import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addToCart, openCart } from '../../store/cartSlice'

function StarRating({ rating = 5 }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  
  return (
    <div className="flex items-center gap-1 text-cyan-400">
      {Array.from({ length: 5 }).map((_, index) => {
        if (index < fullStars) {
          return (
            <svg key={index} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          )
        } else if (index === fullStars && hasHalfStar) {
          return (
            <svg key={index} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
            </svg>
          )
        } else {
          return (
            <svg key={index} className="w-4 h-4 text-white/10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.426.837-.426.988 0l3.003 8.525a.37 0 0 0 .33.242l9.011.605c.465.031.653.61.288.903l-6.847 5.929a.36.36 0 0 0-.113.348l2.032 8.742c.11.472-.416.853-.807.575l-7.79-5.55a.36.36 0 0 0-.411 0l-7.79 5.55c-.39.278-.917-.103-.807-.575l2.032-8.742a.36.36 0 0 0-.113-.348L.38 14.772c-.365-.293-.177-.872.288-.903l9.011-.605a.37.37 0 0 0 .33-.242l3.003-8.525z" />
            </svg>
          )
        }
      })}
    </div>
  )
}

function ProductCard({ product, index }) {
  const dispatch = useDispatch()
  const cardRef = useRef(null)
  
  // Track selected configurations - selectedVariant defaults to the first available variant color
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [selectedStorage, setSelectedStorage] = useState(product.storages?.[0] || null)
  const [isAdding, setIsAdding] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Scroll reveal animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const totalPrice = product.price + (selectedStorage?.priceModifier || 0)
  const isImageLeft = index % 2 === 0

  const handleAddClick = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      await dispatch(
        addToCart({
          id: product._id,
          name: product.name,
          price: totalPrice,
          color: selectedVariant?.colorName || 'Default',
          storage: selectedStorage?.size || 'Standard',
          image: selectedVariant?.imageUrl || '/textures/samsung_s23_hero.png',
          quantity: 1,
        })
      ).unwrap()
      dispatch(openCart())
    } catch (err) {
      console.error(err)
    } finally {
      setIsAdding(false)
    }
  }

  // Display the real photograph stored in selectedVariant.imageUrl
  const displayImage = selectedVariant?.imageUrl || "/textures/samsung_s23_hero.png"

  return (
    <div 
      ref={cardRef}
      className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center py-20 border-b border-white/5 last:border-0 transition-all duration-[1200ms] ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      {/* ── Product Image Container ── */}
      <div className={`lg:col-span-6 w-full ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="relative aspect-square w-full bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-12 overflow-hidden flex items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_65%)]" />
          
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-contain max-h-[460px] transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-mono tracking-widest text-cyan-400 uppercase">
            NEW ARRIVAL
          </div>
        </div>
      </div>

      {/* ── Product Details Column (using inline-block as layout preference) ── */}
      <div className={`lg:col-span-6 space-y-8 inline-block w-full text-left ${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
        
        {/* Title and Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono text-[9px] tracking-[0.3em] uppercase">Newly Launched</span>
            {product.rating && <StarRating rating={product.rating} />}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-none">
            {product.name}
            {/* Dynamically inject selected color variant name in details heading */}
            <span className="text-xs md:text-sm font-mono tracking-widest text-cyan-400 font-light block mt-2.5 uppercase">
              Selected Color: {selectedVariant?.colorName || 'Default'}
            </span>
          </h2>
          <p className="text-sm text-white/60 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price display */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl md:text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            ${totalPrice.toFixed(2)}
          </span>
          {selectedStorage && selectedStorage.priceModifier > 0 && (
            <span className="text-xs text-white/40 line-through font-mono">
              ${(product.price + 150).toFixed(2)}
            </span>
          )}
        </div>

        {/* Configurable Attributes (Color selection renders ONLY if variants.length > 1) */}
        <div className="space-y-6 pt-4 border-t border-white/5">
          {/* COLOR SELECTION UI (sleek circular swatches mapped from variants list) */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs tracking-wider font-mono">
                <span className="text-white/40 uppercase">Color Selection</span>
                <span className="text-white font-semibold">{selectedVariant?.colorName}</span>
              </div>
              <div className="flex gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.colorName}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-9 h-9 rounded-full p-0.5 border cursor-pointer hover:scale-105 transition-all duration-200 ${
                      selectedVariant?.colorName === variant.colorName ? 'border-cyan-400' : 'border-white/10'
                    }`}
                    aria-label={`Select color ${variant.colorName}`}
                  >
                    <div 
                      className="w-full h-full rounded-full" 
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage Capacity Selector */}
          {product.storages && product.storages.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs tracking-wider font-mono">
                <span className="text-white/40 uppercase">Storage Capacity</span>
                <span className="text-cyan-400 font-semibold">
                  {selectedStorage?.priceModifier > 0 ? `+$${selectedStorage.priceModifier}` : 'Base Spec'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {product.storages.map((storage) => (
                  <button
                    key={storage.size}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-3 py-3.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                      selectedStorage?.size === storage.size 
                        ? 'border-cyan-500 bg-cyan-950/20 text-white font-bold' 
                        : 'border-white/10 bg-white/[0.01] text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs tracking-wider">{storage.size}</p>
                    <p className="text-[8px] font-mono text-cyan-400/50 mt-0.5 uppercase">
                      {storage.priceModifier > 0 ? `+$${storage.priceModifier}` : 'Standard'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specifications Block */}
        {product.specs && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/40">Technical Specifications</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] font-light text-white/70 font-sans">
              {product.specs.display && (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">Display</span>
                  <span className="line-clamp-1">{product.specs.display}</span>
                </div>
              )}
              {product.specs.processor && (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">Processor</span>
                  <span className="line-clamp-1">{product.specs.processor}</span>
                </div>
              )}
              {product.specs.camera && (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">Camera Specs</span>
                  <span className="line-clamp-1">{product.specs.camera}</span>
                </div>
              )}
              {product.specs.battery && (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">Battery & Power</span>
                  <span className="line-clamp-1">{product.specs.battery}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Purchase Action CTA */}
        <div className="pt-4">
          <button 
            onClick={handleAddClick}
            disabled={isAdding}
            className="w-full py-4.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-white/30 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}
            {isAdding ? 'ADDING TO BAG...' : 'ADD TO BAG'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function ExploreTheRange() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const fetchNewlyLaunched = async () => {
      try {
        const response = await fetch(`${API_URL}/products/newly-launched`)
        if (!response.ok) {
          throw new Error('Failed to fetch premium devices.')
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNewlyLaunched()
  }, [API_URL])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-mono">Exploring premium showcase...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-mono">Unable to load catalog</p>
        <p className="text-xs text-white/40 font-light">{error}</p>
      </div>
    )
  }

  return (
    <section className="space-y-8 max-w-7xl mx-auto px-6">
      {products.map((product, index) => (
        <ProductCard 
          key={product._id} 
          product={product} 
          index={index} 
        />
      ))}
    </section>
  )
}
