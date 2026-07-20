import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice.js';
import cartReducer from './cart/cartSlice.js';
import wishlistReducer from './cart/wishlistSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});
