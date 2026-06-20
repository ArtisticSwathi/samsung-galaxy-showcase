import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

// Hero reveal position — front of phone, slightly elevated
const REVEAL_POS  = new THREE.Vector3(0, 0.32, 1.2)
const REVEAL_LOOK = new THREE.Vector3(0, 0.16, 0)

// ── Showcase angles — silky cinematic transitions (1.5s each) ───────────────
const SHOWCASE = [
  { pos: [0,      0.32,  1.20],  look: [0,  0.16, 0],  dur: 1.0, hold: 0.5 }, // Front
  { pos: [0.85,   0.40,  0.85],  look: [0,  0.12, 0],  dur: 1.0, hold: 0.5 }, // 3/4 Right
  { pos: [1.30,   0.18,  0.05],  look: [0,  0.16, 0],  dur: 1.0, hold: 0.5 }, // Side
  { pos: [0.10,   0.95,  0.50],  look: [0,  0.26, 0],  dur: 1.0, hold: 0.5 }, // Aerial
  { pos: [-0.85,  0.36,  0.90],  look: [0,  0.14, 0],  dur: 1.0, hold: 0.5 }, // 3/4 Left
  { pos: [0,      0.04,  1.15],  look: [0,  0.26, 0],  dur: 1.0, hold: 0.5 }, // Low angle
]

export default function ShowroomCamera({ view, onIntroComplete }) {
  const { camera } = useThree()
  const lookTarget  = useRef(new THREE.Vector3(0.1, 1.0, 6.0))
  const flightRef   = useRef(null)
  const showcaseRef = useRef(null)
  const kfIndexRef  = useRef(0)

  // ── Spline flight path through space ──────────────────────────────────────
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,   10.0, 15.0),
    new THREE.Vector3(0.4,  7.2, 11.0),
    new THREE.Vector3(1.0,  4.5,  7.5),
    new THREE.Vector3(1.5,  2.2,  4.0),
    new THREE.Vector3(1.2,  1.0,  2.2),
    new THREE.Vector3(0.6,  0.5,  1.6),
  ]))

  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1,  7.5, 10.0),
    new THREE.Vector3(0.5,  5.2,  7.5),
    new THREE.Vector3(0.9,  3.0,  4.5),
    new THREE.Vector3(0.8,  1.2,  1.5),
    new THREE.Vector3(0.3,  0.4,  0.3),
    new THREE.Vector3(0.0,  0.2, -0.2),
  ]))

  // ── Showcase loop — fires each angle every ~1 second ──────────────────────
  const startShowcase = useCallback(() => {
    kfIndexRef.current = 0

    function playNext() {
      const kf = SHOWCASE[kfIndexRef.current % SHOWCASE.length]
      kfIndexRef.current++

      if (showcaseRef.current) showcaseRef.current.kill()

      const tl = gsap.timeline({ onComplete: playNext })
      showcaseRef.current = tl

      // Move camera and look-target simultaneously
      tl.to(camera.position, {
        x: kf.pos[0], y: kf.pos[1], z: kf.pos[2],
        duration: kf.dur,
        ease: 'power3.inOut',   // silky acceleration + decel
      })
      tl.to(lookTarget.current, {
        x: kf.look[0], y: kf.look[1], z: kf.look[2],
        duration: kf.dur,
        ease: 'power3.inOut',
      }, '<')
      tl.to({}, { duration: kf.hold })  // brief hold at this angle
    }

    playNext()
  }, [camera])

  // ── View effect ────────────────────────────────────────────────────────────
  useEffect(() => {

    if (view === 'guided-intro') {
      // Kill any previous animations
      if (showcaseRef.current) { showcaseRef.current.kill(); showcaseRef.current = null }
      if (flightRef.current)   { flightRef.current.kill();   flightRef.current   = null }

      const progress = { value: 0 }

      // Snap to spline start — prevents any jump artefact
      positionCurve.current.getPoint(0, camera.position)
      targetCurve.current.getPoint(0, lookTarget.current)
      camera.lookAt(lookTarget.current)

      // Phase 1 — 4-second jet blast (fast start, natural decel via ease)
      flightRef.current = gsap.to(progress, {
        value: 1,
        duration: 4.0,
        ease: 'power2.out',   // starts fast, eases out near the end
        onUpdate: () => {
          positionCurve.current.getPoint(progress.value, camera.position)
          targetCurve.current.getPoint(progress.value, lookTarget.current)
        },
        onComplete: () => {
          // Phase 2 — 1-second smooth deceleration glide into reveal position
          const decelTl = gsap.timeline()
          decelTl.to(camera.position, {
            x: REVEAL_POS.x, y: REVEAL_POS.y, z: REVEAL_POS.z,
            duration: 1.0,
            ease: 'power3.out',   // heavy decel — feels like braking
          })
          decelTl.to(lookTarget.current, {
            x: REVEAL_LOOK.x, y: REVEAL_LOOK.y, z: REVEAL_LOOK.z,
            duration: 1.0,
            ease: 'power3.out',
          }, '<')
          decelTl.call(() => {
            // Lock to exact values (no float drift)
            camera.position.copy(REVEAL_POS)
            lookTarget.current.copy(REVEAL_LOOK)
            camera.lookAt(lookTarget.current)
            // Switch view → models appear → showcase starts immediately
            if (onIntroComplete) onIntroComplete()
          })
        },
      })

    } else if (view === 'showroom') {
      if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }

      // Set camera to reveal position instantly (e.g. if user skipped intro)
      camera.position.copy(REVEAL_POS)
      lookTarget.current.copy(REVEAL_LOOK)
      camera.lookAt(lookTarget.current)

      // Start showcase immediately — no delay
      startShowcase()
    }

    return () => {
      if (flightRef.current)   flightRef.current.kill()
      if (showcaseRef.current) showcaseRef.current.kill()
    }
  }, [view, camera, onIntroComplete, startShowcase])

  // Every frame: enforce live lookAt
  useFrame(() => {
    camera.lookAt(lookTarget.current)
  })

  return null
}
