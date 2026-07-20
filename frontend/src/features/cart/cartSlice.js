import { createSlice } from '@reduxjs/toolkit';
import { updateCartApi } from '../../utils/api.js';

const storedCartItems = localStorage.getItem('curacare_cart');

const initialState = {
  items: storedCartItems ? JSON.parse(storedCartItems) : [],
  couponCode: null,
  discountPercentage: 0,
  taxRate: 0.05, // 5% flat tax on medical products
  shippingRate: 10, // $10 flat shipping
};

// Helper function to calculate totals
const calculateTotals = (state) => {
  const subtotal = state.items.reduce((total, item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return total + discountedPrice * item.quantity;
  }, 0);

  const discountAmount = subtotal * (state.discountPercentage / 100);
  const tax = (subtotal - discountAmount) * state.taxRate;
  const shipping = (subtotal - discountAmount > 75 || subtotal === 0) ? 0 : state.shippingRate;
  const total = subtotal - discountAmount + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('curacare_cart', JSON.stringify(state.items));
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item._id === product._id);

      if (existingItem) {
        // Prevent exceeding stock
        const potentialQty = existingItem.quantity + quantity;
        existingItem.quantity = Math.min(potentialQty, product.stock);
      } else {
        state.items.push({ ...product, quantity: Math.min(quantity, product.stock) });
      }

      localStorage.setItem('curacare_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      localStorage.setItem('curacare_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item._id === productId);

      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
      }
      localStorage.setItem('curacare_cart', JSON.stringify(state.items));
    },
    applyCoupon: (state, action) => {
      const code = action.payload.toUpperCase();
      let discount = 0;

      // Mock Coupons: HEALTH20 (20% off), CURA10 (10% off), FREESHIP (100% off shipping - handled dynamically)
      if (code === 'HEALTH20') {
        discount = 20;
      } else if (code === 'CURA10') {
        discount = 10;
      } else {
        discount = 0;
      }

      if (discount > 0) {
        state.couponCode = code;
        state.discountPercentage = discount;
      }
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountPercentage = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountPercentage = 0;
      localStorage.removeItem('curacare_cart');
    },
  },
});

export const {
  setCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

// Async Thunk to sync local cart state with Backend
export const syncCartWithBackend = () => async (dispatch, getState) => {
  const { auth, cart } = getState();
  if (auth.isAuthenticated) {
    try {
      const formattedItems = cart.items
        .filter(item => item && item._id)
        .map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        }));
      await updateCartApi(formattedItems);
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    }
  }
};

// Selector to get cart totals
export const selectCartTotals = (state) => calculateTotals(state.cart);
// Selector to check if prescription upload is required
export const selectPrescriptionRequired = (state) =>
  state.cart.items.some((item) => item && item.prescriptionRequired);

export default cartSlice.reducer;
