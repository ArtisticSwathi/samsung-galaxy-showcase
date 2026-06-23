import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, useGLTF, OrbitControls } from '@react-three/drei'
import ShowroomCamera from './canvas/ShowroomCamera'
import ShowroomEnvironment from './canvas/ShowroomEnvironment'
import * as THREE from 'three'
import gsap from 'gsap'

useGLTF.preload('/models/tabel.glb')
useGLTF.preload('/models/samsung_s23_ultra_free.glb')

// ── Configurator data ─────────────────────────────────────────────────────────
//
// hex: null  →  "Original" — restore model's own GLB colors
// hex: string → override body parts with that color
//
export const COLOR_OPTIONS = [
  { id: 'original', label: 'Original',      hex: null,      swatch: '#9b2020' }, // red approx
  { id: 'black',    label: 'Phantom Black',  hex: '#0f0f14', swatch: '#1c1c26' },
  { id: 'cream',    label: 'Cream',          hex: '#e0d8c5', swatch: '#ede5d2' },
  { id: 'green',    label: 'Phantom Green',  hex: '#1e3d2f', swatch: '#2e5040' },
  { id: 'lavender', label: 'Lavender',       hex: '#9b8ec4', swatch: '#b4a7d8' },
  { id: 'graphite', label: 'Graphite',       hex: '#3c3c42', swatch: '#54545e' },
  { id: 'sky',      label: 'Sky Blue',       hex: '#3a6f96', swatch: '#4e88b4' },
  { id: 'gold',     label: 'Titanium Gold',  hex: '#9a7c3c', swatch: '#b89448' },
]

// Material presets — only applied to body parts when user explicitly clicks
export const MATERIAL_PRESETS = {
  original: { label: 'Original',       roughness: null, metalness: null, envMapIntensity: null },
  glossy:   { label: 'Glossy',         roughness: 0.04, metalness: 0.08, envMapIntensity: 3.5  },
  matte:    { label: 'Matte',          roughness: 0.90, metalness: 0.00, envMapIntensity: 0.06 },
  brushed:  { label: 'Brushed Metal',  roughness: 0.28, metalness: 0.96, envMapIntensity: 2.2  },
  satin:    { label: 'Satin',          roughness: 0.48, metalness: 0.22, envMapIntensity: 1.0  },
  rough:    { label: 'Rough',          roughness: 0.94, metalness: 0.05, envMapIntensity: 0.04 },
}

// ─── Space Background ─────────────────────────────────────────────────────────
function SpaceBackground({ introProgressRef, view }) {
  const groupRef = useRef()
  const positions = useRef(null)
  if (!positions.current) {
    const pos = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      pos[i*3]   = (Math.random()-0.5)*55
      pos[i*3+1] = (Math.random()-0.5)*55
      pos[i*3+2] = Math.random()*120 - 20
    }
    positions.current = pos
  }
  useFrame(() => {
    let spaceFade = 1.0
    if (view === 'guided-intro' && introProgressRef.current !== undefined) {
      const p = introProgressRef.current
      spaceFade = p > 0.76 ? 1.0-(p-0.76)/0.24 : 1.0
    } else if (view === 'showroom') {
      spaceFade = 0.0
    }
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isPoints && child.material) {
          if (child.userData.baseOpacity === undefined)
            child.userData.baseOpacity = child.material.opacity || 1.0
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

// ─── Phone component ──────────────────────────────────────────────────────────
//
// Body-part classification heuristic:
//   luminance  > 0.04              → not pitch-black (not a lens/screen)
//   luminance  < 0.78              → not bright chrome (not Samsung logo / metallic trim)
//   !hasBaseColorMap               → has no baked texture (not the display)
//
// This targets: back cover, side frame, camera housing, S-Pen barrel, buttons.
// This preserves: screen glass, display texture, camera lenses, chrome trims.
//
function PhoneOnTable({ introProgressRef, view, selectedColor, selectedMaterial }) {
  const { scene }        = useGLTF('/models/samsung_s23_ultra_free.glb')
  const groupRef         = useRef()
  const allMatsRef       = useRef([])  // every material (for opacity fade)
  const bodyMatsRef      = useRef([])  // body-only (for color / finish changes)
  const targetColorRef   = useRef(null) // THREE.Color | null (null = use originals)
  const matInitRef       = useRef(false) // skip first selectedMaterial render

  // ── One-time material setup ─────────────────────────────────────────────
  useEffect(() => {
    if (!scene) return
    const allMats  = []
    const bodyMats = []

    scene.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow    = true
      child.receiveShadow = true
      if (!child.material) return

      child.material = child.material.clone()
      const mat = child.material

      // ── Store all original properties ───────────────────────────────────
      mat.userData.origColor         = mat.color.clone()
      mat.userData.origRoughness     = mat.roughness
      mat.userData.origMetalness     = mat.metalness
      mat.userData.origEnvMapInt     = mat.envMapIntensity ?? 1.0
      mat.userData.origEmissive      = mat.emissive ? mat.emissive.clone() : new THREE.Color(0)
      mat.userData.origEmissiveInt   = mat.emissiveIntensity ?? 0

      // ── Subtle reflections boost (doesn't change appearance much) ───────
      mat.envMapIntensity = Math.max(mat.envMapIntensity ?? 1.0, 1.0) * 1.35

      // Start invisible (fade-in during intro)
      mat.transparent = true
      mat.opacity     = 0.0
      allMats.push(mat)

      // ── Classify ────────────────────────────────────────────────────────
      const c   = mat.userData.origColor
      const lum = c.r * 0.299 + c.g * 0.587 + c.b * 0.114
      const hasBaseTexture = !!mat.map

      if (lum > 0.04 && lum < 0.78 && !hasBaseTexture) {
        mat.userData.isBodyPart = true
        bodyMats.push(mat)
      }
    })

    allMatsRef.current  = allMats
    bodyMatsRef.current = bodyMats

    // ── Scale: tallest dimension → 0.38 units ───────────────────────────
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    if (maxDim > 0) { const s = 0.38/maxDim; scene.scale.set(s,s,s) }

    // ── Position: bottom edge at y = 0 ──────────────────────────────────
    const lb = new THREE.Box3().setFromObject(scene)
    const cc = new THREE.Vector3()
    lb.getCenter(cc)
    scene.position.set(-cc.x, -lb.min.y, -cc.z)
  }, [scene])

  // ── React to color selection ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedColor) {
      // null → restore originals (handled per-frame via lerp)
      targetColorRef.current = null
    } else {
      if (targetColorRef.current) {
        targetColorRef.current.set(selectedColor)
      } else {
        targetColorRef.current = new THREE.Color(selectedColor)
      }
    }
  }, [selectedColor])

  // ── React to material preset ─────────────────────────────────────────────
  useEffect(() => {
    // Skip the very first render so we don't override GLB originals on mount
    if (!matInitRef.current) { matInitRef.current = true; return }

    const preset = MATERIAL_PRESETS[selectedMaterial]
    if (!preset) return

    bodyMatsRef.current.forEach((mat) => {
      if (!mat) return
      if (preset.roughness === null) {
        // "Original" preset → restore stored originals
        gsap.to(mat, {
          roughness:       mat.userData.origRoughness,
          metalness:       mat.userData.origMetalness,
          envMapIntensity: mat.userData.origEnvMapInt * 1.35,
          duration: 0.55, ease: 'power2.out',
          onUpdate: () => { mat.needsUpdate = true },
        })
      } else {
        gsap.to(mat, {
          roughness:       preset.roughness,
          metalness:       preset.metalness,
          envMapIntensity: preset.envMapIntensity,
          duration: 0.55, ease: 'power2.out',
          onUpdate: () => { mat.needsUpdate = true },
        })
      }
    })
  }, [selectedMaterial])

  // ── Frame loop ───────────────────────────────────────────────────────────
  useFrame(() => {
    // Fade-in progress
    let fade = 0.0
    if (view === 'guided-intro' && introProgressRef.current !== undefined) {
      const p = introProgressRef.current
      fade = p > 0.80 ? (p-0.80)/0.20 : 0.0
    } else if (view === 'showroom') {
      fade = 1.0
    }

    // Apply fade to every material
    allMatsRef.current.forEach((mat) => {
      if (!mat) return
      mat.opacity    = fade
      mat.transparent = fade < 0.99
    })

    // Smooth color lerp — body parts only
    bodyMatsRef.current.forEach((mat) => {
      if (!mat) return
      if (targetColorRef.current) {
        // Lerp toward selected color
        mat.color.lerp(targetColorRef.current, 0.07)
      } else {
        // Lerp back toward original GLB color
        if (mat.userData.origColor) {
          mat.color.lerp(mat.userData.origColor, 0.07)
        }
      }
    })
  })

  return (
    <group ref={groupRef} position={[0,0,0]} rotation={[0, Math.PI*0.15, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Product lighting ─────────────────────────────────────────────────────────
function ShowroomLighting() {
  return (
    <group>
      {/* Symmetric omnidirectional rig — identical brightness from every angle ─────
          Layout (top-down view):    BL ─ B ─ BR
                                     │         │
                                     L    ●    R      ● = overhead key
                                     │         │
                                     FL ─ F ─ FR
          All cardinal distances equal (0.52 units). All diagonal distances equal.
      ──────────────────────────────────────────────────────────────────────────── */}

      {/* Very dim scene ambient — baseline for unlit sides */}
      <ambientLight intensity={0.04} color="#c0d4f0" />

      {/* OVERHEAD KEY — exactly above center, no Z bias */}
      <pointLight position={[0,     1.05, 0]}    color="#ffffff" intensity={2.8} distance={1.2} decay={2} />

      {/* CARDINAL RING — front / back / left / right at equal distances & intensities */}
      <pointLight position={[0,     0.30,  0.52]} color="#e8f2ff" intensity={1.8} distance={0.90} decay={2} />
      <pointLight position={[0,     0.30, -0.52]} color="#e8f2ff" intensity={1.8} distance={0.90} decay={2} />
      <pointLight position={[-0.52, 0.30,  0]}    color="#ddeeff" intensity={1.8} distance={0.90} decay={2} />
      <pointLight position={[0.52,  0.30,  0]}    color="#ddeeff" intensity={1.8} distance={0.90} decay={2} />

      {/* DIAGONAL RING — 4 corners at equal distances & intensities */}
      <pointLight position={[-0.37, 0.28,  0.37]} color="#cce4ff" intensity={1.2} distance={0.85} decay={2} />
      <pointLight position={[0.37,  0.28,  0.37]} color="#cce4ff" intensity={1.2} distance={0.85} decay={2} />
      <pointLight position={[-0.37, 0.28, -0.37]} color="#cce4ff" intensity={1.2} distance={0.85} decay={2} />
      <pointLight position={[0.37,  0.28, -0.37]} color="#cce4ff" intensity={1.2} distance={0.85} decay={2} />

      {/* UNDER-GLOW — cyan accent from platform (fully symmetric, centered) */}
      <pointLight position={[0,     0.04,  0]}    color="#22d3ee" intensity={0.8} distance={0.55} decay={2} />
    </group>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductShowroom({ view, onIntroComplete }) {
  const introProgressRef  = useRef(0)
  const [buttonsVisible,   setButtonsVisible]  = useState(false)
  const [configuratorMode, setConfiguratorMode] = useState(false)
  const [orbitEnabled,     setOrbitEnabled]     = useState(false)
  const [cfgPanelVisible,  setCfgPanelVisible]  = useState(false)

  // Default: null = "Original" (no color override, use GLB colors)
  const [selectedColor,    setSelectedColor]    = useState(null)
  // Default: 'original' = use GLB material properties (matInitRef skips first render)
  const [selectedMaterial, setSelectedMaterial] = useState('original')

  const orbitTimerRef = useRef(null)

  useEffect(() => {
    if (view === 'showroom') {
      setTimeout(() => setButtonsVisible(true), 600)
    } else {
      setButtonsVisible(false)
      setConfiguratorMode(false)
      setOrbitEnabled(false)
      setCfgPanelVisible(false)
    }
  }, [view])

  useEffect(() => {
    clearTimeout(orbitTimerRef.current)
    if (configuratorMode) {
      orbitTimerRef.current = setTimeout(() => {
        setOrbitEnabled(true)
        setCfgPanelVisible(true)
      }, 1500)
    } else {
      setOrbitEnabled(false)
      setCfgPanelVisible(false)
    }
    return () => clearTimeout(orbitTimerRef.current)
  }, [configuratorMode])

  const handleProgressUpdate = useCallback((t) => { introProgressRef.current = t }, [])

  const handleExplore = () => {
    setConfiguratorMode(true)
    setButtonsVisible(false)
  }

  const handleBack = () => {
    setConfiguratorMode(false)
    setTimeout(() => setButtonsVisible(true), 2000)
  }

  const handleColorSelect = (hex) => {
    setSelectedColor(hex)   // null for "Original"
  }

  const handleMaterialSelect = (key) => {
    setSelectedMaterial(key)
  }

  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">

      {/* ── 3D Canvas ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <Canvas
          shadows
          camera={{ fov: 42, near: 0.1, far: 1000, position: [0, 0.36, 95.0] }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <SpaceBackground introProgressRef={introProgressRef} view={view} />
          <ShowroomLighting />
          <ShowroomEnvironment introProgressRef={introProgressRef} view={view} />
          <PhoneOnTable
            introProgressRef={introProgressRef}
            view={view}
            selectedColor={selectedColor}
            selectedMaterial={selectedMaterial}
          />
          <ShowroomCamera
            view={view}
            configuratorMode={configuratorMode}
            onIntroComplete={onIntroComplete}
            onProgressUpdate={handleProgressUpdate}
          />
          {configuratorMode && orbitEnabled && (
            <OrbitControls
              target={[0, 0.19, 0]}
              enablePan={false}
              enableDamping
              dampingFactor={0.07}
              minDistance={0.35}
              maxDistance={2.8}
              minPolarAngle={Math.PI * 0.08}
              maxPolarAngle={Math.PI * 0.88}
              makeDefault
            />
          )}
        </Canvas>
      </div>

      {/* ── Skip Intro ── */}
      <div className={`absolute top-6 right-6 transition-opacity duration-500 ${
        view === 'guided-intro' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <button onClick={onIntroComplete}
          className="px-5 py-2.5 bg-black/40 hover:bg-cyan-950/20 text-white border border-white/15 hover:border-cyan-400/50 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer">
          Skip Intro ➔
        </button>
      </div>

      {/* ── Showroom action buttons ── */}
      <div className={`absolute bottom-10 right-10 flex flex-col gap-3 transition-all duration-700 ease-out pointer-events-auto ${
        buttonsVisible && !configuratorMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}>
        <button onClick={() => {}}
          className="relative px-8 py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{ background:'linear-gradient(135deg,#1a6aff,#0044cc)', boxShadow:'0 0 24px rgba(26,106,255,0.5),inset 0 1px 0 rgba(255,255,255,0.15)' }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 38px rgba(26,106,255,0.75),inset 0 1px 0 rgba(255,255,255,0.2)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='0 0 24px rgba(26,106,255,0.5),inset 0 1px 0 rgba(255,255,255,0.15)'}>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13h10M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            Buy Now
          </span>
        </button>

        <button onClick={handleExplore}
          className="px-8 py-3.5 rounded-2xl text-sm font-medium tracking-wide text-white/90 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(16px)' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor='rgba(34,211,238,0.4)' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)' }}>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
            </svg>
            Explore Product
          </span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  PRODUCT CONFIGURATOR OVERLAY                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {configuratorMode && (
        <>
          {/* ── Back button ── */}
          <button onClick={handleBack}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5
              bg-black/50 backdrop-blur-md border border-white/10 hover:border-cyan-400/40
              text-white/75 hover:text-white rounded-full text-[10px] font-mono tracking-[0.22em] uppercase
              transition-all duration-300 cursor-pointer pointer-events-auto hover:bg-black/70">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* ── Product title ── */}
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none
            transition-all duration-700 ease-out
            ${cfgPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
            <p className="text-[9px] font-mono tracking-[0.35em] text-cyan-400/70 uppercase mb-0.5">Samsung</p>
            <h2 className="text-sm font-light tracking-[0.2em] text-white uppercase">Galaxy S23 Ultra</h2>
            <p className="text-[8px] font-mono tracking-[0.3em] text-white/35 uppercase mt-0.5">Product Configurator</p>
          </div>

          {/* ── Preparing hint (shown before panel animates in) ── */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            pointer-events-none transition-all duration-700 ease-out
            ${cfgPanelVisible ? 'opacity-0' : 'opacity-50'}`}>
            <p className="text-[9px] font-mono tracking-[0.3em] text-white/60 uppercase">Preparing Configurator…</p>
          </div>

          {/* ── Bottom configurator panel ── */}
          <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto
            transition-all duration-700 ease-out
            ${cfgPanelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mx-auto max-w-2xl px-6 pb-8 pt-5"
              style={{ background:'linear-gradient(to top,rgba(0,0,0,0.90) 0%,rgba(0,0,0,0.55) 60%,transparent 100%)', backdropFilter:'blur(10px)' }}>

              {/* ── Color swatches ── */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase w-10 text-right shrink-0">Color</span>
                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorSelect(c.hex)}
                      title={c.label}
                      className="relative w-7 h-7 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer"
                      style={{
                        background: c.swatch,
                        boxShadow: selectedColor === c.hex || (c.hex === null && selectedColor === null)
                          ? `0 0 0 2px #000, 0 0 0 3.5px #22d3ee, 0 0 12px rgba(34,211,238,0.4)`
                          : '0 0 0 1.5px rgba(255,255,255,0.12)',
                      }}
                    >
                      {(selectedColor === c.hex || (c.hex === null && selectedColor === null)) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected color name */}
              <div className="flex justify-center mb-5">
                <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400/60 uppercase">
                  {COLOR_OPTIONS.find(c => selectedColor === null ? c.hex === null : c.hex === selectedColor)?.label ?? ''}
                </span>
              </div>

              {/* ── Material finish buttons ── */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase shrink-0 mr-1">Finish</span>
                {Object.entries(MATERIAL_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleMaterialSelect(key)}
                    className={`px-3.5 py-1.5 rounded-lg text-[8.5px] font-mono tracking-[0.12em] uppercase
                      transition-all duration-200 border focus:outline-none cursor-pointer
                      ${selectedMaterial === key
                        ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.4)] font-bold'
                        : 'bg-white/5 text-white/55 border-white/10 hover:bg-white/12 hover:text-white/85 hover:border-white/22'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* ── Orbit/drag hint ── */}
          {cfgPanelVisible && (
            <div className="absolute right-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-25">
              <svg className="w-5 h-5 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <p className="text-[7.5px] font-mono tracking-[0.25em] text-white uppercase" style={{writingMode:'vertical-rl'}}>
                Drag to rotate
              </p>
            </div>
          )}
        </>
      )}

    </div>
  )
}
