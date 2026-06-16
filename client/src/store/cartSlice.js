import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalAmount: 0,
};

const calculateTotal = (items) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalAmount = calculateTotal(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.totalAmount = calculateTotal(state.items);
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item) => item._id === action.payload);
      if (item) {
        item.quantity += 1;
      }
      state.totalAmount = calculateTotal(state.items);
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((item) => item._id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter((i) => i._id !== action.payload);
        }
      }
      state.totalAmount = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
