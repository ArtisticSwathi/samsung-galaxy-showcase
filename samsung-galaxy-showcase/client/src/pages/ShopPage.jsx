import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import ChatbotWidget from '../components/ecommerce/ChatbotWidget'

export default function ShopPage() {
  // Video player controls
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

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
              <Link 
                to="/products"
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                EXPLORE THE RANGE
              </Link>
              <a 
                href="#reviews-section"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                TESTIMONIALS
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

      {/* ── 2. CUSTOMER REVIEWS SECTION ── */}
      <section id="reviews-section" className="py-24 max-w-7xl mx-auto px-6 bg-[#020204]">
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
              "The camera is an absolute game-changer. Night photography displays levels of detail I have never seen in a smartphone. Performance is outstanding."
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

      {/* Footer Branding Banner */}
      <section className="py-16 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
            SAMSUNG GALAXY ECOSYSTEM
          </p>
          <p className="text-xs text-white/30 font-light">
            © 2026 Samsung Electronics Co., Ltd. All specifications and descriptions provided herein may be different from the actual specifications and descriptions for the product.
          </p>
        </div>
      </section>

      <ChatbotWidget />

    </div>
  )
}
