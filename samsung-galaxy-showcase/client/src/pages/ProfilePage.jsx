import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import {
  fetchUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  updateUserPassword,
  deleteUserAccount,
  clearAuthError
} from '../store/authSlice'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { user, token, isLoading, authError } = useSelector((state) => state.auth)
  const { orderHistory } = useSelector((state) => state.orders)

  const searchParams = new URLSearchParams(location.search)
  const queryTab = searchParams.get('tab')

  // Tab State: 'info' | 'addresses' | 'security' | 'orders'
  const [activeTab, setActiveTab] = useState(
    queryTab && ['info', 'addresses', 'security', 'orders'].includes(queryTab) ? queryTab : 'info'
  )

  // Update tab state if location query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab && ['info', 'addresses', 'security', 'orders'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  // User Info Edit Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState('')
  const [infoError, setInfoError] = useState('')

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null) // null for 'add', id for 'edit'
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('India')
  const [addrPhone, setAddrPhone] = useState('')
  const [isDefaultAddr, setIsDefaultAddr] = useState(false)
  const [addressSuccess, setAddressSuccess] = useState('')
  const [addressError, setAddressError] = useState('')

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Delete Account Confirmation Dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // Fetch full profile info on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, token])

  // Sync form states with Redux user state
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  // Reset notifications on tab switch
  useEffect(() => {
    setInfoSuccess('')
    setInfoError('')
    setAddressSuccess('')
    setAddressError('')
    setPasswordSuccess('')
    setPasswordError('')
    setDeleteError('')
    dispatch(clearAuthError())
  }, [activeTab, dispatch])

  // ── 1. USER PROFILE INFO SUBMIT ──────────────────────────────────────
  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setInfoSuccess('')
    setInfoError('')

    if (!name.trim()) {
      setInfoError('Name cannot be empty.')
      return
    }

    const resultAction = await dispatch(updateUserProfile({ name: name.trim(), phone: phone.trim() }))
    if (updateUserProfile.fulfilled.match(resultAction)) {
      setInfoSuccess('Profile updated successfully!')
      setIsEditingInfo(false)
    } else {
      setInfoError(resultAction.payload || 'Failed to update profile.')
    }
  }

  // ── 2. ADDRESS BOOK SUBMIT (ADD / EDIT) ──────────────────────────────
  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    setAddressSuccess('')
    setAddressError('')

    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      setAddressError('Please fill in all required fields.')
      return
    }

    const addressData = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      phoneNumber: addrPhone.trim(),
      isDefault: isDefaultAddr
    }

    let resultAction
    if (editingAddressId) {
      resultAction = await dispatch(updateUserAddress({ addressId: editingAddressId, addressData }))
    } else {
      resultAction = await dispatch(addUserAddress(addressData))
    }

    if (addUserAddress.fulfilled.match(resultAction) || updateUserAddress.fulfilled.match(resultAction)) {
      setAddressSuccess(editingAddressId ? 'Address updated successfully!' : 'Address added successfully!')
      resetAddressForm()
    } else {
      setAddressError(resultAction.payload || 'Failed to save address.')
    }
  }

  const resetAddressForm = () => {
    setStreet('')
    setCity('')
    setState('')
    setZipCode('')
    setCountry('India')
    setAddrPhone('')
    setIsDefaultAddr(false)
    setShowAddressForm(false)
    setEditingAddressId(null)
  }

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id)
    setStreet(addr.street || '')
    setCity(addr.city || '')
    setState(addr.state || '')
    setZipCode(addr.zipCode || '')
    setCountry(addr.country || 'India')
    setAddrPhone(addr.phoneNumber || '')
    setIsDefaultAddr(addr.isDefault || false)
    setShowAddressForm(true)
    setAddressSuccess('')
    setAddressError('')
  }

  const handleDeleteAddress = async (id) => {
    setAddressSuccess('')
    setAddressError('')
    if (window.confirm('Are you sure you want to delete this address?')) {
      const resultAction = await dispatch(deleteUserAddress(id))
      if (deleteUserAddress.fulfilled.match(resultAction)) {
        setAddressSuccess('Address deleted successfully.')
      } else {
        setAddressError(resultAction.payload || 'Failed to delete address.')
      }
    }
  }

  const handleSetDefaultAddress = async (id) => {
    setAddressSuccess('')
    setAddressError('')
    const resultAction = await dispatch(setDefaultAddress(id))
    if (setDefaultAddress.fulfilled.match(resultAction)) {
      setAddressSuccess('Default address updated.')
    } else {
      setAddressError(resultAction.payload || 'Failed to update default address.')
    }
  }

  // ── 3. PASSWORD CHANGE SUBMIT ────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordSuccess('')
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    const resultAction = await dispatch(updateUserPassword({ currentPassword, newPassword }))
    if (updateUserPassword.fulfilled.match(resultAction)) {
      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordError(resultAction.payload || 'Failed to update password.')
    }
  }

  // ── 4. DELETE ACCOUNT SUBMIT ─────────────────────────────────────────
  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setDeleteError('')

    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.')
      return
    }

    const resultAction = await dispatch(deleteUserAccount())
    if (deleteUserAccount.fulfilled.match(resultAction)) {
      alert('Your account has been deleted successfully. Goodbye!')
      navigate('/')
    } else {
      setDeleteError(resultAction.payload || 'Failed to delete account.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-white/60 text-xs tracking-widest font-mono">LOADING PROFILE...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020204] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 w-full flex-grow">
        {/* Page Banner Title */}
        <div className="mb-10 text-center md:text-left">
          <p className="text-[10px] font-mono tracking-[0.4em] text-cyan-400 uppercase mb-2">Account Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-xs text-white/40 mt-2 font-light">
            Manage your personal profile, addresses, and account security.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Tabs Menu */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 lg:flex-none text-left py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Info</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 lg:flex-none text-left py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Address Book</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 lg:flex-none text-left py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 lg:flex-none text-left py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/15'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Security</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-9 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 min-h-[500px]">
            
            {/* ── A. USER PROFILE INFO TAB ──────────────────────────────────── */}
            {activeTab === 'info' && (
              <div className="animate-[fadeInScale_0.3s_ease-out]">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Personal Profile</h2>
                
                {infoSuccess && (
                  <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 font-medium">{infoSuccess}</p>
                  </div>
                )}
                {infoError && (
                  <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-red-400 font-medium">{infoError}</p>
                  </div>
                )}

                <form onSubmit={handleUpdateInfo} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditingInfo || isLoading}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/40 focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-[10px] text-white/30 font-light italic">Your email address is permanent and cannot be modified.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditingInfo || isLoading}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    {!isEditingInfo ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(true)}
                        className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        Edit Details
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                          {isLoading && (
                            <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingInfo(false)
                            setName(user.name || '')
                            setPhone(user.phone || '')
                            setInfoError('')
                          }}
                          className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ── B. ADDRESS BOOK TAB ────────────────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div className="animate-[fadeInScale_0.3s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-tight text-white">Saved Addresses</h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        resetAddressForm()
                        setShowAddressForm(true)
                      }}
                      className="py-2.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Address
                    </button>
                  )}
                </div>

                {addressSuccess && (
                  <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 font-medium">{addressSuccess}</p>
                  </div>
                )}
                {addressError && (
                  <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-red-400 font-medium">{addressError}</p>
                  </div>
                )}

                {/* Inline Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8 space-y-5 animate-[fadeInScale_0.25s_ease-out]">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                      {editingAddressId ? 'Edit Address Details' : 'New Address Details'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Street Address</label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          disabled={isLoading}
                          placeholder="Flat/House No., Building Name, Street Name"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. Mumbai"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">State / Province</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. Maharashtra"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Zip / Postal Code</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. 400001"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. India"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Contact Phone (Optional)</label>
                        <input
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          disabled={isLoading}
                          placeholder="10-digit mobile number"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="isDefaultAddr"
                          checked={isDefaultAddr}
                          onChange={(e) => setIsDefaultAddr(e.target.checked)}
                          disabled={isLoading}
                          className="w-4 h-4 accent-cyan-500 rounded bg-white/5 border-white/10 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="isDefaultAddr" className="text-[11px] text-white/70 select-none cursor-pointer">
                          Set as default delivery address
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="py-3 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                      >
                        {isLoading && (
                          <svg className="animate-spin h-3 w-3 text-black" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Addresses List Grid */}
                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <svg className="w-8 h-8 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 7.5h.008v.008h-.008V7.5zm0 2.25h.008v.008h-.008V9.75zm-2.25-2.25h.008v.008h-.008V7.5zm0 2.25h.008v.008h-.008V9.75zM4.5 21h15m-15 0v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3.375 7.5h.008v.008H3.375V7.5zm0 2.25h.008v.008H3.375V9.75zm2.25-2.25h.008v.008H5.625V7.5zm0 2.25h.008v.008H5.625V9.75z" />
                    </svg>
                    <p className="text-sm font-semibold text-white/50">No saved addresses found</p>
                    <p className="text-[10px] text-white/25 mt-1 font-light">Add an address to speed up your checkout process.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`relative border rounded-2xl p-5 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 ${
                          addr.isDefault
                            ? 'border-cyan-500/30 bg-cyan-500/[0.02] shadow-lg shadow-cyan-500/5'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div>
                          {/* Card Header badges */}
                          <div className="flex items-center justify-between mb-4">
                            {addr.isDefault ? (
                              <span className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                Default Address
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultAddress(addr._id)}
                                disabled={isLoading}
                                className="text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-40"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          {/* Address details */}
                          <div className="text-xs space-y-1 text-white/70 font-light">
                            <p className="font-semibold text-white text-sm mb-2">{user.name}</p>
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p>{addr.country}</p>
                            {addr.phoneNumber && (
                              <p className="mt-3 text-[10px] text-white/40">Phone: {addr.phoneNumber}</p>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex gap-4 border-t border-white/5 mt-5 pt-3.5 text-[10px] font-bold uppercase tracking-widest">
                          <button
                            onClick={() => handleEditAddressClick(addr)}
                            disabled={isLoading}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            disabled={isLoading}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── C. SECURITY (PASSWORD CHANGE) TAB ──────────────────────────── */}
            {activeTab === 'security' && (
              <div className="animate-[fadeInScale_0.3s_ease-out] space-y-10">
                
                {/* Change password card */}
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Change Password</h2>
                  <p className="text-xs text-white/40 mb-6 font-light">Update your account login password periodically for maximum safety.</p>

                  {passwordSuccess && (
                    <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl max-w-xl">
                      <p className="text-xs text-emerald-400 font-medium">{passwordSuccess}</p>
                    </div>
                  )}
                  {passwordError && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl max-w-xl">
                      <p className="text-xs text-red-400 font-medium">{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all duration-300 disabled:opacity-40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 mt-2"
                    >
                      {isLoading && (
                        <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      Change Password
                    </button>
                  </form>
                </div>

                {/* Danger zone card */}
                <div className="pt-8 border-t border-white/5">
                  <h2 className="text-xl font-bold uppercase tracking-tight text-red-500 mb-2">Danger Zone</h2>
                  <p className="text-xs text-white/40 mb-6 font-light">Irreversible settings for deleting user accounts permanently.</p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-3.5 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <form onSubmit={handleDeleteAccount} className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 max-w-xl space-y-5 animate-[fadeInScale_0.2s_ease-out]">
                      <div>
                        <h3 className="text-sm font-semibold text-red-500">Are you absolutely sure?</h3>
                        <p className="text-[11px] text-white/60 mt-1 font-light">
                          This operation is permanent. All address configurations, order histories, and profile structures will be deleted from the database.
                        </p>
                      </div>

                      {deleteError && (
                        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-[10px] text-red-400 font-medium">{deleteError}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/50 font-semibold">
                          Type <span className="font-mono text-red-400 font-bold select-none">DELETE</span> in capitals to confirm:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          disabled={isLoading}
                          placeholder="DELETE"
                          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.04] transition-all"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={isLoading || deleteConfirmText !== 'DELETE'}
                          className="py-3.5 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-800/40 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xl shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Confirm Account Deletion
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteConfirmText('')
                            setDeleteError('')
                          }}
                          className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            )}

            {/* ── D. MY ORDERS TAB ────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="animate-[fadeInScale_0.3s_ease-out]">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Order History</h2>
                
                {(!orderHistory || orderHistory.length === 0) ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <svg className="w-8 h-8 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-white/50">No purchases found</p>
                    <p className="text-[10px] text-white/25 mt-1 font-light">You haven't placed any orders yet. Visit our shop to explore Galaxy devices!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {[...orderHistory].reverse().map((order, idx) => (
                      <div key={idx} className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 md:p-6 space-y-5">
                        {/* Order Header Summary */}
                        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-white/5">
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Order Date</span>
                            <p className="text-xs text-white/80">
                              {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Order Reference</span>
                            <p className="text-xs font-mono font-bold text-cyan-400">{order.orderId}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Total Charged</span>
                            <p className="text-xs font-bold font-mono text-white">${Number(order.total).toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Shipment Status</span>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Processing
                            </p>
                          </div>
                        </div>

                        {/* Items in the purchase */}
                        <div className="space-y-3">
                          {order.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-center text-xs">
                              <div className="text-white/80 font-light">
                                <span className="font-medium text-white">{item.name}</span>
                                <span className="text-white/40 text-[10px] uppercase font-mono block sm:inline sm:ml-2">
                                  ({item.color} • {item.storage} • Qty {item.quantity})
                                </span>
                              </div>
                              <span className="font-mono text-white/60">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address & Tracking */}
                        <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-white/50 font-light">
                          <div>
                            <h4 className="font-bold text-white uppercase tracking-wider text-[9px] mb-1.5">Shipment Delivery</h4>
                            <p className="text-white/70 font-semibold">{order.shippingInfo.name}</p>
                            <p>{order.shippingInfo.address}</p>
                            <p>{order.shippingInfo.city}, {order.shippingInfo.zipCode}</p>
                          </div>
                          <div className="sm:text-right flex flex-col justify-end">
                            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Courier Tracking Reference</p>
                            <p className="font-mono text-white/80 mt-1">{order.trackingNumber}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />

      {/* Style Animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
