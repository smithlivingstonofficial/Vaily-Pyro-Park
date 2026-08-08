'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Package, ArrowLeft, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { OrderService } from '@/lib/services/order.service';
import { WhatsAppService } from '@/lib/services/whatsapp.service';
import { Order } from '@/types';

export default function TrackOrderPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearchedOrder(null);

    const term = searchInput.trim();
    if (!term) return;

    setHasSearched(true);
    const allOrders = await OrderService.getAllOrders();
    const found = allOrders.find(
      (o) =>
        o.order_number.toLowerCase() === term.toLowerCase() ||
        o.id === term ||
        o.customer_mobile === term
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setErrorMsg(`No order found matching "${term}". Please check your Order Number or Mobile.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div>
            <span className="text-amber-600 font-extrabold text-xs uppercase tracking-wider block mb-1">
              Order Status
            </span>
            <h1 className="text-2xl font-black text-slate-950">Track Your Cracker Order</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Order Number (e.g. VPP-2026-1001) or Registered Mobile Number to view live dispatch status.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Mobile (e.g. 9840123456) or Order Number"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shrink-0 shadow-md"
            >
              SEARCH
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {searchedOrder && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <div>
                  <span className="font-black text-slate-950 text-base block">{searchedOrder.order_number}</span>
                  <span className="text-xs text-slate-500">Customer: {searchedOrder.customer_name}</span>
                </div>
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                  {searchedOrder.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Shipping Address:</span>
                  <span className="font-bold text-slate-900">{searchedOrder.city}, {searchedOrder.state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-black text-amber-700">₹{searchedOrder.grand_total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>{new Date(searchedOrder.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/order-confirmation/${searchedOrder.id}`}
                  className="flex-1 py-2.5 bg-slate-950 text-white font-bold text-xs rounded-xl text-center"
                >
                  View Full Tracking Page
                </Link>
                <a
                  href={WhatsAppService.generateOrderWhatsAppLink(searchedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" /> WhatsApp Copy
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
