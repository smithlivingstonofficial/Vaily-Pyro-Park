'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Warehouse, AlertTriangle, History, X, Loader2, RefreshCw, Search } from 'lucide-react';
import { MovementType, InventoryMovement } from '@/types';
import { InventoryService, StockItem } from '@/lib/services/inventory.service';

export default function AdminInventoryPage() {
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment modal state (UI-only)
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<MovementType>('PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [stock, log] = await Promise.all([
      InventoryService.getAllStock(),
      InventoryService.getMovementLog(30),
    ]);
    setStockList(stock);
    setMovements(log);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStock = stockList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setAdjusting(true);
    setAdjustError('');

    try {
      const updated = await InventoryService.adjustStock(
        selectedProduct.product_id,
        adjustType,
        adjustQty,
        adjustReason
      );

      // Update local state optimistically
      setStockList((prev) =>
        prev.map((item) => (item.product_id === updated.product_id ? updated : item))
      );

      // Refresh movement log from DB
      const freshLog = await InventoryService.getMovementLog(30);
      setMovements(freshLog);

      setSelectedProduct(null);
      setAdjustQty(10);
      setAdjustReason('');
    } catch (err: any) {
      setAdjustError(err.message || 'Failed to save stock adjustment to database.');
    } finally {
      setAdjusting(false);
    }
  };

  const lowStockCount = stockList.filter(
    (item) => item.available_stock <= item.safety_threshold
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Stock &amp; Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Check and update stock for each product — all changes are saved to the database
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-200">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} LOW STOCK
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 flex items-center justify-center gap-3 shadow-2xs">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-xs font-bold text-slate-600">Loading stock from database...</span>
        </div>
      ) : (
        <>
          {/* Stock Summary Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/80 font-black text-xs uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Warehouse className="w-4 h-4 text-amber-600" />
                <span>Current Stock Levels ({filteredStock.length} products)</span>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                Live Supabase
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Available</th>
                    <th className="p-4">Reserved</th>
                    <th className="p-4">Safety Threshold</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStock.map((item) => {
                    const isLow = item.available_stock <= item.safety_threshold;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
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

            {/* Mobile Cards */}
            <div className="block sm:hidden p-3 space-y-3">
              {filteredStock.map((item) => {
                const isLow = item.available_stock <= item.safety_threshold;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
                      isLow ? 'bg-red-50/60 border-red-200/80' : 'bg-slate-50/80 border-slate-200/80'
                    }`}
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
                    <div className="grid grid-cols-3 gap-2 text-center bg-white p-2 rounded-xl border border-slate-200/60">
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

          {/* Movement Audit Log */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="font-black text-sm sm:text-base text-slate-950 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              <span>Stock Change History</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Last 30 changes
              </span>
            </h2>

            {movements.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-4">
                No history available.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
                {movements.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-black text-slate-950 block truncate text-xs">{m.product_name}</span>
                      <span className="text-slate-500 text-[11px] block truncate">{m.reason}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(m.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-[9px] px-2 py-0.5 rounded-full uppercase inline-block mb-0.5 border ${
                          ['DAMAGE', 'SALE', 'RESERVATION'].includes(m.type)
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {m.type}
                      </span>
                      <span className="font-black text-slate-950 block text-xs font-mono">
                        {['DAMAGE', 'SALE', 'RESERVATION'].includes(m.type) ? '-' : '+'}
                        {m.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-950">Update Stock</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setAdjustError('');
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs border border-slate-200/80">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Current</span>
                <span className="font-black text-slate-950 font-mono">{selectedProduct.available_stock}</span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Reserved</span>
                <span className="font-black text-amber-700 font-mono">{selectedProduct.reserved_stock}</span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Minimum</span>
                <span className="font-bold text-slate-600 font-mono">{selectedProduct.safety_threshold}</span>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Change</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as MovementType)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                >
                  <option value="PURCHASE">Stock Arrival</option>
                  <option value="ADJUSTMENT">Manual Fix</option>
                  <option value="DAMAGE">Damage/Loss</option>
                  <option value="SALE">Manual Sale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setAdjustError('');
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {adjusting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
