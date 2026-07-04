import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import CartDrawer from './components/ecommerce/CartDrawer'
import { fetchCart } from './store/cartSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* Routed active sub-page */}
      <Outlet />

      {/* Global sliding cart drawer */}
      <CartDrawer />
    </div>
  )
}

export default App

