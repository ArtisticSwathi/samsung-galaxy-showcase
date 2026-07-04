import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeCart, removeFromCart, updateQuantity } from '../../store/cartSlice'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, isOpen } = useSelector((state) => state.cart)

  // Calculate cart subtotal
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleCheckoutClick = () => {
    dispatch(closeCart())
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1100] overflow-hidden font-sans">
      {/* Background Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => dispatch(closeCart())}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel Container */}
        <div className="w-screen max-w-md bg-[#08080d]/80 border-l border-white/10 backdrop-blur-2xl flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">YOUR SHOPPING BAG</h2>
            <button 
              onClick={() => dispatch(closeCart())}
              className="text-white/60 hover:text-white p-1 cursor-pointer transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-500/20">
            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <svg 
                  className="w-12 h-12 text-white/20" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={1}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                <p className="text-white/40 font-light text-xs tracking-wider">Your bag is empty.</p>
                <button 
                  onClick={() => dispatch(closeCart())}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] uppercase font-mono tracking-wider text-white transition-all cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={`${item.id}-${item.color}-${item.storage}-${index}`}
                  className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    <img 
                      src={item.image || "/textures/samsung_screen.png"} 
                      alt={item.name} 
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-white truncate tracking-wide">{item.name}</h3>
                    <p className="text-[10px] text-white/50 mt-0.5 tracking-wider">
                      {item.color} / {item.storage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-white/10 rounded-full px-2 py-0.5 bg-black/20">
                        <button 
                          onClick={() => dispatch(updateQuantity({ id: item.id, color: item.color, storage: item.storage, quantity: item.quantity - 1 }))}
                          className="text-white/60 hover:text-white text-xs px-1.5 cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span className="text-[11px] px-2 font-semibold text-white">{item.quantity}</span>
                        <button 
                          onClick={() => dispatch(updateQuantity({ id: item.id, color: item.color, storage: item.storage, quantity: item.quantity + 1 }))}
                          className="text-white/60 hover:text-white text-xs px-1.5 cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Subtotal Price */}
                      <span className="text-xs font-semibold text-cyan-400 font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Item */}
                  <button 
                    onClick={() => dispatch(removeFromCart({ id: item.id, color: item.color, storage: item.storage }))}
                    className="text-white/30 hover:text-red-400 p-1 cursor-pointer transition-colors duration-200 self-start"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="px-6 py-8 border-t border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center justify-between text-xs tracking-wide">
                <span className="text-white/60 font-light">Subtotal</span>
                <span className="text-sm font-bold text-white font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-white/40 font-light leading-relaxed">
                Shipping and taxes calculated at checkout. Enjoy free premium delivery on this luxury purchase.
              </p>
              
              <button 
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-wider rounded-2xl cursor-pointer transition-all duration-300 shadow-xl shadow-cyan-500/20 active:scale-[0.98]"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
