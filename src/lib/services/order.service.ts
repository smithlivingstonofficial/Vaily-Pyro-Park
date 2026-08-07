import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types';
import { PricingService, CheckoutPayloadItem } from './pricing.service';

export interface CreateOrderDTO {
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  items: CheckoutPayloadItem[];
}

let inMemoryOrders: Order[] = [];

export class OrderService {
  private static getSupabase() {
    return createClient();
  }

  static async createOrder(dto: CreateOrderDTO): Promise<Order> {
    if (!dto.customer_name || !dto.customer_mobile || !dto.shipping_address || !dto.city || !dto.state || !dto.pincode) {
      throw new Error('Please fill in all mandatory delivery address fields.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const pricing = PricingService.calculateOrderPricing(dto.items, dto.state);

    if (!pricing.isMinOrderMet) {
      throw new Error(
        `Minimum order required for ${pricing.zoneName} is ₹${pricing.minOrderThreshold.toLocaleString()}. Your subtotal is ₹${pricing.subtotal.toLocaleString()}.`
      );
    }

    const orderNumber = `VPP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrderPayload = {
      order_number: orderNumber,
      customer_name: dto.customer_name.trim(),
      customer_mobile: dto.customer_mobile.trim(),
      customer_email: dto.customer_email?.trim() || null,
      shipping_address: dto.shipping_address.trim(),
      city: dto.city.trim(),
      state: dto.state.trim(),
      pincode: dto.pincode.trim(),
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      delivery_fee: pricing.deliveryFee,
      grand_total: pricing.grandTotal,
      status: 'PENDING' as OrderStatus,
      created_at: now,
      updated_at: now,
    };

    try {
      const supabase = this.getSupabase();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(newOrderPayload)
        .select()
        .single();

      if (orderError || !orderData) {
        throw orderError || new Error('Failed to insert order into Supabase.');
      }

      // Insert Order Items
      const orderItemsPayload = pricing.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
      }));

      const { data: itemsData } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)
        .select();

      const createdOrder: Order = {
        ...orderData,
        grand_total: Number(orderData.grand_total),
        subtotal: Number(orderData.subtotal),
        delivery_fee: Number(orderData.delivery_fee),
        discount_amount: Number(orderData.discount_amount),
        items: itemsData || pricing.items,
      };

      inMemoryOrders.unshift(createdOrder);
      return createdOrder;
    } catch (e) {
      console.warn('Supabase DB insert fallback to memory:', e);
      const fallbackOrder: Order = {
        id: `ord-${Date.now()}`,
        ...newOrderPayload,
        customer_email: dto.customer_email?.trim() || undefined,
        items: pricing.items,
      };
      inMemoryOrders.unshift(fallbackOrder);
      return fallbackOrder;
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .or(`id.eq.${id},order_number.eq.${id}`)
        .single();

      if (error || !data) {
        const mem = inMemoryOrders.find((o) => o.id === id || o.order_number === id);
        return mem || null;
      }

      return {
        ...data,
        grand_total: Number(data.grand_total),
        subtotal: Number(data.subtotal),
        delivery_fee: Number(data.delivery_fee),
        discount_amount: Number(data.discount_amount),
      };
    } catch (e) {
      return inMemoryOrders.find((o) => o.id === id || o.order_number === id) || null;
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [...inMemoryOrders];
      }

      const dbOrders: Order[] = data.map((item: any) => ({
        id: item.id,
        order_number: item.order_number,
        customer_name: item.customer_name,
        customer_mobile: item.customer_mobile,
        customer_email: item.customer_email,
        shipping_address: item.shipping_address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        subtotal: Number(item.subtotal),
        discount_amount: Number(item.discount_amount || 0),
        delivery_fee: Number(item.delivery_fee || 0),
        grand_total: Number(item.grand_total),
        status: item.status,
        admin_notes: item.admin_notes,
        courier_partner: item.courier_partner,
        tracking_number: item.tracking_number,
        estimated_delivery: item.estimated_delivery,
        is_paid: item.is_paid,
        created_at: item.created_at,
        updated_at: item.updated_at,
        items: item.items
          ? item.items.map((i: any) => ({
              product_id: i.product_id,
              product_name: i.product_name,
              unit_price: Number(i.unit_price),
              quantity: i.quantity,
              total_price: Number(i.total_price),
            }))
          : [],
      }));

      return dbOrders;
    } catch (e) {
      console.warn('Supabase DB fetch fallback to in-memory orders:', e);
      return [...inMemoryOrders];
    }
  }

  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    adminNotes?: string
  ): Promise<Order> {
    const now = new Date().toISOString();

    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: now,
        })
        .eq('id', id)
        .select('*, items:order_items(*)')
        .single();

      if (!error && data) {
        const updatedOrder: Order = {
          ...data,
          grand_total: Number(data.grand_total),
          subtotal: Number(data.subtotal),
          delivery_fee: Number(data.delivery_fee),
          discount_amount: Number(data.discount_amount),
        };
        // Update in-memory fallback
        inMemoryOrders = inMemoryOrders.map((o) => (o.id === id ? updatedOrder : o));
        return updatedOrder;
      }
    } catch (e) {
      console.warn('Supabase DB update fallback:', e);
    }

    // In-memory fallback
    const index = inMemoryOrders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order ${id} not found.`);
    }

    const currentOrder = inMemoryOrders[index];
    const existingHistory = currentOrder.history || [
      {
        status: currentOrder.status,
        timestamp: currentOrder.created_at,
        note: 'Order created',
        actor: 'Customer',
      },
    ];

    const history = [...existingHistory];
    if (currentOrder.status !== status) {
      history.push({
        status,
        timestamp: now,
        note: adminNotes || `Status updated to ${status}`,
        actor: 'Admin Dispatcher',
      });
    }

    const updated: Order = {
      ...currentOrder,
      status,
      admin_notes: adminNotes !== undefined ? adminNotes : currentOrder.admin_notes,
      updated_at: now,
      history,
    };

    inMemoryOrders[index] = updated;
    return updated;
  }
}
