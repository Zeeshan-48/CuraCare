import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Upload, ShieldAlert, Truck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import {
  selectCartTotals,
  selectPrescriptionRequired,
  clearCart,
} from '../features/cart/cartSlice.js';
import { createOrderApi, uploadImageApi, getErrorMessage, createRazorpayOrderApi, verifySignatureApi } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Zod Validation Schema
const checkoutSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(8, 'Provide a valid phone number (at least 8 digits)'),
  paymentMethod: z.enum(['cod', 'razorpay']),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const cartItems = useSelector((state) => state.cart.items);
  const totals = useSelector(selectCartTotals);
  const rxRequired = useSelector(selectPrescriptionRequired);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      paymentMethod: 'cod',
    },
  });

  const selectedPayment = watch('paymentMethod');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPrescriptionError('File is too large. Max size is 2MB.');
        setPrescriptionFile(null);
        return;
      }
      setPrescriptionFile(file);
      setPrescriptionError(null);
    }
  };

  const onSubmit = async (data) => {
    // Extra validation for prescription if needed
    if (rxRequired && !prescriptionFile) {
      setPrescriptionError('A valid prescription is required for these medications.');
      showToast('Please upload your prescription.', 'error');
      return;
    }

    setIsPlacing(true);

    try {
      let prescriptionUrl = '';
      if (prescriptionFile) {
        showToast('Uploading prescription file to secure server...', 'info');
        const uploadResult = await uploadImageApi(prescriptionFile);
        prescriptionUrl = uploadResult.url;
      }

      let txId = '';
      if (data.paymentMethod === 'razorpay') {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error('Razorpay Key ID is not configured in environment variables.');
        }

        showToast('Initializing secure Razorpay gateway...', 'info');
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your network.');
        }

        // 1. Create Order on backend
        const orderData = await createRazorpayOrderApi(totals.total);
        const { orderId } = orderData;

        // 2. Open Razorpay Checkout modal
        const paymentResult = await new Promise((resolve, reject) => {
          const options = {
            key: razorpayKey,
            amount: orderData.amount,
            currency: 'INR',
            name: 'CuraCare Pharmacy',
            description: 'Order Payment',
            order_id: orderId,
            handler: function (response) {
              resolve(response);
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment cancelled by user.'));
              }
            },
            prefill: {
              contact: data.phone,
            },
            theme: {
              color: '#0d9488',
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });

        // 3. Verify signature on backend
        showToast('Verifying payment signature securely...', 'info');
        const verifyData = await verifySignatureApi({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature
        });

        if (!verifyData.success) {
          throw new Error('Payment signature verification failed.');
        }

        txId = paymentResult.razorpay_payment_id;
      }

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        prescriptionImage: prescriptionUrl,
        couponCode: totals.couponCode || '',
        discountAmount: totals.discountAmount,
        tax: totals.tax,
        shippingCharges: totals.shipping,
        totalAmount: totals.total,
        paymentMethod: data.paymentMethod,
        transactionId: txId,
      };

      await createOrderApi(orderPayload);
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      showToast('Order placed successfully! Track it in your profile.', 'success');
      setShowSuccessOverlay(true);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsPlacing(false);
    }
  };

  if (showSuccessOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-950/85 backdrop-blur-md text-txt-title">
        <style>{`
          @keyframes drawCheck {
            0% { stroke-dashoffset: 48; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes scaleCircle {
            0% { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulseScale {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
          .animate-draw {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: drawCheck 0.8s ease-in-out forwards 0.3s;
          }
          .animate-scale-circle {
            animation: scaleCircle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-pop {
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-pulse-slow {
            animation: pulseScale 3s infinite ease-in-out;
          }
        `}</style>
        <div
          className="glass-panel p-10 rounded-3xl max-w-sm w-full text-center flex flex-col items-center gap-6 border border-emerald-500/20 animate-pop"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative animate-scale-circle">
            <svg className="w-12 h-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path
                className="animate-draw"
                d="M20 6L9 17l-5-5"
              />
            </svg>
            <div
              className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-pulse-slow"
            ></div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-txt-title">
              Order Placed!
            </h2>
            <p className="text-xs text-txt-muted text-center">
              Your payment has been secured and order is now routing to our pharmacy dispatch.
            </p>
            <p className="text-xs text-primary-500 font-semibold text-center mt-1">
              Estimated Delivery: 3-4 days from today
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button
              onClick={() => navigate('/orders')}
              variant="primary"
              className="w-full text-sm font-semibold"
            >
              View My Orders
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full text-sm font-semibold"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-txt-title mb-4">
          Cannot Checkout
        </h2>
        <p className="text-dark-500 mb-6">Your cart is empty. Add items before checking out.</p>
        <Link to="/products">
          <Button variant="primary">Shop Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <h1 className="text-3xl font-extrabold font-display text-txt-title mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Shipping Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Delivery address card */}
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="font-display font-bold text-lg text-txt-title mb-6">
                1. Delivery Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Street Address"
                  placeholder="123 Health Ave, Apt 4"
                  error={errors.street?.message}
                  {...register('street')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="New York"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State / Province"
                    placeholder="NY"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    placeholder="10001"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                  <Input
                    label="Country"
                    placeholder="United States"
                    error={errors.country?.message}
                    {...register('country')}
                  />
                </div>

                <Input
                  label="Contact Phone"
                  placeholder="+1 (555) 019-2834"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Prescription upload (If required) */}
            {rxRequired && (
              <div className="glass-panel p-8 rounded-3xl border border-red-500/20">
                <h3 className="font-display font-bold text-lg text-txt-title mb-2 flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={20} />
                  2. Prescription Upload (Required)
                </h3>
                <p className="text-xs text-txt-muted mb-6">
                  One or more items in your cart require a doctor prescription. Please upload a clear photo or copy of your valid prescription document.
                </p>

                <div className="border-2 border-dashed border-bdr-main rounded-2xl p-6 text-center hover:border-primary-500 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="text-dark-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-txt-title">
                    {prescriptionFile ? prescriptionFile.name : 'Upload Prescription File'}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">
                    Supports JPG, PNG, PDF formats. Max size 2MB.
                  </p>
                </div>
                {prescriptionError && (
                  <p className="mt-2 text-xs text-red-500 font-semibold">{prescriptionError}</p>
                )}
              </div>
            )}

            {/* Payment options card */}
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="font-display font-bold text-lg text-txt-title mb-6">
                {rxRequired ? '3. Payment Selection' : '2. Payment Selection'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex flex-col items-center justify-center p-5 border rounded-2xl cursor-pointer transition-all ${selectedPayment === 'cod'
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-dark-200 dark:border-dark-850 hover:border-dark-300'
                    }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    className="sr-only"
                    {...register('paymentMethod')}
                  />
                  <Truck size={24} className="text-primary-500 mb-2" />
                  <span className="text-sm font-semibold text-txt-title">Cash on Delivery</span>
                  <span className="text-[10px] text-dark-450 mt-1">Pay at your doorstep</span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-5 border rounded-2xl cursor-pointer transition-all ${selectedPayment === 'razorpay'
                    ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10'
                    : 'border-dark-200 dark:border-dark-850 hover:border-dark-300'
                    }`}
                >
                  <input
                    type="radio"
                    value="razorpay"
                    className="sr-only"
                    {...register('paymentMethod')}
                  />
                  <ShieldCheck size={24} className="text-primary-500 mb-2" />
                  <span className="text-sm font-semibold text-txt-title">Razorpay Pay</span>
                  <span className="text-[10px] text-dark-450 mt-1">Cards, Netbanking, UPI</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-base font-bold shadow-lg"
              isLoading={isPlacing}
            >
              Place Your Order (${totals.total.toFixed(2)})
            </Button>
          </form>
        </div>

        {/* Order review column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-lg text-txt-title border-b border-dark-100 dark:border-dark-850 pb-3">
              Order Review
            </h3>

            {/* Scrollable list of items */}
            <div className="space-y-3 max-h-62.5 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
                return (
                  <div key={item._id} className="flex justify-between items-center gap-3 text-xs">
                    <div className="grow">
                      <p className="font-semibold text-txt-title">{item.name}</p>
                      <p className="text-[10px] text-dark-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-txt-title">
                      ${(discountedPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals split */}
            <div className="border-t border-dark-100 dark:border-dark-850 pt-4 space-y-2 text-xs text-txt-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-amber-500 font-semibold">
                  <span>Savings</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-dark-100 dark:border-dark-850 pt-4 flex justify-between font-display font-bold text-base text-txt-title">
              <span>Total Bill</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-bdr-light/40 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-dark-450 border border-dark-100 dark:border-dark-850 mt-4">
              <ShieldCheck size={14} className="text-primary-500" />
              Verifying licensed clinical protocols.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
