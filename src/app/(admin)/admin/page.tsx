'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  PackageCheck,
  RefreshCw,
  IndianRupee,
  CalendarDays,
} from 'lucide-react';
import { OrderService } from '@/lib/services/order.service';
import { InventoryService, StockItem } from '@/lib/services/inventory.service';
import { Order } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    const [fetchedOrders, stockItems] = await Promise.all([
      OrderService.getAllOrders(),
      InventoryService.getAllStock(),
    ]);
    setOrders(fetchedOrders);
    // Use actual safety_threshold from DB — no hardcoded values
    setLowStockItems(
      stockItems.filter((item) => item.available_stock <= item.safety_threshold)
    );
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds to catch new orders
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.grand_total, 0);
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.grand_total, 0);

  const pendingFulfillmentCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PACKING'
  ).length;

  const handleUpdateStatus = async (orderId: string, newStatus: any) => {
    const updated = await OrderService.updateOrderStatus(orderId, newStatus);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
            <span>Live Supabase data</span>
            <span className="text-slate-300">•</span>
            <span>Auto-refreshes every 60s</span>
            <span className="text-slate-300">•</span>
            <span>Last: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders ({pendingFulfillmentCount} Pending)</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100/80 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-950">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-950">
            ₹{todayRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {todayOrders.length} orders today
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-950">
            ₹{averageOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {totalOrdersCount} total orders
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-600">
            {pendingFulfillmentCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Need fulfillment action
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Feed */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-black text-sm sm:text-base text-slate-950">Recent Order Activity</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order No</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-extrabold text-slate-950">{order.order_number}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">{order.customer_name}</span>
                      <span className="text-slate-400 text-[10px]">
                        {order.city}, {order.state}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[10px]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short',
                      })}
                    </td>
                    <td className="py-3 font-black text-slate-950">
                      ₹{order.grand_total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-900'
                            : order.status === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[10px] hover:bg-emerald-400 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PACKING')}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] hover:bg-amber-400 transition-colors"
                        >
                          Pack
                        </button>
                      )}
                      {order.status === 'PACKING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
                          className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] hover:bg-blue-500 transition-colors"
                        >
                          Dispatch
                        </button>
                      )}
                      {order.status === 'DISPATCHED' && (
                        <span className="text-[10px] text-emerald-600 font-extrabold">Dispatched ✓</span>
                      )}
                      {order.status === 'DELIVERED' && (
                        <span className="text-[10px] text-emerald-700 font-extrabold">Delivered ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Feed */}
          <div className="sm:hidden space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-950">{order.order_number}</span>
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <div>
                    <span className="font-bold block text-slate-900">{order.customer_name}</span>
                    <span className="text-[10px] text-slate-500">{order.city}, {order.state}</span>
                  </div>
                  <span className="font-black text-slate-950 text-sm">
                    ₹{order.grand_total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      className="w-full py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PACKING')}
                      className="w-full py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs"
                    >
                      Pack Order
                    </button>
                  )}
                  {order.status === 'PACKING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
                      className="w-full py-1.5 bg-blue-600 text-white font-black rounded-lg text-xs"
                    >
                      Dispatch Order
                    </button>
                  )}
                  {(order.status === 'DISPATCHED' || order.status === 'DELIVERED') && (
                    <span className="text-xs text-emerald-600 font-extrabold">✓ {order.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts Sidebar — uses real safety_threshold from DB */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Ledger
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-4">
                All products are above their safety threshold ✓
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                    <span className="text-slate-400 text-[10px]">SKU: {item.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded text-[11px] block">
                      {item.available_stock} units
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      threshold: {item.safety_threshold}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
