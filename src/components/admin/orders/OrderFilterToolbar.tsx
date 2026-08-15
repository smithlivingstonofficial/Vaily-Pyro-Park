'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  Calendar,
  CheckSquare,
  Square,
  X,
  Filter,
  Download,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrderFilterToolbarProps {
  orders: Order[];
  filteredOrders: Order[];
  activeStatusTab: string;
  setActiveStatusTab: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  selectedOrderIds: string[];
  onSelectAll: () => void;
  onResetFilters: () => void;
  onExportCSV?: () => void;
}

const STATUS_OPTIONS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PACKING', label: 'Packing' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export function OrderFilterToolbar({
  orders,
  filteredOrders,
  activeStatusTab,
  setActiveStatusTab,
  dateFilter,
  setDateFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedOrderIds,
  onSelectAll,
  onResetFilters,
  onExportCSV,
}: OrderFilterToolbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const isFiltered = activeStatusTab !== 'ALL' || dateFilter !== 'ALL' || searchQuery !== '';

  const getStatusCount = (status: string) => {
    if (status === 'ALL') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const getStatusLabel = (key: string) => {
    if (key === 'ALL') return 'Status: All';
    const found = STATUS_OPTIONS.find((s) => s.key === key);
    return found ? `Status: ${found.label}` : `Status: ${key}`;
  };

  return (
    <div className="space-y-3">
      {/* Control Actions Row */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className={`relative transition-all duration-300 ease-out flex-1 min-w-[200px]`}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search by Order #, Customer, Mobile, City, Pincode..."
            className={`w-full border text-slate-900 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none transition-all placeholder:text-slate-400 font-medium ${
              isSearchFocused || searchQuery
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 font-black bg-slate-200/70 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Order Status Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                activeStatusTab !== 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-black'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{getStatusLabel(activeStatusTab)}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isStatusDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="absolute left-0 sm:left-auto right-auto sm:right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Filter by Order Status
                  </div>
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st.key}
                      onClick={() => {
                        setActiveStatusTab(st.key);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        activeStatusTab === st.key
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {getStatusCount(st.key)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative block">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                dateFilter !== 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{dateFilter === 'ALL' ? 'Date: All' : dateFilter}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isDateDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDateDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  {['ALL', 'Today', 'Last 7 Days', 'This Month'].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDateFilter(d);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        dateFilter === d
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d === 'ALL' ? 'All Time' : d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="px-2.5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Export Orders to CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Select All Orders Row */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-600 font-bold">
        <button
          onClick={onSelectAll}
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-amber-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>Select All Filtered ({filteredOrders.length} orders)</span>
        </button>

        <span className="text-[11px] text-slate-400 font-medium">
          Showing {filteredOrders.length} of {orders.length} total orders
        </span>
      </div>
    </div>
  );
}
