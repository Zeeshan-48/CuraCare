import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Ticket, ArrowRight, Lock, ShieldAlert, ShoppingBag } from 'lucide-react';

import {
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  selectCartTotals,
  selectPrescriptionRequired,
  syncCartWithBackend,
} from '../features/cart/cartSlice.js';
import { toggleWishlist } from '../features/cart/wishlistSlice.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cartItems = useSelector((state) => state.cart.items);
  const couponCode = useSelector((state) => state.cart.couponCode);
  const discountPercentage = useSelector((state) => state.cart.discountPercentage);

  const totals = useSelector(selectCartTotals);
  const prescriptionNeeded = useSelector(selectPrescriptionRequired);

  const [couponInput, setCouponInput] = useState('');

  const handleQuantityChange = (productId, qty, stock) => {
    if (qty > stock) {
      showToast(`Cannot exceed available stock of ${stock}`, 'warning');
      return;
    }
    dispatch(updateQuantity({ productId, quantity: qty }));
    dispatch(syncCartWithBackend());
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
    dispatch(syncCartWithBackend());
    showToast('Removed from cart', 'success');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    dispatch(applyCoupon(couponInput));
    setCouponInput('');
  };

  // Check if coupon application was successful (if state was updated)
  React.useEffect(() => {
    if (couponCode) {
      showToast(`Coupon applied! ${discountPercentage}% off your order.`, 'success');
    } else if (couponInput && !couponCode) {
      showToast('Invalid coupon code.', 'error');
    }
  }, [couponCode]);

  const handleSaveForLater = (product) => {
    dispatch(removeFromCart(product._id));
    dispatch(toggleWishlist(product));
    dispatch(syncCartWithBackend());
    showToast(`Saved ${product.name} to Wishlist`, 'success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-full bg-bdr-light/40 text-dark-400 flex items-center justify-center mb-6">
          <ShoppingBag size={44} />
        </div>
        <h2 className="text-2xl font-bold font-display text-txt-title mb-2">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-dark-500 dark:text-dark-450 max-w-sm mb-8 leading-relaxed">
          Looks like you haven't added any medicines or health items to your cart yet.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <h1 className="text-3xl font-extrabold font-display text-txt-title mb-8">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
            return (
              <div
                key={item._id}
                className="glass-panel p-5 rounded-2xl border border-dark-100 dark:border-dark-850 flex flex-col sm:flex-row items-center gap-6"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-bdr-light rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Product details */}
                <div className="grow text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-display font-bold text-txt-title text-base">
                      {item.name}
                    </h3>
                    {item.prescriptionRequired && (
                      <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-red-500 text-white rounded">
                        Rx
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-500 italic mt-0.5">{item.genericName}</p>

                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                    <button
                      onClick={() => handleSaveForLater(item)}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-650 cursor-pointer"
                    >
                      Save for Later
                    </button>
                    <span className="text-dark-200">|</span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-650 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center border border-bdr-main rounded-xl overflow-hidden bg-bg-panel shrink-0">
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.stock)}
                    className="px-3 py-1 text-dark-500 cursor-pointer hover:bg-dark-55"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-txt-title">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.stock)}
                    className="px-3 py-1 text-dark-500 cursor-pointer hover:bg-dark-55"
                  >
                    +
                  </button>
                </div>

                {/* Total Price for single item */}
                <div className="text-right shrink-0 min-w-20">
                  <span className="font-display font-bold text-txt-title text-base">
                    ${(discountedPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Coupon Input Form */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-display font-bold text-sm text-txt-title mb-3 flex items-center gap-2">
              <Ticket size={16} className="text-primary-500" />
              Apply Coupon
            </h3>
            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-500/20 text-sm">
                <span className="font-semibold text-primary-500">
                  CODE: {couponCode}
                </span>
                <button
                  onClick={() => dispatch(removeCoupon())}
                  className="text-xs text-red-500 font-semibold hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. HEALTH20"
                  className="flex-1 px-3 py-2 rounded-xl bg-bdr-light border border-bdr-main text-sm text-txt-title outline-none focus:border-primary-500"
                />
                <Button type="submit" variant="primary" size="sm">
                  Apply
                </Button>
              </form>
            )}
            <p className="text-[10px] text-dark-400 mt-2">
              Try using <span className="font-bold text-primary-500">HEALTH20</span> (20% off) or{' '}
              <span className="font-bold text-primary-500">CURA10</span> (10% off) for discounts.
            </p>
          </div>

          {/* Pricing breakdown */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-txt-title border-b border-dark-100 dark:border-dark-850 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm text-dark-600 dark:text-dark-455">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-amber-500 font-medium">
                  <span>Discount</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>
                  {totals.shipping === 0 ? (
                    <span className="text-emerald-500 font-semibold">FREE</span>
                  ) : (
                    `$${totals.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {totals.shipping > 0 && (
                <p className="text-[10px] text-dark-400 text-right leading-none">
                  Add ${(75 - (totals.subtotal - totals.discountAmount)).toFixed(2)} more for free
                  shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between font-display font-bold text-lg text-txt-title border-t border-dark-100 dark:border-dark-850 pt-4">
              <span>Total Price</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>

            {/* Prescription warnings */}
            {prescriptionNeeded && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 flex items-start gap-2.5 text-xs">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div className="text-left leading-normal">
                  <p className="font-bold">Prescription Required</p>
                  <p className="mt-0.5">
                    Your cart contains prescription-only medications. You will need to upload a valid Doctor prescription in the next step to place this order.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={() => navigate('/checkout')}
              variant="primary"
              className="w-full gap-2 mt-4"
            >
              Secure Checkout
              <ArrowRight size={16} />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-dark-400 mt-2">
              <Lock size={12} />
              SSL Encrypted Transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
