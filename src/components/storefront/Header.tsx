'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Sparkles, Search, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { INITIAL_DELIVERY_ZONES } from '@/lib/mockData';
import { Category } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenCart: () => void;
  categories?: Category[];
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  onOpenCart,
  categories = [],
}) => {
  const { itemCount, subtotal, selectedZone, setSelectedZone, minOrderThreshold, isMinOrderReached } = useCart();
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
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

      {/* Main Responsive Brand & Cart Header */}
      <div className="px-3 sm:px-4 py-2 max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-xs">
            🎆
          </div>
          <div className="leading-tight">
            <span className="font-black text-sm sm:text-base tracking-tight text-slate-950 block">
              VAILY PYRO
            </span>
            <span className="text-[9px] text-amber-600 font-extrabold tracking-wider uppercase block -mt-0.5">
              Sivakasi Direct
            </span>
          </div>
        </Link>

        {/* Right Cart & Region Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Region Picker Button (Desktop/Tablet) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowZonePicker(!showZonePicker)}
              className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-bold"
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              <span className="truncate max-w-[90px]">{selectedZone.zone_name}</span>
            </button>

            {showZonePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Region
                </div>
                {INITIAL_DELIVERY_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      setShowZonePicker(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex flex-col transition-colors ${
                      selectedZone.id === zone.id
                        ? 'bg-amber-500/15 text-amber-900 font-bold border border-amber-300'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{zone.zone_name}</span>
                    <span className="text-[10px] text-slate-500">Min: ₹{zone.min_order_amount.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart CTA */}
          <button
            onClick={onOpenCart}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-black text-xs transition-all ${
              isMinOrderReached
                ? 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-black">₹{subtotal.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* SINGLE ROW TOOLBAR: Animated Expanding Search + Category Filter Dropdown + View Switcher */}
      <div className="px-3 sm:px-4 py-1.5 max-w-7xl mx-auto flex items-center justify-between gap-2 border-t border-slate-100 relative">
        {/* Animated Expanding Search Input Box */}
        <div
          className={`relative transition-all duration-300 ease-out min-w-0 ${
            isSearchFocused
              ? 'flex-1 z-20 shadow-xs'
              : 'flex-1 z-10'
          }`}
        >
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search sparklers..."
            className={`w-full border border-slate-200/80 text-slate-900 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none transition-all placeholder:text-slate-400 font-medium ${
              isSearchFocused || searchQuery
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                : 'bg-slate-100/90 hover:bg-slate-100'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 font-black bg-slate-200/60 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Filter */}
        <div className={`relative shrink-0 transition-all duration-200 ${isSearchFocused ? 'hidden xs:block sm:block' : 'block'}`}>
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              selectedCategory !== 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-1 truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-slate-600" />
              <span className="truncate max-w-[75px] sm:max-w-[130px]">
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
                <div className="text-[10px] font-extrabold text-slate-400 px-2.5 py-1.5 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                  <span>Select Category</span>
                  <span className="text-[9px] text-amber-600 font-bold">{categories.length} Total</span>
                </div>

                <button
                  onClick={() => {
                    onSelectCategory('all');
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
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
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
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

        {/* Grid vs List View Switcher */}
        <div className={`flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs transition-all duration-200 ${isSearchFocused ? 'hidden xs:flex sm:flex' : 'flex'}`}>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg text-xs transition-all duration-150 ${
              viewMode === 'grid'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg text-xs transition-all duration-150 ${
              viewMode === 'list'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

