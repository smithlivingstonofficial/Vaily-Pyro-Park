'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Package, Image as ImageIcon, AlertCircle, Wand2, Check } from 'lucide-react';
import { Product, Category, SoundLevel } from '@/types';
import { ProductService } from '@/lib/services/product.service';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Partial<Product> | null;
  onSuccess: (savedProduct: Product) => void;
}

const PRESET_FIREWORK_IMAGES = [
  {
    name: 'Sparkler Box',
    url: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ground Chakkar',
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Flower Pot Fountain',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Whistling Rocket',
    url: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Aerial Sky Cake',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Diwali Gift Box',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
  },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(productToEdit?.id);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [packSize, setPackSize] = useState('1 Box (10 Pcs)');
  const [mrp, setMrp] = useState<number>(200);
  const [sellingPrice, setSellingPrice] = useState<number>(50);
  const [stock, setStock] = useState<number>(100);
  const [soundLevel, setSoundLevel] = useState<SoundLevel>('Medium');
  const [imageUrl, setImageUrl] = useState(PRESET_FIREWORK_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadCategories() {
      const cats = await ProductService.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setCategoryId(productToEdit.category_id || '');
      setPackSize(productToEdit.pack_size || '1 Box (10 Pcs)');
      setMrp(productToEdit.mrp || 0);
      setSellingPrice(productToEdit.selling_price || 0);
      setStock(productToEdit.stock || 100);
      setSoundLevel(productToEdit.sound_level || 'Medium');
      setImageUrl(productToEdit.image_url || PRESET_FIREWORK_IMAGES[0].url);
      setDescription(productToEdit.description || '');
      setIsActive(productToEdit.is_active !== undefined ? productToEdit.is_active : true);
      setIsFeatured(Boolean(productToEdit.is_featured));
      setIsBestSeller(Boolean(productToEdit.is_best_seller));
    } else {
      setName('');
      setSku('');
      setPackSize('1 Box (10 Pcs)');
      setMrp(200);
      setSellingPrice(50);
      setStock(100);
      setSoundLevel('Medium');
      setImageUrl(PRESET_FIREWORK_IMAGES[0].url);
      setDescription('');
      setIsActive(true);
      setIsFeatured(false);
      setIsBestSeller(false);
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Smart Auto-Generators for Easy Admin Flow
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !sku) {
      // Auto-generate clean SKU from name e.g. "Green Sparklers" -> "SPK-GREEN"
      const words = val.trim().split(/\s+/).filter(Boolean);
      let autoSku = 'SKU';
      if (words.length >= 2) {
        autoSku = `${words[0].substring(0, 3)}-${words[1]}`.toUpperCase();
      } else if (words.length === 1) {
        autoSku = `SKU-${words[0]}`.toUpperCase();
      }
      setSku(autoSku.replace(/[^A-Z0-9-]/g, ''));
    }
  };

  const handleMrpChange = (val: number) => {
    setMrp(val);
    // Auto-calculate 75% OFF factory price (MRP * 0.25)
    if (val > 0) {
      setSellingPrice(Math.round(val * 0.25));
    }
  };

  const discountPercent =
    mrp > 0 && mrp >= sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a Product Name.');
      return;
    }

    const finalSku = sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;

    if (sellingPrice > mrp) {
      setErrorMsg('Selling Price cannot be greater than MRP.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        sku: finalSku.toUpperCase(),
        category_id: categoryId || undefined,
        pack_size: packSize.trim() || '1 Box',
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        stock: Number(stock),
        sound_level: soundLevel,
        image_url: imageUrl.trim() || PRESET_FIREWORK_IMAGES[0].url,
        description: description.trim() || `Direct Sivakasi ${name} crackers with factory guarantee.`,
        is_active: isActive,
        is_featured: isFeatured,
        is_best_seller: isBestSeller,
      };

      let result: Product;
      if (isEditing && productToEdit?.id) {
        result = await ProductService.updateProduct(productToEdit.id, payload);
      } else {
        result = await ProductService.createProduct(payload, Number(stock));
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('Failed to save product SKU:', err);
      setErrorMsg(err.message || 'Failed to save product in database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-98 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {isEditing ? 'Edit Product' : 'Add New Product (Quick Setup)'}
              </h3>
              <span className="text-[11px] text-amber-700 font-bold block">
                ⚡ Auto-calculates 75% OFF prices & auto-generates SKUs
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. 20cm Electric Sparklers"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU Code (Auto Generated)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SPK-20CM"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 uppercase"
              />
            </div>
          </div>

          {/* Category & Pack Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. 1 Box (10 Pcs)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-950 text-xs">MRP & Factory Wholesale Price</span>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full">
                  {discountPercent}% OFF FACTORY RATE
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={mrp}
                  onChange={(e) => handleMrpChange(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Wholesale Rate (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-black text-amber-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 1-Click Preset Firework Image Picker Gallery */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">1-Click Firework Image Preset (No URLs needed!)</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_FIREWORK_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative p-1 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-12 object-cover rounded-xl"
                    />
                    <span className="text-[9px] font-extrabold text-slate-800 block text-center truncate mt-1">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Level & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Sound:</label>
              <select
                value={soundLevel}
                onChange={(e) => setSoundLevel(e.target.value as SoundLevel)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none cursor-pointer text-xs"
              >
                <option value="Silent">Silent</option>
                <option value="Low">Low Sound</option>
                <option value="Medium">Medium Sound</option>
                <option value="High">High Sound</option>
              </select>
            </div>

            <div className="flex items-center gap-3 font-bold text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 w-4 h-4"
                />
                <span>Active</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 w-4 h-4"
                />
                <span>Featured</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Product SKU' : 'Add Product SKU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
