'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  PackageCheck,
  RefreshCw,
  IndianRupee,
  CalendarDays,
  Package,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { OrderService } from '@/lib/services/order.service';
import { Order } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    const fetchedOrders = await OrderService.getAllOrders();
    setOrders(fetchedOrders);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived KPI Metrics
  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.grand_total || 0), 0);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(
    (o) => o.created_at && o.created_at.split('T')[0] === todayStr
  );
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.grand_total || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">PENDING</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[10px]">CONFIRMED</span>;
      case 'PACKING':
      case 'PACKED':
        return <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded text-[10px]">PACKING</span>;
      case 'DISPATCHED':
        return <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded text-[10px]">DISPATCHED</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded text-[10px]">CANCELLED</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Live order stats, revenue summary, and quick management links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
            Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-normal block">
            Excludes cancelled orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            {totalOrders}
          </p>
          <span className="text-[10px] text-slate-500 font-normal block">
            All-time customer bookings
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            {pendingCount}
          </p>
          <span className="text-[10px] text-amber-700 font-semibold block">
            Requires admin confirmation
          </span>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-emerald-700 tracking-tight">
            ₹{todayRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-normal block">
            {todayOrders.length} orders booked today
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-600" />
              <span>Recent Customer Orders</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 font-normal text-center py-6">
                No orders received yet.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-slate-500 font-normal block truncate mt-0.5">
                      {order.customer_name} • {order.city}, {order.state}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">
                      ₹{(order.grand_total || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Management Actions Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Quick Actions</span>
            </h2>
          </div>

          <div className="space-y-2">
            <Link
              href="/admin/orders"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-900">Manage Orders</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/products"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900">Manage Products</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/categories"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">Manage Categories</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
