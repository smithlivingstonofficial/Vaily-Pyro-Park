'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Copy,
  ExternalLink,
  FileText,
  Truck,
  CheckCircle2,
  DollarSign,
  Edit3,
  PhoneCall,
  Globe,
  Smartphone,
} from 'lucide-react';
import { Order } from '@/types';
import { WhatsAppService, WhatsAppTemplateType } from '@/lib/services/whatsapp.service';

interface WhatsAppModalProps {
  order: Order | null;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialTemplate?: WhatsAppTemplateType;
}

export function WhatsAppModal({
  order,
  onClose,
  onShowToast,
  initialTemplate = 'ORDER_RECEIPT',
}: WhatsAppModalProps) {
  const [template, setTemplate] = useState<WhatsAppTemplateType>(initialTemplate);
  const [customText, setCustomText] = useState<string>('');
  const [courierPartner, setCourierPartner] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [estDeliveryDays, setEstDeliveryDays] = useState<string>('');
  const [useWebWhatsApp, setUseWebWhatsApp] = useState<boolean>(false);

  useEffect(() => {
    if (order) {
      setCourierPartner(order.courier_partner || 'ST Courier');
      setTrackingNumber(order.tracking_number || '');
      setEstDeliveryDays(order.estimated_delivery || '2-3 Days');
      setTemplate(initialTemplate);
    }
  }, [order, initialTemplate]);

  if (!order) return null;

  const formattedPhone = WhatsAppService.formatWhatsAppPhone(order.customer_mobile);
  const displayPhone = order.customer_mobile.length === 10 ? `+91 ${order.customer_mobile}` : order.customer_mobile;

  const messageText = WhatsAppService.generateMessageText(order, {
    templateType: template,
    customMessage: customText,
    courierPartner,
    trackingNumber,
    estDeliveryDays,
  });

  const whatsappUrl = WhatsAppService.generateCustomerWhatsAppLink(order, {
    templateType: template,
    customMessage: customText,
    courierPartner,
    trackingNumber,
    estDeliveryDays,
    useWebUrl: useWebWhatsApp,
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageText);
    onShowToast('WhatsApp message text copied to clipboard!', 'success');
  };

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    onShowToast(`Opened WhatsApp for customer ${order.customer_name}`, 'success');
    onClose();
  };

  const templatesList: { id: WhatsAppTemplateType; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'ORDER_RECEIPT', label: 'Order Receipt', icon: FileText },
    { id: 'STATUS_UPDATE', label: 'Status Notice', icon: CheckCircle2 },
    { id: 'DISPATCH_TRACKING', label: 'Dispatch Info', icon: Truck },
    { id: 'PAYMENT_REMINDER', label: 'Payment Note', icon: DollarSign },
    { id: 'CUSTOM', label: 'Custom Note', icon: Edit3 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-98 duration-200">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
              <MessageSquare className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Send WhatsApp Message</h3>
                <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full uppercase">
                  {order.order_number}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Customer: <strong className="text-white font-bold">{order.customer_name}</strong> ({displayPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {/* Template Selection Tabs */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Message Preset
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {templatesList.map((item) => {
                const Icon = item.icon;
                const isActive = template === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTemplate(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Template Controls */}
          {template === 'DISPATCH_TRACKING' && (
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  placeholder="e.g. ST Courier"
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Tracking / LR No.</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. ST123456"
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Est. Delivery</label>
                <input
                  type="text"
                  value={estDeliveryDays}
                  onChange={(e) => setEstDeliveryDays(e.target.value)}
                  placeholder="e.g. 2-3 Days"
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          )}

          {template === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Message Text</label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your custom message for the customer..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          )}

          {/* Live Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Live Message Preview</span>
              <button
                onClick={handleCopyText}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {messageText}
            </div>
          </div>

          {/* Destination Platform Switcher */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Target WhatsApp Mode:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseWebWhatsApp(false)}
                className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !useWebWhatsApp
                    ? 'bg-slate-950 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App (wa.me)</span>
              </button>
              <button
                type="button"
                onClick={() => setUseWebWhatsApp(true)}
                className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  useWebWhatsApp
                    ? 'bg-slate-950 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <a
            href={`tel:${order.customer_mobile}`}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Call Customer Phone"
          >
            <PhoneCall className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Call Phone</span>
          </a>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <MessageSquare className="w-4 h-4 fill-white text-white" />
            <span>Open WhatsApp to Customer (+91 {formattedPhone.slice(-10)})</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
