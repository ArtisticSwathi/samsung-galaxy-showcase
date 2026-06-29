import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from '../components/common/Navbar'
import { addToCart, openCart } from '../store/cartSlice'
import ChatbotWidget from '../components/ecommerce/ChatbotWidget'

export default function ShopPage() {
  const dispatch = useDispatch()
  const product = useSelector((state) => state.products.products[0])

  // Configurator states
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedStorage, setSelectedStorage] = useState(product.storages[0])
  
  // Video player controls
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // Calculate final price based on selected storage
  const totalPrice = product.basePrice + selectedStorage.priceModifier

  // Handle browser autoplay restrictions on mount
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.log("Autoplay was blocked by browser. User interaction required:", error)
          setIsPlaying(false) // Show play icon so user can manually play it
        }
      }
    }
    playVideo()
  }, [])

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle adding product to cart
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: totalPrice,
        color: selectedColor.name,
        storage: selectedStorage.size,
        image: '/textures/samsung_s23_hero.png',
      })
    )
    dispatch(openCart())
  }

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* ── Navbar Header Overlay ── */}
      <Navbar />

      {/* ── 1. CINEMATIC HERO SECTION ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Fullscreen Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover scale-[1.01]"
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
          >
            <source src="/videos/Samsung-video-ad.mp4" type="video/mp4" />
          </video>
          {/* Luxurious overlays to ensure readability and cinematic tone */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020204]/90 via-[#020204]/50 to-[#020204]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full h-full flex flex-col justify-center pt-24">
          <div className="max-w-2xl space-y-6">
            <span className="text-cyan-400 font-mono text-[10px] tracking-[0.4em] uppercase font-semibold">
              WELCOME TO GALAXY
            </span>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1] uppercase">
              THE NEW ERA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                OF MOBILE
              </span>
            </h1>
            <p className="text-sm md:text-base text-white/70 font-light leading-relaxed max-w-lg">
              Discover the ultimate ecosystem of innovation. From revolutionary foldable displays to pro-grade cameras and seamless connectivity, experience the pinnacle of sustainable technology designed for the future.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#configurator-section"
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                EXPLORE THE RANGE
              </a>
              <a 
                href="#specs-section"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                FIND YOUR GALAXY
              </a>
            </div>
          </div>
        </div>

        {/* Play/Pause Video Controller (Bottom-Left) */}
        <div className="absolute bottom-10 left-10 z-20 flex items-center gap-3">
          <button 
            onClick={toggleVideoPlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 hover:border-cyan-400/50 text-white hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer backdrop-blur-md"
            aria-label={isPlaying ? "Pause background video" : "Play background video"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </section>

      {/* ── 2. PRODUCT GALLERY & CONFIGURATOR SECTION ── */}
      <section id="configurator-section" className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Luxurious Image Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-square w-full bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 rounded-3xl p-12 overflow-hidden flex items-center justify-center group shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_70%)]" />
            <img 
              src="/textures/samsung_s23_hero.png" 
              alt={product.name} 
              className="w-full h-full object-contain max-h-[460px] transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Floating Spec tag */}
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono tracking-wider text-cyan-400">
              EXPLORE IN 3D AT HOME PAGE
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-6">
            <div className="aspect-video bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-center hover:border-cyan-400/30 transition-all duration-300">
              <img src="/textures/samsung_s23_hero.png" alt="Angle 1" className="h-16 object-contain" />
            </div>
            <div className="aspect-video bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-center hover:border-cyan-400/30 transition-all duration-300">
              <img src="/textures/samsung_s23_camera.png" alt="Angle 2" className="h-16 object-contain" />
            </div>
            <div className="aspect-video bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-center hover:border-cyan-400/30 transition-all duration-300">
              <img src="/textures/samsung_screen.png" alt="Angle 3" className="h-16 object-contain" />
            </div>
          </div>
        </div>

        {/* Right Side: Configurator Controls */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-4">
            <span className="text-cyan-400 font-mono text-[10px] tracking-[0.3em] uppercase">CUSTOMIZE YOUR DEVICE</span>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">{product.name}</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                ${totalPrice.toFixed(2)}
              </span>
              <span className="text-xs text-white/40 line-through font-mono">
                ${(totalPrice + 150).toFixed(2)}
              </span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Color Selector */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-white/60 uppercase font-light">SELECT COLOR</span>
              <span className="font-semibold text-white">{selectedColor.name}</span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full p-0.5 border cursor-pointer hover:scale-105 transition-all duration-200 ${
                    selectedColor.name === color.name ? 'border-cyan-400' : 'border-white/10'
                  }`}
                  aria-label={`Select color ${color.name}`}
                >
                  <div 
                    className="w-full h-full rounded-full" 
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Storage Selector */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-white/60 uppercase font-light">SELECT STORAGE</span>
              <span className="font-semibold text-cyan-400">
                {selectedStorage.priceModifier > 0 ? `+$${selectedStorage.priceModifier}` : 'Standard'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.storages.map((storage) => (
                <button
                  key={storage.size}
                  onClick={() => setSelectedStorage(storage)}
                  className={`px-4 py-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                    selectedStorage.size === storage.size 
                      ? 'border-cyan-500 bg-cyan-950/20 text-white font-bold' 
                      : 'border-white/10 bg-white/[0.01] text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <p className="text-xs tracking-wider">{storage.size}</p>
                  <p className="text-[9px] font-mono text-cyan-400/60 mt-1 uppercase">
                    {storage.priceModifier > 0 ? `+$${storage.priceModifier}` : 'BASE'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Buy Action CTAs */}
          <div className="pt-6 space-y-4">
            <button 
              onClick={handleAddToCart}
              className="w-full py-4.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              ADD TO BAG
            </button>
            <p className="text-[10px] text-center text-white/40 tracking-wider font-light">
              🚀 Free shipping. 30-day money-back guarantee. Samsung Official warranty.
            </p>
          </div>

        </div>
      </section>

      {/* ── 3. SPECIFICATIONS / DETAIL FEATURE GRID ── */}
      <section id="specs-section" className="py-24 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4 mb-16">
            <span className="text-cyan-400 font-mono text-[10px] tracking-[0.3em] uppercase">ULTIMATE SPECS</span>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">ENGINEERED FOR EXCELLENCE</h2>
            <p className="text-white/60 font-light max-w-xl text-sm leading-relaxed">
              Every detail is calibrated to perfection. Explore the professional-grade technology engineered into the body of the Galaxy S23 Ultra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Spec Card 1 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316A2.192 2.192 0 0 0 14.502 4h-5c-.7 0-1.363.396-1.706 1.017l-.82 1.317Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">200MP Nightography</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.camera}</p>
            </div>

            {/* Spec Card 2 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m10.5-5.25v1.5M3 12h1.5m10.5-3.75H13.5m-3 0h.008v.008H10.5V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM10.5 11.25h.008v.008H10.5v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3-3h.008v.008H7.875V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3 3h.008v.008H4.875v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm12.75 3v1.5m-15 0v1.5m3.75 3.75V21m10.5-5.25V21m.75-9H21m-2.25 3.75H21M3 16.5h1.5m10.5-3.75H13.5m-3 0h.008v.008H10.5v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm.375 3.75h.008v.008H11.25v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3 0h.008v.008H8.25v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3 0h.008v.008H5.25v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">Snapdragon 8 Gen 2</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.processor}</p>
            </div>

            {/* Spec Card 3 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">Dynamic AMOLED 2X</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.display}</p>
            </div>

            {/* Spec Card 4 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">5000 mAh Battery</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.battery}</p>
            </div>

            {/* Spec Card 5 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">Integrated S Pen</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.spen}</p>
            </div>

            {/* Spec Card 6 */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-cyan-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-wide uppercase">Armor & Security</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{product.specs.material}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. CUSTOMER REVIEWS SECTION ── */}
      <section id="reviews-section" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-cyan-400 font-mono text-[10px] tracking-[0.3em] uppercase">VERIFIED RATINGS</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">EXPERIENCED BY CRITICS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Review Card 1 */}
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-4">
            <div className="flex gap-1 text-cyan-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <p className="text-xs text-white/70 italic leading-relaxed font-light">
              "The 200MP camera is an absolute game-changer. Night photography displays levels of detail I have never seen in a smartphone. S-Pen latency is imperceptible."
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">David K.</span>
              <span className="text-[9px] font-mono text-white/40">Verified Buyer</span>
            </div>
          </div>

          {/* Review Card 2 */}
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-4">
            <div className="flex gap-1 text-cyan-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <p className="text-xs text-white/70 italic leading-relaxed font-light">
              "Unrivaled processing speeds. Playing graphically intensive 3D games for hours with near-zero stuttering. The dynamic screen adjusting makes media beautiful outdoors."
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Marcus T.</span>
              <span className="text-[9px] font-mono text-white/40">Tech Reviewer</span>
            </div>
          </div>

          {/* Review Card 3 */}
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-4">
            <div className="flex gap-1 text-cyan-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <p className="text-xs text-white/70 italic leading-relaxed font-light">
              "Premium luxury feel in the hand. The armor aluminum gives it substantial durability. Battery life gets me through 2 days of moderate workspace workflows easily."
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Sophia L.</span>
              <span className="text-[9px] font-mono text-white/40">Verified Buyer</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. BRAND TRUST INDICATORS ── */}
      <section className="py-16 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">COMPLIMENTARY SHIPPING</h4>
            <p className="text-[10px] text-white/50 leading-relaxed font-light">Enjoy free premium express shipping and delivery on all luxury device orders.</p>
          </div>
          <div className="space-y-3 border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0 md:px-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">2-YEAR BRAND WARRANTY</h4>
            <p className="text-[10px] text-white/50 leading-relaxed font-light">Rest assured with an extensive official brand warranty covering hardware failures.</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">24/7 ELITE ASSISTANCE</h4>
            <p className="text-[10px] text-white/50 leading-relaxed font-light">Our specialized luxury service representatives are standing by around the clock.</p>
          </div>
        </div>
      </section>

      {/* Floating luxury chatbot widget only on ShopPage */}
      <ChatbotWidget />

    </div>
  )
}
