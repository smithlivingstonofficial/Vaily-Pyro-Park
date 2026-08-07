import { INITIAL_PRODUCTS, INITIAL_DELIVERY_ZONES } from '@/lib/mockData';
import { OrderItem } from '@/types';

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

export class PricingService {
  /**
   * Recalculates exact order price using ground-truth server data.
   * Client-sent unit prices or totals are strictly IGNORED.
   */
  static calculateOrderPricing(
    clientItems: CheckoutPayloadItem[],
    stateCode: string
  ): CalculatedPricingResult {
    const zone = INITIAL_DELIVERY_ZONES.find((z) =>
      z.state_codes.some((code) => code.toLowerCase() === stateCode.toLowerCase())
    ) || INITIAL_DELIVERY_ZONES[INITIAL_DELIVERY_ZONES.length - 1];

    let subtotal = 0;
    let totalMrp = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of clientItems) {
      const dbProduct = INITIAL_PRODUCTS.find((p) => p.id === clientItem.product_id);
      if (!dbProduct) {
        throw new Error(`Product ID ${clientItem.product_id} not found in database.`);
      }

      const qty = Math.max(1, clientItem.quantity);
      const lineSelling = dbProduct.selling_price * qty;
      const lineMrp = dbProduct.mrp * qty;

      subtotal += lineSelling;
      totalMrp += lineMrp;

      validatedItems.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        unit_price: dbProduct.selling_price,
        quantity: qty,
        total_price: lineSelling,
        image_url: dbProduct.image_url,
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
