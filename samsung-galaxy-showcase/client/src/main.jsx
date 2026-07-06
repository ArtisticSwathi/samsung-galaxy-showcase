import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store/store'
import { router } from './router'
import { verifySession } from './store/authSlice'
import './styles/globals.css'

console.log("🔧 Active API URL:", import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

// Dispatch session verification immediately if a token exists
const state = store.getState()
if (state.auth && state.auth.token) {
  store.dispatch(verifySession())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
