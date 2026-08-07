import { OrderService } from '../lib/services/order.service';

describe('OrderService Transactional Workflow', () => {
  it('should reject order creation if minimum order threshold is not met', async () => {
    await expect(
      OrderService.createOrder({
        customer_name: 'Test User',
        customer_mobile: '9840123456',
        shipping_address: '123 Test St',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        items: [{ product_id: 'prod-1', quantity: 1 }], // Subtotal 150 < 3000
      })
    ).rejects.toThrow(/Minimum order required/);
  });

  it('should successfully place order when threshold is met', async () => {
    const order = await OrderService.createOrder({
      customer_name: 'Karthik S',
      customer_mobile: '9840123456',
      shipping_address: 'Door 14, 2nd Cross Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      items: [
        { product_id: 'prod-4', quantity: 4 }, // 4 x 480 = 1920
        { product_id: 'prod-9', quantity: 2 }, // 2 x 890 = 1780
      ], // Total = 3700 >= 3000
    });

    expect(order.id).toBeDefined();
    expect(order.order_number).toContain('VPP-2026-');
    expect(order.grand_total).toBe(3700);
    expect(order.status).toBe('PENDING');
  });
});
