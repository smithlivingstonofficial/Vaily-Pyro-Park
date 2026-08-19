'use client';

import React from 'react';
import { Lock, AlertTriangle, Check, X } from 'lucide-react';
import { OrderStatus } from '@/types';

export interface PendingStatusChange {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
}

interface StatusConfirmationModalProps {
  pendingStatusChange: PendingStatusChange | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StatusConfirmationModal({
  pendingStatusChange,
  onCancel,
  onConfirm,
}: StatusConfirmationModalProps) {
  if (!pendingStatusChange) return null;

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'PACKING':
      case 'PACKED':
        return 'bg-amber-100 text-amber-950 border-amber-400';
      case 'DISPATCHED':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'DELIVERED':
        return 'bg-emerald-500 text-slate-950 font-black border-emerald-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-950">Confirm Stage Update</h3>
              <span className="text-xs text-slate-500 font-medium">
                Order #{pendingStatusChange.orderNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <p className="text-slate-700 font-medium text-center">
            Are you sure you want to transition this order to the next fulfillment stage?
          </p>

          <div className="flex items-center justify-center gap-3 pt-1 pb-1 font-black text-xs">
            <span className={`px-3 py-1.5 rounded-xl uppercase border ${getStatusBadgeStyle(pendingStatusChange.currentStatus)}`}>
              {pendingStatusChange.currentStatus}
            </span>
            <span className="text-amber-600 font-black text-lg">➔</span>
            <span className={`px-3 py-1.5 rounded-xl uppercase border shadow-2xs ${getStatusBadgeStyle(pendingStatusChange.newStatus)}`}>
              {pendingStatusChange.newStatus}
            </span>
          </div>

          {pendingStatusChange.newStatus === 'CANCELLED' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[11px] font-bold flex items-start gap-2 mt-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                Warning: Cancelling this order will mark it as void in your system ledger.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm Stage Transition</span>
          </button>
        </div>
      </div>
    </div>
  );
}
