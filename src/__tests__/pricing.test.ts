import { PricingService } from '../lib/services/pricing.service';

describe('PricingService Server-Authoritative Price Calculation', () => {
  it('should accurately calculate subtotal and delivery fee for Tamil Nadu zone', () => {
    const result = PricingService.calculateOrderPricing(
      [
        { product_id: 'prod-4', quantity: 3 }, // 3 x 480 = 1440
        { product_id: 'prod-9', quantity: 2 }, // 2 x 890 = 1780
      ],
      'Tamil Nadu'
    );

    expect(result.subtotal).toBe(3220); // 1440 + 1780
    expect(result.isMinOrderMet).toBe(true); // 3220 >= 3000
    expect(result.deliveryFee).toBe(0); // TN home zone free
    expect(result.grandTotal).toBe(3220);
  });

  it('should detect when subtotal is below minimum threshold', () => {
    const result = PricingService.calculateOrderPricing(
      [{ product_id: 'prod-1', quantity: 2 }], // 2 x 150 = 300
      'Tamil Nadu'
    );

    expect(result.subtotal).toBe(300);
    expect(result.isMinOrderMet).toBe(false); // 300 < 3000
  });
});
