import { useState, useEffect } from 'react'

export default function WelcomeScreen({ onLoadComplete, onStartExperience }) {
  // Loading sequence states
  const [progress, setProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState("INITIATING CORE COMPILING...")
  const [isLoaderFading, setIsLoaderFading] = useState(false)
  const [isLoaderActive, setIsLoaderActive] = useState(true)

  // Fade-out transition state
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Word-by-word cinematic reveal states
  const [wordHeading1, setWordHeading1] = useState(false)
  const [wordHeading2, setWordHeading2] = useState(false)
  const [silverSweepActive, setSilverSweepActive] = useState(false)
  const [wordSlogan1, setWordSlogan1] = useState(false)
  const [wordSlogan2, setWordSlogan2] = useState(false)
  const [wordSlogan3, setWordSlogan3] = useState(false)
  const [wordSlogan4, setWordSlogan4] = useState(false)
  const [isIntroActive, setIsIntroActive] = useState(true)
  const [buttonVisible, setButtonVisible] = useState(false)

  // Deterministic 2-second Loading simulation (completes in exactly 2000ms)
  useEffect(() => {
    let timer;
    const duration = 2000; // 2 seconds
    const intervalTime = 20; // 20ms ticks
    const totalSteps = duration / intervalTime; // 100 steps
    let currentStep = 0;

    const updateProgress = () => {
      currentStep += 1;
      const nextProgress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      if (nextProgress < 25) {
        setLoadingStatus("LINKING 3D RENDERING MATRIX...")
      } else if (nextProgress < 50) {
        setLoadingStatus("GENERATING VECTOR SCHEMES...")
      } else if (nextProgress < 75) {
        setLoadingStatus("CONFIGURING MULTI-AUDIO NODES...")
      } else if (nextProgress < 100) {
        setLoadingStatus("CALIBRATING INTERACTIVE PARALLAX RIG...")
      } else {
        setLoadingStatus("SCHEMA READY")
      }

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        
        // 1. Immediately trigger background canvas reveal in App.jsx
        if (onLoadComplete) onLoadComplete();

        // 2. Fade out loader panel overlay
        setTimeout(() => setIsLoaderFading(true), 50);
        setTimeout(() => setIsLoaderActive(false), 250);

        // 3. Cinematic sequential reveal timelines
        // t=300ms: Heading ("Samsung Galaxy") slides up & fades in together
        setTimeout(() => {
          setWordHeading1(true);
          setWordHeading2(true);
        }, 300);
        
        // t=1500ms: Silver sweep animation starts immediately after heading finishes appearing (300ms + 1200ms transition)
        setTimeout(() => setSilverSweepActive(true), 1500);
        
        // t=2620ms: Slogan Word 1 ("Do") fades in (pure white) immediately after the shimmer animation completes (1500ms + 720ms delay + 400ms duration)
        setTimeout(() => setWordSlogan1(true), 2620);
        
        // t=2820ms: Slogan Word 2 ("What") fades in
        setTimeout(() => setWordSlogan2(true), 2820);
        
        // t=3020ms: Slogan Word 3 ("You") fades in
        setTimeout(() => setWordSlogan3(true), 3020);
        
        // t=3220ms: Slogan Word 4 ("Can't") fades in
        setTimeout(() => setWordSlogan4(true), 3220);
 
        // t=4020ms: CTA Button fades in at the bottom (maintaining the original 800ms pacing from the last slogan word)
        setTimeout(() => setButtonVisible(true), 4020);

        // t=4200ms: Reveal completed. Gradually decelerate the gold sweep and come to rest
        setTimeout(() => setIsIntroActive(false), 4200);
      }
    };

    timer = setInterval(updateProgress, intervalTime);
    return () => clearInterval(timer);
  }, [onLoadComplete]);

  // Global mousemove and custom CSS properties setup for parallax
  useEffect(() => {
    document.documentElement.style.setProperty('--mouse-x', '0');
    document.documentElement.style.setProperty('--mouse-y', '0');

    const handleMouseMoveGlobal = (e) => {
      if (isLoaderActive) return;
      
      const x = (e.clientX / window.innerWidth) * 2 - 1; // normalized X (-1 to 1)
      const y = -(e.clientY / window.innerHeight) * 2 + 1; // normalized Y (-1 to 1)
      
      // Update custom properties for GPU-driven parallax rotation
      
      // Update custom properties for GPU-driven parallax rotation
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
    };
  }, [isLoaderActive]);

  // Transition logic
  const handleStart = () => {
    setIsFadingOut(true);
    if (onStartExperience) {
      onStartExperience();
    }
  };

  // Handle global click to enter
  const handleContainerClick = () => {
    if (isLoaderActive || isFadingOut) return;
    handleStart();
  };

  // Button click handler
  const handleButtonClick = (e) => {
    e.stopPropagation(); // prevent root container click bubble
    if (isFadingOut) return;
    handleStart();
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`fixed inset-0 w-full h-full z-40 flex flex-col justify-center items-center text-white px-6 bg-transparent select-none overflow-hidden transition-all duration-[800ms] ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none -translate-y-6' : 'opacity-100'
      }`}
    >
      {/* Self-contained styling for Gold Metallic typography and animations */}
      <style>{`
        /* Premium brushed and polished chrome/silver metallic gradient text style - dull/matte look */
        .purple-text-stable {
          background: linear-gradient(
            135deg,
            #5a6578 0%,
            #bdc5d0 20%,
            #8e9ba8 40%,
            #e2e6ec 50%, /* soft highlight */
            #7a8698 65%,
            #aeb8c4 80%,
            #4e5868 100%
          );
          background-size: 100% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          will-change: text-shadow, filter, -webkit-text-fill-color;
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
          filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.08));
        }

        /* Premium brushed and polished chrome/silver metallic gradient character style - dull/matte look */
        .twinkle-letter {
          background: linear-gradient(
            135deg,
            #5a6578 0%,
            #bdc5d0 20%,
            #8e9ba8 40%,
            #e2e6ec 50%, /* soft highlight */
            #7a8698 65%,
            #aeb8c4 80%,
            #4e5868 100%
          );
          background-size: 100% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          will-change: text-shadow, filter, -webkit-text-fill-color;
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
          filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.08));
        }

        .twinkle-active {
          animation: smoothGlowWave 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes smoothGlowWave {
          0% {
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
            filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.08));
          }
          30%, 50% {
            /* Specular glassy reflection - sharp offset bevels, tight white refraction edge */
            -webkit-text-fill-color: #ffffff;
            text-shadow: 
              1px 1px 0px rgba(255, 255, 255, 0.95), 
              -1px -1px 0px rgba(0, 0, 0, 0.35),
              0 0 4px rgba(255, 255, 255, 0.9);
            filter: 
              drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.4)) 
              drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.3));
          }
          100% {
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
            filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.08));
          }
        }

        /* White Slogan text style */
        .slogan-word {
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
          display: inline-block;
          will-change: opacity, filter;
        }
      `}</style>

      {/* 1. INITIAL LOADING OVERLAY SCREEN (#0a0a0a) */}
      {isLoaderActive && (
        <div 
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-white transition-opacity duration-200 ${
            isLoaderFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Circular loader ring */}
          <div className="relative w-20 h-20 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                className="text-slate-900" 
                strokeWidth="2" 
                stroke="currentColor" 
                fill="transparent" 
                r="44" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-75" 
                strokeWidth="2.5" 
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                strokeLinecap="round"
                stroke="currentColor" 
                fill="transparent" 
                r="44" 
                cx="50" 
                cy="50" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-mono font-bold text-cyan-400">
                {progress}%
              </span>
            </div>
          </div>

          {/* Loader status logs */}
          <div className="text-center px-4 max-w-sm">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 mb-2">
              BUILDING DESIGN MATRIX
            </h2>
            <div className="h-4">
              <p className="text-[9px] font-mono text-cyan-500/80 uppercase tracking-wider animate-pulse">
                {loadingStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINIMAL CINEMATIC HERO CONTENT AREA */}
      <main className="flex flex-col items-center text-center max-w-4xl select-none pointer-events-none mb-10">
        {/* Main Heading (Samsung is stable purple; Galaxy has the silver shimmer sweep) */}
        <h1 className="text-5xl md:text-8xl font-extralight tracking-[0.25em] uppercase mb-8 flex justify-center gap-[0.4em] flex-wrap">
          <span 
            className={`inline-flex transition-all duration-[1200ms] ease-out ${
              wordHeading1 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
            }`}
          >
            {['S', 'a', 'm', 's', 'u', 'n', 'g'].map((char, index) => (
              <span
                key={index}
                className={`twinkle-letter ${
                  silverSweepActive ? 'twinkle-active' : ''
                }`}
                style={{
                  animationDelay: silverSweepActive ? `${index * 60}ms` : '0ms',
                }}
              >
                {char}
              </span>
            ))}
          </span>
          <span 
            className={`inline-flex transition-all duration-[1200ms] ease-out ${
              wordHeading2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
            }`}
          >
            {['G', 'a', 'l', 'a', 'x', 'y'].map((char, index) => (
              <span
                key={index}
                className={`twinkle-letter ${
                  silverSweepActive ? 'twinkle-active' : ''
                }`}
                style={{
                  animationDelay: silverSweepActive ? `${(index + 7) * 60}ms` : '0ms',
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
        
        {/* Slogan (Words fade & blur-reveal sequentially in pure white) */}
        <p className="text-xs md:text-sm font-mono tracking-[0.55em] uppercase pl-[0.55em] flex justify-center gap-[0.65em] flex-wrap">
          <span 
            className={`slogan-word transition-all duration-[1000ms] ease-out ${
              wordSlogan1 ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
            }`}
          >
            Do
          </span>
          <span 
            className={`slogan-word transition-all duration-[1000ms] ease-out ${
              wordSlogan2 ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
            }`}
          >
            What
          </span>
          <span 
            className={`slogan-word transition-all duration-[1000ms] ease-out ${
              wordSlogan3 ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
            }`}
          >
            You
          </span>
          <span 
            className={`slogan-word transition-all duration-[1000ms] ease-out ${
              wordSlogan4 ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
            }`}
          >
            Can't
          </span>
        </p>
      </main>

      {/* 3. CONTROLS (Sound interaction button) */}
      <footer 
        className={`flex flex-col items-center w-full z-10 transition-opacity duration-[1200ms] ease-out ${
          buttonVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button 
          onClick={handleButtonClick}
          className="px-10 py-4 border border-slate-700 text-slate-300 hover:border-cyan-400/85 hover:text-white bg-black/40 hover:bg-cyan-950/10 shadow-lg text-[10px] font-mono tracking-[0.3em] uppercase transition-all duration-300 pointer-events-auto cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          CLICK TO ENTER SHOWCASE
        </button>
      </footer>
    </div>
  )
}
