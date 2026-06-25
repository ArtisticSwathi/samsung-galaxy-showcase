import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

// Front-view landing position (used after intro flight + as configurator entry point)
const REVEAL_POS  = new THREE.Vector3(0, 0.60, 1.10)
const REVEAL_LOOK = new THREE.Vector3(0, 0.19, 0)

// ── Helper: tween camera + lookTarget to an absolute position ──────────────
function makeTween(camera, lookTarget, transitionRef, pos, look, duration, ease, onDone) {
  if (transitionRef.current) { transitionRef.current.kill(); transitionRef.current = null }
  transitionRef.current = gsap.timeline()
    .to(camera.position, {
      x: pos.x, y: pos.y, z: pos.z,
      duration, ease,
    }, 0)
    .to(lookTarget.current, {
      x: look.x, y: look.y, z: look.z,
      duration, ease,
      onComplete: () => { if (onDone) onDone() },
    }, 0)
}

export default function ShowroomCamera({ view, configuratorMode, onIntroComplete, onProgressUpdate }) {
  const { camera } = useThree()
  const lookTarget      = useRef(new THREE.Vector3(0, 0.19, 75.0))
  const flightRef       = useRef(null)
  const orbitActive     = useRef(false)
  const orbitAngleRef   = useRef(0)
  // true only after the enter-configurator transition completes (OrbitControls in charge)
  const cfgActiveRef    = useRef(false)
  const transitionRef   = useRef(null)
  // track previous configuratorMode to detect transitions
  const prevCfgRef      = useRef(false)

  // ── Spline flight path ───────────────────────────────────────────────────
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.36, 95.0),
    new THREE.Vector3(0.15, 0.35, 70.0),
    new THREE.Vector3(-0.1, 0.34, 45.0),
    new THREE.Vector3(0.05, 0.33, 20.0),
    new THREE.Vector3(0,    0.60, 1.10),
  ]))
  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.16, 75.0),
    new THREE.Vector3(0.15, 0.16, 50.0),
    new THREE.Vector3(-0.1, 0.16, 25.0),
    new THREE.Vector3(0.05, 0.16,  5.0),
    new THREE.Vector3(0,    0.19,  0),
  ]))

  function startOrbit() {
    orbitAngleRef.current = 0
    camera.position.copy(REVEAL_POS)
    lookTarget.current.copy(REVEAL_LOOK)
    camera.lookAt(lookTarget.current)
    orbitActive.current = true
  }

  // ── Main effect (reacts to both view and configuratorMode) ────────────────
  useEffect(() => {
    const wasConfigurator = prevCfgRef.current
    prevCfgRef.current = configuratorMode

    // Always stop everything first
    if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }
    orbitActive.current = false

    // ── Case 1: entering configurator ──────────────────────────────────────
    if (configuratorMode) {
      cfgActiveRef.current = false  // keep our lookAt alive during the approach tween
      makeTween(camera, lookTarget, transitionRef, REVEAL_POS, REVEAL_LOOK, 1.4, 'power2.inOut', () => {
        cfgActiveRef.current = true  // hand camera control to OrbitControls
      })
      return
    }

    // ── Not in configurator ────────────────────────────────────────────────
    cfgActiveRef.current = false  // reclaim camera immediately

    if (wasConfigurator) {
      // ── Case 2: returning from configurator → smooth transition → orbit
      makeTween(camera, lookTarget, transitionRef, REVEAL_POS, REVEAL_LOOK, 1.2, 'power2.inOut', () => {
        if (view === 'showroom') {
          orbitAngleRef.current = 0
          orbitActive.current = true
        }
      })
      return
    }

    // ── Case 3: normal view change ─────────────────────────────────────────
    if (view === 'guided-intro') {
      positionCurve.current.getPointAt(0, camera.position)
      targetCurve.current.getPointAt(0, lookTarget.current)
      camera.lookAt(lookTarget.current)

      const prog = { value: 0 }
      flightRef.current = gsap.to(prog, {
        value: 1.0, duration: 5.0, ease: 'none',
        onUpdate: () => {
          const p = prog.value
          let easedT
          if (p <= 0.54)       easedT = 1.605 * p
          else if (p <= 0.6)   { const s = 5*p; easedT = 0.321*(2.85 - Math.pow(3.0-s,2)/0.6) }
          else if (p <= 0.76)  easedT = 0.915
          else                 { const u=(5*p-3.8)/1.2; easedT=0.915+0.085*(u*u*(3-2*u)) }
          positionCurve.current.getPointAt(easedT, camera.position)
          targetCurve.current.getPointAt(easedT, lookTarget.current)
          if (p > 0.6 && p <= 0.76) {
            const t = 5*p - 3.0
            let env = 1.0
            if (t < 0.15) env = t/0.15; else if (t > 0.65) env = (0.8-t)/0.15
            camera.position.y += Math.sin(t*18)*0.0008*env
            camera.position.x += Math.cos(t*15)*0.0005*env
          }
          if (onProgressUpdate) onProgressUpdate(p)
        },
        onComplete: () => {
          camera.position.copy(REVEAL_POS)
          lookTarget.current.copy(REVEAL_LOOK)
          camera.lookAt(lookTarget.current)
          if (onProgressUpdate) onProgressUpdate(1.0)
          if (onIntroComplete)  onIntroComplete()
        },
      })

    } else if (view === 'showroom') {
      startOrbit()
    }

    return () => {
      if (flightRef.current) flightRef.current.kill()
      orbitActive.current = false
      if (transitionRef.current) { transitionRef.current.kill(); transitionRef.current = null }
    }
  }, [view, configuratorMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Frame loop ─────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    // When OrbitControls is active, don't clobber the camera
    if (cfgActiveRef.current) return

    if (orbitActive.current) {
      // Increment orbit angle with medium speed (0.22 rad/sec)
      // One full 360-degree rotation takes 2 * Math.PI / 0.22 ≈ 28.5 seconds
      orbitAngleRef.current += delta * 0.22

      const radiusX = 1.05
      const radiusZ = 1.10
      const height = 0.60 + Math.sin(orbitAngleRef.current * 1.5) * 0.05

      camera.position.x = radiusX * Math.sin(orbitAngleRef.current)
      camera.position.z = radiusZ * Math.cos(orbitAngleRef.current)
      camera.position.y = height

      lookTarget.current.set(0, 0.19, 0)
    }

    camera.lookAt(lookTarget.current)
  })

  return null
}
