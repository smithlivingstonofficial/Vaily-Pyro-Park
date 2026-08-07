'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Shield, QrCode } from 'lucide-react';
import { Order } from '@/types';

interface PackingSlipModalProps {
  order: Order | null;
  onClose: () => void;
}

export function PackingSlipModal({ order, onClose }: PackingSlipModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-98 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              VAILY PYRO PARK • SIVAKASI DIRECT WAREHOUSE
            </span>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
              PACKING SLIP & TAX INVOICE
            </h2>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              Invoice #{order.order_number} • Date:{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Dispatch From */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Dispatched From
            </span>
            <span className="font-black text-slate-950 block">Vaily Pyro Park Main Depot</span>
            <span className="text-slate-600 text-[11px] block leading-relaxed">
              142/A Bypass Road, Sivakasi Industrial Estate, Tamil Nadu - 626123
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">GSTIN: 33AAAFF9012K1Z5</span>
          </div>

          {/* Delivery To */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Ship & Bill To Customer
            </span>
            <span className="font-black text-slate-950 block">{order.customer_name}</span>
            <span className="text-slate-600 text-[11px] block leading-relaxed">
              {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">Mobile: {order.customer_mobile}</span>
          </div>
        </div>

        {/* Shipping & Payment Summary Banner */}
        <div className="bg-slate-100/90 text-slate-900 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Payment Mode:</span>
            <span
              className={`font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                order.is_paid
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {order.is_paid ? 'PAID ONLINE ✓' : 'COLLECT CASH ON DELIVERY (COD)'}
            </span>
          </div>

          {order.courier_partner && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Courier:</span>
              <span className="font-bold text-amber-400">
                {order.courier_partner} ({order.tracking_number || 'Pending'})
              </span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Unit Price</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                  <td className="p-3 text-center text-slate-600 font-mono">
                    ₹{item.unit_price.toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-black text-amber-700 bg-amber-50/50">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right font-black text-slate-950 font-mono">
                    ₹{item.total_price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal Calculation Strip */}
        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600 font-medium max-w-xs ml-auto">
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
            <span>Delivery Freight ({order.state}):</span>
            <span className="font-bold text-slate-900">
              {order.delivery_fee === 0 ? (
                <span className="text-emerald-600 font-black">FREE</span>
              ) : (
                `₹${order.delivery_fee.toLocaleString()}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
            <span>Grand Total Payable:</span>
            <span className="text-amber-600 font-black text-base font-mono">
              ₹{order.grand_total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Warehouse Inspection Checklist & Barcode Simulation */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Warehouse Quality & Safety Inspection
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Count Verified
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Waterproof Packed
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Caution Labeled
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <QrCode className="w-8 h-8 text-slate-800" />
            <div className="text-[9px] font-mono text-slate-500">
              <div>SCAN TO VERIFY</div>
              <div className="font-bold text-slate-800">{order.order_number}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
