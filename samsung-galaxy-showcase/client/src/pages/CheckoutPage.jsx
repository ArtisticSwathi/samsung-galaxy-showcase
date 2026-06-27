import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import CheckoutForm from '../components/ecommerce/CheckoutForm'

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items)
  
  // Calculate cart pricing breakdown
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 0 // Complimentary
  const estimatedTax = subtotal * 0.08 // 8% sales tax
  const total = subtotal + estimatedTax

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
            Please fill in your delivery and billing credentials below. Your transaction is protected with military-grade encryption.
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
            
            {/* Left side: Checkout Form */}
            <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
              <CheckoutForm />
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
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-white/5" />

                {/* Subtotals & Pricing Details */}
                <div className="space-y-3.5 text-xs font-light text-white/60 tracking-wide">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complimentary Delivery</span>
                    <span className="text-cyan-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
                  </div>
                  
                  <hr className="border-white/5" />
                  
                  <div className="flex justify-between text-sm font-bold text-white tracking-normal pt-2">
                    <span className="uppercase text-xs tracking-wider">TOTAL VALUE</span>
                    <span className="font-mono text-cyan-400 text-base">${total.toFixed(2)}</span>
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
