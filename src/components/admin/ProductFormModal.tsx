'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
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
  const [sellingPrice, setSellingPrice] = useState<number>(50);
  const [stock, setStock] = useState<number>(100);
  const [soundLevel, setSoundLevel] = useState<SoundLevel>('Medium');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [description, setDescription] = useState('');
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
      setIsBestSeller(Boolean(productToEdit.is_best_seller));
      setSelectedFile(null);
      setPreviewUrl('');
    } else {
      setName('');
      setSku('');
      setPackSize('1 Box');
      setMrp(200);
      setSellingPrice(50);
      setStock(100);
      setSoundLevel('Medium');
      setImageUrl('');
      setDescription('');
      setIsBestSeller(false);
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !sku) {
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
    if (val > 0) {
      setSellingPrice(Math.round(val * 0.25));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setImageUrl(localUrl);
    }
  };

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
      let finalImageUrl = imageUrl;

      // Upload selected/captured file to Supabase Storage
      if (selectedFile) {
        try {
          finalImageUrl = await ProductService.uploadProductImage(selectedFile);
        } catch (uploadErr: any) {
          console.error('Supabase Storage image upload error:', uploadErr);
          setErrorMsg(`Image upload error: ${uploadErr.message}`);
          setSaving(false);
          return;
        }
      }

      const payload: Partial<Product> = {
        name: name.trim(),
        sku: finalSku.toUpperCase(),
        category_id: categoryId || undefined,
        pack_size: packSize.trim() || '1 Box',
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        sound_level: soundLevel,
        image_url: finalImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        description: description.trim() || `Direct Sivakasi ${name} crackers with factory guarantee.`,
        is_active: true,
        is_featured: false,
        is_best_seller: isBestSeller,
      };

      let result: Product;
      if (isEditing && productToEdit?.id) {
        result = await ProductService.updateProduct(productToEdit.id, payload);
      } else {
        result = await ProductService.createProduct(payload);
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-98 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing ? 'Update product details below' : 'Fill in the details to add a new SKU'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. 20cm Electric Sparklers"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SPK-20CM"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-500 uppercase transition-all"
              />
            </div>
          </div>

          {/* Category & Pack Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. 1 Box (10 Pcs)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Pricing & Rate Card */}
          <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Pricing Details</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">MRP (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={mrp}
                  onChange={(e) => handleMrpChange(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-amber-600 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Product Image Section: Device Gallery or Camera Snap */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Product Image</label>

            {imageUrl ? (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shrink-0 relative shadow-2xs">
                  <img src={imageUrl} alt="Selected preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedFile ? selectedFile.name : 'Product Image Loaded'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate max-w-full">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Uploads to Supabase Storage`
                      : 'Saved image'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: Choose from Media Gallery / Files */}
                <label className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-amber-50/50 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl cursor-pointer transition-all text-center group">
                  <Upload className="w-5 h-5 text-slate-600 group-hover:text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-amber-950">
                    Choose from Media
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Device files or gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>

                {/* Option 2: Take Photo with Camera */}
                <label className="flex flex-col items-center justify-center p-3.5 bg-amber-50/50 hover:bg-amber-100/70 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl cursor-pointer transition-all text-center group">
                  <Camera className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-amber-950">Open Camera</span>
                  <span className="text-[10px] text-amber-700 font-medium">Take a photo directly</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Sound Level Selection */}
          <div className="flex items-center gap-2 pt-1">
            <label className="font-semibold text-slate-700">Sound Level:</label>
            <select
              value={soundLevel}
              onChange={(e) => setSoundLevel(e.target.value as SoundLevel)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none cursor-pointer text-xs focus:border-amber-500"
            >
              <option value="Silent">Silent</option>
              <option value="Low">Low Sound</option>
              <option value="Medium">Medium Sound</option>
              <option value="High">High Sound</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
