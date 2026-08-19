'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  KeyRound,
  Save,
  Check,
  Trash2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';
import { useAdminNotification } from '@/context/AdminNotificationContext';

export default function AdminProfilePage() {
  const router = useRouter();
  const { isMuted, toggleMute, permissionState, requestPermission } = useAdminNotification();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [adminName, setAdminName] = useState('Store Administrator');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const sess = await AuthService.getCurrentSession();
        setSession(sess);
        if (typeof window !== 'undefined') {
          const savedName = localStorage.getItem('vpp_admin_name');
          const savedPhone = localStorage.getItem('vpp_admin_phone');
          if (savedName) setAdminName(savedName);
          if (savedPhone) setPhone(savedPhone);
        }
      } catch (e) {
        console.error('Error fetching admin session:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vpp_admin_name', adminName);
      localStorage.setItem('vpp_admin_phone', phone);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await AuthService.updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setPasswordError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await AuthService.logoutAdmin();
    router.push('/admin/login');
  };

  const handleClearCache = () => {
    if (confirm('Clear local admin cache and notification history?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vpp_admin_notifications_v1');
      }
      alert('Admin local cache cleared successfully!');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-800">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  const userEmail = session?.user?.email || 'admin@vailypyropark.com';

  return (
    <div className="space-y-4 sm:space-y-6 font-sans max-w-4xl mx-auto pb-12">
      {/* Header Profile Card */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-slate-950 font-bold text-lg sm:text-2xl flex items-center justify-center shadow-2xs shrink-0">
            {userEmail.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {adminName}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono font-medium truncate">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin"
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive stacked sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Account Details & Password Change */}
        <div className="md:col-span-7 space-y-4 sm:space-y-6">
          {/* Section 1: Personal Details */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <span>Profile Information</span>
              </h2>
              {savedSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Administrator Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userEmail}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-slate-500 font-mono font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Change Password</span>
              </h2>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-10 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-10 py-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Preferences & Maintenance */}
        <div className="md:col-span-5 space-y-4 sm:space-y-6">
          {/* Section 3: Notification Preferences */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Notification Settings</span>
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80 gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">Sound Chime</span>
                  <span className="text-slate-500 text-[11px] block">
                    Play audio chime on order receipt
                  </span>
                </div>
                <button
                  onClick={toggleMute}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                    isMuted
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isMuted ? 'Muted' : 'Active'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80 gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">Desktop Push</span>
                  <span className="text-slate-500 text-[11px] block">
                    Native browser push notifications
                  </span>
                </div>
                {permissionState !== 'granted' ? (
                  <button
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Enable
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Push Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Maintenance */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-slate-600" />
                <span>Storage & Cache</span>
              </h2>
            </div>

            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Clear local notification history if data needs to be refreshed.
            </p>

            <button
              onClick={handleClearCache}
              className="w-full py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
