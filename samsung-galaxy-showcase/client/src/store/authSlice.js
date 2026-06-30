import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Hydrate from localStorage on app start
const loadStoredAuth = () => {
  try {
    const stored = localStorage.getItem('samsung_auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { 
        user: parsed.user, 
        token: parsed.token,
        isAuthenticated: !!parsed.token 
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored auth:', e)
  }
  return { user: null, token: null, isAuthenticated: false }
}

const initialState = {
  ...loadStoredAuth(),
  isLoading: false,
  authError: null,
}

// Thunk to verify existing session/token validity
export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) return null

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Session expired')
      }

      const data = await response.json()
      return data // returns user object
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async registration thunk
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      return data // returns { user, token }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async login thunk
export const logIn = createAsyncThunk(
  'auth/logIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      return data // returns { user, token }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch user profile details
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile')
      }
      return data // returns user object
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update user profile info (name, phone)
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ name, phone }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }
      return data // returns updated user object
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add address
export const addUserAddress = createAsyncThunk(
  'auth/addUserAddress',
  async (addressData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add address')
      }
      return data // returns { message, addresses }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update address
export const updateUserAddress = createAsyncThunk(
  'auth/updateUserAddress',
  async ({ addressId, addressData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address')
      }
      return data // returns { message, addresses }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete address
export const deleteUserAddress = createAsyncThunk(
  'auth/deleteUserAddress',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete address')
      }
      return data // returns { message, addresses }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Set default address
export const setDefaultAddress = createAsyncThunk(
  'auth/setDefaultAddress',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to set default address')
      }
      return data // returns { message, addresses }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update password
export const updateUserPassword = createAsyncThunk(
  'auth/updateUserPassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password')
      }
      return data // returns { message }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete account
export const deleteUserAccount = createAsyncThunk(
  'auth/deleteUserAccount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      if (!token) throw new Error('No token found')

      const response = await fetch(`${API_URL}/users/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account')
      }
      return data // returns { message }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.authError = null
      localStorage.removeItem('samsung_auth')
    },
    clearAuthError: (state) => {
      state.authError = null
    },
    updateProfile: (state, action) => {
      const { name } = action.payload
      if (state.user) {
        state.user.name = name
        // Update in localStorage session
        localStorage.setItem('samsung_auth', JSON.stringify({ 
          user: state.user, 
          token: state.token 
        }))
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.authError = null
        localStorage.setItem('samsung_auth', JSON.stringify({ 
          user: action.payload.user, 
          token: action.payload.token 
        }))
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Registration failed'
      })

      // Log In
      .addCase(logIn.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.authError = null
        localStorage.setItem('samsung_auth', JSON.stringify({ 
          user: action.payload.user, 
          token: action.payload.token 
        }))
      })
      .addCase(logIn.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Login failed'
      })

      // Verify Session
      .addCase(verifySession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
          // Keep storage in sync
          const stored = localStorage.getItem('samsung_auth')
          if (stored) {
            const parsed = JSON.parse(stored)
            localStorage.setItem('samsung_auth', JSON.stringify({
              user: action.payload,
              token: parsed.token
            }))
          }
        }
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('samsung_auth')
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.authError = null
        localStorage.setItem('samsung_auth', JSON.stringify({
          user: action.payload,
          token: state.token
        }))
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to fetch profile'
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.authError = null
        localStorage.setItem('samsung_auth', JSON.stringify({
          user: action.payload,
          token: state.token
        }))
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to update profile'
      })

      // Add Address
      .addCase(addUserAddress.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.addresses = action.payload.addresses
          localStorage.setItem('samsung_auth', JSON.stringify({
            user: state.user,
            token: state.token
          }))
        }
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to add address'
      })

      // Update Address
      .addCase(updateUserAddress.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.addresses = action.payload.addresses
          localStorage.setItem('samsung_auth', JSON.stringify({
            user: state.user,
            token: state.token
          }))
        }
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to update address'
      })

      // Delete Address
      .addCase(deleteUserAddress.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.addresses = action.payload.addresses
          localStorage.setItem('samsung_auth', JSON.stringify({
            user: state.user,
            token: state.token
          }))
        }
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to delete address'
      })

      // Set Default Address
      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.user) {
          state.user.addresses = action.payload.addresses
          localStorage.setItem('samsung_auth', JSON.stringify({
            user: state.user,
            token: state.token
          }))
        }
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to set default address'
      })

      // Update Password
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.isLoading = false
        state.authError = null
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to update password'
      })

      // Delete Account
      .addCase(deleteUserAccount.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.authError = null
        localStorage.removeItem('samsung_auth')
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.isLoading = false
        state.authError = action.payload || 'Failed to delete account'
      })
  }
})

export const { logOut, clearAuthError, updateProfile } = authSlice.actions
export default authSlice.reducer
