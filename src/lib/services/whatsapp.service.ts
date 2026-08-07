import { Order } from '@/types';

export class WhatsAppService {
  /**
   * ZERO-COST & ULTRA-FAST WHATSAPP INTEGRATION SERVICE
   * 
   * Performance & Cost Advantages:
   * 1. 0ms Server Overhead: Computed client-side directly in browser memory.
   * 2. ₹0 API Fees: Uses official WhatsApp deep-link scheme (`wa.me`). Requires NO paid WhatsApp Business Cloud API, NO Twilio subscription, and NO monthly gateways.
   * 3. Instant Conversion: Clicking opens native WhatsApp app (iOS/Android/Desktop) with pre-filled itemized order proof ready to send to shop owner.
   */
  static generateOrderWhatsAppLink(order: Order, storePhoneNumber: string = '919840000000'): string {
    const itemsList = order.items
      ? order.items.map((i) => `• ${i.quantity}x ${i.product_name} - ₹${i.total_price.toLocaleString()}`).join('\n')
      : '';

    const text = `🎆 *NEW CRACKER ORDER: ${order.order_number}* 🎆

*Customer Details:*
• Name: ${order.customer_name}
• Phone: ${order.customer_mobile}
• Shipping Address: ${order.shipping_address}, ${order.city}, ${order.state} - ${order.pincode}

*Ordered Items:*
${itemsList}

*Financial Summary:*
• Subtotal: ₹${order.subtotal.toLocaleString()}
• Delivery Fee: ${order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee.toLocaleString()}`}
• *Grand Total: ₹${order.grand_total.toLocaleString()}*

Thank you for choosing Vaily Pyro Park! Please confirm dispatch timeline.`;

    const encoded = encodeURIComponent(text);
    // wa.me universal URL scheme works on mobile apps, web, and desktop
    return `https://wa.me/${storePhoneNumber}?text=${encoded}`;
  }
}
