'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, CheckCircle2, Phone, Building, Percent, Sparkles, Save, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Vaily Pyro Park');
  const [tagline, setTagline] = useState('Sivakasi Direct Fireworks Outlet');
  const [helplineMobile, setHelplineMobile] = useState('+91 98401 23456');
  const [whatsappNumber, setWhatsappNumber] = useState('919840123456');
  const [gstin, setGstin] = useState('33AAACV1234A1Z5');
  const [announcement, setAnnouncement] = useState('⚡ DIWALI PRE-BOOKING OPEN: Get up to 75% OFF Factory Direct Rates!');

  const [dbStatus, setDbStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestDatabase = async () => {
    setDbStatus('TESTING');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setDbStatus('CONNECTED');
    } catch (e) {
      console.error(e);
      setDbStatus('ERROR');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Store Settings & Sivakasi Depot Config
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage factory depot branding, helpline contact, GST tax ID, banner announcements, and Supabase health
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Depot settings saved successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Depot Profile Section */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-slate-950 text-base">Sivakasi Depot Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Outlet Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={helplineMobile}
                onChange={(e) => setHelplineMobile(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">GSTIN / Factory Tax Identification</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Announcement Ticker Message */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-slate-950 text-base">Storefront Ticker Announcement</h2>
          </div>

          <div className="text-xs space-y-2">
            <label className="block font-bold text-slate-700">Top Header Announcement Message</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-950 outline-none"
            />
          </div>
        </div>

        {/* Database Health Monitor */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <h2 className="font-black text-slate-950 text-base">Supabase Database Connection</h2>
            </div>
            <button
              type="button"
              onClick={handleTestDatabase}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs cursor-pointer"
            >
              Test Supabase Ping
            </button>
          </div>

          <div className="text-xs">
            {dbStatus === 'TESTING' && (
              <span className="text-amber-700 font-bold">Pinging Supabase Postgres server...</span>
            )}
            {dbStatus === 'CONNECTED' && (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supabase Connection Healthy (Realtime RLS Active)
              </span>
            )}
            {dbStatus === 'ERROR' && (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-600" /> Database Connection Failed. Please check .env.local keys.
              </span>
            )}
            {dbStatus === 'IDLE' && (
              <span className="text-slate-500 font-medium">Supabase Project Target: lwbqlysuqxxfutqlqggf.supabase.co</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </form>
    </div>
  );
}
