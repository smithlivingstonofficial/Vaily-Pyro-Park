'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Truck,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Building2,
  Map,
  Navigation,
  Lock,
  Sparkles,
  CreditCard,
  Banknote,
  BadgeCheck,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { OrderService } from '@/lib/services/order.service';

// All 28 Indian states + 8 Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    savings,
    selectedZone,
    setSelectedZone,
    deliveryFee,
    grandTotal,
    minOrderThreshold,
    isMinOrderReached,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_mobile: '',
    customer_email: '',
    shipping_address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Mobile number — only allow digits, max 10
    if (name === 'customer_mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, customer_mobile: digits });
      return;
    }

    // Pincode — only allow digits, max 6
    if (name === 'pincode') {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, pincode: digits });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.customer_name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.customer_mobile || formData.customer_mobile.length !== 10) {
      setErrorMessage('Please enter a 10-digit mobile number (without +91).');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.shipping_address.trim()) {
      setErrorMessage('Please enter your house number and street name.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city or town name.');
      return;
    }
    if (!formData.pincode || formData.pincode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit PIN code.');
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isMinOrderReached) {
      setErrorMessage(
        `The minimum order for ${selectedZone.zone_name} is ₹${minOrderThreshold.toLocaleString()}. Please add more items before placing the order.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const createdOrder = await OrderService.createOrder({
        ...formData,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      router.push(`/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold text-xl text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6">
            Add items to your cart first, then come back here to place your order.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs inline-block shadow-md transition-all active:scale-98"
          >
            Go Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Shop</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Safe &amp; Secure</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Place Your Order
          </h1>
          <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
            📍 {selectedZone.zone_name}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-5 bg-white p-1.5 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                currentStep === 1
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-500/15 text-emerald-900 font-bold cursor-pointer'
                  : 'bg-slate-100 text-slate-400 font-medium'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep > 1 ? 'bg-emerald-600 text-white' : currentStep === 1 ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span className="text-xs font-extrabold">Your Details</span>
            </button>

            <div className="w-2 sm:w-6 h-0.5 bg-slate-200 shrink-0" />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                currentStep === 2
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-500/15 text-emerald-900 font-bold cursor-pointer'
                  : 'bg-slate-100 text-slate-400 font-medium'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span className="text-xs font-extrabold">Delivery Address</span>
            </button>

            <div className="w-2 sm:w-6 h-0.5 bg-slate-200 shrink-0" />

            {/* Step 3 */}
            <div className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
              currentStep === 3 ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-slate-100 text-slate-400 font-medium'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                currentStep === 3 ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </span>
              <span className="text-xs font-extrabold">Payment</span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Form + Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-7">

            {/* STEP 1: YOUR DETAILS */}
            {currentStep === 1 && (
              <form
                onSubmit={handleNextFromStep1}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-150"
              >
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="font-black text-sm sm:text-base text-slate-950">Your Details</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">We need this to contact you about your order</p>
                </div>

                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="customer_name"
                        required
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        placeholder="e.g. Karthik Subramanian"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Mobile Number — India only, +91 locked, 10 digits only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-amber-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      {/* +91 prefix — locked, not editable */}
                      <div className="flex items-center gap-1.5 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0 min-w-[64px] justify-center">
                        🇮🇳 +91
                      </div>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="tel"
                          name="customer_mobile"
                          required
                          inputMode="numeric"
                          maxLength={10}
                          value={formData.customer_mobile}
                          onChange={handleInputChange}
                          placeholder="10-digit number"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono tracking-wider"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Enter 10 digits only — India (+91) is set automatically
                    </p>
                  </div>

                  {/* Email — optional */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email <span className="text-slate-400 font-normal">(not required)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Next — Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: DELIVERY ADDRESS */}
            {currentStep === 2 && (
              <form
                onSubmit={handleNextFromStep2}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-150"
              >
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-slate-950">Where should we deliver?</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">We deliver anywhere in India</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Home Delivery
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* House / Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      House No. &amp; Street Name <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <textarea
                        name="shipping_address"
                        required
                        rows={2}
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                        placeholder="e.g. Door 14, 2nd Cross Street, Anna Nagar"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* City + State + Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Town <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g. Chennai"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* State — full dropdown of all Indian states */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Map className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                        <select
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Navigation className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          name="pincode"
                          required
                          inputMode="numeric"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit PIN"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Next — Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT */}
            {currentStep === 3 && (
              <form
                onSubmit={handleSubmitOrder}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-150"
              >
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <h2 className="font-black text-sm sm:text-base text-slate-950">How do you want to pay?</h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Pay on Delivery Available
                  </span>
                </div>

                {/* Delivery address recap */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Delivering to: {formData.customer_name} (+91 {formData.customer_mobile})</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-amber-600 hover:underline font-extrabold text-[11px]"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-slate-600 font-medium truncate">
                    {formData.shipping_address}, {formData.city}, {formData.state} — {formData.pincode}
                  </div>
                </div>

                {/* Payment Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pay on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                      paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-500/10 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-900 mt-0.5 shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-950 block">
                        Pay on Delivery
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                        Pay by cash or UPI when you receive the parcel.
                      </span>
                    </div>
                  </div>

                  {/* UPI / Online */}
                  <div
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                      paymentMethod === 'online'
                        ? 'border-amber-500 bg-amber-500/10 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 mt-0.5 shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-950 block">
                        Pay by UPI / Online
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                        We will send a payment link on WhatsApp after you place the order.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Direct Factory Prices</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quality Checked</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isMinOrderReached}
                    className={`px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isMinOrderReached && !isSubmitting
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Placing your order...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Place Order Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-md sticky top-20 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="font-black text-sm sm:text-base text-slate-950">Your Order</h2>
                <span className="text-xs font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden text-sm">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : '🎆'}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{product.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {quantity} × ₹{product.selling_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 shrink-0">
                      ₹{(product.selling_price * quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Savings */}
              {savings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>You save:</span>
                  </div>
                  <span className="font-black text-emerald-900">- ₹{savings.toLocaleString()}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2.5 text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Items total:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({selectedZone.zone_name}):</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
                    ) : (
                      `₹${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>You Pay:</span>
                  <span className="text-amber-600 text-base font-black">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
