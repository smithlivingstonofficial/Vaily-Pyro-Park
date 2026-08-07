'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, SlidersHorizontal, Sparkles, Flame, RotateCw, Rocket, Zap, Volume2, Gift, CheckCircle2, X } from 'lucide-react';
import { Category } from '@/types';
import { ProductService } from '@/lib/services/product.service';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Partial<Category> | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Sparkles');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await ProductService.getCategories();
      setCategories(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setCategoryToEdit(null);
    setName('');
    setDescription('');
    setIconName('Sparkles');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setCategoryToEdit(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIconName(cat.icon_name || 'Sparkles');
    setDisplayOrder(cat.display_order || 1);
    setIsActive(cat.is_active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await ProductService.updateCategory(id, { is_active: !currentStatus });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await ProductService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMsg('');

    try {
      const payload: Partial<Category> = {
        name: name.trim(),
        description: description.trim(),
        icon_name: iconName,
        display_order: Number(displayOrder),
        is_active: isActive,
      };

      let result: Category;
      if (categoryToEdit?.id) {
        result = await ProductService.updateCategory(categoryToEdit.id, payload);
        setCategories((prev) => prev.map((c) => (c.id === result.id ? result : c)));
      } else {
        result = await ProductService.createCategory(payload);
        setCategories((prev) => [...prev, result]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = ['Sparkles', 'Flame', 'RotateCw', 'Rocket', 'Zap', 'Volume2', 'Gift'];

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Fireworks Category Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage storefront category tabs, display sorting order, and icon assignments
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                    <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-sm">{cat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">/{cat.slug}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(cat.id, cat.is_active)}
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border cursor-pointer ${
                    cat.is_active
                      ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {cat.is_active ? 'ACTIVE ✓' : 'INACTIVE'}
                </button>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-400">
                Display Order: <strong className="text-slate-900 font-mono">#{cat.display_order}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-950 text-base">
                {categoryToEdit ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electric Sparklers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Safe golden & multicolor hand-held sparklers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Icon Name</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 w-4 h-4"
                />
                <span>Active in Storefront Tabs</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
