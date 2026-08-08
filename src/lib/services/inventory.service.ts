import { createClient } from '@/lib/supabase/client';
import { MovementType, InventoryMovement } from '@/types';

export interface StockItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  available_stock: number;
  reserved_stock: number;
  safety_threshold: number;
  updated_at: string;
}

export class InventoryService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Fetch all inventory stock records joined with product name & SKU.
   */
  static async getAllStock(): Promise<StockItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:products(id, name, sku)')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('InventoryService.getAllStock error:', error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      name: row.product?.name ?? 'Unknown Product',
      sku: row.product?.sku ?? '—',
      available_stock: Number(row.available_stock ?? 0),
      reserved_stock: Number(row.reserved_stock ?? 0),
      safety_threshold: Number(row.safety_threshold ?? 10),
      updated_at: row.updated_at,
    }));
  }

  /**
   * Fetch stock for a single product by product_id.
   */
  static async getStockByProduct(productId: string): Promise<StockItem | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:products(id, name, sku)')
      .eq('product_id', productId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      product_id: data.product_id,
      name: (data as any).product?.name ?? 'Unknown',
      sku: (data as any).product?.sku ?? '—',
      available_stock: Number(data.available_stock),
      reserved_stock: Number(data.reserved_stock),
      safety_threshold: Number(data.safety_threshold),
      updated_at: data.updated_at,
    };
  }

  /**
   * Apply a stock adjustment and persist both the inventory row and
   * an inventory_movements audit record to the database.
   */
  static async adjustStock(
    productId: string,
    movementType: MovementType,
    quantity: number,
    reason: string
  ): Promise<StockItem> {
    const supabase = this.getSupabase();

    // Determine direction: outflows subtract, inflows add
    const outflowTypes: MovementType[] = ['DAMAGE', 'SALE', 'RESERVATION'];
    const delta = outflowTypes.includes(movementType) ? -Math.abs(quantity) : Math.abs(quantity);

    // Fetch current stock
    const current = await this.getStockByProduct(productId);
    if (!current) throw new Error(`No inventory record found for product ${productId}.`);

    const newAvailable = Math.max(0, current.available_stock + delta);

    // Update inventory row
    const { data: updatedRow, error: updateErr } = await supabase
      .from('inventory')
      .update({
        available_stock: newAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .select('*, product:products(id, name, sku)')
      .single();

    if (updateErr || !updatedRow) {
      console.error('InventoryService.adjustStock update error:', updateErr);
      throw new Error(updateErr?.message || 'Failed to update stock in database.');
    }

    // Insert audit movement record
    const { error: movErr } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        type: movementType,
        quantity: Math.abs(quantity),
        reason: reason || `Manual ${movementType} adjustment`,
        created_at: new Date().toISOString(),
      });

    if (movErr) {
      // Non-critical: log but don't throw — stock update already succeeded
      console.warn('InventoryService: movement log insert failed:', movErr.message);
    }

    return {
      id: updatedRow.id,
      product_id: updatedRow.product_id,
      name: (updatedRow as any).product?.name ?? current.name,
      sku: (updatedRow as any).product?.sku ?? current.sku,
      available_stock: Number(updatedRow.available_stock),
      reserved_stock: Number(updatedRow.reserved_stock),
      safety_threshold: Number(updatedRow.safety_threshold),
      updated_at: updatedRow.updated_at,
    };
  }

  /**
   * Update the safety threshold for a product's inventory row.
   */
  static async updateSafetyThreshold(productId: string, threshold: number): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('inventory')
      .update({ safety_threshold: threshold, updated_at: new Date().toISOString() })
      .eq('product_id', productId);

    if (error) {
      console.error('InventoryService.updateSafetyThreshold error:', error);
      throw new Error(error.message);
    }
    return true;
  }

  /**
   * Fetch recent inventory movement audit logs from the database.
   */
  static async getMovementLog(limit = 50): Promise<InventoryMovement[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn('InventoryService.getMovementLog error:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.product?.name ?? 'Unknown Product',
      type: row.type as MovementType,
      quantity: Number(row.quantity),
      reason: row.reason ?? '',
      created_at: row.created_at,
    }));
  }
}
