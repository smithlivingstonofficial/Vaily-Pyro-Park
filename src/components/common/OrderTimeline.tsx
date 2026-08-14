'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  AlertCircle,
  XCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { OrderStatus } from '@/types';

export interface TimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    status: 'PENDING',
    title: 'Order Placed',
    description: 'We received your order and details.',
    icon: Clock,
  },
  {
    status: 'CONFIRMED',
    title: 'Order Confirmed',
    description: 'Order confirmed & sent to warehouse.',
    icon: CheckCircle2,
  },
  {
    status: 'PACKING',
    title: 'Packing & Preparing',
    description: 'Items being safely packed.',
    icon: Package,
  },
  {
    status: 'DISPATCHED',
    title: 'Dispatched / Out for Delivery',
    description: 'Order handed to logistics partner.',
    icon: Truck,
  },
  {
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Successfully delivered to your location.',
    icon: CheckCheck,
  },
];

const STATUS_ORDER_MAP: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PACKING: 2,
  PACKED: 2, // Map PACKED to step 2 as well
  DISPATCHED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
  courierPartner?: string;
  trackingNumber?: string;
  interactive?: boolean;
  onUpdateStatus?: (newStatus: OrderStatus) => void;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  updatedAt,
  adminNotes,
  courierPartner,
  trackingNumber,
  interactive = false,
  onUpdateStatus,
}) => {
  const currentStepIndex = STATUS_ORDER_MAP[status] ?? 0;
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-950">
              Live Order Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time status progression from Sivakasi store hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 text-xs font-black px-3 py-1 rounded-full border border-red-200">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>ORDER CANCELLED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-xs font-black px-3 py-1 rounded-full border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>STATUS: {status}</span>
            </span>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-sm text-red-950">This order has been cancelled.</p>
            <p className="text-xs text-red-700 font-medium mt-0.5">
              If you have any questions or wish to place a new order, please contact customer support.
            </p>
          </div>
        </div>
      )}

      {/* Desktop & Tablet Horizontal Timeline */}
      {!isCancelled && (
        <div className="hidden sm:block">
          <div className="relative flex items-center justify-between">
            {/* Background connecting bar */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0 rounded-full" />
            
            {/* Progress line */}
            <div
              className="absolute top-5 left-6 h-1 bg-gradient-to-r from-amber-500 to-emerald-500 -z-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 90)}%`,
              }}
            />

            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center text-center w-1/5">
                  <button
                    type="button"
                    disabled={!interactive || !onUpdateStatus}
                    onClick={() => interactive && onUpdateStatus && onUpdateStatus(step.status)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
                    } ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 shadow-md scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>

                  <div className="mt-3 space-y-0.5">
                    <span
                      className={`text-xs font-extrabold block ${
                        isCurrent
                          ? 'text-amber-900 font-black'
                          : isPassed
                          ? 'text-slate-950'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block max-w-[120px] mx-auto leading-tight">
                      {step.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Vertical Timeline */}
      {!isCancelled && (
        <div className="sm:hidden space-y-4 relative pl-3">
          {/* Vertical bar line */}
          <div className="absolute top-3 bottom-3 left-6 w-0.5 bg-slate-200" />

          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isPassed = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.status}
                onClick={() => interactive && onUpdateStatus && onUpdateStatus(step.status)}
                className={`relative flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                  interactive ? 'cursor-pointer hover:bg-slate-50' : ''
                } ${
                  isCurrent ? 'bg-amber-500/10 border border-amber-300/80 shadow-2xs' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-200 shadow-xs'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-amber-950 font-black'
                          : isPassed
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        Active Step
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Interactive Quick Step Controls */}
      {interactive && onUpdateStatus && (
        <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Admin Workflow Action: Step Order Status Forward
          </span>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_STEPS.map((step) => {
              const isActive = status === step.status;
              return (
                <button
                  key={step.status}
                  type="button"
                  onClick={() => onUpdateStatus(step.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>{step.title}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onUpdateStatus('CANCELLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                status === 'CANCELLED'
                  ? 'bg-red-600 text-white font-black shadow-xs'
                  : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
              }`}
            >
              Cancel Order
            </button>
          </div>
        </div>
      )}

      {/* Logistics & Admin Notes Box */}
      {(courierPartner || trackingNumber || adminNotes) && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
          {courierPartner && (
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-slate-500">Courier Partner:</span>
              <span className="font-black text-slate-950">{courierPartner}</span>
            </div>
          )}
          {trackingNumber && (
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-slate-500">Tracking AWB #:</span>
              <span className="font-mono font-black text-amber-700">{trackingNumber}</span>
            </div>
          )}
          {adminNotes && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="font-bold text-slate-500 block mb-0.5">Status Note:</span>
              <p className="text-slate-800 font-medium italic bg-white p-2 rounded-xl border border-slate-200">
                "{adminNotes}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
