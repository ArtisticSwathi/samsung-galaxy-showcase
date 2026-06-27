import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Experience3DPage from './pages/Experience3DPage'
import ShopPage from './pages/ShopPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import StoreLocatorPage from './pages/StoreLocatorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Experience3DPage />,
      },
      {
        path: 'shop',
        element: <ShopPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'order-confirmation',
        element: <OrderConfirmationPage />,
      },
      {
        path: 'stores',
        element: <StoreLocatorPage />,
      },
    ],
  },
])

export default router
