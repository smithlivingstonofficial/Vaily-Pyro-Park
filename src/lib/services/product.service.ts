import { createClient } from '@/lib/supabase/client';
import { Product, Category, DeliveryZone } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_DELIVERY_ZONES } from '@/lib/mockData';

export class ProductService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Fetch all active categories from Supabase DB.
   * If empty in Supabase, fallback to INITIAL_CATEGORIES.
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return INITIAL_CATEGORIES;
      }
      return data as Category[];
    } catch (e) {
      console.warn('Falling back to default categories:', e);
      return INITIAL_CATEGORIES;
    }
  }

  /**
   * Fetch all products from Supabase DB.
   * If empty in Supabase, fallback to INITIAL_PRODUCTS.
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)');

      if (error || !data || data.length === 0) {
        return INITIAL_PRODUCTS;
      }

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
      console.warn('Falling back to default products:', e);
      return INITIAL_PRODUCTS;
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
