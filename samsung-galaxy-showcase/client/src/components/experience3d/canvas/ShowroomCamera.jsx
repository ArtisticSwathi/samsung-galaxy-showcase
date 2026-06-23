import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

// Hero reveal position — front of phone, slightly elevated
const REVEAL_POS  = new THREE.Vector3(0, 0.32, 1.2)
const REVEAL_LOOK = new THREE.Vector3(0, 0.16, 0)

export default function ShowroomCamera({ view, onIntroComplete, onProgressUpdate }) {
  const { camera } = useThree()
  const lookTarget  = useRef(new THREE.Vector3(0, 0.16, 75.0))
  const flightRef   = useRef(null)

  // ── Spline flight path through space (Straight forward with subtle banking) ──
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.36, 95.0),
    new THREE.Vector3(0.15, 0.35, 70.0),
    new THREE.Vector3(-0.1, 0.34, 45.0),
    new THREE.Vector3(0.05, 0.33, 20.0),
    new THREE.Vector3(0,    0.32, 1.2), // End exactly at REVEAL_POS
  ]))

  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.16, 75.0),
    new THREE.Vector3(0.15, 0.16, 50.0),
    new THREE.Vector3(-0.1, 0.16, 25.0),
    new THREE.Vector3(0.05, 0.16, 5.0),
    new THREE.Vector3(0,    0.16, 0),   // End exactly at REVEAL_LOOK
  ]))

  // ── View effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'guided-intro') {
      // Kill any previous animations
      if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }

      const progress = { value: 0 }

      // Snap to spline start — prevents any jump artefact
      positionCurve.current.getPointAt(0, camera.position)
      targetCurve.current.getPointAt(0, lookTarget.current)
      camera.lookAt(lookTarget.current)

      // Single uninterrupted 4.0s GSAP timeline
      flightRef.current = gsap.to(progress, {
        value: 1.0,
        duration: 4.0,
        ease: 'none', // linear interpolation of parameter t, easedT is piecewise below
        onUpdate: () => {
          const t = progress.value
          let easedT
          if (t <= 0.75) {
            // Constant speed from 0.0s to 3.0s (t = 0 to 0.75)
            easedT = (8 / 7) * t
          } else {
            // Smooth quadratic deceleration from 3.0s to 4.0s (t = 0.75 to 1.0)
            easedT = (-16 / 7) * Math.pow(t - 1.0, 2) + 1.0
          }

          // Evaluate positions using arc length parameterization to ensure constant velocity
          positionCurve.current.getPointAt(easedT, camera.position)
          targetCurve.current.getPointAt(easedT, lookTarget.current)

          if (onProgressUpdate) {
            onProgressUpdate(t)
          }
        },
        onComplete: () => {
          // Lock to exact values on completion
          camera.position.copy(REVEAL_POS)
          lookTarget.current.copy(REVEAL_LOOK)
          camera.lookAt(lookTarget.current)

          if (onProgressUpdate) {
            onProgressUpdate(1.0)
          }

          if (onIntroComplete) {
            onIntroComplete()
          }
        },
      })

    } else if (view === 'showroom') {
      if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }

      // Set camera to reveal position instantly and keep static
      camera.position.copy(REVEAL_POS)
      lookTarget.current.copy(REVEAL_LOOK)
      camera.lookAt(lookTarget.current)
    }

    return () => {
      if (flightRef.current) flightRef.current.kill()
    }
  }, [view, camera, onIntroComplete, onProgressUpdate])

  // Every frame: enforce live lookAt
  useFrame(() => {
    camera.lookAt(lookTarget.current)
  })

  return null
}

