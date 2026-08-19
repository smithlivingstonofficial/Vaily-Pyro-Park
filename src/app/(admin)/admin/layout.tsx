'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';
import { AdminNotificationProvider } from '@/context/AdminNotificationContext';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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

  const userEmail = session?.user?.email || 'admin@vailypyropark.com';

  return (
    <AdminNotificationProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
        {/* Mobile Top Navigation Header */}
        <div className="md:hidden sticky top-0 z-30">
          <AdminNavbar
            userEmail={userEmail}
            isMobileNavOpen={isMobileNavOpen}
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            onSignOutClick={() => setIsSignOutModalOpen(true)}
          />
        </div>

        {/* Mobile Slide-Out Drawer Navigation */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
              <AdminSidebar
                userEmail={userEmail}
                onSignOutClick={() => setIsSignOutModalOpen(true)}
                onNavClick={() => setIsMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Desktop Permanent Left Navigation Sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">
          <AdminSidebar
            userEmail={userEmail}
            onSignOutClick={() => setIsSignOutModalOpen(true)}
          />
        </div>

        {/* Main Viewport Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
          {/* Desktop Top Header Bar for Real-time Notifications & Header Bar */}
          <div className="hidden md:block sticky top-0 z-20">
            <AdminNavbar
              userEmail={userEmail}
              isMobileNavOpen={isMobileNavOpen}
              onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
              onSignOutClick={() => setIsSignOutModalOpen(true)}
            />
          </div>

          <main className="flex-1 p-3 sm:p-6">{children}</main>
        </div>

        {/* Confirm Sign Out Modal */}
        {isSignOutModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="space-y-1">
              <h3 className="font-black text-slate-950 text-base">Sign Out</h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to sign out of <strong className="text-slate-900 font-mono">{userEmail}</strong>?
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
    </AdminNotificationProvider>
  );
}
