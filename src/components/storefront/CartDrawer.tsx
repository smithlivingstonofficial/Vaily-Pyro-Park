'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductService } from '@/lib/services/product.service';
import { Product } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    savings,
    itemCount,
    selectedZone,
    minOrderThreshold,
    remainingForMinOrder,
    isMinOrderReached,
    deliveryFee,
    grandTotal,
  } = useCart();

  useEffect(() => {
    async function loadRecs() {
      const allProds = await ProductService.getAllProducts();
      setRecommendations(allProds);
    }
    loadRecs();
  }, []);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / minOrderThreshold) * 100));

  const topUpRecommendations = recommendations.filter(
    (p) => !cart.some((item) => item.product.id === p.id)
  ).slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="font-extrabold text-base text-slate-950">Your Cart ({itemCount})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimum Order Progress Bar */}
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-800 flex items-center gap-1">
                {isMinOrderReached ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Min Order ({selectedZone.zone_name}): ₹{minOrderThreshold.toLocaleString()}
              </span>
              <span className={isMinOrderReached ? 'text-emerald-700 font-black' : 'text-amber-800'}>
                ₹{subtotal.toLocaleString()} / ₹{minOrderThreshold.toLocaleString()}
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isMinOrderReached ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {!isMinOrderReached && (
              <p className="text-[11px] text-amber-900 font-bold mt-1 flex items-center justify-between">
                <span>Add ₹{remainingForMinOrder.toLocaleString()} more to checkout</span>
                <span>{progressPercent}%</span>
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Cart is empty</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tap + on products to add items.</p>
              </div>
            ) : (
              <>
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-500">₹{product.selling_price.toLocaleString()} / unit</p>
                      <span className="font-black text-xs text-amber-700">
                        ₹{(product.selling_price * quantity).toLocaleString()}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-5 h-5 rounded bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Compact Top-up Recommendations */}
                {!isMinOrderReached && topUpRecommendations.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Top-ups:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {topUpRecommendations.map((recProduct) => (
                        <div
                          key={recProduct.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate">{recProduct.name}</span>
                            <span className="text-slate-500">₹{recProduct.selling_price.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => addToCart(recProduct, 1)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg flex items-center gap-1 shadow-xs shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Add ₹{recProduct.selling_price}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Summary & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200">
              <div className="space-y-1 text-xs text-slate-600 mb-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Savings:</span>
                    <span>- ₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({selectedZone.zone_name}):</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-1.5 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-amber-600">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {isMinOrderReached ? (
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md text-xs transition-all active:scale-98"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed text-xs"
                >
                  <span>ADD ₹{remainingForMinOrder.toLocaleString()} MORE TO CHECKOUT</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
