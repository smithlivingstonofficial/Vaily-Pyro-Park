'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAdminNotification } from '@/context/AdminNotificationContext';

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isMuted,
    permissionState,
    toggleMute,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
  } = useAdminNotification();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4 font-sans max-w-4xl mx-auto pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-2xs">
            🔔
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {unreadCount > 0
                ? `${unreadCount} unread order alerts`
                : 'All order alerts are up to date'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer border border-slate-200"
            title="Sync latest orders from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Sync DB</span>
          </button>

          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMuted
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isMuted ? 'Unmute Sound Alerts' : 'Mute Sound Alerts'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          {permissionState !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enable Push Alerts</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Push Enabled</span>
            </div>
          )}

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-2xl font-black shadow-inner">
              🎆
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Notifications Yet</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                When customers place new fireworks orders, real-time alerts will appear here with instant sound chimes and order details.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer mt-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Go to Orders</span>
            </Link>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                !item.read ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                    !item.read
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-950 tracking-tight">
                      Order #{item.orderNumber}
                    </span>
                    {!item.read && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    Customer: <span className="text-slate-950 font-black">{item.customerName}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                    <span>Amount: <strong className="text-slate-900 font-extrabold font-mono">₹{item.grandTotal.toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span>City: <strong className="text-slate-800 font-bold">{item.city}</strong></span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Link */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>

                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
                >
                  <span>View Order</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
