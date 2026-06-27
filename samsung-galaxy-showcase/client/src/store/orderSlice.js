import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentOrder: null, // { orderId, date, items, total, shippingInfo }
  orderHistory: []
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder(state, action) {
      state.currentOrder = action.payload
      state.orderHistory.push(action.payload)
    },
    clearCurrentOrder(state) {
      state.currentOrder = null
    }
  }
})

export const { createOrder, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
