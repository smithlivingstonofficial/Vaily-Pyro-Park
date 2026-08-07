import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 text-slate-600 text-xs border-t border-slate-200">
      {/* Compact Features Row */}
      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">Direct Factory Rates</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">Safe Express Delivery</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">WhatsApp Copy Share</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">Sivakasi Direct Hub</span>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              🎆
            </div>
            <span className="font-black text-sm text-slate-950">VAILY PYRO PARK</span>
          </div>
          <p className="text-slate-500 text-[11px]">Sivakasi Direct Fireworks • Tamil Nadu, India</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
          <Link href="/" className="hover:text-amber-600 transition-colors">Storefront</Link>
          <Link href="/quick-shop" className="hover:text-amber-600 transition-colors">Quick Shop Mode</Link>
          <Link href="/buy-again" className="hover:text-amber-600 transition-colors">Buy Again</Link>
          <Link href="/track-order" className="hover:text-amber-600 transition-colors">Order Tracking</Link>
          <Link href="/admin" className="text-amber-600 hover:text-amber-700 font-black">Admin Panel</Link>
        </div>

        <div className="text-[11px] text-slate-500 text-left md:text-right">
          Minimum Orders: TN: ₹3,000 | South India: ₹4,000 | Rest of India: ₹5,000
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-slate-200 border-t border-slate-300 py-3 text-center text-[11px] text-slate-500 font-medium">
        © 2026 Vaily Pyro Park. All Rights Reserved.
      </div>
    </footer>
  );
};
