'use client';

import React from 'react';
import { Package, Clock, Truck, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Total Orders */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full group-hover:scale-110 transition-transform pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Ledger Orders
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {totalOrdersCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                +100% active
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-800 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-2xs">
            <Package className="w-5 h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Metric 2: Pending Fulfillment */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full group-hover:scale-110 transition-transform pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Pending Fulfillment
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
                {pendingCount}
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200/60 animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center border border-amber-200 shadow-2xs">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Metric 3: In-Transit Dispatches */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              In-Transit Dispatches
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">
                {dispatchedCount}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
                Couriers Active
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200/80 shadow-2xs">
            <Truck className="w-5 h-5 text-blue-700" />
          </div>
        </div>
      </div>

      {/* Metric 4: Revenue & AOV */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Settled Revenue
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                ₹{totalPaidRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">
                Avg ₹{avgOrderValue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200/80 shadow-2xs">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
