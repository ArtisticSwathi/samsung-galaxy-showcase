import { useState } from 'react'
import WelcomeScreen from './components/experience3d/WelcomeScreen'
import FloatingBackground from './components/experience3d/FloatingBackground'
import ProductShowroom from './components/experience3d/ProductShowroom'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [view, setView] = useState('welcome') // 'welcome' | 'guided-intro' | 'showroom'
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true)
  const [show2DBackground, setShow2DBackground] = useState(true)

  const handleStartExperience = () => {
    setView('guided-intro')
    // Keep overlay and 2D background mounted for 1000ms to let CSS transitions complete
    setTimeout(() => {
      setShowWelcomeOverlay(false)
      setShow2DBackground(false)
    }, 1000)
  }

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden selection:bg-cyan-500 selection:text-slate-950 bg-[#020204]">
      {/* 1. 2D Starfield Background (Responds to mouse coordinates for parallax hover drift) */}
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

      {/* 2. 3D Product Showroom Canvas (Fades in when view changes from 'welcome') */}
      {isLoaded && (
        <div 
          className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-[300ms] ease-in-out ${
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

export default App
