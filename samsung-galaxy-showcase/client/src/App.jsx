import { useState } from 'react'
import WelcomeScreen from './components/experience3d/WelcomeScreen'
import FloatingBackground from './components/experience3d/FloatingBackground'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Galaxy Background (fades in smoothly over 1.5s when loading completes) */}
      <div className={`transition-opacity duration-[1500ms] ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <FloatingBackground />
      </div>

      {/* Brand Welcome Screen Overlay */}
      <WelcomeScreen onLoadComplete={() => setIsLoaded(true)} />
    </div>
  )
}

export default App
