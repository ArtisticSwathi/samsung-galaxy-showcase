import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signUp, logIn, clearAuthError } from '../../store/authSlice'

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const dispatch = useDispatch()
  const { isAuthenticated, authError, isLoading } = useSelector((state) => state.auth)

  const [mode, setMode] = useState(defaultMode) // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  const modalRef = useRef(null)

  // Open shop in a new tab on successful authentication
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose()
      // Open the ecommerce page in a new browser tab
      window.open('/shop', '_blank')
    }
  }, [isAuthenticated, isOpen, onClose])

  // Reset mode to defaultMode when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
    }
  }, [isOpen, defaultMode])

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setLocalError(null)
    dispatch(clearAuthError())
  }, [isOpen, mode, dispatch])

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Close on outside click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoading) return
    setLocalError(null)
    dispatch(clearAuthError())

    if (mode === 'signup') {
      if (!name.trim()) { setLocalError('Please enter your name.'); return }
      if (!email.trim()) { setLocalError('Please enter your email.'); return }
      if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return }
      if (password !== confirmPassword) { setLocalError('Passwords do not match.'); return }

      dispatch(signUp({ name: name.trim(), email: email.trim(), password }))
    } else {
      if (!email.trim()) { setLocalError('Please enter your email.'); return }
      if (!password) { setLocalError('Please enter your password.'); return }

      dispatch(logIn({ email: email.trim(), password }))
    }
  }

  if (!isOpen) return null

  const displayError = localError || authError

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-[fadeInScale_0.3s_ease-out]"
      >
        {/* Decorative gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-8 pb-10">
          {/* Brand header */}
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono tracking-[0.4em] text-cyan-400 uppercase mb-2">Samsung Galaxy</p>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-white/40 mt-2 font-light">
              {mode === 'login'
                ? 'Sign in to access your Samsung account'
                : 'Join the Samsung Galaxy experience'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error display */}
          {displayError && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-[11px] text-red-400 font-medium">{displayError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/15 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/30 mt-6 font-light tracking-wide">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
