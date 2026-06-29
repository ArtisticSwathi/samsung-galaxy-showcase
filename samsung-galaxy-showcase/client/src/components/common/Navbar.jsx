import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleCart } from '../../store/cartSlice'
import AuthModal from './AuthModal'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar() {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const cartItems = useSelector((state) => state.cart.items)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Calculate total item count in the cart
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Determine if we should render a light theme (used on Store Locator page)
  const isLightTheme = pathname === '/stores'

  // Dynamic class styling based on active page theme
  const headerStyles = isLightTheme 
    ? "sticky top-0 w-full z-50 bg-white border-b border-neutral-200 text-neutral-800"
    : "absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/40 to-transparent text-white"

  const logoStyles = isLightTheme
    ? "text-neutral-900 hover:text-cyan-600 font-mono text-sm tracking-[0.35em] uppercase font-bold transition-all duration-300"
    : "text-white hover:text-cyan-400 font-mono text-sm tracking-[0.35em] uppercase font-bold transition-all duration-300"

  const navLinkStyles = isLightTheme
    ? "text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-600 hover:text-black transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-cyan-600 hover:after:w-full after:transition-all after:duration-300"
    : "text-[11px] uppercase tracking-[0.25em] font-medium text-white/80 hover:text-white transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"

  const iconBtnStyles = isLightTheme
    ? "relative p-2.5 rounded-full bg-neutral-100 border border-neutral-200 hover:border-cyan-600 text-neutral-800 hover:text-cyan-600 transition-all duration-300 cursor-pointer"
    : "relative p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/40 text-white hover:text-cyan-400 transition-all duration-300 cursor-pointer"

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowProfileDropdown(prev => !prev)
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <header className={headerStyles}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Brand Logo — links to e-commerce home */}
          <Link to="/shop" className={logoStyles}>
            SAMSUNG <span className={`font-light ${isLightTheme ? 'text-neutral-500' : 'text-white/60'}`}>GALAXY</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-12">
            <Link to="/shop" className={navLinkStyles}>
              Home
            </Link>
            <Link to="/stores" className={navLinkStyles}>
              Stores
            </Link>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            
            {/* Location Locator Link */}
            <Link 
              to="/stores" 
              className={`${iconBtnStyles} ${pathname === '/stores' ? 'border-cyan-600 text-cyan-600' : ''}`}
              aria-label="Find Samsung Store"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" 
                />
              </svg>
            </Link>

            {/* Profile User Icon */}
            <div className="relative">
              <button 
                onClick={handleProfileClick}
                className={iconBtnStyles} 
                aria-label="User Account"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={1.5}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
                  />
                </svg>

                {/* Logged-in indicator dot */}
                {isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-black shadow-lg shadow-cyan-500/40" />
                )}
              </button>

              {/* Profile Dropdown (only when logged in) */}
              <ProfileDropdown
                isOpen={showProfileDropdown}
                onClose={() => setShowProfileDropdown(false)}
                isLightTheme={isLightTheme}
              />
            </div>

            {/* Cart Icon / Toggle Cart Drawer */}
            <button 
              onClick={() => dispatch(toggleCart())}
              className={iconBtnStyles}
              aria-label="Toggle Cart"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" 
                />
              </svg>

              {/* Cart Badge */}
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black font-sans shadow-lg shadow-cyan-500/30 animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Auth Modal (rendered outside header to avoid z-index issues) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
