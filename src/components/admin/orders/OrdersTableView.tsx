'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Square,
  User,
  Phone,
  MapPin,
  Truck,
  Printer,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { Order, OrderStatus } from '@/types';
import { WhatsAppService } from '@/lib/services/whatsapp.service';

interface OrdersTableViewProps {
  orders: Order[];
  selectedOrderIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onSelectOrder: (order: Order) => void;
  onPrintSlip: (order: Order) => void;
  onRequestStatusChange: (
    orderId: string,
    orderNumber: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => void;
  onTogglePaymentSettlement?: (orderId: string) => void;
  onOpenWhatsAppModal?: (order: Order) => void;
}

export function OrdersTableView({
  orders,
  selectedOrderIds,
  onToggleSelection,
  onSelectAll,
  onSelectOrder,
  onPrintSlip,
  onRequestStatusChange,
  onTogglePaymentSettlement,
  onOpenWhatsAppModal,
}: OrdersTableViewProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'CONFIRMED':
        return {
          color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'PACKING':
      case 'PACKED':
        return {
          color: 'bg-amber-600/10 text-amber-800 border-amber-600/30',
          dot: 'bg-amber-600',
        };
      case 'DISPATCHED':
        return {
          color: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
          dot: 'bg-blue-500',
        };
      case 'DELIVERED':
        return {
          color: 'bg-emerald-600 text-white border-emerald-600',
          dot: 'bg-white',
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-500/10 text-red-700 border-red-500/30',
          dot: 'bg-red-500',
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/90 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <button onClick={onSelectAll} className="cursor-pointer">
                  {selectedOrderIds.length === orders.length && orders.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-3.5">Order Info</th>
              <th className="p-3.5">Customer & Contact</th>
              <th className="p-3.5">Destination</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-5">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {orders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              const statusStyle = getStatusBadge(order.status);
              const nextStatus = getNextStatus(order.status);

              return (
                <tr
                  key={order.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onToggleSelection(order.id)}
                      className="cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </td>

                  {/* Order Number & Date */}
                  <td className="p-3.5">
                    <Link
                      href={`/admin/orders/${order.order_number}`}
                      className="font-bold text-slate-900 hover:text-amber-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer group"
                    >
                      <span>{order.order_number}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  {/* Customer Profile */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-950 font-black text-xs flex items-center justify-center border border-amber-500/20 shrink-0">
                        {getInitials(order.customer_name)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {order.customer_name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {order.customer_mobile}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location & Courier */}
                  <td className="p-3.5 text-slate-700">
                    <span className="font-semibold block">{order.city}</span>
                    <span className="text-[10px] text-slate-400 block">{order.state}</span>
                    {order.courier_partner && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-0.5">
                        {order.courier_partner} #{order.tracking_number || 'Pending'}
                      </span>
                    )}
                  </td>

                  {/* Grand Total */}
                  <td className="p-3.5">
                    <span className="font-black text-slate-950 text-sm block">
                      ₹{order.grand_total.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {order.items?.length || 0} items
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${statusStyle.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{order.status}</span>
                    </div>
                  </td>

                  {/* Quick Action Buttons */}
                  <td className="p-3.5 text-right pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          onOpenWhatsAppModal
                            ? onOpenWhatsAppModal(order)
                            : window.open(WhatsAppService.generateCustomerWhatsAppLink(order), '_blank')
                        }
                        className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all shadow-xs cursor-pointer"
                        title="Send WhatsApp Update to Customer"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                      </button>

                      <button
                        onClick={() => onPrintSlip(order)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        title="Print Packing Slip"
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
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] transition-all cursor-pointer shadow-2xs"
                          title={`Advance to ${nextStatus}`}
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

                      <Link
                        href={`/admin/orders/${order.order_number}`}
                        className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white font-semibold rounded-xl text-[11px] transition-colors cursor-pointer inline-block"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
