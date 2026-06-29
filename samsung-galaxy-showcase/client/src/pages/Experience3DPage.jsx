import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import WelcomeScreen from '../components/experience3d/WelcomeScreen'
import FloatingBackground from '../components/experience3d/FloatingBackground'
import ProductShowroom from '../components/experience3d/ProductShowroom'

export default function Experience3DPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const autoLogin = searchParams.get('login') === 'true'

  const [isLoaded, setIsLoaded] = useState(autoLogin)
  const [view, setView] = useState(autoLogin ? 'showroom' : 'welcome') // 'welcome' | 'guided-intro' | 'showroom'
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(!autoLogin)
  const [show2DBackground, setShow2DBackground] = useState(!autoLogin)

  const handleStartExperience = () => {
    setView('guided-intro')
    setShowWelcomeOverlay(false)
    setShow2DBackground(false)
  }

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden selection:bg-cyan-500 selection:text-slate-950 bg-[#020204]">
      {/* 1. 2D Starfield Background */}
      {show2DBackground && (
        <div 
          className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-[1000ms] ease-in-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${
            view !== 'welcome' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <FloatingBackground />
        </div>
      )}

      {/* 2. 3D Product Showroom Canvas */}
      {isLoaded && (
        <div 
          className={`absolute inset-0 w-full h-full z-10 ${
            view !== 'welcome' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ProductShowroom 
            view={view} 
            onIntroComplete={() => setView('showroom')} 
          />
        </div>
      )}

      {/* 3. Brand Welcome Screen Overlay */}
      {showWelcomeOverlay && (
        <WelcomeScreen 
          onLoadComplete={() => setIsLoaded(true)} 
          onStartExperience={handleStartExperience}
        />
      )}
    </div>
  )
}
