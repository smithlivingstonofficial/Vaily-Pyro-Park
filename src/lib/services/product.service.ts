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
   * Create new product in Supabase DB.
   */
  static async createProduct(productData: Partial<Product>, initialStock: number = 100): Promise<Product> {
    const supabase = this.getSupabase();
    const slug = productData.slug || (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      name: productData.name,
      slug,
      sku: productData.sku,
      category_id: productData.category_id || null,
      description: productData.description || '',
      pack_size: productData.pack_size || '1 Box',
      mrp: productData.mrp || 0,
      selling_price: productData.selling_price || 0,
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      is_active: productData.is_active !== undefined ? productData.is_active : true,
      is_featured: productData.is_featured || false,
      is_best_seller: productData.is_best_seller || false,
      sound_level: productData.sound_level || 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('*, category:categories(*)')
      .single();

    if (error || !data) {
      console.error('Supabase createProduct error:', error);
      throw error || new Error('Failed to create product in database.');
    }

    // Insert stock balance into inventory table
    try {
      await supabase.from('inventory').insert({
        product_id: data.id,
        available_stock: initialStock,
        reserved_stock: 0,
        safety_threshold: 20,
      });
    } catch (invErr) {
      console.warn('Inventory initial stock insert error:', invErr);
    }

    return {
      id: data.id,
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      pack_size: data.pack_size,
      mrp: Number(data.mrp),
      selling_price: Number(data.selling_price),
      image_url: data.image_url,
      is_active: data.is_active,
      is_featured: data.is_featured,
      is_best_seller: data.is_best_seller,
      sound_level: data.sound_level,
      stock: initialStock,
      category: data.category,
    };
  }

  /**
   * Update existing product in Supabase DB.
   */
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const supabase = this.getSupabase();

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (productData.name) {
      payload.name = productData.name;
      payload.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (productData.sku) payload.sku = productData.sku;
    if (productData.category_id !== undefined) payload.category_id = productData.category_id;
    if (productData.description !== undefined) payload.description = productData.description;
    if (productData.pack_size !== undefined) payload.pack_size = productData.pack_size;
    if (productData.mrp !== undefined) payload.mrp = productData.mrp;
    if (productData.selling_price !== undefined) payload.selling_price = productData.selling_price;
    if (productData.image_url !== undefined) payload.image_url = productData.image_url;
    if (productData.is_active !== undefined) payload.is_active = productData.is_active;
    if (productData.is_featured !== undefined) payload.is_featured = productData.is_featured;
    if (productData.is_best_seller !== undefined) payload.is_best_seller = productData.is_best_seller;
    if (productData.sound_level !== undefined) payload.sound_level = productData.sound_level;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error || !data) {
      console.error('Supabase updateProduct error:', error);
      throw error || new Error('Failed to update product in database.');
    }

    return {
      id: data.id,
      category_id: data.category_id,
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      pack_size: data.pack_size,
      mrp: Number(data.mrp),
      selling_price: Number(data.selling_price),
      image_url: data.image_url,
      is_active: data.is_active,
      is_featured: data.is_featured,
      is_best_seller: data.is_best_seller,
      sound_level: data.sound_level,
      stock: productData.stock ?? 100,
      category: data.category,
    };
  }

  /**
   * Delete product from Supabase DB.
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Supabase deleteProduct error:', error);
      throw error;
    }
    return true;
  }

  /**
   * Bulk insert/upsert products from CSV import into Supabase DB.
   */
  static async bulkCreateProducts(productsList: Partial<Product>[]): Promise<boolean> {
    const supabase = this.getSupabase();

    const payloads = productsList.map((p, idx) => ({
      name: p.name,
      slug: (p.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now()}-${idx}`,
      sku: p.sku || `SKU-${Date.now()}-${idx}`,
      description: p.description || '',
      pack_size: p.pack_size || '1 Box',
      mrp: p.mrp || 0,
      selling_price: p.selling_price || 0,
      image_url: p.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      is_active: p.is_active !== undefined ? p.is_active : true,
      is_featured: p.is_featured || false,
      is_best_seller: p.is_best_seller || false,
      sound_level: p.sound_level || 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error } = await supabase
      .from('products')
      .upsert(payloads, { onConflict: 'sku' })
      .select();

    if (error) {
      console.error('Supabase bulkCreateProducts error:', error);
      throw error;
    }

    if (inserted && inserted.length > 0) {
      const invPayloads = inserted.map((p, idx) => ({
        product_id: p.id,
        available_stock: productsList[idx]?.stock || 100,
        reserved_stock: 0,
        safety_threshold: 20,
      }));

      try {
        await supabase.from('inventory').upsert(invPayloads, { onConflict: 'product_id' });
      } catch (invErr) {
        console.warn('Inventory bulk stock insert warning:', invErr);
      }
    }

    return true;
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
