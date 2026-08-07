'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Product } from '@/types';
import { ProductService } from '@/lib/services/product.service';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (deletedId: string) => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg('');

    try {
      await ProductService.deleteProduct(product.id);
      onSuccess(product.id);
      onClose();
    } catch (err: any) {
      console.error('Delete product error:', err);
      setErrorMsg(err.message || 'Failed to delete product from database.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-black text-slate-950 text-base">
            Delete Product SKU
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{product.name}</strong> (<span className="font-mono text-slate-700">{product.sku}</span>)?
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Yes, Delete SKU'}
          </button>
        </div>
      </div>
    </div>
  );
};
