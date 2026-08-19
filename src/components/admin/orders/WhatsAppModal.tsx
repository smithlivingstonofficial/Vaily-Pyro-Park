'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  ExternalLink,
  FileText,
  Truck,
  CheckCircle2,
  Edit3,
  PhoneCall,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
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

  useEffect(() => {
    if (order) {
      setCourierPartner(order.courier_partner || 'ST Courier');
      setTrackingNumber(order.tracking_number || '');
      setEstDeliveryDays(order.estimated_delivery || '2-3 Days');
      setTemplate(initialTemplate);
    }
  }, [order, initialTemplate]);

  if (!order) return null;

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
    { id: 'CUSTOM', label: 'Custom Note', icon: Edit3 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-98 duration-200">
        
        {/* Streamlined Light Theme Header */}
        <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center font-black shadow-2xs shrink-0">
              <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-950 text-sm sm:text-base tracking-tight truncate">
                  Send WhatsApp
                </h3>
                <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/80 font-mono shrink-0">
                  {order.order_number}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                To: <strong className="text-slate-950 font-extrabold">{order.customer_name}</strong> ({displayPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          
          {/* Preset Selector Tabs */}
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Message Preset
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {templatesList.map((item) => {
                const Icon = item.icon;
                const isActive = template === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTemplate(item.id)}
                    title={item.label}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#25D366] text-white shadow-xs font-black'
                        : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    <span className={isActive ? 'inline' : 'hidden sm:inline'}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Template Fields */}
          {template === 'DISPATCH_TRACKING' && (
            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 space-y-2.5 text-xs">
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Tracking LR No.</label>
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
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] outline-none"
              />
            </div>
          )}

          {/* Authentic WhatsApp Chat Bubble Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                WhatsApp Preview
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 cursor-pointer shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy Text</span>
              </button>
            </div>

            {/* WhatsApp Chat Wallpaper & Message Bubble UI */}
            <div className="bg-[#efeae2] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-inner max-h-56 overflow-y-auto">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs border border-slate-200/60 max-w-[95%] space-y-1 relative">
                <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed font-sans">
                  {messageText}
                </p>
                <div className="flex items-center justify-end gap-1 pt-1 text-[9px] text-slate-400 font-medium">
                  <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  <span className="text-emerald-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <a
            href={`tel:${order.customer_mobile}`}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Call Customer Phone"
          >
            <PhoneCall className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Call</span>
          </a>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <WhatsAppIcon className="w-4.5 h-4.5 fill-white shrink-0" />
            <span className="text-white truncate">Send WhatsApp Message</span>
            <ExternalLink className="w-4 h-4 text-white shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

