import { create } from 'zustand';
import { supabase } from './supabase';

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  description?: string;
  brand?: string;
  category?: string;
  condition: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  location_id?: string;
  status: 'in_stock' | 'sold' | 'reserved';
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  created_at: string;
  updated_at: string;
}

interface InventoryStore {
  items: InventoryItem[];
  locations: StorageLocation[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addLocation: (location: Omit<StorageLocation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<StorageLocation>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  locations: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ items: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      set({ locations: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ items: [data, ...state.items] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...data } : item
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        items: state.items.filter(item => item.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (location) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .insert([location])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ locations: [...state.locations, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateLocation: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        locations: state.locations.map(location =>
          location.id === id ? { ...location, ...data } : location
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLocation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('storage_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        locations: state.locations.filter(location => location.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
