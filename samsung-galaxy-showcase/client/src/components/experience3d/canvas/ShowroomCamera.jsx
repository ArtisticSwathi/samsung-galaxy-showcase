import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

// ── Showroom slideshow camera positions ─────────────────────────────────────
// Phone: 0.38 units tall, bottom at y=0, center at y=0.19.
// Camera Y=0.6 positions us well above the table surface.
// Z≈1.1 gives a comfortable framing distance (phone ~45% of vertical FOV).
const SLIDESHOW_ANGLES = [
  // Front view — face-on, slightly elevated
  {
    pos:  new THREE.Vector3(0,     0.60, 1.10),
    look: new THREE.Vector3(0,     0.19, 0),
    hold: 4.0,
  },
  // Right-side view — phone profile
  {
    pos:  new THREE.Vector3(1.05,  0.55, 0.65),
    look: new THREE.Vector3(0,     0.19, 0),
    hold: 3.5,
  },
  // Back view — rear cameras
  {
    pos:  new THREE.Vector3(0,     0.60, -1.10),
    look: new THREE.Vector3(0,     0.19, 0),
    hold: 4.0,
  },
  // Left-side view
  {
    pos:  new THREE.Vector3(-1.05, 0.55, 0.65),
    look: new THREE.Vector3(0,     0.19, 0),
    hold: 3.5,
  },
]

// Transition duration between each angle (seconds)
const TRANSITION_DURATION = 1.8

// ── Intro landing position (camera stops here after flight) ──────────────────
const REVEAL_POS  = new THREE.Vector3(0, 0.60, 1.10)  // same as front view
const REVEAL_LOOK = new THREE.Vector3(0, 0.19, 0)

export default function ShowroomCamera({ view, onIntroComplete, onProgressUpdate }) {
  const { camera } = useThree()
  const lookTarget  = useRef(new THREE.Vector3(0, 0.19, 75.0))
  const flightRef   = useRef(null)

  // Slideshow state
  const slideshowRef      = useRef(null)   // GSAP tween for current transition
  const currentAngleRef   = useRef(0)      // index into SLIDESHOW_ANGLES
  const holdTimerRef      = useRef(null)   // setTimeout for hold phase
  const slideshowActive   = useRef(false)

  // ── Spline flight path through space ────────────────────────────────────────
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.36, 95.0),
    new THREE.Vector3(0.15, 0.35, 70.0),
    new THREE.Vector3(-0.1, 0.34, 45.0),
    new THREE.Vector3(0.05, 0.33, 20.0),
    new THREE.Vector3(0,    0.60, 1.10),  // End exactly at REVEAL_POS
  ]))

  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,    0.16, 75.0),
    new THREE.Vector3(0.15, 0.16, 50.0),
    new THREE.Vector3(-0.1, 0.16, 25.0),
    new THREE.Vector3(0.05, 0.16, 5.0),
    new THREE.Vector3(0,    0.19, 0),    // End exactly at REVEAL_LOOK
  ]))

  // ── Helper: animate camera smoothly to a target angle ────────────────────
  function tweenToAngle(angleIdx, onDone) {
    if (slideshowRef.current) { slideshowRef.current.kill(); slideshowRef.current = null }

    const angle = SLIDESHOW_ANGLES[angleIdx]

    // Proxy objects for GSAP to interpolate
    const posProxy  = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const lookProxy = { x: lookTarget.current.x, y: lookTarget.current.y, z: lookTarget.current.z }

    slideshowRef.current = gsap.timeline()
      .to(posProxy, {
        x: angle.pos.x, y: angle.pos.y, z: angle.pos.z,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.set(posProxy.x, posProxy.y, posProxy.z)
        },
      }, 0)
      .to(lookProxy, {
        x: angle.look.x, y: angle.look.y, z: angle.look.z,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          lookTarget.current.set(lookProxy.x, lookProxy.y, lookProxy.z)
        },
        onComplete: () => {
          if (onDone) onDone()
        },
      }, 0)
  }

  // ── Helper: schedule the hold → advance loop ────────────────────────────
  function scheduleNextAngle() {
    if (!slideshowActive.current) return
    const angle = SLIDESHOW_ANGLES[currentAngleRef.current]

    holdTimerRef.current = setTimeout(() => {
      if (!slideshowActive.current) return
      currentAngleRef.current = (currentAngleRef.current + 1) % SLIDESHOW_ANGLES.length
      tweenToAngle(currentAngleRef.current, scheduleNextAngle)
    }, angle.hold * 1000)
  }

  // ── Cleanup all slideshow timers / tweens ──────────────────────────────
  function stopSlideshow() {
    slideshowActive.current = false
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null }
    if (slideshowRef.current) { slideshowRef.current.kill(); slideshowRef.current = null }
  }

  // ── View effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'guided-intro') {
      // Stop any running slideshow
      stopSlideshow()

      // Kill any previous flight
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
        ease: 'none', // linear interpolation of progress parameter p
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

          // Subtle micro-stabilization quiver during the pause phase
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
      // Kill flight if still running
      if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }

      // Start slideshow from front view (angle 0)
      currentAngleRef.current = 0
      camera.position.copy(REVEAL_POS)
      lookTarget.current.copy(REVEAL_LOOK)
      camera.lookAt(lookTarget.current)

      slideshowActive.current = true
      scheduleNextAngle()
    }

    return () => {
      if (flightRef.current) flightRef.current.kill()
      stopSlideshow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // Every frame: enforce live lookAt
  useFrame(() => {
    camera.lookAt(lookTarget.current)
  })

  return null
}
