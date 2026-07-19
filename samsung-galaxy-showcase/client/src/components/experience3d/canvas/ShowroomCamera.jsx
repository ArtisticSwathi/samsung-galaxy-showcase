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
  const cfgActiveRef    = useRef(false)
  const transitionRef   = useRef(null)
  const prevCfgRef      = useRef(false)

  // ── Spline flight path ─────────────────────────────────────────────────────
  // Endpoint is exactly REVEAL_POS so the snap in onComplete is a zero-delta no-op
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.36, 95.0),
    new THREE.Vector3(0.10, 0.42, 68.0),
    new THREE.Vector3(-0.08,0.50, 38.0),
    new THREE.Vector3(0.04, 0.56, 12.0),
    new THREE.Vector3(0,    0.60,  1.10), // ← exactly REVEAL_POS
  ]))
  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.16, 75.0),
    new THREE.Vector3(0.10, 0.17, 50.0),
    new THREE.Vector3(-0.08,0.18, 25.0),
    new THREE.Vector3(0.04, 0.19,  5.0),
    new THREE.Vector3(0,    0.19,  0),   // ← exactly REVEAL_LOOK
  ]))

  function startOrbit() {
    orbitAngleRef.current = 0
    camera.position.copy(REVEAL_POS)
    lookTarget.current.copy(REVEAL_LOOK)
    camera.lookAt(lookTarget.current)
    orbitActive.current = true
  }

  // ── Main effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    const wasConfigurator = prevCfgRef.current
    prevCfgRef.current = configuratorMode

    if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }
    orbitActive.current = false

    // Case 1: entering configurator
    if (configuratorMode) {
      cfgActiveRef.current = false
      makeTween(camera, lookTarget, transitionRef, REVEAL_POS, REVEAL_LOOK, 1.4, 'power2.inOut', () => {
        cfgActiveRef.current = true
      })
      return
    }

    cfgActiveRef.current = false

    if (wasConfigurator) {
      // Case 2: returning from configurator → smooth orbit
      makeTween(camera, lookTarget, transitionRef, REVEAL_POS, REVEAL_LOOK, 1.2, 'power2.inOut', () => {
        if (view === 'showroom') {
          orbitAngleRef.current = 0
          orbitActive.current = true
        }
      })
      return
    }

    // Case 3: guided intro flight
    if (view === 'guided-intro') {
      positionCurve.current.getPointAt(0, camera.position)
      targetCurve.current.getPointAt(0, lookTarget.current)
      camera.lookAt(lookTarget.current)

      const prog = { value: 0 }

      flightRef.current = gsap.to(prog, {
        value: 1.0,
        // ── Total flight duration ─────────────────────────────────────────
        // power3.out: rockets in fast, then decelerates to a silky-smooth float stop.
        // No manual easing math — GSAP handles velocity = 0 at t=1 naturally.
        duration: 5.5,
        ease: 'power3.out',
        onUpdate: () => {
          const t = prog.value

          // Sample spline directly — GSAP's ease controls velocity, no manual remapping
          positionCurve.current.getPointAt(t, camera.position)
          targetCurve.current.getPointAt(t, lookTarget.current)

          if (onProgressUpdate) onProgressUpdate(t)
        },
        onComplete: () => {
          // Snap cleanly — spline endpoint == REVEAL_POS so this is zero-delta
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
  useFrame((_, delta) => {
    if (cfgActiveRef.current) return

    if (orbitActive.current) {
      // Gentle orbit — 0.18 rad/sec for a slow, premium float
      orbitAngleRef.current += delta * 0.18

      const angle  = orbitAngleRef.current
      const rx     = 1.05
      const rz     = 1.10
      // Subtle vertical bob for a "floating" feel
      const height = 0.60 + Math.sin(angle * 0.8) * 0.04

      camera.position.x = rx * Math.sin(angle)
      camera.position.z = rz * Math.cos(angle)
      camera.position.y = height

      lookTarget.current.set(0, 0.19, 0)
    }

    camera.lookAt(lookTarget.current)
  })

  return null
}
