'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Order } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { AudioService } from '@/lib/services/audio.service';
import { NotificationService } from '@/lib/services/notification.service';

export interface AdminNotificationItem {
  id: string;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  city: string;
  timestamp: string;
  read: boolean;
  order: Partial<Order>;
}

export interface AdminNotificationToast {
  id: string;
  title: string;
  message: string;
  orderNumber: string;
  grandTotal: number;
  order: Partial<Order>;
}

interface AdminNotificationContextType {
  notifications: AdminNotificationItem[];
  unreadCount: number;
  toasts: AdminNotificationToast[];
  isMuted: boolean;
  permissionState: NotificationPermission;
  toggleMute: () => void;
  requestPermission: () => Promise<void>;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  testSoundAlert: () => void;
  notifyNewOrder: (order: Partial<Order>) => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'vpp_admin_notifications_v1';

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [toasts, setToasts] = useState<AdminNotificationToast[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  // Load initial state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMuted(AudioService.isMuted());
      setPermissionState(NotificationService.getPermissionState());

      try {
        const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (saved) {
          const parsed: AdminNotificationItem[] = JSON.parse(saved);
          // Filter out legacy test notifications
          const clean = parsed.filter((n) => !n.orderNumber?.includes('TEST'));
          setNotifications(clean);
        }
      } catch (e) {
        console.error('Error loading saved notifications:', e);
      }
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (items: AdminNotificationItem[]) => {
    setNotifications(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
      } catch (e) {
        console.error('Error saving notifications:', e);
      }
    }
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notifyNewOrder = useCallback((order: Partial<Order>) => {
    if (!order.order_number) return;

    const newItem: AdminNotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: order.order_number,
      customerName: order.customer_name || 'Customer',
      grandTotal: order.grand_total || 0,
      city: order.city || 'Tamil Nadu',
      timestamp: new Date().toISOString(),
      read: false,
      order,
    };

    setNotifications((prev) => {
      // Prevent duplicate notification for same order number created within 5 seconds
      const exists = prev.some((n) => n.orderNumber === order.order_number);
      if (exists) return prev;
      const updated = [newItem, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
        } catch {}
      }
      return updated;
    });

    // 1. Play Web Audio API Chime
    AudioService.playNewOrderChime();

    // 2. Trigger Native Push Notification
    NotificationService.showOrderNotification(order);

    // 3. Show In-App Visual Toast
    const toastId = `toast-${Date.now()}`;
    const newToast: AdminNotificationToast = {
      id: toastId,
      title: '🎆 NEW ORDER RECEIVED!',
      message: `Order #${order.order_number} by ${order.customer_name || 'Customer'} (₹${(order.grand_total || 0).toLocaleString('en-IN')})`,
      orderNumber: order.order_number,
      grandTotal: order.grand_total || 0,
      order,
    };

    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(toastId);
    }, 6000);
  }, [dismissToast]);

  // Subscribe to Supabase Realtime & Local Broadcast Events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supabase = createClient();

    // 1. Realtime DB listener for new order inserts
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new) {
            notifyNewOrder(payload.new as Partial<Order>);
          }
        }
      )
      .subscribe();

    // 2. BroadcastChannel for cross-tab instant notification when checkout completes in same browser
    let broadcastChannel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('vpp_orders_channel');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data?.order) {
          notifyNewOrder(event.data.order);
        }
      };
    }

    // 3. Storage event fallback for older browsers
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vpp_last_created_order' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          notifyNewOrder(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      if (broadcastChannel) broadcastChannel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [notifyNewOrder]);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    AudioService.setMuted(nextState);
  };

  const requestPermission = async () => {
    const res = await NotificationService.requestPermission();
    setPermissionState(res);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const testSoundAlert = () => {
    AudioService.playNewOrderChime();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminNotificationContext.Provider
      value={{
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
        clearAllNotifications,
        testSoundAlert,
        notifyNewOrder,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotification must be used within an AdminNotificationProvider');
  }
  return context;
}
