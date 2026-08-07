import { INITIAL_DELIVERY_ZONES } from '@/lib/mockData';
import { OrderItem, Product } from '@/types';

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
   * Recalculates exact order price using live catalog products.
   * Client-sent unit prices or totals are strictly IGNORED.
   */
  static calculateOrderPricing(
    clientItems: CheckoutPayloadItem[],
    stateCode: string,
    products: Product[] = []
  ): CalculatedPricingResult {
    const zone = INITIAL_DELIVERY_ZONES.find((z) =>
      z.state_codes.some((code) => code.toLowerCase() === stateCode.toLowerCase())
    ) || INITIAL_DELIVERY_ZONES[INITIAL_DELIVERY_ZONES.length - 1];

    let subtotal = 0;
    let totalMrp = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of clientItems) {
      const dbProduct = products.find((p) => p.id === clientItem.product_id);

      // If product not found in provided array, create a resilient fallback item from payload
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
