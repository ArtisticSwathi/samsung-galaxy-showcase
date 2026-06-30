import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Experience3DPage from './pages/Experience3DPage'
import ShopPage from './pages/ShopPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import StoreLocatorPage from './pages/StoreLocatorPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/common/ProtectedRoute'

export const router = createBrowserRouter([
  {
    // Landing Page — standalone promotional showcase (no shared Navbar layout)
    path: '/',
    element: <Experience3DPage />,
  },
  {
    // E-commerce Website — shared App layout with Navbar, Cart Drawer, etc.
    path: '/',
    element: <App />,
    children: [
      {
        path: 'shop',
        element: <ProtectedRoute><ShopPage /></ProtectedRoute>,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },
      {
        path: 'order-confirmation',
        element: <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>,
      },
      {
        path: 'stores',
        element: <ProtectedRoute><StoreLocatorPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
    ],
  },
])

export default router
