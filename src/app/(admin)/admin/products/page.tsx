'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Edit, Trash2, Search, Sparkles, Volume2, Package, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { ProductService } from '@/lib/services/product.service';
import { BulkCSVImportModal } from '@/components/admin/BulkCSVImportModal';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteProductModal } from '@/components/admin/DeleteProductModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Partial<Product> | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    const newStatus = await ProductService.toggleProductActive(productId, currentStatus);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: newStatus } : p))
    );
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = (savedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleBulkImportSuccess = async () => {
    const freshData = await ProductService.getAllProducts();
    setProducts(freshData);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Product Catalogue Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage Sivakasi cracker SKUs, MRP pricing, selling rates, stock levels, and bulk imports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-400" /> Bulk CSV
          </button>
        </div>
      </div>

      {/* Search & Statistics Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <span>
            Active SKUs:{' '}
            <strong className="text-slate-900 font-black">
              {products.filter((p) => p.is_active).length}
            </strong>
          </span>
          <span>
            Total Catalog:{' '}
            <strong className="text-slate-900 font-black">{products.length}</strong>
          </span>
        </div>
      </div>

      {/* Desktop Product Table (Hidden on mobile) */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Pack Size</th>
                <th className="p-4">MRP</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((product) => {
                const discount =
                  product.mrp > 0
                    ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
                    : 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.image_url ||
                            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block">{product.name}</span>
                          {product.sound_level && (
                            <span className="text-[10px] text-amber-700 font-semibold">
                              {product.sound_level} Sound
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{product.sku}</td>
                    <td className="p-4 text-slate-600">{product.pack_size}</td>
                    <td className="p-4 text-slate-400 line-through font-mono">₹{product.mrp}</td>
                    <td className="p-4 font-black text-slate-950 font-mono">₹{product.selling_price}</td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-700 font-black text-[10px] px-2 py-0.5 rounded-full border border-red-200">
                        {discount}% OFF
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">{product.stock || 0}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer border ${
                          product.is_active
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {product.is_active ? 'ACTIVE ✓' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(product)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Product SKU"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Super Responsive Product Card Grid (Visible on mobile only) */}
      <div className="block sm:hidden space-y-3">
        {filteredProducts.map((product) => {
          const discount =
            product.mrp > 0
              ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
              : 0;

          return (
            <div
              key={product.id}
              className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    product.image_url ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-2xl border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-slate-950 text-xs truncate">
                      {product.name}
                    </span>
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 cursor-pointer ${
                        product.is_active
                          ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                    <span className="font-mono">{product.sku}</span>
                    <span>• {product.pack_size}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-black text-slate-950 text-sm font-mono">
                      ₹{product.selling_price}
                    </span>
                    <span className="text-slate-400 line-through text-[11px] font-mono">
                      ₹{product.mrp}
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                      {discount}% OFF
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(product)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onSuccess={handleDeleteSuccess}
      />

      {/* CSV Importer Modal */}
      <BulkCSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleBulkImportSuccess}
      />
    </div>
  );
}
