import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../store/orderSlice'
import { clearCart } from '../../store/cartSlice'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

export default function CheckoutForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items)
  
  const stripe = useStripe()
  const elements = useElements()

  // Calculate cart pricing
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const estimatedTax = subtotal * 0.08 // 8% tax
  const total = subtotal + estimatedTax

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    const tempErrors = {}
    if (!formData.firstName) tempErrors.firstName = 'First name is required'
    if (!formData.lastName) tempErrors.lastName = 'Last name is required'
    if (!formData.email) {
      tempErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address'
    }
    if (!formData.address) tempErrors.address = 'Street address is required'
    if (!formData.city) tempErrors.city = 'City is required'
    if (!formData.zipCode) tempErrors.zipCode = 'ZIP / Postal Code is required'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Pre-validate shipping fields
    if (!validateForm()) return

    // 2. Ensure Stripe elements are ready
    if (!stripe || !elements) {
      setErrors({ payment: 'Stripe payment gateway has not loaded. Please wait.' })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // 3. Confirm Stripe payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.city,
                postal_code: formData.zipCode,
                country: 'IN' // Defaults to India checkout
              }
            }
          }
        },
        redirect: 'if_required' // Prevent hard reload in Test Mode to preserve Redux State
      })

      if (result.error) {
        // Handle Stripe payment errors (e.g., card declined, invalid details)
        setErrors({ payment: result.error.message })
        setIsSubmitting(false)
      } else {
        // Payment succeeded! Update local state and navigate
        const orderId = 'SG-' + Math.floor(100000 + Math.random() * 900000)
        const trackingNumber = 'TRK' + Math.floor(100000000 + Math.random() * 900000000) + 'IN'
        
        dispatch(
          createOrder({
            orderId,
            trackingNumber,
            date: new Date().toISOString(),
            items: cartItems,
            subtotal,
            tax: estimatedTax,
            total,
            shippingInfo: {
              name: `${formData.firstName} ${formData.lastName}`,
              address: formData.address,
              city: formData.city,
              zipCode: formData.zipCode,
              email: formData.email,
            },
          })
        )

        dispatch(clearCart())
        setIsSubmitting(false)
        navigate('/order-confirmation')
      }
    } catch (err) {
      console.error("Stripe confirmPayment exception:", err)
      setErrors({ payment: 'An unexpected checkout error occurred. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-white font-sans">
      
      {/* ── Shipping Details Group ── */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">01. DELIVERY INFORMATION</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
                errors.firstName ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
              }`}
            />
            {errors.firstName && <span className="text-[10px] text-red-400 mt-1">{errors.firstName}</span>}
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
                errors.lastName ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
              }`}
            />
            {errors.lastName && <span className="text-[10px] text-red-400 mt-1">{errors.lastName}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
                errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
              }`}
            />
            {errors.email && <span className="text-[10px] text-red-400 mt-1">{errors.email}</span>}
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-cyan-500/50 rounded-2xl text-xs focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">Street Address</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
              errors.address ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
            }`}
          />
          {errors.address && <span className="text-[10px] text-red-400 mt-1">{errors.address}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">City</label>
            <input 
              type="text" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
                errors.city ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
              }`}
            />
            {errors.city && <span className="text-[10px] text-red-400 mt-1">{errors.city}</span>}
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-2 font-medium">ZIP / Postal Code</label>
            <input 
              type="text" 
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 bg-white/[0.02] border rounded-2xl text-xs focus:outline-none transition-colors ${
                errors.zipCode ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-cyan-500/50'
              }`}
            />
            {errors.zipCode && <span className="text-[10px] text-red-400 mt-1">{errors.zipCode}</span>}
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      {/* ── Stripe Element Payment Group ── */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">02. SECURE PAYMENT GATEWAY</h3>
        
        <div className="space-y-4">
          <PaymentElement />
          
          {errors.payment && (
            <span className="text-xs text-red-400 mt-2 block font-medium">
              ⚠️ {errors.payment}
            </span>
          )}
        </div>
      </div>

      {/* Submit Order button */}
      <div className="pt-6">
        <button 
          type="submit"
          disabled={isSubmitting || !stripe || !elements || cartItems.length === 0}
          className="w-full py-4.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 text-black font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
              AUTHORIZING SECURE TRANSACTION...
            </span>
          ) : (
            `COMPLETE PURCHASE - ₹${total.toLocaleString('en-IN')}`
          )}
        </button>
        <p className="text-[10px] text-center text-white/40 tracking-wider font-light mt-3">
          🔒 Secure 256-bit SSL encrypted connection.
        </p>
      </div>

    </form>
  )
}
