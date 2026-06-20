import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function ShowroomCamera({ view, onIntroComplete }) {
  const { camera } = useThree()
  const lookTarget = useRef(new THREE.Vector3(0.1, 1.0, 6.0))
  const timelineRef = useRef(null)
  const completedRef = useRef(false)

  // 3D continuous spline curves for fast, downward-floating jet flight through space
  const positionCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10.0, 15.0),   // Start centered, very high back
    new THREE.Vector3(0.8, 6.5, 10.0),  // Float down fast & right
    new THREE.Vector3(2.2, 3.2, 5.0),   // Float down fast & right further
    new THREE.Vector3(3.0, 0.5, 2.0)    // Stop slowly in the middle of space
  ]))

  const targetCurve = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 7.5, 10.0),   // Looking straight/down
    new THREE.Vector3(0.9, 4.5, 5.0),   // Looking straight/down
    new THREE.Vector3(2.4, 2.0, 0.6),   // Looking along the curve
    new THREE.Vector3(3.5, 0.5, -2.0)   // Final gaze direction
  ]))

  useEffect(() => {
    if (view === 'guided-intro') {
      completedRef.current = false
      const progress = { value: 0 }
      
      // Instantly align camera to starting points of the curve to prevent jumps
      positionCurve.current.getPoint(0, camera.position)
      targetCurve.current.getPoint(0, lookTarget.current)
      camera.lookAt(lookTarget.current)

      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      // Single continuous GSAP tween driving camera position along splines with power1.out ease (starts fast, lands slow)
      timelineRef.current = gsap.to(progress, {
        value: 1,
        duration: 4.0, // Exactly 4.0 seconds of travel
        ease: 'power1.out',
        onUpdate: () => {
          positionCurve.current.getPoint(progress.value, camera.position)
          targetCurve.current.getPoint(progress.value, lookTarget.current)
        },
        onComplete: () => {
          completedRef.current = true
          positionCurve.current.getPoint(1.0, camera.position)
          targetCurve.current.getPoint(1.0, lookTarget.current)
          camera.lookAt(lookTarget.current)
          if (onIntroComplete) onIntroComplete()
        }
      })

    } else if (view === 'showroom') {
      completedRef.current = true
      
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      
      // Instantly set camera to final destination
      camera.position.set(3.0, 0.5, 2.0)
      lookTarget.current.set(3.5, 0.5, -2.0)
      camera.lookAt(lookTarget.current)
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [view, camera, onIntroComplete])

  // Continuous frame lookAt lock
  useFrame(() => {
    camera.lookAt(lookTarget.current)
  })

  return null
}

