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

      // Single uninterrupted 5.0s GSAP timeline
      flightRef.current = gsap.to(progress, {
        value: 1.0,
        duration: 5.0,
        ease: 'none', // linear interpolation of progress parameter p, easedT is piecewise below
        onUpdate: () => {
          const p = progress.value
          let easedT
          
          if (p <= 0.54) {
            // Constant speed from p = 0 to 0.54 (0.0s to 2.7s)
            easedT = 1.605 * p
          } else if (p <= 0.6) {
            // Smooth deceleration to a stop in front of the door from p = 0.54 to 0.6 (2.7s to 3.0s)
            const sec = 5.0 * p
            easedT = 0.321 * (2.85 - Math.pow(3.0 - sec, 2) / 0.6)
          } else if (p <= 0.76) {
            // Stop/pause in front of the door from p = 0.6 to 0.76 (3.0s to 3.8s)
            easedT = 0.915
          } else {
            // Resume forward movement and enter showroom from p = 0.76 to 1.0 (3.8s to 5.0s)
            const u = (5.0 * p - 3.8) / 1.2
            easedT = 0.915 + 0.085 * (u * u * (3 - 2 * u))
          }

          // Evaluate positions using arc length parameterization
          positionCurve.current.getPointAt(easedT, camera.position)
          targetCurve.current.getPointAt(easedT, lookTarget.current)

          // Subtlest micro-stabilization quiver during the pause phase to make the camera feel alive but stabilized
          if (p > 0.6 && p <= 0.76) {
            const waitTime = 5.0 * p - 3.0 // 0.0 to 0.8s
            let envelope = 1.0
            if (waitTime < 0.15) {
              envelope = waitTime / 0.15
            } else if (waitTime > 0.65) {
              envelope = (0.8 - waitTime) / 0.15
            }
            const stabY = Math.sin(waitTime * 18.0) * 0.0008 * envelope
            const stabX = Math.cos(waitTime * 15.0) * 0.0005 * envelope
            camera.position.y += stabY
            camera.position.x += stabX
          }

          if (onProgressUpdate) {
            onProgressUpdate(p)
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

