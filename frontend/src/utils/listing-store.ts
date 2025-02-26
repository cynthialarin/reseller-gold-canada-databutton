import { create } from 'zustand';
import { supabase } from './supabase';
import { useAuthStore } from './auth-store';

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  images: string[];
  status: 'draft' | 'published';
  marketplace: string;
  created_at: string;
  updated_at: string;
}

interface ListingStore {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  // Create a new listing
  createListing: (listing: Partial<Listing>) => Promise<Listing>;
  // Update an existing listing
  updateListing: (id: string, listing: Partial<Listing>) => Promise<Listing>;
  // Delete a listing
  deleteListing: (id: string) => Promise<void>;
  // Upload images for a listing
  uploadImages: (files: File[]) => Promise<string[]>;
  // Load listings for the current user
  loadListings: () => Promise<void>;
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  createListing: async (listing: Partial<Listing>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('listings')
        .insert([{
          ...listing,
          user_id: user.id,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create listing');

      set(state => ({
        listings: [...state.listings, data],
        loading: false
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateListing: async (id: string, listing: Partial<Listing>) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('listings')
        .update(listing)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update listing');

      set(state => ({
        listings: state.listings.map(l => l.id === id ? data : l),
        loading: false
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteListing: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        listings: state.listings.filter(l => l.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  uploadImages: async (files: File[]) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    try {
      set({ loading: true, error: null });

      const uploadPromises = files.map(async file => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      set({ loading: false });

      return urls;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadListings: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No user logged in');

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        listings: data || [],
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
