import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import productReducer from './productSlice'
import orderReducer from './orderSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    auth: authReducer,
  },
})

export default store

