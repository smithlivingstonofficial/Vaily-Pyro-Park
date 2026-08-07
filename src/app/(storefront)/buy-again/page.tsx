'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ShoppingBag, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { OrderService } from '@/lib/services/order.service';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { Order } from '@/types';
import { useCart } from '@/context/CartContext';

export default function BuyAgainPage() {
  const router = useRouter();
  const { addToCart, clearCart } = useCart();

  const [inputTerm, setInputTerm] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFoundOrder(null);

    const term = inputTerm.trim();
    if (!term) return;

    const allOrders = await OrderService.getAllOrders();
    const match = allOrders.find(
      (o) =>
        o.order_number.toLowerCase() === term.toLowerCase() ||
        o.customer_mobile === term
    );

    if (match) {
      setFoundOrder(match);
    } else {
      setErrorMsg(`No prior order found matching "${term}".`);
    }
  };

  const handleReAddAllToCart = () => {
    if (!foundOrder || !foundOrder.items) return;

    clearCart();
    foundOrder.items.forEach((item) => {
      const dbProd = INITIAL_PRODUCTS.find((p) => p.id === item.product_id);
      if (dbProd) {
        addToCart(dbProd, item.quantity);
      }
    });

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div>
            <span className="text-amber-600 font-extrabold text-xs uppercase tracking-wider block mb-1">
              Returning Customer Flow
            </span>
            <h1 className="text-2xl font-black text-slate-950">Buy Again (Instant Re-Order)</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your previous Order Number or Mobile Number to populate your cart in one tap.
            </p>
          </div>

          <form onSubmit={handleLookupOrder} className="flex gap-2">
            <input
              type="text"
              required
              value={inputTerm}
              onChange={(e) => setInputTerm(e.target.value)}
              placeholder="Enter Mobile (e.g. 9840123456) or Order #"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shrink-0 shadow-md"
            >
              LOOKUP
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {foundOrder && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <div>
                  <span className="font-extrabold text-slate-950 text-sm block">Previous Order #{foundOrder.order_number}</span>
                  <span className="text-xs text-slate-500">Date: {new Date(foundOrder.created_at).toLocaleDateString()}</span>
                </div>
                <span className="font-black text-amber-700 text-sm">₹{foundOrder.grand_total.toLocaleString()}</span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Items in this order:</span>
                <ul className="space-y-1 text-slate-600">
                  {foundOrder.items?.map((i) => (
                    <li key={i.product_id} className="flex justify-between">
                      <span>• {i.quantity}x {i.product_name}</span>
                      <span className="font-bold text-slate-900">₹{i.total_price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleReAddAllToCart}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg glow-gold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RE-ADD ALL ITEMS & GO TO CHECKOUT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
