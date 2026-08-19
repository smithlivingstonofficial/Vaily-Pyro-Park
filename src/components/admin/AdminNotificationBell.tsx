'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAdminNotification } from '@/context/AdminNotificationContext';

export function AdminNotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    toasts,
    isMuted,
    permissionState,
    toggleMute,
    requestPermission,
    dismissToast,
    markAsRead,
    markAllAsRead,
  } = useAdminNotification();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    // On mobile screens, navigate directly to dedicated Notifications page
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push('/admin/notifications');
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* HEADER BELL BUTTON & UNREAD BADGE */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleBellClick}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative cursor-pointer border border-slate-200/80 shrink-0"
          title="Notifications"
          aria-label="Toggle notifications menu"
        >
          <Bell className="w-4 h-4 text-slate-800" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-2xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* NOTIFICATION DROPDOWN POPUP (DESKTOP) */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                  🔔
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white">Notifications</h3>
                  <p className="text-[11px] text-amber-400 font-semibold">
                    {unreadCount > 0 ? `${unreadCount} unread order alerts` : 'All caught up!'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Controls Bar */}
            <div className="bg-slate-50 p-2.5 border-b border-slate-200/80 flex items-center justify-between gap-2 text-xs">
              {permissionState !== 'granted' ? (
                <button
                  onClick={requestPermission}
                  className="py-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Enable Push</span>
                </button>
              ) : (
                <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Push Active
                </span>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 text-slate-700 hover:text-slate-950 font-extrabold hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 bg-white">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-xl font-bold">
                    🎆
                  </div>
                  <p className="text-xs font-bold text-slate-800">No New Notifications</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    When customers place orders, real-time alerts will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 flex items-start justify-between gap-3 text-xs transition-colors cursor-pointer ${
                      !item.read ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-950">{item.orderNumber}</span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-700 font-bold truncate">{item.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ₹{item.grandTotal.toLocaleString('en-IN')} • {item.city}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(item.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <Link
                        href="/admin/orders"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-amber-600 font-black hover:text-amber-700 inline-flex items-center gap-0.5"
                      >
                        <span>View Order</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Link */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-black text-slate-900 hover:text-amber-600 transition-colors inline-flex items-center gap-1"
              >
                <span>View All Notifications Page →</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* REAL-TIME FLOATING VISUAL TOAST ALERTS */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-[92vw]">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/50 flex items-start justify-between gap-3 animate-in slide-in-from-top-4 duration-200"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <h4 className="font-black text-xs text-amber-400 uppercase tracking-wider">
                    {toast.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-100 font-bold leading-tight">{toast.message}</p>
                <div className="pt-1">
                  <Link
                    href="/admin/orders"
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-xl transition-all shadow-2xs"
                  >
                    <span>View Order Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
