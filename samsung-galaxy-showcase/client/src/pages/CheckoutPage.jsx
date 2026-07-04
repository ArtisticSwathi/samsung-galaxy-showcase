import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import CheckoutForm from '../components/ecommerce/CheckoutForm'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Initialize Stripe publishable key outside of render
const stripePromise = loadStripe('pk_test_51TpPz2H2wNT6iXxFgwua4mPayT8QvNx2z8WY9rlYud1ZwQARnb9Jc2LrSwXbGcySLK8e2PhN44AUqhMOcxujHsh400vOZ7KjXU')

// appearance configurations matching the dark/neon accent styling of the MERN showcase app
const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#22d3ee', // Neon Cyan
    colorBackground: '#020204', // Dark mode background
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    fontFamily: 'Outfit, Inter, sans-serif',
    borderRadius: '16px',
    spacingGridRow: '20px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      color: '#ffffff',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      fontSize: '12px',
      padding: '14px 16px',
    },
    '.Input:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '.Input:focus': {
      borderColor: '#22d3ee',
      boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.2)',
    },
    '.Label': {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '6px',
      fontWeight: '500',
    }
  }
}

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items)
  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState(null)
  
  // Calculate cart pricing breakdown
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const estimatedTax = subtotal * 0.08 // 8% sales tax
  const total = subtotal + estimatedTax

  useEffect(() => {
    if (cartItems.length === 0) return

    const getPaymentIntent = async () => {
      setLoadingIntent(true)
      setIntentError(null)
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${API_URL}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: cartItems }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize secure transaction')
        }
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error("Secure Checkout error:", err)
        setIntentError(err.message)
      } finally {
        setLoadingIntent(false)
      }
    }

    getPaymentIntent()
  }, [cartItems])

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden">
      
      {/* Header navbar */}
      <Navbar />

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-24">
        
        {/* Breadcrumb / Slogan */}
        <div className="space-y-4 mb-16">
          <div className="flex gap-2 text-[10px] font-mono tracking-widest text-white/40 uppercase">
            <Link to="/" className="hover:text-white transition-colors">Showroom</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-cyan-400">Checkout</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">SECURE TRANSACTION</h1>
          <p className="text-white/60 font-light text-sm max-w-md">
            Please fill in your delivery and payment credentials below. Your transaction is protected with military-grade encryption.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white/[0.01] border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
            <svg 
              className="w-16 h-16 text-white/20 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p className="text-white/50 font-light text-sm tracking-wide">
              Your shopping bag is empty. You must add items to your cart before checking out.
            </p>
            <Link 
              to="/shop" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all"
            >
              Back to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left side: Checkout Form wrapped in Elements */}
            <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
              {loadingIntent ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono">Initializing Secure Gateway...</p>
                </div>
              ) : intentError ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-white">Payment Gateway Error</h3>
                  <p className="text-white/50 font-light text-xs tracking-wide max-w-sm mx-auto leading-relaxed">
                    {intentError}. Please verify that the local backend server is running and connected to MongoDB.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm />
                </Elements>
              ) : null}
            </div>

            {/* Right side: Order Summary */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">ORDER SUMMARY</h2>
                
                {/* Cart Items List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20">
                  {cartItems.map((item, idx) => (
                    <div 
                      key={`${item.id}-${item.color}-${item.storage}-${idx}`}
                      className="flex items-center gap-4 py-3 border-b border-white/5 last:border-b-0"
                    >
                      <div className="w-14 h-14 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image || "/textures/samsung_screen.png"} 
                          alt={item.name} 
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                        <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider">
                          Qty: {item.quantity} • {item.color} • {item.storage}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-cyan-400 font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-white/5" />

                {/* Subtotals & Pricing Details */}
                <div className="space-y-3.5 text-xs font-light text-white/60 tracking-wide">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complimentary Delivery</span>
                    <span className="text-cyan-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-mono text-white">₹{estimatedTax.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <hr className="border-white/5" />
                  
                  <div className="flex justify-between text-sm font-bold text-white tracking-normal pt-2">
                    <span className="uppercase text-xs tracking-wider">TOTAL VALUE</span>
                    <span className="font-mono text-cyan-400 text-base">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Elite Security Guard</h4>
                  <p className="text-[10px] text-white/50 font-light mt-0.5 leading-relaxed">
                    Transactions are audited, tokenized, and encrypted. Your personal data is never shared.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
