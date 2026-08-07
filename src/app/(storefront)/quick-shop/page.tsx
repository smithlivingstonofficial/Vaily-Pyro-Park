'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';

export default function QuickShopPage() {
  const { cart, addToCart, updateQuantity, subtotal, itemCount, isMinOrderReached, selectedZone, minOrderThreshold } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    }
    loadData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalogue
          </Link>
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Zap className="w-4 h-4" /> High-Density Quick Shop Mode
          </div>
        </div>

        <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Bulk Retailer Quick Shop</h1>
            <p className="text-xs text-slate-400 mt-1">High-density price list table mode for rapid quantity entry.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Current Subtotal:</span>
              <span className="text-lg font-black text-amber-400">₹{subtotal.toLocaleString()}</span>
            </div>
            {itemCount > 0 && (
              <Link
                href="/checkout"
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md ${
                  isMinOrderReached
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>CHECKOUT ({itemCount})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search price list by name or SKU..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Dense Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Pack Size</th>
                  <th className="p-3.5">MRP</th>
                  <th className="p-3.5">Rate</th>
                  <th className="p-3.5">Qty</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find((i) => i.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  const lineTotal = qty * product.selling_price;

                  return (
                    <tr key={product.id} className={qty > 0 ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                      <td className="p-3.5 font-bold text-slate-900">{product.name}</td>
                      <td className="p-3.5 font-mono text-slate-600">{product.sku}</td>
                      <td className="p-3.5 text-slate-500">{product.pack_size}</td>
                      <td className="p-3.5 text-slate-400 line-through">₹{product.mrp}</td>
                      <td className="p-3.5 font-extrabold text-slate-950">₹{product.selling_price}</td>
                      <td className="p-3.5">
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 w-max">
                          <button
                            onClick={() => updateQuantity(product.id, Math.max(0, qty - 1))}
                            className="w-6 h-6 rounded bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-black text-xs">{qty}</span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-950">
                        ₹{lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
