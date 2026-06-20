import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import PhoneModel from './canvas/PhoneModel'
import ShowroomEnvironment from './canvas/ShowroomEnvironment'
import Lighting from './canvas/Lighting'
import ShowroomCamera from './canvas/ShowroomCamera'
import * as THREE from 'three'
import gsap from 'gsap'

export default function ProductShowroom({ view, onIntroComplete }) {
  const [subtitleIndex, setSubtitleIndex] = useState(0)

  // Narration / Subtitle text placeholders (synchronized with camera sweeps)
  const subtitles = [
    "Narrator: Beginning core system diagnostics. Initiating high-tech showroom matrix...",
    "Narrator: Scanning the custom aircraft-grade silver alloy chassis and camera optics...",
    "Narrator: Calibration complete. Welcome to the flagship digital showroom."
  ]

  // Synchronize subtitles with guided intro camera angles (4.0s total)
  useEffect(() => {
    if (view === 'guided-intro') {
      setSubtitleIndex(0)

      const timer1 = setTimeout(() => setSubtitleIndex(1), 1600)
      const timer2 = setTimeout(() => setSubtitleIndex(2), 2800)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [view])

  // Centerpiece Phone mesh wrapper (completely static, no bobbing/floating/spinning)
  function CenterpiecePhone({ view }) {
    const groupRef = useRef()
    const tweenRef = useRef(null)
    
    // Control scale dynamically based on view to avoid compile/mount stutter
    useEffect(() => {
      if (!groupRef.current) return

      if (view === 'welcome') {
        gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
      } else if (view === 'guided-intro') {
        gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
        if (tweenRef.current) tweenRef.current.kill()
        tweenRef.current = gsap.to(groupRef.current.scale, {
          x: 0.65,
          y: 0.65,
          z: 0.65,
          duration: 1.2,
          ease: 'power2.out',
          delay: 4.0 // Scales up slowly starting precisely at t=4.0s (when flight ends)
        })
      } else if (view === 'showroom') {
        if (tweenRef.current) tweenRef.current.kill()
        gsap.to(groupRef.current.scale, {
          x: 0.65,
          y: 0.65,
          z: 0.65,
          duration: 0.6,
          ease: 'power2.out'
        })
      }

      return () => {
        if (tweenRef.current) tweenRef.current.kill()
      }
    }, [view])

    return (
      <group ref={groupRef} position={[0, -0.23, 0]} rotation={[0, Math.PI / 4.2, 0]}>
        {/* Render 3D phone model mesh sitting flat on the table platter (removed by request) */}
        {/* <PhoneModel position={[0, 0, 0]} scale={[1, 1, 1]} /> */}
      </group>
    )
  }

  return (
    <div className="absolute inset-0 w-full h-full z-20 flex flex-col justify-between pointer-events-none">
      
      {/* 1. 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <Canvas
          shadows
          camera={{ fov: 45, near: 0.1, far: 1000 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ background: 'transparent' }}
        >
          {/* 3D Cosmic Space Background (Stars and Sparkles) */}
          <Stars 
            radius={35} 
            depth={60} 
            count={2200} 
            factor={8} 
            saturation={0.2} 
            fade 
            speed={1.0} // Gentle continuous rotation
          />

          {/* Glowing Space Dust (Floating particles drifting in 3D space) */}
          <Sparkles
            count={150}
            scale={12}
            size={3.0}
            speed={0.25}
            color="#ffffff"
            opacity={0.7}
          />
          <Sparkles
            count={80}
            scale={16}
            size={4.0}
            speed={0.18}
            color="#22d3ee" // Cyan
            opacity={0.5}
          />
          <Sparkles
            count={50}
            scale={14}
            size={2.5}
            speed={0.12}
            color="#a855f7" // Purple
            opacity={0.35}
          />

          {/* Dynamic camera rig */}
          <ShowroomCamera view={view} onIntroComplete={onIntroComplete} />
        </Canvas>
      </div>

      {/* --- 2D HTML/CSS UI OVERLAYS (Only active during intro flight) --- */}

      {/* Guided Intro Subtitle Box (Bottom center) */}
      <div 
        className={`absolute bottom-28 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 transition-all duration-700 ease-in-out ${
          view === 'guided-intro' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4.5 text-center shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="text-[8px] font-mono tracking-widest text-cyan-400 uppercase">CINEMATIC SYSTEM ACTIVE</span>
          </div>
          <p className="text-xs font-mono leading-relaxed text-slate-200">
            {subtitles[subtitleIndex]}
          </p>
        </div>
      </div>

      {/* Skip Intro button (Top right) */}
      <div 
        className={`absolute top-6 right-6 transition-opacity duration-500 ease-in-out ${
          view === 'guided-intro' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onIntroComplete}
          className="px-5 py-2.5 bg-black/45 hover:bg-cyan-950/20 text-white border border-slate-700/50 hover:border-cyan-400/60 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
        >
          Skip Intro ➔
        </button>
      </div>

    </div>
  )
}
