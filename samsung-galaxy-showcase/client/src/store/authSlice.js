import { createSlice } from '@reduxjs/toolkit'

// Hydrate from localStorage on app start
const loadStoredAuth = () => {
  try {
    const stored = localStorage.getItem('samsung_auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { user: parsed.user, isAuthenticated: true }
    }
  } catch (e) {
    console.warn('Failed to parse stored auth:', e)
  }
  return { user: null, isAuthenticated: false }
}

// Load all registered users from localStorage
const loadRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem('samsung_users')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn('Failed to parse stored users:', e)
  }
  return []
}

const saveRegisteredUsers = (users) => {
  localStorage.setItem('samsung_users', JSON.stringify(users))
}

const initialState = {
  ...loadStoredAuth(),
  authError: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signUp: (state, action) => {
      const { name, email, password } = action.payload
      const users = loadRegisteredUsers()

      // Check if user already exists
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        state.authError = 'An account with this email already exists.'
        return
      }

      const newUser = {
        name,
        email,
        password, // In production, this would be hashed
        joinDate: new Date().toISOString(),
        id: `user_${Date.now()}`,
      }

      users.push(newUser)
      saveRegisteredUsers(users)

      // Auto-login after signup
      const sessionUser = { name: newUser.name, email: newUser.email, joinDate: newUser.joinDate, id: newUser.id }
      state.user = sessionUser
      state.isAuthenticated = true
      state.authError = null
      localStorage.setItem('samsung_auth', JSON.stringify({ user: sessionUser }))
    },

    logIn: (state, action) => {
      const { email, password } = action.payload
      const users = loadRegisteredUsers()

      const found = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )

      if (!found) {
        state.authError = 'Invalid email or password.'
        return
      }

      const sessionUser = { name: found.name, email: found.email, joinDate: found.joinDate, id: found.id }
      state.user = sessionUser
      state.isAuthenticated = true
      state.authError = null
      localStorage.setItem('samsung_auth', JSON.stringify({ user: sessionUser }))
    },

    logOut: (state) => {
      state.user = null
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
        localStorage.setItem('samsung_auth', JSON.stringify({ user: state.user }))

        // Update in registered users list
        const users = loadRegisteredUsers()
        const idx = users.findIndex(u => u.id === state.user.id)
        if (idx !== -1) {
          users[idx].name = name
          saveRegisteredUsers(users)
        }
      }
    },
  },
})

export const { signUp, logIn, logOut, clearAuthError, updateProfile } = authSlice.actions
export default authSlice.reducer
