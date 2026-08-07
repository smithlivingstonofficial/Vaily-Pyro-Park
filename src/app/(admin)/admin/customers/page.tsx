'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MessageSquare, ShoppingBag, MapPin, ExternalLink, Award } from 'lucide-react';
import { Order } from '@/types';
import { OrderService } from '@/lib/services/order.service';

interface CustomerSummary {
  mobile: string;
  name: string;
  email?: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      const orders = await OrderService.getAllOrders();
      const customerMap = new Map<string, CustomerSummary>();

      orders.forEach((o) => {
        const key = o.customer_mobile.trim();
        const existing = customerMap.get(key);

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += o.grand_total;
          if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = o.created_at;
          }
        } else {
          customerMap.set(key, {
            mobile: o.customer_mobile,
            name: o.customer_name,
            email: o.customer_email,
            city: o.city,
            state: o.state,
            totalOrders: 1,
            totalSpent: o.grand_total,
            lastOrderDate: o.created_at,
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgSpendPerCustomer = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Customer Directory & Analytics Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Directory of Sivakasi fireworks buyers, lifetime spend metrics, and 1-tap WhatsApp contacts
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
            Total Direct Buyers
          </span>
          <span className="text-xl font-black text-slate-950">{customers.length}</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
            Customer Lifetime Revenue
          </span>
          <span className="text-xl font-black text-amber-700">₹{totalSpentAll.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
            Average Order Spend / Buyer
          </span>
          <span className="text-xl font-black text-slate-950">₹{avgSpendPerCustomer.toLocaleString()}</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer Name, Mobile, or City..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Customer Desktop Table */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Location</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Total Lifetime Spend</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map((c) => (
                <tr key={c.mobile} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-black text-slate-950">{c.name}</td>
                  <td className="p-4 font-mono font-bold text-slate-700">{c.mobile}</td>
                  <td className="p-4 text-slate-600">{c.city}, {c.state}</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      {c.totalOrders} {c.totalOrders === 1 ? 'Order' : 'Orders'}
                    </span>
                  </td>
                  <td className="p-4 font-black text-amber-700 font-mono">₹{c.totalSpent.toLocaleString()}</td>
                  <td className="p-4 text-slate-500 text-[11px]">
                    {new Date(c.lastOrderDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`https://wa.me/91${c.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Vaily%20Pyro%20Park!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-[11px] shadow-2xs transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Customer Cards */}
      <div className="block sm:hidden space-y-3">
        {filteredCustomers.map((c) => (
          <div key={c.mobile} className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-950 text-sm">{c.name}</h3>
                <span className="text-[11px] font-mono text-slate-600 font-bold">{c.mobile}</span>
              </div>
              <span className="bg-amber-100 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                {c.totalOrders} Orders
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Lifetime Spend:</span>
                <span className="font-black text-amber-700 font-mono text-sm">₹{c.totalSpent.toLocaleString()}</span>
              </div>

              <a
                href={`https://wa.me/91${c.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Vaily%20Pyro%20Park!`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
