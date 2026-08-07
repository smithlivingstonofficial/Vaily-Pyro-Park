'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await AuthService.loginAdmin(email.trim(), password);
      setSuccessMsg('✓ Authenticated successfully! Redirecting to Admin Console...');
      setTimeout(() => {
        router.push('/admin');
      }, 800);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@vailypyropark.com');
    setPassword('admin123456');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl space-y-6 animate-in zoom-in-98 duration-200">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md">
            ⚡
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              VAILY PYRO PARK • SIVAKASI DIRECT
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
              Admin Console Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Authenticate with your Supabase Admin credentials
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vailypyropark.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating with Supabase...</span>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold block">
            Demo Credentials Quick Fill:
          </span>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Use `admin@vailypyropark.com`</span>
          </button>
        </div>
      </div>
    </div>
  );
}
