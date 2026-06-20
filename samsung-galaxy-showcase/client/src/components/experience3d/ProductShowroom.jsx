import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Sparkles, useGLTF } from '@react-three/drei'
import ShowroomCamera from './canvas/ShowroomCamera'
import ShowroomEnvironment from './canvas/ShowroomEnvironment'
import * as THREE from 'three'
import gsap from 'gsap'

// Preload models early — eliminates shader-compile stutter on reveal
useGLTF.preload('/models/tabel.glb')
useGLTF.preload('/models/samsung_s23_ultra_free.glb')

// ─── Showcase angle spec sequence ─────────────────────────────────────────────
const ANGLE_LABELS = [
  { title: 'Front View',              sub: 'Quad-camera array · Gorilla Glass Victus+' },
  { title: 'Three-Quarter View',      sub: 'Titanium frame · Aerospace-grade alloy' },
  { title: 'Side Profile',            sub: '8.9 mm ultra-slim · IP68 rated' },
  { title: 'Aerial Detail',           sub: '200 MP main sensor · OIS stabilisation' },
  { title: 'Rear Three-Quarter',      sub: 'S Pen slot · Symmetrical ergonomics' },
  { title: 'Low-Angle Dramatic',      sub: 'AMOLED 6.8″ · 1–120 Hz adaptive refresh' },
]

// ─── Phone 3D component ────────────────────────────────────────────────────────
function PhoneOnTable({ revealed }) {
  const { scene } = useGLTF('/models/samsung_s23_ultra_free.glb')
  const groupRef  = useRef()
  const tweenRef  = useRef(null)

  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.roughness       = Math.max(child.material.roughness * 0.55, 0.06)
          child.material.metalness       = Math.min(child.material.metalness * 1.3, 1.0)
          child.material.envMapIntensity = 3.5
          // Slight emissive so phone glows and doesn't look dull
          child.material.emissive        = new THREE.Color('#111822')
          child.material.emissiveIntensity = 0.4
          child.material.needsUpdate     = true
        }
      }
    })

    // Normalise: 0.52 units tall
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    if (maxDim > 0) {
      const s = 0.52 / maxDim
      scene.scale.set(s, s, s)
    }

    // Bottom edge → y = 0
    const lb = new THREE.Box3().setFromObject(scene)
    const c  = new THREE.Vector3()
    lb.getCenter(c)
    scene.position.set(-c.x, -lb.min.y, -c.z)
  }, [scene])

  useEffect(() => {
    if (!groupRef.current) return
    if (tweenRef.current) tweenRef.current.kill()

    if (revealed) {
      gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
      tweenRef.current = gsap.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.1,
      })
    } else {
      gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
    }

    return () => { if (tweenRef.current) tweenRef.current.kill() }
  }, [revealed])

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI * 0.15, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Studio lighting ──────────────────────────────────────────────────────────
function ShowroomLighting({ revealed }) {
  return revealed ? (
    <group>
      {/* Key light — warm, high left */}
      <directionalLight
        position={[-2.5, 6, 3]} intensity={2.2} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3}  shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
      />
      {/* Cool fill — right */}
      <pointLight position={[3, 3, -1]} color="#ffffff" intensity={3.5} distance={12} decay={1.8} />
      {/* Under-glow from platform */}
      <pointLight position={[0, 0.08, 0]} color="#ffffff" intensity={4.5} distance={2.2} decay={2} />
      {/* Soft ambient */}
      <ambientLight intensity={0.35} color="#ffffff" />
      {/* Top spot on phone */}
      <spotLight
        position={[0, 5, 0.8]}
        intensity={12} angle={Math.PI / 9}
        penumbra={0.7} castShadow color="#ffffff"
      />
    </group>
  ) : (
    <ambientLight intensity={0.1} />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductShowroom({ view, onIntroComplete }) {
  const [showroomRevealed, setShowroomRevealed] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(false)

  useEffect(() => {
    if (view === 'showroom') {
      setShowroomRevealed(true)
      // Buttons fade in shortly after models appear
      setTimeout(() => setButtonsVisible(true), 600)
    } else {
      setShowroomRevealed(false)
      setButtonsVisible(false)
    }
  }, [view])

  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">

      {/* ── 3D WebGL canvas ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <Canvas
          shadows
          camera={{ fov: 42, near: 0.1, far: 1000 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          {/* Space background */}
          <Stars radius={40} depth={60} count={2500} factor={8} saturation={0.15} fade speed={0.8} />
          <Sparkles count={120} scale={14} size={2.5} speed={0.2}  color="#ffffff" opacity={0.6} />
          <Sparkles count={70}  scale={18} size={3.5} speed={0.15} color="#22d3ee" opacity={0.4} />
          <Sparkles count={40}  scale={12} size={2.0} speed={0.1}  color="#a855f7" opacity={0.28} />

          <ShowroomLighting   revealed={showroomRevealed} />
          <ShowroomEnvironment revealed={showroomRevealed} />
          <PhoneOnTable       revealed={showroomRevealed} />
          <ShowroomCamera     view={view} onIntroComplete={onIntroComplete} />
        </Canvas>
      </div>

      {/* ── Skip Intro (during flight only) ── */}
      <div className={`absolute top-6 right-6 transition-opacity duration-500 ${
        view === 'guided-intro' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={onIntroComplete}
          className="px-5 py-2.5 bg-black/40 hover:bg-cyan-950/20 text-white border border-white/15 hover:border-cyan-400/50 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer"
        >
          Skip Intro ➔
        </button>
      </div>

      {/* ── Premium action buttons — bottom right ── */}
      <div className={`absolute bottom-10 right-10 flex flex-col gap-3 transition-all duration-700 ease-out ${
        buttonsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {/* Buy Now — primary CTA */}
        <button
          className="group relative px-8 py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white overflow-hidden cursor-pointer pointer-events-auto transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #1a6aff 0%, #0044cc 100%)',
            boxShadow: '0 0 24px rgba(26,106,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 38px rgba(26,106,255,0.75), inset 0 1px 0 rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(26,106,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'}
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13h10M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            Buy Now
          </span>
        </button>

        {/* Explore Product — secondary CTA */}
        <button
          className="group px-8 py-3.5 rounded-2xl text-sm font-medium tracking-wide text-white/90 cursor-pointer pointer-events-auto transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 0 0 rgba(26,106,255,0)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(100,180,255,0.35)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(26,106,255,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(26,106,255,0)'
          }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
            </svg>
            Explore Product
          </span>
        </button>
      </div>

    </div>
  )
}
