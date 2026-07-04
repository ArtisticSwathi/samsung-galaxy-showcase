import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'

export default function OrderConfirmationPage() {
  const currentOrder = useSelector((state) => state.orders.currentOrder)

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden">
      
      {/* Transparent Navbar overlay */}
      <Navbar />

      {/* Main container */}
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        
        {!currentOrder ? (
          <div className="py-24 text-center space-y-6 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
            <svg 
              className="w-16 h-16 text-white/20 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <h1 className="text-xl font-bold uppercase tracking-wider">Order Not Found</h1>
            <p className="text-white/50 font-light text-xs tracking-wide">
              No recent order transaction was found in this session.
            </p>
            <Link 
              to="/shop" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all"
            >
              Back to Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Cinematic Thank you card */}
            <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_65%)]" />
              
              {/* Glowing Icon */}
              <div className="w-16 h-16 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/10">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <div className="space-y-2 relative z-10">
                <span className="text-cyan-400 font-mono text-[9px] tracking-[0.4em] uppercase font-semibold">TRANSACTION SUCCESSFUL</span>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">THANK YOU FOR YOUR PURCHASE</h1>
                <p className="text-white/60 font-light text-xs max-w-md mx-auto leading-relaxed mt-2">
                  Your luxury device is being prepared. We have sent a purchase confirmation receipt and shipment updates to <span className="text-white font-medium">{currentOrder.shippingInfo.email}</span>.
                </p>
              </div>
            </div>

            {/* Receipt details */}
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl space-y-8">
              <div className="flex flex-wrap justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Order Number</span>
                  <p className="text-sm font-mono font-bold text-white tracking-wide">{currentOrder.orderId}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Estimated Delivery</span>
                  <p className="text-sm font-bold text-cyan-400">2-3 Business Days</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Tracking Reference</span>
                  <p className="text-xs font-mono text-white/60">{currentOrder.trackingNumber}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Itemized Summary</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="font-light text-white/70">
                        {item.name} <span className="text-white/40 text-[10px] uppercase font-mono">({item.color} • {item.storage} • x{item.quantity})</span>
                      </div>
                      <span className="font-mono text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Address / Billing details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-light text-white/60">
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase tracking-wider">Shipping Address</h4>
                  <p>{currentOrder.shippingInfo.name}</p>
                  <p>{currentOrder.shippingInfo.address}</p>
                  <p>{currentOrder.shippingInfo.city}, {currentOrder.shippingInfo.zipCode}</p>
                </div>
                
                <div className="space-y-2.5 text-right font-light">
                  <h4 className="font-bold text-white uppercase tracking-wider text-right">Payment Summary</h4>
                  <div className="flex justify-between md:justify-end gap-6">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">₹{currentOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between md:justify-end gap-6">
                    <span>Complimentary Express Shipping</span>
                    <span className="text-cyan-400 font-medium font-mono">₹0</span>
                  </div>
                  <div className="flex justify-between md:justify-end gap-6">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-mono text-white">₹{currentOrder.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between md:justify-end gap-6 text-sm font-bold text-white tracking-normal pt-2 border-t border-white/5">
                    <span className="uppercase text-xs tracking-wider">TOTAL CHARGED</span>
                    <span className="font-mono text-cyan-400 text-sm">₹{currentOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                Return to Showroom
              </Link>
              <Link 
                to="/shop" 
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 text-center"
              >
                Store Home
              </Link>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
