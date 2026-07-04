import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper to map backend cart items (with productId) to frontend items (with id)
const mapCartItems = (items = []) => {
  return items.map((item) => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    color: item.color,
    storage: item.storage,
    image: item.image,
    quantity: item.quantity,
  }))
}

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) return []

      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart')
      }
      return data.items || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          name: item.name,
          price: item.price,
          color: item.color,
          storage: item.storage,
          image: item.image,
          quantity: item.quantity || 1,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart')
      }
      return data.items
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ id, color, storage }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('User not authenticated')

      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, color, storage }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item from cart')
      }
      return data.items
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, color, storage, quantity }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('User not authenticated')

      const response = await fetch(`${API_URL}/cart/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, color, storage, quantity }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity')
      }
      return data.items
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('User not authenticated')

      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart')
      }
      return []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = mapCartItems(action.payload)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = mapCartItems(action.payload)
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // removeFromCart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = mapCartItems(action.payload)
      })
      // updateQuantity
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = mapCartItems(action.payload)
      })
      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
      })
      // Clear cart on logout
      .addCase('auth/logOut', (state) => {
        state.items = []
      })
  },
})

export const { toggleCart, openCart, closeCart } = cartSlice.actions
export default cartSlice.reducer
