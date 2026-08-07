'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Minus, AlertTriangle, History, CheckCircle, X } from 'lucide-react';
import { MovementType, InventoryMovement } from '@/types';
import { ProductService } from '@/lib/services/product.service';

export default function AdminInventoryPage() {
  const [stockList, setStockList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const products = await ProductService.getAllProducts();
      setStockList(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          available_stock: p.stock || 100,
          reserved_stock: 0,
          safety_threshold: 30,
        }))
      );
    }
    loadData();
  }, []);

  const [movements, setMovements] = useState<InventoryMovement[]>([
    {
      id: 'mov-1',
      product_id: 'prod-4',
      product_name: 'Flower Pot Big Deluxe',
      type: 'RESERVATION',
      quantity: 3,
      reason: 'Order VPP-2026-1001 stock reservation',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mov-2',
      product_id: 'prod-1',
      product_name: '10cm Electric Sparklers',
      type: 'PURCHASE',
      quantity: 50,
      reason: 'Factory purchase batch receipt',
      created_at: new Date().toISOString(),
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<MovementType>('PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const delta = adjustType === 'DAMAGE' || adjustType === 'SALE' ? -Math.abs(adjustQty) : Math.abs(adjustQty);

    setStockList((prev) =>
      prev.map((item) => {
        if (item.id === selectedProduct.id) {
          const newAvail = Math.max(0, item.available_stock + delta);
          return { ...item, available_stock: newAvail };
        }
        return item;
      })
    );

    const newMov: InventoryMovement = {
      id: `mov-${Date.now()}`,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      type: adjustType,
      quantity: adjustQty,
      reason: adjustReason || `Manual ${adjustType} stock update`,
      created_at: new Date().toISOString(),
    };

    setMovements((prev) => [newMov, ...prev]);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Inventory & Warehouse Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Track live stock balances, reserved items, safety thresholds, and stock movement audit logs
          </p>
        </div>
      </div>

      {/* Stock Summary Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/80 font-black text-xs uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Warehouse className="w-4 h-4 text-amber-600" />
            <span>Warehouse Stock Balances ({stockList.length} SKUs)</span>
          </div>
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
            Live Depot
          </span>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Reserved Stock</th>
                <th className="p-4">Safety Threshold</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stockList.map((item) => {
                const isLow = item.available_stock <= item.safety_threshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-black text-slate-900">{item.name}</td>
                    <td className="p-4 font-mono font-bold text-slate-600">{item.sku}</td>
                    <td className="p-4 font-black text-slate-950 text-sm font-mono">{item.available_stock} units</td>
                    <td className="p-4 font-bold text-amber-700 font-mono">{item.reserved_stock} units</td>
                    <td className="p-4 text-slate-500 font-mono">{item.safety_threshold} units</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="bg-red-500/10 text-red-700 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> LOW STOCK
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          HEALTHY ✓
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Super Responsive Stock Cards View */}
        <div className="block sm:hidden p-3 space-y-3">
          {stockList.map((item) => {
            const isLow = item.available_stock <= item.safety_threshold;

            return (
              <div
                key={item.id}
                className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-950 text-xs block">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                  </div>
                  {isLow ? (
                    <span className="bg-red-100 text-red-800 font-black text-[9px] px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      HEALTHY
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-white p-2 rounded-xl border border-slate-200/60 font-medium text-[11px]">
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Available</span>
                    <span className="font-black text-slate-950 text-xs font-mono">{item.available_stock}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Reserved</span>
                    <span className="font-black text-amber-700 text-xs font-mono">{item.reserved_stock}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Safety</span>
                    <span className="font-bold text-slate-600 text-xs font-mono">{item.safety_threshold}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(item)}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Adjust Stock Balance
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Movement Audit Log */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="font-black text-sm sm:text-base text-slate-950 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-600" />
          <span>Recent Stock Movement Audit Logs</span>
        </h2>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
          {movements.map((m) => (
            <div key={m.id} className="p-3 bg-slate-50 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-black text-slate-950 block truncate text-xs">{m.product_name}</span>
                <span className="text-slate-500 text-[11px] block truncate">{m.reason}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="bg-amber-100 text-amber-900 font-black text-[9px] px-2 py-0.5 rounded-full uppercase inline-block mb-0.5 border border-amber-200">
                  {m.type}
                </span>
                <span className="font-black text-slate-950 block text-xs font-mono">{m.quantity} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Adjustment Modal / Sheet */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-950">
                Adjust Stock: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Movement Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as MovementType)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                >
                  <option value="PURCHASE">PURCHASE (Factory Batch Receipt +)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Manual Inventory Fix +)</option>
                  <option value="DAMAGE">DAMAGE (Warehouse Breakage -)</option>
                  <option value="SALE">SALE (Manual Outflow -)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Units Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Audit Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received Sivakasi batch receipt #402"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
