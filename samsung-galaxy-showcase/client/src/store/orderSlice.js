import { createSlice } from '@reduxjs/toolkit'

// Hydrate order history from localStorage on app start
const loadStoredOrders = () => {
  try {
    const stored = localStorage.getItem('samsung_orders')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to parse stored orders:', e)
  }
  return []
}

const initialState = {
  currentOrder: null, // { orderId, date, items, total, shippingInfo }
  orderHistory: loadStoredOrders()
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder(state, action) {
      state.currentOrder = action.payload
      state.orderHistory.push(action.payload)
      localStorage.setItem('samsung_orders', JSON.stringify(state.orderHistory))
    },
    clearCurrentOrder(state) {
      state.currentOrder = null
    }
  }
})

export const { createOrder, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
