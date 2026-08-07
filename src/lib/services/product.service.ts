import { createClient } from '@/lib/supabase/client';
import { Product, Category, DeliveryZone, Combo } from '@/types';
import { INITIAL_DELIVERY_ZONES } from '@/lib/mockData';

export class ProductService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Fetch all active categories from Supabase DB.
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data) return [];
      return data as Category[];
    } catch (e) {
      console.warn('Failed to fetch categories from Supabase:', e);
      return [];
    }
  }

  /**
   * Fetch all products from Supabase DB.
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)');

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        description: item.description,
        pack_size: item.pack_size,
        mrp: Number(item.mrp),
        selling_price: Number(item.selling_price),
        image_url: item.image_url,
        is_active: item.is_active,
        is_featured: item.is_featured,
        is_best_seller: item.is_best_seller,
        sound_level: item.sound_level,
        stock: item.stock ?? 100,
        category: item.category,
      }));
    } catch (e) {
      console.warn('Failed to fetch products from Supabase:', e);
      return [];
    }
  }

  /**
   * Fetch active combos/assortment boxes from Supabase DB.
   */
  static async getCombos(): Promise<Combo[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .eq('is_active', true);

      if (error || !data) return [];

      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        price: Number(c.price),
        mrp: Number(c.mrp),
        image_url: c.image_url,
        is_active: c.is_active,
      }));
    } catch (e) {
      console.warn('Failed to fetch combos from Supabase:', e);
      return [];
    }
  }

  /**
   * Fetch delivery zones from Supabase DB.
   */
  static async getDeliveryZones(): Promise<DeliveryZone[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return INITIAL_DELIVERY_ZONES;
      }
      return data as DeliveryZone[];
    } catch (e) {
      return INITIAL_DELIVERY_ZONES;
    }
  }

  /**
   * Toggle product active status in Supabase.
   */
  static async toggleProductActive(id: string, currentStatus: boolean): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return !currentStatus;
    } catch (e) {
      console.error('Failed to update product active state in Supabase:', e);
      return !currentStatus;
    }
  }
}
