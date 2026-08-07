'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Gift, ShoppingBag, ChevronRight } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { QuickAddCard } from '@/components/storefront/QuickAddCard';
import { QuickAddListItem } from '@/components/storefront/QuickAddListItem';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { Footer } from '@/components/storefront/Footer';
import { Product, Category, Combo } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductService } from '@/lib/services/product.service';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadDbData() {
      const [fetchedProducts, fetchedCategories, fetchedCombos] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getCategories(),
        ProductService.getCombos(),
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setCombos(fetchedCombos);
    }
    loadDbData();
  }, []);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('vaily_pyro_storefront_state_v1');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.viewMode) setViewMode(parsed.viewMode);
      }
    } catch (e) {
      console.error('Failed to load storefront state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(
          'vaily_pyro_storefront_state_v1',
          JSON.stringify({ selectedCategory, searchQuery, viewMode })
        );
      } catch (e) {
        console.error('Failed to save storefront state to localStorage', e);
      }
    }
  }, [selectedCategory, searchQuery, viewMode, isLoaded]);

  const { itemCount, subtotal, addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddComboToCart = (combo: Combo) => {
    const comboProduct: Product = {
      id: combo.id,
      name: combo.name,
      slug: combo.slug,
      sku: `CMB-${combo.id}`,
      description: combo.description,
      pack_size: 'Assortment Box',
      mrp: combo.mrp,
      selling_price: combo.price,
      image_url: combo.image_url,
      is_active: combo.is_active,
      is_featured: true,
      is_best_seller: true,
      sound_level: 'Medium',
    };
    addToCart(comboProduct, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div>
        <Header
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCart={() => setIsCartOpen(true)}
          categories={categories}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
          {/* Main Product Catalog Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-950 text-sm sm:text-base tracking-tight">
                  {selectedCategory === 'all'
                    ? 'All Sivakasi Fireworks'
                    : categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
                </h2>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Showing {filteredProducts.length} items • Direct Factory Prices
                </span>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs space-y-2">
                <p className="text-slate-500 text-xs font-medium">No items match your search filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <QuickAddCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <QuickAddListItem
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Curated Combos Section */}
          {combos.length > 0 && (
            <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100 p-4 sm:p-6 rounded-3xl border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-2xs">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-950 text-base">Assortment Gift Boxes</h2>
                    <span className="text-xs font-bold text-amber-700">Direct Factory Value Packs</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combos.map((combo) => (
                  <div
                    key={combo.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-center gap-4"
                  >
                    <img
                      src={combo.image_url || '/images/combo_box.png'}
                      alt={combo.name}
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                          GIFT BOX
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          SAVE ₹{(combo.mrp - combo.price).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        {combo.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {combo.description}
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <div>
                          <span className="text-base font-black text-slate-950 font-mono">
                            ₹{combo.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through ml-2 font-mono">
                            ₹{combo.mrp.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddComboToCart(combo)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add Box</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Mobile Sticky Quick Checkout Bar */}
        {itemCount > 0 && (
          <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden shadow-2xl">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-between px-4 shadow-md text-xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="bg-slate-950 text-white font-black px-2 py-0.5 rounded-full text-[10px]">
                  {itemCount} Items
                </span>
                <span className="font-extrabold font-mono">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1">
                <span>View Cart & Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
