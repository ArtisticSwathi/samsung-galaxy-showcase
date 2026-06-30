import { useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logOut } from '../../store/authSlice'

export default function ProfileDropdown({ isOpen, onClose, isLightTheme }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      // Delay adding event listener to prevent immediate close from the same click
      setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || !user) return null

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const joinDate = user.joinDate
    ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const handleLogout = () => {
    dispatch(logOut())
    onClose()
  }

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  // Theme-aware styling
  const dropdownBg = isLightTheme
    ? 'bg-white border-neutral-200 shadow-xl shadow-neutral-200/50'
    : 'bg-[#0f0f14] border-white/10 shadow-2xl shadow-black/50'
  const textPrimary = isLightTheme ? 'text-neutral-900' : 'text-white'
  const textSecondary = isLightTheme ? 'text-neutral-500' : 'text-white/50'
  const textTertiary = isLightTheme ? 'text-neutral-400' : 'text-white/30'
  const dividerColor = isLightTheme ? 'border-neutral-100' : 'border-white/5'
  const hoverBg = isLightTheme ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
  const avatarBg = isLightTheme
    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
    : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black'

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full right-0 mt-3 w-72 ${dropdownBg} border rounded-2xl overflow-hidden z-50 animate-[dropIn_0.2s_ease-out]`}
    >
      {/* Gradient top accent */}
      <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

      {/* User info header */}
      <div className={`p-5 border-b ${dividerColor}`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/20`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${textPrimary} truncate`}>{user.name}</p>
            <p className={`text-[10px] ${textSecondary} truncate font-light`}>{user.email}</p>
          </div>
        </div>
        {joinDate && (
          <p className={`text-[9px] ${textTertiary} mt-3 font-mono tracking-wider uppercase`}>
            Member since {joinDate}
          </p>
        )}
      </div>

      {/* Menu items */}
      <div className="py-2">
        <Link
          to="/profile?tab=orders"
          onClick={onClose}
          className={`w-full flex items-center gap-3 px-5 py-3 ${hoverBg} transition-colors cursor-pointer text-left`}
        >
          <svg className={`w-4 h-4 ${textSecondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${textPrimary}`}>My Orders</span>
        </Link>

        <Link
          to="/stores"
          onClick={onClose}
          className={`w-full flex items-center gap-3 px-5 py-3 ${hoverBg} transition-colors cursor-pointer text-left`}
        >
          <svg className={`w-4 h-4 ${textSecondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${textPrimary}`}>Find Stores</span>
        </Link>

        <Link
          to="/profile"
          onClick={onClose}
          className={`w-full flex items-center gap-3 px-5 py-3 ${hoverBg} transition-colors cursor-pointer text-left`}
        >
          <svg className={`w-4 h-4 ${textSecondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${textPrimary}`}>Account Settings</span>
        </Link>
      </div>

      {/* Logout */}
      <div className={`border-t ${dividerColor} p-3`}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-300 cursor-pointer"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Sign Out</span>
        </button>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
