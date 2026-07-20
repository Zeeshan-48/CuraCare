import { createSlice } from '@reduxjs/toolkit';

const storedWishlist = localStorage.getItem('curacare_wishlist');

const initialState = {
  items: storedWishlist ? JSON.parse(storedWishlist) : [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item._id === product._id);

      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
      localStorage.setItem('curacare_wishlist', JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      localStorage.setItem('curacare_wishlist', JSON.stringify(state.items));
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
