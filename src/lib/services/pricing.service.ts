import { createClient } from '@/lib/supabase/client';
import { DeliveryZone, OrderItem, Product } from '@/types';

export interface CheckoutPayloadItem {
  product_id: string;
  quantity: number;
}

export interface CalculatedPricingResult {
  items: OrderItem[];
  subtotal: number;
  totalMrp: number;
  discountAmount: number;
  deliveryFee: number;
  grandTotal: number;
  minOrderThreshold: number;
  isMinOrderMet: boolean;
  zoneName: string;
}

// Hard-coded fallback zones — only used if Supabase is unreachable at checkout time
const FALLBACK_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-tn',
    zone_name: 'Tamil Nadu (Home Zone)',
    state_codes: ['TN', 'Tamil Nadu'],
    min_order_amount: 3000,
    delivery_fee: 0,
    estimated_days: '2-3 Days',
    is_active: true,
  },
  {
    id: 'zone-south',
    zone_name: 'South India',
    state_codes: ['PY', 'KL', 'KA', 'AP', 'TS', 'Puducherry', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
    min_order_amount: 4000,
    delivery_fee: 150,
    estimated_days: '3-4 Days',
    is_active: true,
  },
  {
    id: 'zone-rest',
    zone_name: 'Rest of India',
    state_codes: ['ALL'],
    min_order_amount: 5000,
    delivery_fee: 250,
    estimated_days: '5-7 Days',
    is_active: true,
  },
];

export class PricingService {
  /**
   * Fetch active delivery zones from DB. Falls back to hardcoded if DB fails.
   */
  static async fetchDeliveryZones(): Promise<DeliveryZone[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) return FALLBACK_DELIVERY_ZONES;
      return data as DeliveryZone[];
    } catch {
      return FALLBACK_DELIVERY_ZONES;
    }
  }

  /**
   * Recalculates exact order price using live catalog products & DB delivery zones.
   * Client-sent unit prices or totals are strictly IGNORED.
   */
  static calculateOrderPricing(
    clientItems: CheckoutPayloadItem[],
    stateCode: string,
    products: Product[] = [],
    zones: DeliveryZone[] = FALLBACK_DELIVERY_ZONES
  ): CalculatedPricingResult {
    const zone =
      zones.find((z) =>
        z.state_codes.some((code) => code.toLowerCase() === stateCode.toLowerCase())
      ) ?? zones[zones.length - 1];

    let subtotal = 0;
    let totalMrp = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of clientItems) {
      const dbProduct = products.find((p) => p.id === clientItem.product_id);

      const sellingPrice = dbProduct ? dbProduct.selling_price : 100;
      const mrpPrice = dbProduct ? dbProduct.mrp : 150;
      const productName = dbProduct ? dbProduct.name : 'Sivakasi Fireworks Item';

      const qty = Math.max(1, clientItem.quantity);
      const lineSelling = sellingPrice * qty;
      const lineMrp = mrpPrice * qty;

      subtotal += lineSelling;
      totalMrp += lineMrp;

      validatedItems.push({
        product_id: clientItem.product_id,
        product_name: productName,
        unit_price: sellingPrice,
        quantity: qty,
        total_price: lineSelling,
        image_url: dbProduct?.image_url,
      });
    }

    const isMinOrderMet = subtotal >= zone.min_order_amount;
    const deliveryFee = isMinOrderMet ? zone.delivery_fee : 0;
    const discountAmount = Math.max(0, totalMrp - subtotal);
    const grandTotal = subtotal + deliveryFee;

    return {
      items: validatedItems,
      subtotal,
      totalMrp,
      discountAmount,
      deliveryFee,
      grandTotal,
      minOrderThreshold: zone.min_order_amount,
      isMinOrderMet,
      zoneName: zone.zone_name,
    };
  }
}
