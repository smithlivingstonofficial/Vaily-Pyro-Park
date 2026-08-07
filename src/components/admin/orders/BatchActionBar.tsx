'use client';

import React from 'react';
import { CheckCircle2, Package, Truck, CreditCard, Download, X } from 'lucide-react';
import { OrderStatus } from '@/types';

interface BatchActionBarProps {
  selectedCount: number;
  onBulkStatusUpdate: (status: OrderStatus) => void;
  onBulkPaymentUpdate: (isPaid: boolean) => void;
  onExportCSV: () => void;
  onDeselectAll: () => void;
}

export function BatchActionBar({
  selectedCount,
  onBulkStatusUpdate,
  onBulkPaymentUpdate,
  onExportCSV,
  onDeselectAll,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-200/90 backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-6 duration-200 max-w-2xl w-[92vw]">
      <div className="flex items-center gap-2 border-r border-slate-200 pr-3 shrink-0">
        <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-2xs">
          {selectedCount} Selected
        </span>
        <span className="text-xs text-slate-700 font-bold hidden sm:inline">Batch Actions</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 py-0.5">
        <button
          onClick={() => onBulkStatusUpdate('CONFIRMED')}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-2xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirm</span>
        </button>

        <button
          onClick={() => onBulkStatusUpdate('PACKING')}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-2xs"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Pack</span>
        </button>

        <button
          onClick={() => onBulkStatusUpdate('DISPATCHED')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-2xs"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Dispatch</span>
        </button>

        <button
          onClick={() => onBulkPaymentUpdate(true)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-2xs"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Mark Paid</span>
        </button>

        <button
          onClick={onExportCSV}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-slate-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <button
        onClick={onDeselectAll}
        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-colors shrink-0 cursor-pointer border border-slate-200"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
