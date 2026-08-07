'use client';

import React from 'react';
import {
  CheckSquare,
  Square,
  User,
  Phone,
  MapPin,
  Truck,
  MessageSquare,
  Printer,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { WhatsAppService } from '@/lib/services/whatsapp.service';

interface OrdersCardViewProps {
  orders: Order[];
  selectedOrderIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectOrder: (order: Order) => void;
  onPrintSlip: (order: Order) => void;
  onRequestStatusChange: (
    orderId: string,
    orderNumber: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => void;
  onTogglePaymentSettlement: (orderId: string) => void;
}

export function OrdersCardView({
  orders,
  selectedOrderIds,
  onToggleSelection,
  onSelectOrder,
  onPrintSlip,
  onRequestStatusChange,
  onTogglePaymentSettlement,
}: OrdersCardViewProps) {
  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-800 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30';
      case 'PACKING':
      case 'PACKED':
        return 'bg-amber-600/10 text-amber-900 border-amber-600/30';
      case 'DISPATCHED':
        return 'bg-blue-500/10 text-blue-800 border-blue-500/30';
      case 'DELIVERED':
        return 'bg-emerald-600 text-white border-emerald-600';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-800 border-red-500/30';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'PENDING':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'PACKING';
      case 'PACKING':
      case 'PACKED':
        return 'DISPATCHED';
      case 'DISPATCHED':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => {
        const isSelected = selectedOrderIds.includes(order.id);
        const nextStatus = getNextStatus(order.status);

        return (
          <div
            key={order.id}
            className={`bg-white rounded-3xl border transition-all p-4.5 flex flex-col justify-between space-y-3.5 relative overflow-hidden group ${
              isSelected
                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
            }`}
          >
            <div>
              {/* Card Top Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleSelection(order.id)}
                    className="text-slate-400 hover:text-amber-600 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="font-black text-slate-950 text-base tracking-tight hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{order.order_number}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onTogglePaymentSettlement(order.id)}
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                      order.is_paid
                        ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                    }`}
                    title="Click to toggle payment settlement status"
                  >
                    {order.is_paid ? 'PAID ✓' : 'UNPAID COD'}
                  </button>

                  <span
                    className={`font-black text-[10px] px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">{order.customer_name}</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{order.customer_mobile}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 font-semibold truncate max-w-[130px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{order.city}, {order.state}</span>
                  </div>
                </div>

                {/* Items preview snippet */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <span>Items Breakdown</span>
                      <span>{order.items.length} Products</span>
                    </div>
                    <div className="text-slate-700 font-medium truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </div>
                  </div>
                )}

                {/* Logistics Badge */}
                {order.courier_partner && (
                  <div className="flex items-center justify-between text-[10px] bg-blue-50/70 p-2 rounded-xl border border-blue-200/60">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      {order.courier_partner}
                    </span>
                    <span className="font-mono font-extrabold text-blue-700">
                      #{order.tracking_number || 'Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Grand Total
                </span>
                <span className="text-base font-black text-slate-950">
                  ₹{order.grand_total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={WhatsAppService.generateOrderWhatsAppLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-2xs"
                  title="Send WhatsApp Update"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
                </a>

                <button
                  onClick={() => onPrintSlip(order)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 cursor-pointer"
                  title="Print Packing Slip / Tax Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {nextStatus && (
                  <button
                    onClick={() =>
                      onRequestStatusChange(
                        order.id,
                        order.order_number,
                        order.status,
                        nextStatus
                      )
                    }
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    {nextStatus === 'CONFIRMED'
                      ? 'Confirm'
                      : nextStatus === 'PACKING'
                      ? 'Pack'
                      : nextStatus === 'DISPATCHED'
                      ? 'Dispatch'
                      : 'Deliver'}
                  </button>
                )}

                <button
                  onClick={() => onSelectOrder(order)}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
