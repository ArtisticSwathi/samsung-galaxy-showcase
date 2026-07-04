import Navbar from '../components/common/Navbar'
import ExploreTheRange from '../components/ecommerce/ExploreTheRange'
import ChatbotWidget from '../components/ecommerce/ChatbotWidget'

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden">
      
      {/* Navbar Header Overlay */}
      <Navbar />

      {/* Header Promo Banner */}
      <div className="relative pt-36 pb-12 w-full bg-gradient-to-b from-cyan-950/20 via-[#020204] to-[#020204]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <span className="text-cyan-400 font-mono text-[10px] tracking-[0.4em] uppercase font-semibold">
            THE CATALOGUE
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase leading-none">
            GALAXY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">SERIES</span>
          </h1>
          <p className="text-xs md:text-sm text-white/50 font-light max-w-xl mx-auto leading-relaxed">
            Discover the next generation of mobile computing. Built with aerospace-grade materials, pro-grade camera clusters, and groundbreaking folding glass.
          </p>
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <ExploreTheRange />
      </div>

      <ChatbotWidget />

    </div>
  )
}
