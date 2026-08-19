'use client';

import React, { useMemo } from 'react';
import { Plus, Minus, Eye } from 'lucide-react';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';

interface PriceListTableProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  onQuickView?: (product: Product) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'sound crackers': '🔊',
  'flower pots': '🌸',
  'ground chakkaras': '💫',
  'bijili crackers': '⚡',
  'lar': '💥',
  'bomb': '💣',
  'rocket': '🚀',
  'pencil': '✏️',
  'kutties special': '🎁',
  'match box': '📦',
  'colorful nights': '✨',
  'new arrivals (2025)': '⭐',
  'amazing shots': '🎆',
  'fancy shots': '🌟',
  'sparklers': '✨',
};

function getCategoryEmoji(name: string): string {
  return CATEGORY_EMOJIS[name.toLowerCase()] || '🎆';
}

export const PriceListTable: React.FC<PriceListTableProps> = ({
  products,
  categories,
  selectedCategory,
  searchQuery,
  onQuickView,
}) => {
  const { cart, addToCart, updateQuantity } = useCart();

  // Map product id -> quantity in cart
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: { category: { id: string; name: string }; items: Product[] }[] = [];
    const catMap = new Map<string, Product[]>();

    filteredProducts.forEach((p) => {
      const catId = p.category_id || 'uncategorized';
      if (!catMap.has(catId)) catMap.set(catId, []);
      catMap.get(catId)!.push(p);
    });

    categories.forEach((cat) => {
      const items = catMap.get(cat.id);
      if (items && items.length > 0) {
        groups.push({ category: cat, items });
      }
    });

    const uncat = catMap.get('uncategorized');
    if (uncat && uncat.length > 0) {
      groups.push({ category: { id: 'uncategorized', name: 'Other Fireworks' }, items: uncat });
    }

    return groups;
  }, [filteredProducts, categories]);

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-2xs space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-xl font-bold">
          🔍
        </div>
        <h3 className="font-bold text-slate-800 text-sm">No fireworks found</h3>
        <p className="text-slate-500 text-xs font-normal max-w-sm mx-auto">
          No products matched your search or category filter. Try clearing your search keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 font-sans">
      {groupedProducts.map((group) => {
        const emoji = getCategoryEmoji(group.category.name);

        return (
          <div
            key={group.category.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
          >
            {/* ELEGANT PREMIUM CATEGORY BANNER (Rich Crimson Red) */}
            <div className="bg-red-700 text-white px-3.5 sm:px-5 py-2 flex items-center justify-between shadow-2xs border-b border-red-800">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">{emoji}</span>
                <h2 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-white font-heading">
                  {group.category.name}
                </h2>
              </div>

              <span className="bg-red-800/80 text-amber-200 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border border-red-600">
                {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* COLUMN GUIDE HEADER BAR */}
            <div className="flex items-center justify-between bg-slate-100/90 px-3 sm:px-4 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200/90">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-9 text-center shrink-0">Img</span>
                <span>Product Name</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 text-right">
                <span className="w-14 sm:w-20 text-right">Price</span>
                <span className="w-20 sm:w-28 text-center">Quantity</span>
                <span className="w-16 sm:w-20 text-right hidden sm:block">Total</span>
              </div>
            </div>

            {/* SINGLE-ROW LIST CONTAINER (Refined Premium Typography & Mobile Space Optimization) */}
            <div className="divide-y divide-slate-100">
              {group.items.map((product) => {
                const qty = cartQtyMap.get(product.id) || 0;
                const itemTotal = product.selling_price * qty;

                return (
                  <div
                    key={product.id}
                    className={`px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2 transition-colors hover:bg-slate-50/80 ${
                      qty > 0 ? 'bg-amber-50/50 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* LEFT: Thumbnail + Product Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        onClick={() => onQuickView && onQuickView(product)}
                        className="relative w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/80 shrink-0 cursor-pointer group"
                      >
                        <img
                          src={product.image_url || '/images/sparkler_box.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pr-1">
                        <span
                          onClick={() => onQuickView && onQuickView(product)}
                          className="font-semibold text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-amber-600 transition-colors leading-snug line-clamp-2 block break-words"
                          title={product.name}
                        >
                          {product.name}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLS: Price | Quantity Stepper | Total */}
                    <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                      {/* Price Column */}
                      <div className="w-14 sm:w-20 text-right shrink-0">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-none">
                          ₹{product.selling_price.toFixed(2)}
                        </div>
                        {product.mrp > product.selling_price && (
                          <div className="text-[10px] text-slate-400 line-through leading-none mt-0.5 font-medium">
                            ₹{product.mrp.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper Column */}
                      <div className="w-20 sm:w-28 text-center shrink-0">
                        <div className="flex items-center justify-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => qty > 0 && updateQuantity(product.id, qty - 1)}
                            disabled={qty === 0}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs transition-all ${
                              qty > 0
                                ? 'bg-white text-slate-800 font-bold shadow-2xs hover:bg-slate-50 cursor-pointer active:scale-95 border border-slate-200/60'
                                : 'bg-transparent text-slate-300 cursor-not-allowed'
                            }`}
                            aria-label="Decrease Quantity"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>

                          <input
                            type="number"
                            min={0}
                            value={qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              updateQuantity(product.id, isNaN(val) || val < 0 ? 0 : val);
                            }}
                            className="w-6 sm:w-7 text-center font-bold text-xs text-slate-900 bg-transparent outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => addToCart(product, 1)}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
                            aria-label="Increase Quantity"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total Column (Hidden on small mobile to give maximum width to Product Name) */}
                      <div className="w-14 sm:w-20 text-right shrink-0 hidden sm:block">
                        <span
                          className={`text-xs sm:text-sm block ${
                            itemTotal > 0 ? 'text-amber-600 font-bold' : 'text-slate-400 font-normal'
                          }`}
                        >
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
