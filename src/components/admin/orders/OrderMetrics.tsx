'use client';

import React from 'react';
import { Package, Clock, Truck, TrendingUp } from 'lucide-react';
import { Order } from '@/types';

interface OrderMetricsProps {
  orders: Order[];
}

export function OrderMetrics({ orders }: OrderMetricsProps) {
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PACKING'
  ).length;
  const dispatchedCount = orders.filter((o) => o.status === 'DISPATCHED').length;
  const paidOrders = orders.filter((o) => o.is_paid);
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.grand_total, 0);
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalPaidRevenue / paidOrders.length) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {/* Metric 1: Total Orders */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Orders
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                {totalOrdersCount}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                Ledger
              </span>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center border border-amber-200 shadow-2xs shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Metric 2: Pending Orders */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Fulfillment
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-2xl font-bold text-amber-600 tracking-tight">
                {pendingCount}
              </span>
              {pendingCount > 0 && (
                <span className="text-[9px] sm:text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200/60 animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center border border-amber-200 shadow-2xs shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Metric 3: Dispatched Orders */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Dispatched Orders
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-2xl font-bold text-blue-600 tracking-tight">
                {dispatchedCount}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
                Dispatched
              </span>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200/80 shadow-2xs shrink-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
          </div>
        </div>
      </div>

      {/* Metric 4: Revenue & AOV */}
      <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Paid Revenue
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-2xl font-bold text-emerald-600 tracking-tight">
                ₹{totalPaidRevenue.toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 block truncate">
                Avg ₹{avgOrderValue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200/80 shadow-2xs shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
