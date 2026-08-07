'use client';

import React from 'react';
import { Plus, Minus, Volume2, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface QuickAddListItemProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const QuickAddListItem: React.FC<QuickAddListItemProps> = ({ product, onQuickView }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const discountPercent = product.mrp > 0 
    ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
    : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQty > 0) {
      updateQuantity(product.id, currentQty - 1);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border p-3 transition-all flex items-center justify-between gap-3 shadow-xs ${
      currentQty > 0 ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Left Image & Discount Badge */}
      <div 
        onClick={() => onQuickView && onQuickView(product)}
        className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-slate-100"
      >
        <img
          src={product.image_url || '/images/sparkler_box.png'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute top-1 left-1 bg-red-500 text-white font-black text-[9px] px-1 py-0.2 rounded uppercase">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Middle Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {product.pack_size || '1 Box'}
          </span>
          {product.sound_level && (
            <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-0.5">
              <Volume2 className="w-2.5 h-2.5 text-amber-600" />
              {product.sound_level}
            </span>
          )}
        </div>

        <h3 
          onClick={() => onQuickView && onQuickView(product)}
          className="font-bold text-slate-950 text-xs sm:text-sm truncate cursor-pointer hover:text-amber-600 transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="font-black text-slate-950 text-sm sm:text-base">
            ₹{product.selling_price.toLocaleString()}
          </span>
          {product.mrp > product.selling_price && (
            <span className="text-[10px] text-slate-400 line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          )}
          <span className="text-[10px] text-emerald-600 font-bold hidden sm:inline">
            (Save ₹{product.mrp - product.selling_price})
          </span>
        </div>
      </div>

      {/* Right Stepper */}
      <div className="shrink-0">
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          {currentQty > 0 ? (
            <>
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-white text-slate-900 font-extrabold flex items-center justify-center shadow-xs active:scale-95"
                aria-label="Decrease Quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-xs text-slate-950">
                {currentQty}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center shadow-xs active:scale-95"
                aria-label="Increase Quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleIncrement}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
