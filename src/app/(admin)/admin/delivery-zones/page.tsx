'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Edit, CheckCircle2, AlertCircle, MapPin, X } from 'lucide-react';
import { DeliveryZone } from '@/types';
import { ProductService } from '@/lib/services/product.service';

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(3000);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState('2-3 Days');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await ProductService.getDeliveryZones();
      setZones(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleOpenEditModal = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setMinOrderAmount(zone.min_order_amount);
    setDeliveryFee(zone.delivery_fee);
    setEstimatedDays(zone.estimated_days);
    setErrorMsg('');
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    setSaving(true);
    setErrorMsg('');

    try {
      const updated = await ProductService.updateDeliveryZone(selectedZone.id, {
        min_order_amount: Number(minOrderAmount),
        delivery_fee: Number(deliveryFee),
        estimated_days: estimatedDays.trim(),
      });

      setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
      setSelectedZone(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update delivery zone in database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Delivery Areas & Charges
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Set the minimum order amount and delivery charge for each region
          </p>
        </div>
      </div>

      {/* Delivery Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                    <Truck className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-sm">{zone.zone_name}</h3>
                    <span className="text-[10px] text-amber-700 font-bold">{zone.estimated_days}</span>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              {/* Threshold & Delivery Fee Cards */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 font-medium text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Min. Order Amount</span>
                  <span className="font-black text-slate-950 font-mono text-sm">
                    ₹{zone.min_order_amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Delivery Charge</span>
                  <span className="font-black text-amber-700 font-mono text-sm">
                    {zone.delivery_fee === 0 ? 'FREE' : `₹${zone.delivery_fee}`}
                  </span>
                </div>
              </div>

              {/* State Codes Tag Cloud */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  States Covered:
                </span>
                <div className="flex flex-wrap gap-1">
                  {zone.state_codes.map((code) => (
                    <span
                      key={code}
                      className="bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenEditModal(zone)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Settings
            </button>
          </div>
        ))}
      </div>

      {/* Edit Zone Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-950 text-base">
                Edit {selectedZone.zone_name}
              </h3>
              <button onClick={() => setSelectedZone(null)} className="p-1 rounded-xl bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{errorMsg}</div>
            )}

            <form onSubmit={handleSaveZone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Min. Order Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Charge (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Time (e.g. 2-3 Days)</label>
                <input
                  type="text"
                  required
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g. 3-4 Days"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedZone(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
