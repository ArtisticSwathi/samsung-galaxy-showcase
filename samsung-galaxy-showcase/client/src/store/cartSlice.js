import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], // Array of { id, name, price, color, storage, quantity, image }
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    openCart(state) {
      state.isOpen = true
    },
    closeCart(state) {
      state.isOpen = false
    },
    addToCart(state, action) {
      const { id, name, price, color, storage, image } = action.payload
      // Check if item with same configuration already exists in the cart
      const existingItem = state.items.find(
        (item) => item.id === id && item.color === color && item.storage === storage
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          id,
          name,
          price,
          color,
          storage,
          image,
          quantity: 1,
        })
      }
    },
    removeFromCart(state, action) {
      const { id, color, storage } = action.payload
      state.items = state.items.filter(
        (item) => !(item.id === id && item.color === color && item.storage === storage)
      )
    },
    updateQuantity(state, action) {
      const { id, color, storage, quantity } = action.payload
      const item = state.items.find(
        (item) => item.id === id && item.color === color && item.storage === storage
      )
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const {
  toggleCart,
  openCart,
  closeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
