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
      // Distribute stars in a 3D corridor along the camera flight path (Z: -20 to 100)
      pos[i * 3]     = (Math.random() - 0.5) * 55 // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 55 // Y
      pos[i * 3 + 2] = Math.random() * 120 - 20   // Z
    }
    positions.current = pos
  }

  useFrame(() => {
    let spaceFade = 1.0

    if (view === 'guided-intro' && introProgressRef.current !== undefined) {
      const t = introProgressRef.current
      if (t > 0.75) {
        spaceFade = 1.0 - (t - 0.75) / 0.25
      } else {
        spaceFade = 1.0
      }
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
          <bufferAttribute
            attach="attributes-position"
            args={[positions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
        />
      </points>
      <Sparkles count={120} scale={14} size={2.5} speed={0.2}  color="#ffffff" opacity={0.6} />
      <Sparkles count={70}  scale={18} size={3.5} speed={0.15} color="#22d3ee" opacity={0.4} />
      <Sparkles count={40}  scale={12} size={2.0} speed={0.1}  color="#a855f7" opacity={0.28} />
    </group>
  )
}

// ─── Phone 3D component ────────────────────────────────────────────────────────
function PhoneOnTable() {
  const { scene } = useGLTF('/models/samsung_s23_ultra_free.glb')
  const groupRef  = useRef()
  
  // Cache cloned materials to modify their opacity
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
          child.material.roughness       = Math.max(child.material.roughness * 0.55, 0.06)
          child.material.metalness       = Math.min(child.material.metalness * 1.3, 1.0)
          child.material.envMapIntensity = 4.0 // Premium specular highlights
          child.material.emissive        = new THREE.Color('#030508')
          child.material.emissiveIntensity = 0.1
          
          child.material.transparent = false
          child.material.opacity = 1.0
          
          mats.push(child.material)
        }
      }
    })
    materialsRef.current = mats

    // Normalise: 0.38 units tall (fits elegantly in the larger showroom scale)
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

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI * 0.15, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Studio lighting ──────────────────────────────────────────────────────────
function ShowroomLighting() {
  const keyLight = useRef()
  const leftFillLight = useRef()
  const rightFillLight = useRef()
  const rimLight = useRef()
  const underGlow = useRef()
  const ambientLightRef = useRef()
  const spotLightRef = useRef()
  const wallGlowLightRef = useRef()

  useFrame(() => {
    const fade = 1.0
    
    if (keyLight.current) keyLight.current.intensity = 3.2 * fade
    if (leftFillLight.current) leftFillLight.current.intensity = 2.5 * fade
    if (rightFillLight.current) rightFillLight.current.intensity = 2.5 * fade
    if (rimLight.current) rimLight.current.intensity = 2.8 * fade
    if (underGlow.current) underGlow.current.intensity = 4.5 * fade
    if (ambientLightRef.current) ambientLightRef.current.intensity = 0.1 + 0.25 * fade
    if (spotLightRef.current) spotLightRef.current.intensity = 12.0 * fade
    if (wallGlowLightRef.current) wallGlowLightRef.current.intensity = 2.5 * fade
  })

  return (
    <group>
      {/* Key light — premium front-top right */}
      <directionalLight
        ref={keyLight}
        position={[0.5, 3.5, 2.5]} 
        intensity={0} 
        castShadow
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-3} 
        shadow-camera-right={3}
        shadow-camera-top={3}  
        shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
      />
      {/* Left fill point light */}
      <pointLight ref={leftFillLight} position={[-3, 2, 1]} color="#ffffff" intensity={0} distance={12} decay={1.8} />
      {/* Right fill point light */}
      <pointLight ref={rightFillLight} position={[3, 2, 1]} color="#ffffff" intensity={0} distance={12} decay={1.8} />
      {/* Rim light behind phone */}
      <directionalLight ref={rimLight} position={[0, 3, -3]} intensity={0} />
      
      {/* Under-glow from platform */}
      <pointLight ref={underGlow} position={[0, 0.08, 0]} color="#ffffff" intensity={0} distance={2.2} decay={2} />
      
      {/* Soft ambient */}
      <ambientLight ref={ambientLightRef} intensity={0.1} color="#ffffff" />
      
      {/* Top spot on phone */}
      <spotLight
        ref={spotLightRef}
        position={[0, 5, 0.8]}
        intensity={0} 
        angle={Math.PI / 9}
        penumbra={0.7} 
        castShadow 
        color="#ffffff"
      />

      {/* Soft Ambient Wall Glow Light Wash (Soft Ice Blue) */}
      <pointLight
        ref={wallGlowLightRef}
        position={[0, 3.3, -4.0]}
        color="#e0f2fe"
        intensity={0}
        distance={6.0}
        decay={1.8}
      />
    </group>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductShowroom({ view, onIntroComplete }) {
  const [showroomRevealed, setShowroomRevealed] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(false)
  const introProgressRef = useRef(0)

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

  const handleProgressUpdate = useCallback((t) => {
    introProgressRef.current = t
  }, [])

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
          {/* Space background (stars fade out during transition) */}
          <SpaceBackground introProgressRef={introProgressRef} view={view} />

          <ShowroomLighting />
          <ShowroomEnvironment revealed={showroomRevealed} introProgressRef={introProgressRef} view={view} />
          <PhoneOnTable />
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

