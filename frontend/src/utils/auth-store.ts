import { create } from 'zustand';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  preferred_marketplaces?: string[];
  business_name?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,


  signUp: async (email: string, password: string) => {
    console.log('Signing up...');
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      console.log('Signup successful:', data);

      if (data.user) {
        // Create initial profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id }]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        set({
          user: data.user,
          profile: { id: data.user.id },
          error: null
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      set({ error: error?.message || 'Failed to sign up' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    console.log('Signing in...');
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      console.log('Sign in successful:', data);

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        console.log('Profile:', profile);

        set({
          user: data.user,
          profile: profile || { id: data.user.id },
          error: null
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error?.message || 'Failed to sign in' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    console.log('Signing out...');
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({
        user: null,
        profile: null,
        error: null
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error?.message || 'Failed to sign out' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (profile: Partial<UserProfile>) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('No user logged in');

    console.log('Updating profile:', profile);
    try {
      set({ loading: true, error: null });
      
      // Validate profile data
      if (profile.username && profile.username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw checkError;
      }

      let data;
      if (!existingProfile) {
        // Insert new profile
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, ...profile }])
          .select()
          .single();

        if (insertError) throw insertError;
        data = insertedData;
      } else {
        // Update existing profile
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update(profile)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        data = updatedData;
      }

      if (!data) throw new Error('Failed to update profile');

      console.log('Profile updated:', data);

      set({
        profile: data,
        error: null
      });
      return data;
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error?.message || 'Failed to update profile';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state
export const initializeAuthListener = () => {
  console.log('Setting up auth listener...');

  // Get initial session
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      useAuthStore.setState({
        user: session.user,
        profile: profile || { id: session.user.id },
        error: null,
        loading: false
      });
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        useAuthStore.setState({
          user: session.user,
          profile: profile || { id: session.user.id },
          error: null,
          loading: false
        });
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          user: null,
          profile: null,
          error: null,
          loading: false
        });
      }
    }
  );

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
};
