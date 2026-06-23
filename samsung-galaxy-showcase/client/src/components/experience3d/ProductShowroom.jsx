import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, useGLTF } from '@react-three/drei'
import ShowroomCamera from './canvas/ShowroomCamera'
import ShowroomEnvironment from './canvas/ShowroomEnvironment'
import * as THREE from 'three'
import gsap from 'gsap'

// Preload models early — eliminates shader-compile stutter on reveal
useGLTF.preload('/models/tabel.glb')
useGLTF.preload('/models/samsung_s23_ultra_free.glb')

// ─── Custom Space Background (Static 3D Star Field + Sparkles Fades) ──────────
function SpaceBackground({ introProgressRef, view }) {
  const groupRef = useRef()
  const numStars = 2000
  const positions = useRef(null)

  if (!positions.current) {
    const pos = new Float32Array(numStars * 3)
    for (let i = 0; i < numStars; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 55
      pos[i * 3 + 1] = (Math.random() - 0.5) * 55
      pos[i * 3 + 2] = Math.random() * 120 - 20
    }
    positions.current = pos
  }

  useFrame(() => {
    let spaceFade = 1.0
    if (view === 'guided-intro' && introProgressRef.current !== undefined) {
      const p = introProgressRef.current
      spaceFade = p > 0.76 ? 1.0 - (p - 0.76) / 0.24 : 1.0
    } else if (view === 'showroom') {
      spaceFade = 0.0
    }
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isPoints && child.material) {
          if (child.userData.baseOpacity === undefined) {
            child.userData.baseOpacity = child.material.opacity || 1.0
          }
          child.material.opacity = child.userData.baseOpacity * spaceFade
          child.visible = spaceFade > 0.001
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.14} color="#ffffff" sizeAttenuation transparent opacity={0.8} depthWrite={false} />
      </points>
      <Sparkles count={120} scale={14} size={2.5} speed={0.2}  color="#ffffff" opacity={0.6} />
      <Sparkles count={70}  scale={18} size={3.5} speed={0.15} color="#22d3ee" opacity={0.4} />
      <Sparkles count={40}  scale={12} size={2.0} speed={0.1}  color="#a855f7" opacity={0.28} />
    </group>
  )
}

// ─── Phone 3D component ────────────────────────────────────────────────────────
function PhoneOnTable({ introProgressRef, view }) {
  const { scene } = useGLTF('/models/samsung_s23_ultra_free.glb')
  const groupRef  = useRef()
  const materialsRef = useRef([])

  useEffect(() => {
    if (!scene) return

    const mats = []
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          // Moderate roughness/metalness — looks premium without over-reflecting
          child.material.roughness         = Math.max(child.material.roughness * 0.5, 0.05)
          child.material.metalness         = Math.min(child.material.metalness * 1.2, 1.0)
          // Lower envMapIntensity — no HDRI loaded so keep it subtle
          child.material.envMapIntensity   = 1.5
          // Very faint self-emissive so unlit areas are not pure black
          child.material.emissive          = new THREE.Color('#050c18')
          child.material.emissiveIntensity = 0.12

          child.material.transparent = true
          child.material.opacity = 0.0
          mats.push(child.material)
        }
      }
    })
    materialsRef.current = mats

    // Phone tall dimension → 0.38 units
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    if (maxDim > 0) {
      const s = 0.38 / maxDim
      scene.scale.set(s, s, s)
    }

    // Bottom edge → y = 0
    const lb = new THREE.Box3().setFromObject(scene)
    const c  = new THREE.Vector3()
    lb.getCenter(c)
    scene.position.set(-c.x, -lb.min.y, -c.z)
  }, [scene])

  useFrame(() => {
    let fade = 0.0
    if (view === 'guided-intro' && introProgressRef.current !== undefined) {
      const p = introProgressRef.current
      fade = p > 0.80 ? (p - 0.80) / 0.20 : 0.0
    } else if (view === 'showroom') {
      fade = 1.0
    }
    materialsRef.current.forEach((mat) => {
      if (mat) {
        mat.opacity = fade
        mat.transparent = fade < 0.99
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI * 0.15, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Product Lighting ─────────────────────────────────────────────────────────
//
// Strategy: cluster multiple low-range point lights very close to the phone.
// Point lights with a short "distance" physically cannot reach the walls or
// background — their intensity falls off to zero within that radius.
// This means ONLY the phone (and table surface directly below) gets lit.
// None of these lights have visible geometry — they are invisible in camera.
//
function ShowroomLighting() {
  return (
    <group>
      {/* Very dim scene ambient — just enough to see the showroom walls faintly */}
      <ambientLight intensity={0.08} color="#b0c8e8" />

      {/* ── Phone-local lights — distance ≤ 1.0 keeps them on the phone only ── */}

      {/* TOP KEY: overhead, casts down across the whole front face */}
      <pointLight position={[0,    0.95, 0.25]} color="#ffffff" intensity={14} distance={1.1} decay={2} />

      {/* FRONT FILL: in front of phone, softly illuminates the display */}
      <pointLight position={[0,    0.28, 0.50]} color="#e8f2ff" intensity={10} distance={0.9} decay={2} />

      {/* LEFT FILL: 45° left — reveals left edge and frame */}
      <pointLight position={[-0.40, 0.30, 0.30]} color="#d8ecff" intensity={8}  distance={0.85} decay={2} />

      {/* RIGHT FILL: 45° right — reveals right edge and frame */}
      <pointLight position={[0.40,  0.30, 0.30]} color="#d8ecff" intensity={8}  distance={0.85} decay={2} />

      {/* REAR RIM: behind phone — defines silhouette, illuminates rear cameras */}
      <pointLight position={[0,    0.30, -0.50]} color="#99c8ff" intensity={10} distance={0.95} decay={2} />

      {/* REAR-LEFT rim for back panel detail */}
      <pointLight position={[-0.35, 0.28, -0.40]} color="#88b8ff" intensity={6}  distance={0.8} decay={2} />

      {/* REAR-RIGHT rim for back panel detail */}
      <pointLight position={[0.35,  0.28, -0.40]} color="#88b8ff" intensity={6}  distance={0.8} decay={2} />

      {/* SIDE-LEFT: grazes the left profile */}
      <pointLight position={[-0.50, 0.25, 0]}    color="#cce4ff" intensity={7}  distance={0.85} decay={2} />

      {/* SIDE-RIGHT: grazes the right profile */}
      <pointLight position={[0.50,  0.25, 0]}    color="#cce4ff" intensity={7}  distance={0.85} decay={2} />

      {/* UNDER-GLOW: cyan rising from platform — only reaches bottom of phone */}
      <pointLight position={[0,    0.04, 0]}    color="#22d3ee" intensity={5}  distance={0.55} decay={2} />
    </group>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductShowroom({ view, onIntroComplete }) {
  const [buttonsVisible, setButtonsVisible] = useState(false)
  const introProgressRef = useRef(0)

  useEffect(() => {
    if (view === 'showroom') {
      setTimeout(() => setButtonsVisible(true), 600)
    } else {
      setButtonsVisible(false)
    }
  }, [view])

  const handleProgressUpdate = useCallback((t) => {
    introProgressRef.current = t
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">

      {/* ── 3D WebGL canvas ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <Canvas
          shadows
          camera={{ fov: 42, near: 0.1, far: 1000, position: [0, 0.36, 95.0] }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          {/* Space background */}
          <SpaceBackground introProgressRef={introProgressRef} view={view} />

          <ShowroomLighting />
          <ShowroomEnvironment introProgressRef={introProgressRef} view={view} />
          <PhoneOnTable       introProgressRef={introProgressRef} view={view} />
          <ShowroomCamera     view={view} onIntroComplete={onIntroComplete} onProgressUpdate={handleProgressUpdate} />
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
