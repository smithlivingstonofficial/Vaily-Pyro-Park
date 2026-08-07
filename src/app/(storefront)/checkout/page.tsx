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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.customer_name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.customer_mobile.trim() || formData.customer_mobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.shipping_address.trim()) {
      setErrorMessage('Please enter your street address / house number.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city / town.');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit pincode.');
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isMinOrderReached) {
      setErrorMessage(
        `Minimum order requirement for ${selectedZone.zone_name} is ₹${minOrderThreshold.toLocaleString()}. Please add more items to your cart.`
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
      setErrorMessage(err.message || 'Failed to place order. Please check your details.');
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
            Add products from our Sivakasi catalogue to proceed with checkout.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs inline-block shadow-md transition-all active:scale-98"
          >
            RETURN TO CATALOGUE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Streamlined Top Navigation & Encrypted Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Return to Store</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {/* Clean Page Title */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Checkout
          </h1>
          <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
            📍 Shipping to {selectedZone.zone_name}
          </span>
        </div>

        {/* Clean Responsive Stepper Bar */}
        <div className="mb-5 bg-white p-1.5 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep(1);
              }}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                currentStep === 1
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-500/15 text-emerald-900 font-bold cursor-pointer'
                  : 'bg-slate-100 text-slate-400 font-medium'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span className="text-xs font-extrabold">Contact</span>
            </button>

            <div className="w-2 sm:w-6 h-0.5 bg-slate-200 shrink-0" />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 2) setCurrentStep(2);
              }}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                currentStep === 2
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-500/15 text-emerald-900 font-bold cursor-pointer'
                  : 'bg-slate-100 text-slate-400 font-medium'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span className="text-xs font-extrabold">Address</span>
            </button>

            <div className="w-2 sm:w-6 h-0.5 bg-slate-200 shrink-0" />

            {/* Step 3 */}
            <div
              className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                currentStep === 3
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-400 font-medium'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  currentStep === 3
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </span>
              <span className="text-xs font-extrabold">Payment</span>
            </div>
          </div>
        </div>

        {/* Validation Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Form & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Active Step Card */}
          <div className="lg:col-span-7">
            {/* STEP 1: CONTACT */}
            {currentStep === 1 && (
              <form
                onSubmit={handleNextFromStep1}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-150"
              >
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="font-black text-sm sm:text-base text-slate-950">
                    Customer Details
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-amber-600">*</span>
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

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="customer_mobile"
                        required
                        value={formData.customer_mobile}
                        onChange={handleInputChange}
                        placeholder="e.g. 9840123456"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        placeholder="e.g. karthik@example.com"
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
                    <span>Continue to Shipping Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ADDRESS */}
            {currentStep === 2 && (
              <form
                onSubmit={handleNextFromStep2}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-150"
              >
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <h2 className="font-black text-sm sm:text-base text-slate-950">
                    Shipping Address
                  </h2>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Door Delivery
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address / House No. <span className="text-amber-600">*</span>
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

                  {/* City, State, Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Map className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="e.g. Tamil Nadu"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Navigation className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          name="pincode"
                          required
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="e.g. 600040"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                    <span>Continue to Payment</span>
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
                  <h2 className="font-black text-sm sm:text-base text-slate-950">
                    Payment Method
                  </h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Pay on Delivery Available
                  </span>
                </div>

                {/* Delivery Recap Card */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Delivering To: {formData.customer_name} ({formData.customer_mobile})</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-amber-600 hover:underline font-extrabold text-[11px]"
                    >
                      Edit Address
                    </button>
                  </div>
                  <div className="text-slate-600 font-medium truncate">
                    {formData.shipping_address}, {formData.city}, {formData.state} - {formData.pincode}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD */}
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
                        Pay on Delivery / COD
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                        Settle via Cash / UPI upon parcel arrival.
                      </span>
                    </div>
                  </div>

                  {/* UPI */}
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
                        UPI / QR Transfer
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                        WhatsApp payment link sent after confirmation.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Direct Factory Rates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Quality Checked</span>
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
                      <span>PLACING ORDER...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm & Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-md sticky top-20 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="font-black text-sm sm:text-base text-slate-950">
                  Order Summary
                </h2>
                <span className="text-xs font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  {cart.length} Items
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1 scrollbar-thin">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden text-sm">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          '🎆'
                        )}
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

              {/* Savings Chip */}
              {savings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Factory Savings:</span>
                  </div>
                  <span className="font-black text-emerald-900">- ₹{savings.toLocaleString()}</span>
                </div>
              )}

              {/* Financial Calculation */}
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2.5 text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
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
                  <span>Total Payable:</span>
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
