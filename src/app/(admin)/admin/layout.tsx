'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LogOut,
  UserCheck,
  AlertTriangle,
  SlidersHorizontal,
  Truck,
  Users,
  Settings,
  Plus,
  Gift,
} from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    async function checkAuth() {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      try {
        const sess = await AuthService.getCurrentSession();
        if (!sess) {
          router.push('/admin/login');
        } else {
          setSession(sess);
        }
      } catch (e) {
        console.error('Auth verification error:', e);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleConfirmSignOut = async () => {
    try {
      setIsSignOutModalOpen(false);
      await AuthService.logoutAdmin();
      router.push('/admin/login');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="flex items-center gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-md text-xs font-black text-slate-800">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Supabase Admin Session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders & Tracking', icon: ShoppingCart },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: SlidersHorizontal },
    { href: '/admin/inventory', label: 'Stock & Inventory', icon: Warehouse },
  ];

  const currentPageLabel = navItems.find((item) => item.href === pathname)?.label || 'Console';
  const userEmail = session?.user?.email || 'admin@vailypyropark.com';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between md:hidden shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-2xs">
            ⚡
          </div>
          <div>
            <span className="font-black text-xs text-slate-950 tracking-tight block">
              ADMIN CONSOLE
            </span>
            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block -mt-0.5">
              {currentPageLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Nav Overlay Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />

          <aside className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                    ⚡
                  </div>
                  <div>
                    <span className="font-black text-sm text-slate-950 tracking-tight block">
                      ADMIN CONSOLE
                    </span>
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider">
                      Vaily Pyro Park
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Auth Governance
              </div>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 font-black flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate pr-1">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-[11px]">{userEmail}</span>
                </div>
                <span className="text-[9px] bg-emerald-200 text-emerald-950 font-black px-1.5 py-0.2 rounded uppercase shrink-0">
                  Active
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsSignOutModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <Link
                href="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-900 shrink-0 border-r border-slate-200/90 sticky top-0 h-screen justify-between p-4 shadow-2xs">
        <div>
          <div className="pb-4 border-b border-slate-100 mb-4 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-2xs">
              ⚡
            </div>
            <div>
              <span className="font-black text-sm text-slate-950 tracking-tight block">
                ADMIN CONSOLE
              </span>
              <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block -mt-0.5">
                Vaily Pyro Park
              </span>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="w-full mb-3 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" /> Quick Add Product
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs translate-x-0.5'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Supabase Auth Session
          </div>
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 font-black flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate pr-1">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate text-[11px] font-mono">{userEmail}</span>
            </div>
            <span className="text-[9px] bg-emerald-200 text-emerald-950 font-black px-1.5 py-0.2 rounded uppercase shrink-0">
              Active
            </span>
          </div>

          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Viewport Content Container */}
      <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-y-auto">{children}</main>

      {/* Confirm Sign Out Popup Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-950 text-base">
                Confirm Admin Sign Out
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to end your session for <strong className="text-slate-900 font-mono">{userEmail}</strong>?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
