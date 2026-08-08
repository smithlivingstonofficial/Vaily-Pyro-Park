'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Search,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Combo, Product } from '@/types';
import { ProductService } from '@/lib/services/product.service';

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state (UI-only)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState<Combo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<Combo | null>(null);

  // Form fields (UI-only state)
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formMrp, setFormMrp] = useState<number>(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allCombos, allProducts] = await Promise.all([
      ProductService.getAllCombos(),
      ProductService.getAllProducts(),
    ]);
    setCombos(allCombos);
    setProducts(allProducts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCombos = combos.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setComboToEdit(null);
    setFormName('');
    setFormDescription('');
    setFormPrice(0);
    setFormMrp(0);
    setFormImageUrl('');
    setFormIsActive(true);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (combo: Combo) => {
    setComboToEdit(combo);
    setFormName(combo.name);
    setFormDescription(combo.description ?? '');
    setFormPrice(combo.price);
    setFormMrp(combo.mrp);
    setFormImageUrl(combo.image_url ?? '');
    setFormIsActive(combo.is_active);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');

    const payload: Partial<Combo> = {
      name: formName.trim(),
      description: formDescription.trim(),
      price: Number(formPrice),
      mrp: Number(formMrp),
      image_url: formImageUrl.trim() || undefined,
      is_active: formIsActive,
    };

    try {
      if (comboToEdit) {
        const updated = await ProductService.updateCombo(comboToEdit.id, payload);
        setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await ProductService.createCombo(payload);
        setCombos((prev) => [created, ...prev]);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save combo.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCombo = async () => {
    if (!comboToDelete) return;
    setDeleteLoading(true);
    try {
      await ProductService.deleteCombo(comboToDelete.id);
      setCombos((prev) => prev.filter((c) => c.id !== comboToDelete.id));
      setIsDeleteModalOpen(false);
      setComboToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (combo: Combo) => {
    try {
      const updated = await ProductService.updateCombo(combo.id, { is_active: !combo.is_active });
      setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      console.error('Failed to toggle combo active:', err.message);
    }
  };

  const discount = (price: number, mrp: number) =>
    mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Combo &amp; Bundle Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Create and manage curated fireworks combo boxes displayed on the storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Combo
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search combos..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span>
            Active:{' '}
            <strong className="text-slate-900">{combos.filter((c) => c.is_active).length}</strong>
          </span>
          <span>
            Total: <strong className="text-slate-900">{combos.length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 flex items-center justify-center gap-3 shadow-2xs">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-xs font-bold text-slate-600">Loading combos from database...</span>
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center text-xl border border-amber-200">
            <Gift className="w-6 h-6" />
          </div>
          <p className="text-slate-700 text-sm font-bold">No combos found.</p>
          <p className="text-slate-400 text-xs">Create your first combo bundle to display on the storefront.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-2xs inline-block"
          >
            Add First Combo
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Combo Name</th>
                    <th className="p-4">MRP</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCombos.map((combo) => (
                    <tr key={combo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={combo.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                            alt={combo.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block">{combo.name}</span>
                            <span className="text-slate-400 text-[10px] truncate max-w-xs block">
                              {combo.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 line-through font-mono">₹{combo.mrp.toLocaleString()}</td>
                      <td className="p-4 font-black text-slate-950 font-mono">₹{combo.price.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="bg-red-100 text-red-700 font-black text-[10px] px-2 py-0.5 rounded-full border border-red-200">
                          {discount(combo.price, combo.mrp)}% OFF
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(combo)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer border ${
                            combo.is_active
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {combo.is_active ? 'ACTIVE ✓' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(combo)}
                            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Edit Combo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setComboToDelete(combo); setIsDeleteModalOpen(true); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete Combo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden space-y-3">
            {filteredCombos.map((combo) => (
              <div key={combo.id} className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={combo.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                    alt={combo.name}
                    className="w-12 h-12 object-cover rounded-2xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-slate-950 text-xs truncate">{combo.name}</span>
                      <button
                        onClick={() => handleToggleActive(combo)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 cursor-pointer ${
                          combo.is_active
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {combo.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{combo.description}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-black text-slate-950 font-mono">₹{combo.price.toLocaleString()}</span>
                    <span className="text-slate-400 line-through text-[11px] font-mono">₹{combo.mrp.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 rounded">
                      {discount(combo.price, combo.mrp)}% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(combo)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setComboToDelete(combo); setIsDeleteModalOpen(true); }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Combo Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-950">
                {comboToEdit ? 'Edit Combo' : 'Add New Combo'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1 rounded-xl bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveCombo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Combo Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Family Celebration Grand Box"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="What's included in this combo..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {formMrp > 0 && formPrice > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs font-bold text-amber-900 text-center">
                  Discount: {discount(formPrice, formMrp)}% OFF — Customer saves ₹{(formMrp - formPrice).toLocaleString()}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 w-4 h-4"
                />
                <span>Active — Show on storefront</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  {formSaving ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Save Combo</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && comboToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-950 text-base">Delete Combo?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Delete <strong className="text-slate-900">{comboToDelete.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCombo}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
