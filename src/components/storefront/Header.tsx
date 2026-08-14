'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ShoppingBag,
  MapPin,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  Home,
  Package,
  ChevronRight,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Category, DeliveryZone } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCart: () => void;
  categories?: Category[];
  zones?: DeliveryZone[];
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  categories = [],
  zones = [],
}) => {
  const { itemCount, subtotal, selectedZone, setSelectedZone, minOrderThreshold, isMinOrderReached } = useCart();
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deduplicate delivery zones by zone_name
  const uniqueZones = useMemo(() => {
    const map = new Map<string, DeliveryZone>();
    zones.forEach((z) => {
      const key = z.zone_name.toLowerCase().trim();
      if (!map.has(key)) map.set(key, z);
    });
    return Array.from(map.values());
  }, [zones]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-sans">
        {/* Streamlined Top Ticker Bar */}
        <div className="bg-amber-100 text-amber-950 px-3 py-1 text-[10px] sm:text-[11px] font-bold border-b border-amber-200/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">Sivakasi Direct Rates</span>
            </div>
            <span className="font-extrabold text-amber-900 shrink-0">
              Min Order: ₹{minOrderThreshold.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Responsive Brand Header */}
        <div className="px-3 sm:px-4 py-2.5 max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Two-Tone Brand Title with Sivakasi Direct Pill Badge */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-base sm:text-lg tracking-tight font-heading">
              <span className="font-extrabold text-slate-900">VAILY PYRO</span>{' '}
              <span className="font-black text-amber-600">PARK</span>
            </span>
            <span className="bg-amber-100/90 text-amber-900 font-extrabold text-[9px] px-2 py-0.5 rounded-md border border-amber-300/80 uppercase tracking-widest hidden xs:inline-block sm:inline-block">
              Sivakasi Direct
            </span>
          </Link>

          {/* Right Cart & Region & Mobile Menu Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Region Picker Button (Desktop/Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowZonePicker(!showZonePicker)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-bold cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[90px]">{selectedZone.zone_name}</span>
              </button>

              {showZonePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Region
                  </div>
                  {uniqueZones.map((zone: DeliveryZone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowZonePicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex flex-col transition-colors cursor-pointer ${
                        selectedZone.id === zone.id
                          ? 'bg-amber-500/15 text-amber-900 font-bold border border-amber-300'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{zone.zone_name}</span>
                      <span className="text-[10px] text-slate-500">Min Order: ₹{zone.min_order_amount.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart CTA */}
            <button
              onClick={onOpenCart}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isMinOrderReached
                  ? 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold font-mono">₹{subtotal.toLocaleString()}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SINGLE ROW TOOLBAR: Animated Expanding Search + Category Filter Dropdown */}
        <div className="px-3 sm:px-4 py-1.5 max-w-7xl mx-auto flex items-center justify-between gap-2 border-t border-slate-100 relative">
          {/* Animated Expanding Search Input Box */}
          <div
            className={`relative transition-all duration-300 ease-out flex-1 min-w-0 ${
              isSearchFocused ? 'z-20 shadow-xs' : 'z-10'
            }`}
          >
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search sparklers, pots..."
              className={`w-full border border-slate-200/80 text-slate-900 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none transition-all placeholder:text-slate-400 font-medium ${
                isSearchFocused || searchQuery
                  ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                  : 'bg-slate-100/90 hover:bg-slate-100'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 font-bold bg-slate-200/60 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`flex items-center justify-between gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                selectedCategory !== 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span className="truncate max-w-[85px] sm:max-w-[140px]">
                  {selectedCategory === 'all'
                    ? 'Category'
                    : categories.find((c: Category) => c.id === selectedCategory)?.name || 'Category'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCategoryDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1.5 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                    <span>Select Category</span>
                    <span className="text-[9px] text-amber-600 font-bold">{categories.length} Total</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>

                  {categories.map((cat: Category) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PORTAL-RENDERED MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9998] flex justify-end font-sans">
          {/* Full Screen Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in z-[9998]"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel Sheet */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full min-h-screen shadow-2xl z-[9999] flex flex-col justify-between p-4 animate-in slide-in-from-right duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-base tracking-tight font-heading">
                  <span className="font-extrabold text-slate-900">VAILY PYRO</span>{' '}
                  <span className="font-black text-amber-600">PARK</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 text-xs font-bold">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-500/10 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span>Home &amp; Shop</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/track-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-500/10 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Track Your Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Shop Contact & Enquiry Info Section */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Shop Contact &amp; Support:
                </span>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <a
                    href="tel:+919952108746"
                    className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Call Us Directly</span>
                      <span className="font-mono text-xs">+91 99521 08746</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919952108746?text=Hi%20Vaily%20Pyro%20Park,%20I%20have%20an%20enquiry%20regarding%20fireworks."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block font-normal">WhatsApp Enquiry</span>
                      <span className="text-xs">Chat on WhatsApp</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Contact Info */}
            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1 mt-4">
              <span className="font-bold text-slate-800 block">Vaily Pyro Park</span>
              <span>Direct Factory Outlet • Sivakasi, Tamil Nadu</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
