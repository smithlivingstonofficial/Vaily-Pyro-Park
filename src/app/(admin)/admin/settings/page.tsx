'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CheckCircle2,
  Phone,
  Building,
  Sparkles,
  Save,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SettingsService, StoreSettings } from '@/lib/services/settings.service';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: '',
    tagline: '',
    helpline_mobile: '',
    whatsapp_number: '',
    gstin: '',
    announcement_banner: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED' | 'ERROR'>('IDLE');

  // Load settings from DB on mount
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const data = await SettingsService.getAllSettings();
      setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleTestDatabase = async () => {
    setDbStatus('TESTING');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setDbStatus('CONNECTED');
    } catch (e) {
      console.error(e);
      setDbStatus('ERROR');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSavedSuccess(false);

    try {
      await SettingsService.saveAllSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    const data = await SettingsService.getAllSettings();
    setSettings(data);
    setLoading(false);
  };

  const Field = ({
    label,
    fieldKey,
    placeholder,
    mono = false,
    upper = false,
  }: {
    label: string;
    fieldKey: keyof StoreSettings;
    placeholder?: string;
    mono?: boolean;
    upper?: boolean;
  }) => (
    <div>
      <label className="block font-bold text-slate-700 mb-1 text-xs">{label}</label>
      <input
        type="text"
        required
        value={settings[fieldKey]}
        onChange={(e) =>
          setSettings((prev) => ({
            ...prev,
            [fieldKey]: upper ? e.target.value.toUpperCase() : e.target.value,
          }))
        }
        placeholder={placeholder}
        className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${
          mono ? 'font-mono' : ''
        } ${upper ? 'uppercase' : ''}`}
      />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Store Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            All settings are saved directly to the Supabase database
          </p>
        </div>
        <button
          type="button"
          onClick={handleReload}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload from DB
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 flex items-center justify-center gap-3 shadow-2xs">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-xs font-bold text-slate-600">Loading settings from database...</span>
        </div>
      )}

      {/* Save feedback banners */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved to database successfully!</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          {/* Depot Profile Section */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-amber-600" />
              <h2 className="font-black text-slate-950 text-base">Sivakasi Depot Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Store Outlet Name" fieldKey="store_name" placeholder="Vaily Pyro Park" />
              <Field label="Brand Tagline" fieldKey="tagline" placeholder="Sivakasi Direct Fireworks Outlet" />
              <Field
                label="Helpline Phone Number"
                fieldKey="helpline_mobile"
                placeholder="+91 98401 23456"
                mono
              />
              <Field
                label="WhatsApp Support Number (with country code)"
                fieldKey="whatsapp_number"
                placeholder="919840123456"
                mono
              />
              <div className="sm:col-span-2">
                <Field
                  label="GSTIN / Factory Tax Identification"
                  fieldKey="gstin"
                  placeholder="33AAACV1234A1Z5"
                  mono
                  upper
                />
              </div>
            </div>
          </div>

          {/* Announcement Ticker */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="font-black text-slate-950 text-base">Storefront Ticker Announcement</h2>
            </div>

            <div className="text-xs space-y-2">
              <label className="block font-bold text-slate-700">Top Header Announcement Message</label>
              <input
                type="text"
                value={settings.announcement_banner}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, announcement_banner: e.target.value }))
                }
                placeholder="⚡ DIWALI PRE-BOOKING OPEN..."
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-950 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <p className="text-slate-400 text-[10px] font-medium">
                This message is displayed in the storefront top header bar and saved to the database.
              </p>
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
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs cursor-pointer transition-colors"
              >
                Test Ping
              </button>
            </div>

            <div className="text-xs">
              {dbStatus === 'TESTING' && (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pinging Supabase Postgres...
                </span>
              )}
              {dbStatus === 'CONNECTED' && (
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supabase Connection Healthy
                </span>
              )}
              {dbStatus === 'ERROR' && (
                <span className="text-red-700 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" /> Connection failed — check .env.local keys.
                </span>
              )}
              {dbStatus === 'IDLE' && (
                <span className="text-slate-500 font-medium">
                  Click "Test Ping" to verify Supabase connectivity.
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save All Settings to Database
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
