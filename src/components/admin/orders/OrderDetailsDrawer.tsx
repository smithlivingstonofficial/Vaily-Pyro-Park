'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Check,
  Package,
  Truck,
  User,
  MapPin,
  FileText,
  PhoneCall,
  MessageSquare,
  Printer,
  Copy,
  CheckCircle,
  Clock,
  Send,
  History,
  ShieldCheck,
  ExternalLink,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { WhatsAppService } from '@/lib/services/whatsapp.service';
import { OrderTimeline } from '@/components/common/OrderTimeline';

interface OrderDetailsDrawerProps {
  order: Order | null;
  onClose: () => void;
  onPrintSlip: (order: Order) => void;
  onRequestStatusChange: (
    orderId: string,
    orderNumber: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => void;
  onTogglePaymentSettlement: (orderId: string) => void;
  onSaveLogistics: (
    orderId: string,
    courierPartner: string,
    trackingNumber: string,
    estDeliveryDays: string,
    adminNotes?: string
  ) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CARRIER_OPTIONS = [
  'ST Courier',
  'Professional Courier',
  'VRL Logistics',
  'BlueDart Express',
  'DTDC Express',
  'Direct Lorry Freight',
  'Local Warehouse Pickup',
];

export function OrderDetailsDrawer({
  order,
  onClose,
  onPrintSlip,
  onRequestStatusChange,
  onTogglePaymentSettlement,
  onSaveLogistics,
  onShowToast,
}: OrderDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'logistics' | 'customer' | 'audit'>('items');

  // Logistics form state
  const [courierPartner, setCourierPartner] = useState<string>('ST Courier');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [estDeliveryDays, setEstDeliveryDays] = useState<string>('2-3 Days');
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');

  useEffect(() => {
    if (order) {
      setCourierPartner(order.courier_partner || 'ST Courier');
      setTrackingNumber(order.tracking_number || '');
      setEstDeliveryDays(order.estimated_delivery || '2-3 Days');
      setAdminNotesInput(order.admin_notes || '');
    }
  }, [order]);

  if (!order) return null;

  const stepperStages: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'PENDING', label: 'Placed', icon: '📝' },
    { status: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
    { status: 'PACKING', label: 'Packing', icon: '📦' },
    { status: 'DISPATCHED', label: 'Dispatched', icon: '🚚' },
    { status: 'DELIVERED', label: 'Delivered', icon: '🎉' },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PACKING':
      case 'PACKED':
        return 2;
      case 'DISPATCHED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
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

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`Copied ${label} to clipboard!`, 'success');
  };

  const handleSaveLogisticsSubmit = () => {
    onSaveLogistics(order.id, courierPartner, trackingNumber, estDeliveryDays, adminNotesInput);
    onShowToast('✓ Logistics details saved & WhatsApp notification dispatched!', 'success');

    const trackingMsg = `🎆 *ORDER DISPATCH UPDATE: ${order.order_number}* 🎆\n\nDear ${order.customer_name},\nYour Sivakasi crackers order has been dispatched!\n\n• Courier: *${courierPartner}*\n• Tracking ID / LR: *${trackingNumber || 'Assigned'}*\n• Est. Delivery: *${estDeliveryDays}*\n\nThank you for choosing Vaily Pyro Park!`;
    const whatsappUrl = `https://wa.me/91${order.customer_mobile}?text=${encodeURIComponent(trackingMsg)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Mobile Slide-Up Container / Desktop Modal Sheet */}
      <div className="w-full max-w-5xl bg-white h-[95vh] sm:h-[92vh] max-h-[95vh] rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-200/90 animate-in slide-in-from-bottom sm:zoom-in-98 duration-200">
        
        {/* LIGHT THEME TOP HEADER BAR */}
        <div className="bg-white text-slate-900 p-3.5 sm:p-5 flex items-center justify-between border-b border-slate-200/80 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back to Orders"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-base sm:text-xl text-slate-950 tracking-tight truncate">
                  {order.order_number}
                </h2>
                <button
                  onClick={() => onTogglePaymentSettlement(order.id)}
                  className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                    order.is_paid
                      ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-800 border border-amber-500/30'
                  }`}
                  title="Click to toggle payment settlement"
                >
                  {order.is_paid ? 'PAID ✓' : 'UNPAID COD'}
                </button>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
                Placed on{' '}
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onPrintSlip(order)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold items-center gap-1.5 transition-colors hidden sm:flex cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <a
              href={WhatsAppService.generateOrderWhatsAppLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE TIMELINE STEPPER PROGRESS BAR */}
        <div className="bg-slate-50/80 border-b border-slate-200/80 p-3 sm:p-4 shrink-0 overflow-y-auto max-h-60 shadow-2xs">
          <OrderTimeline
            status={order.status}
            adminNotes={order.admin_notes}
            courierPartner={order.courier_partner}
            trackingNumber={order.tracking_number}
            createdAt={order.created_at}
            updatedAt={order.updated_at}
            interactive={true}
            onUpdateStatus={(newStatus) =>
              onRequestStatusChange(
                order.id,
                order.order_number,
                order.status,
                newStatus
              )
            }
          />
        </div>

        {/* LIGHT THEME TAB SELECTION BAR */}
        <div className="bg-white border-b border-slate-200/80 px-3 sm:px-5 py-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'items'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black border border-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Items & Pricing ({order.items?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'logistics'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black border border-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Logistics Dispatch</span>
            </button>

            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black border border-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black border border-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>
        </div>

        {/* TAB BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50">
          
          {/* TAB 1: ITEMS & FINANCIAL BREAKDOWN */}
          {activeTab === 'items' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Ordered Products */}
              <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-sm text-slate-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Ordered Items ({order.items?.length || 0})</span>
                  </h3>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Sivakasi Warehouse
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items?.map((item) => (
                    <div key={item.product_id} className="py-3 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-3 truncate pr-2 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-base">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            '🎆'
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <span className="font-extrabold text-slate-950 block truncate text-xs">
                            {item.product_name}
                          </span>
                          <span className="text-slate-500 font-medium text-[11px]">
                            {item.quantity} units × ₹{item.unit_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-950 text-sm shrink-0 font-mono">
                        ₹{item.total_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown Card */}
              <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h3 className="font-black text-sm text-slate-950 border-b border-slate-100 pb-3">
                  Financial Summary
                </h3>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-slate-900 font-mono">₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Festival Discount:</span>
                      <span className="font-mono">-₹{order.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee ({order.state}):</span>
                    <span className="font-bold text-slate-900">
                      {order.delivery_fee === 0 ? (
                        <span className="text-emerald-600 font-black">FREE</span>
                      ) : (
                        `₹${order.delivery_fee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-3 border-t border-slate-200">
                    <span>Grand Total Payable:</span>
                    <span className="text-amber-600 font-black text-lg font-mono">
                      ₹{order.grand_total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-800 block">Payment Reconciled Status:</span>
                  <p className="text-slate-600">
                    {order.is_paid
                      ? '✓ Customer payment settled in shop ledger.'
                      : '⚠️ Payment pending. Collect cash / UPI payment upon delivery.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIGHT THEME LOGISTICS DISPATCHER */}
          {activeTab === 'logistics' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-950 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-600" />
                    <span>Logistics & Courier Dispatcher</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Fulfillment Form
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Courier Partner</label>
                    <select
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                    >
                      {CARRIER_OPTIONS.map((carrier) => (
                        <option key={carrier} value={carrier}>
                          {carrier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tracking LR / Reference #</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. ST-9840123"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Delivery Timeline</label>
                  <input
                    type="text"
                    value={estDeliveryDays}
                    onChange={(e) => setEstDeliveryDays(e.target.value)}
                    placeholder="e.g. 2-3 Business Days"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={handleSaveLogisticsSubmit}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Save Logistics & Launch WhatsApp Update</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER PROFILE & ADDRESS */}
          {activeTab === 'customer' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-950 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    <span>Customer Details</span>
                  </h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-950 font-black flex items-center justify-center text-base sm:text-lg border border-amber-500/30 shrink-0">
                    {getInitials(order.customer_name)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="font-black text-base sm:text-lg text-slate-950 block truncate">
                      {order.customer_name}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                      <span>Phone: {order.customer_mobile}</span>
                      <button
                        onClick={() => handleCopyText(order.customer_mobile, 'Phone Number')}
                        className="text-amber-600 hover:text-amber-700 p-0.5 rounded cursor-pointer"
                        title="Copy Phone Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <a
                    href={`tel:${order.customer_mobile}`}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Phone</span>
                  </a>
                  <a
                    href={WhatsAppService.generateOrderWhatsAppLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-slate-950" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-950 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <span>Shipping Address</span>
                  </h3>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `${order.shipping_address}, ${order.city}, ${order.state} - ${order.pincode}`,
                        'Full Shipping Address'
                      )
                    }
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {order.shipping_address}, {order.city}, {order.state} -{' '}
                  <strong className="text-slate-950 font-black">{order.pincode}</strong>
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS & WAREHOUSE NOTES */}
          {activeTab === 'audit' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
              {/* Internal Notes Input */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="font-black text-sm text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Internal Warehouse Notes</span>
                </h3>

                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Add internal dispatch notes, fragile warnings, or special requests..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />

                <button
                  onClick={() => {
                    onSaveLogistics(order.id, courierPartner, trackingNumber, estDeliveryDays, adminNotesInput);
                    onShowToast('Internal admin notes updated!', 'success');
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>

              {/* Status Audit History Log */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h3 className="font-black text-sm text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <History className="w-4 h-4 text-slate-700" />
                  <span>Status Audit Trail</span>
                </h3>

                <div className="space-y-3">
                  {(order.history || [
                    {
                      status: order.status,
                      timestamp: order.created_at,
                      note: 'Order created',
                      actor: 'System / Customer',
                    },
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-amber-500 pl-3 py-1">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-950 uppercase">{item.status}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                          By: {item.actor || 'Admin'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
