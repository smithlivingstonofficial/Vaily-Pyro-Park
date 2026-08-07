'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Tag, Package, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, Category, SoundLevel } from '@/types';
import { ProductService } from '@/lib/services/product.service';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Partial<Product> | null;
  onSuccess: (savedProduct: Product) => void;
}

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
  const [packSize, setPackSize] = useState('1 Box');
  const [mrp, setMrp] = useState<number>(200);
  const [sellingPrice, setSellingPrice] = useState<number>(150);
  const [stock, setStock] = useState<number>(100);
  const [soundLevel, setSoundLevel] = useState<SoundLevel>('Medium');
  const [imageUrl, setImageUrl] = useState('');
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
      setPackSize(productToEdit.pack_size || '1 Box');
      setMrp(productToEdit.mrp || 0);
      setSellingPrice(productToEdit.selling_price || 0);
      setStock(productToEdit.stock || 100);
      setSoundLevel(productToEdit.sound_level || 'Medium');
      setImageUrl(productToEdit.image_url || '');
      setDescription(productToEdit.description || '');
      setIsActive(productToEdit.is_active !== undefined ? productToEdit.is_active : true);
      setIsFeatured(Boolean(productToEdit.is_featured));
      setIsBestSeller(Boolean(productToEdit.is_best_seller));
    } else {
      setName('');
      setSku('');
      setPackSize('1 Box');
      setMrp(200);
      setSellingPrice(150);
      setStock(100);
      setSoundLevel('Medium');
      setImageUrl('');
      setDescription('');
      setIsActive(true);
      setIsFeatured(false);
      setIsBestSeller(false);
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const discountPercent =
    mrp > 0 && mrp >= sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      setErrorMsg('Please enter both Product Name and SKU Code.');
      return;
    }

    if (sellingPrice > mrp) {
      setErrorMsg('Selling Price cannot be greater than MRP.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category_id: categoryId || undefined,
        pack_size: packSize.trim() || '1 Box',
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        stock: Number(stock),
        sound_level: soundLevel,
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        description: description.trim(),
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
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base">
                {isEditing ? 'Edit Fireworks SKU' : 'Add New Fireworks SKU'}
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold block">
                {isEditing ? `Modifying SKU: ${productToEdit?.sku}` : 'Direct Sivakasi Catalog Item'}
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
          {/* Product Name & SKU Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 20cm Deluxe Electric Sparklers"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SPK-20CM"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 uppercase"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Pricing Strip: MRP, Selling Price, Discount & Stock */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-900 text-xs">Pricing & Factory Stock</span>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF LIVE
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
                  onChange={(e) => setMrp(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Selling Rate (₹)</label>
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

          {/* Sound Level & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sound Level</label>
              <select
                value={soundLevel}
                onChange={(e) => setSoundLevel(e.target.value as SoundLevel)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="Silent">Silent</option>
                <option value="Low">Low Sound</option>
                <option value="Medium">Medium Sound</option>
                <option value="High">High Sound</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Live Image Preview Thumbnail */}
          {imageUrl && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-300 shrink-0"
              />
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                Image Preview Thumbnail
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Premium Sivakasi quality crackers with bright sparkles..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none"
            />
          </div>

          {/* Status Checkbox Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>Active in Storefront</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>Featured Banner</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>Best Seller Badge</span>
            </label>
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
              {saving ? 'Saving to Database...' : isEditing ? 'Update Product SKU' : 'Save New Product SKU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
