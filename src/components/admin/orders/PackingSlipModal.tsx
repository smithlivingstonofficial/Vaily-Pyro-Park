'use client';

import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';
import { Order } from '@/types';

interface PackingSlipModalProps {
  order: Order | null;
  onClose: () => void;
}

export function PackingSlipModal({ order, onClose }: PackingSlipModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:fixed print:inset-0 print:z-[99999] print:bg-white print:p-0 print:m-0 print:block print:overflow-visible">
      {/* Print CSS Rules for Single Page A4 Fit */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-packing-slip {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Printable Card */}
      <div
        id="printable-packing-slip"
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-98 duration-150 print:animate-none print:max-w-none print:w-full print:max-h-none print:p-0 print:m-0 print:rounded-none print:border-none print:shadow-none print:overflow-visible print:space-y-3.5 print:static"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-300 pb-3 print:pb-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-black text-amber-700 uppercase tracking-widest block">
              VAILY PYRO PARK • SIVAKASI DIRECT WAREHOUSE
            </span>
            <h2 className="text-xl sm:text-2xl print:text-xl font-black text-slate-950 tracking-tight mt-0.5">
              PACKING SLIP & TAX INVOICE
            </h2>
            <span className="text-xs print:text-[11px] text-slate-600 font-mono font-bold block mt-0.5">
              Invoice #{order.order_number} • Date:{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Address Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs print:gap-2.5 print:text-[11px]">
          {/* Dispatch From */}
          <div className="bg-slate-50 p-3.5 print:p-2.5 rounded-2xl border border-slate-300 space-y-0.5 print:bg-white print:border-slate-300">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
              Dispatched From
            </span>
            <span className="font-black text-slate-950 text-xs sm:text-sm print:text-xs block">
              Vaily Pyro Park Main Depot
            </span>
            <span className="text-slate-700 text-[11px] print:text-[10px] block leading-snug">
              142/A Bypass Road, Sivakasi Industrial Estate, Tamil Nadu - 626123
            </span>
            <span className="text-[10px] text-slate-600 font-mono font-bold block pt-0.5">
              GSTIN: 33AAAFF9012K1Z5
            </span>
          </div>

          {/* Delivery To */}
          <div className="bg-slate-50 p-3.5 print:p-2.5 rounded-2xl border border-slate-300 space-y-0.5 print:bg-white print:border-slate-300">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
              Ship & Bill To Customer
            </span>
            <span className="font-black text-slate-950 text-xs sm:text-sm print:text-xs block">
              {order.customer_name}
            </span>
            <span className="text-slate-700 text-[11px] print:text-[10px] block leading-snug">
              {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
            </span>
            <span className="text-[10px] text-slate-700 font-mono font-bold block pt-0.5">
              Mobile: {order.customer_mobile}
            </span>
          </div>
        </div>

        {/* Shipping & Payment Mode Banner */}
        <div className="bg-slate-100 text-slate-950 border border-slate-300 p-3 print:p-2 rounded-2xl flex items-center justify-between gap-2 text-xs print:text-[11px] print:bg-white print:border-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-bold">Payment Mode:</span>
            <span
              className={`font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                order.is_paid
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              {order.is_paid ? 'PAID ONLINE ✓' : 'COLLECT CASH ON DELIVERY (COD)'}
            </span>
          </div>

          {order.courier_partner && (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-600 font-bold">Courier:</span>
              <span className="font-black text-slate-950">
                {order.courier_partner} ({order.tracking_number || 'Pending'})
              </span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-300 rounded-2xl overflow-hidden print:rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-950 font-black uppercase text-[10px] tracking-wider border-b border-slate-300 print:bg-slate-200">
              <tr>
                <th className="p-2.5 print:p-2 border-r border-slate-300">Item Description</th>
                <th className="p-2.5 print:p-2 text-center border-r border-slate-300 w-24">Unit Price</th>
                <th className="p-2.5 print:p-2 text-center border-r border-slate-300 w-16">Qty</th>
                <th className="p-2.5 print:p-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 print:p-2 font-extrabold text-slate-950 border-r border-slate-200 print:text-[11px]">
                    {item.product_name}
                  </td>
                  <td className="p-2.5 print:p-2 text-center text-slate-700 font-mono border-r border-slate-200 print:text-[11px]">
                    ₹{item.unit_price.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 print:p-2 text-center font-black text-slate-950 border-r border-slate-200 bg-amber-50/50 print:bg-transparent print:text-[11px]">
                    {item.quantity}
                  </td>
                  <td className="p-2.5 print:p-2 text-right font-black text-slate-950 font-mono print:text-[11px]">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Subtotal Summary */}
        <div className="pt-1.5 border-t border-slate-300 space-y-1 text-xs print:text-[11px] text-slate-700 font-bold max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="font-mono text-slate-950">₹{order.subtotal?.toLocaleString('en-IN')}</span>
          </div>
          {order.discount_amount && order.discount_amount > 0 ? (
            <div className="flex justify-between text-emerald-700 font-black">
              <span>Festival Discount:</span>
              <span className="font-mono">-₹{order.discount_amount.toLocaleString('en-IN')}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Delivery Freight ({order.state}):</span>
            <span className="font-mono text-slate-950">
              {order.delivery_fee === 0 ? (
                <span className="text-emerald-700 font-black">FREE</span>
              ) : (
                `₹${order.delivery_fee?.toLocaleString('en-IN')}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm font-black text-slate-950 pt-1.5 border-t-2 border-slate-950">
            <span>Grand Total Payable:</span>
            <span className="font-mono text-amber-700 print:text-black text-sm sm:text-base">
              ₹{order.grand_total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Warehouse Inspection Checklist & Verification Barcode */}
        <div className="pt-2.5 border-t border-slate-300 flex items-center justify-between gap-3 text-xs print:text-[10px] bg-slate-50 p-3 print:p-2.5 rounded-2xl print:bg-white print:border print:border-slate-300">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
              Warehouse Quality & Safety Inspection
            </span>
            <div className="flex items-center gap-3 text-[10px] print:text-[9px] font-black text-slate-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-black" /> Count Verified
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-black" /> Waterproof Packed
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-black" /> Caution Labeled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-300 pl-3 print:border-l">
            <QrCode className="w-8 h-8 print:w-7 print:h-7 text-slate-950" />
            <div className="text-[9px] font-mono text-slate-600">
              <div className="font-bold text-slate-500">SCAN TO VERIFY</div>
              <div className="font-black text-slate-950 text-xs">{order.order_number}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
