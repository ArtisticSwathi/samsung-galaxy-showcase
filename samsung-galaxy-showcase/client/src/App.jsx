git add .import { Outlet } from 'react-router-dom'
import CartDrawer from './components/ecommerce/CartDrawer'

function App() {
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

