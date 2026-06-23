import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

// ── Showroom slideshow camera angles ────────────────────────────────────────
const SLIDESHOW_ANGLES = [
  { pos: new THREE.Vector3(0,     0.60,  1.10), look: new THREE.Vector3(0, 0.19, 0), hold: 4.0 },
  { pos: new THREE.Vector3(1.05,  0.55,  0.65), look: new THREE.Vector3(0, 0.19, 0), hold: 3.5 },
  { pos: new THREE.Vector3(0,     0.60, -1.10), look: new THREE.Vector3(0, 0.19, 0), hold: 4.0 },
  { pos: new THREE.Vector3(-1.05, 0.55,  0.65), look: new THREE.Vector3(0, 0.19, 0), hold: 3.5 },
]
const TRANSITION_DURATION = 1.8

// Front-view landing position (used after intro flight + as configurator entry point)
const REVEAL_POS  = new THREE.Vector3(0, 0.60, 1.10)
const REVEAL_LOOK = new THREE.Vector3(0, 0.19, 0)

// ── Helper: tween camera + lookTarget to an absolute position ──────────────
function makeTween(camera, lookTarget, transitionRef, pos, look, duration, ease, onDone) {
  if (transitionRef.current) { transitionRef.current.kill(); transitionRef.current = null }
  const pp = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
  const lp = { x: lookTarget.current.x, y: lookTarget.current.y, z: lookTarget.current.z }
  transitionRef.current = gsap.timeline()
    .to(pp, {
      x: pos.x, y: pos.y, z: pos.z,
      duration, ease,
      onUpdate: () => camera.position.set(pp.x, pp.y, pp.z),
    }, 0)
    .to(lp, {
      x: look.x, y: look.y, z: look.z,
      duration, ease,
      onUpdate:  () => lookTarget.current.set(lp.x, lp.y, lp.z),
      onComplete: () => { if (onDone) onDone() },
    }, 0)
}

export default function ShowroomCamera({ view, configuratorMode, onIntroComplete, onProgressUpdate }) {
  const { camera } = useThree()
  const lookTarget      = useRef(new THREE.Vector3(0, 0.19, 75.0))
  const flightRef       = useRef(null)
  const slideshowRef    = useRef(null)
  const holdTimerRef    = useRef(null)
  const slideshowActive = useRef(false)
  const currentAngleRef = useRef(0)
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

  // ── Slideshow helpers ─────────────────────────────────────────────────────
  function tweenToAngle(angleIdx, onDone) {
    if (slideshowRef.current) { slideshowRef.current.kill(); slideshowRef.current = null }
    const angle = SLIDESHOW_ANGLES[angleIdx]
    const pp = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const lp = { x: lookTarget.current.x, y: lookTarget.current.y, z: lookTarget.current.z }
    slideshowRef.current = gsap.timeline()
      .to(pp, {
        x: angle.pos.x, y: angle.pos.y, z: angle.pos.z,
        duration: TRANSITION_DURATION, ease: 'power2.inOut',
        onUpdate: () => camera.position.set(pp.x, pp.y, pp.z),
      }, 0)
      .to(lp, {
        x: angle.look.x, y: angle.look.y, z: angle.look.z,
        duration: TRANSITION_DURATION, ease: 'power2.inOut',
        onUpdate:  () => lookTarget.current.set(lp.x, lp.y, lp.z),
        onComplete: () => { if (onDone) onDone() },
      }, 0)
  }

  function scheduleNextAngle() {
    if (!slideshowActive.current) return
    const angle = SLIDESHOW_ANGLES[currentAngleRef.current]
    holdTimerRef.current = setTimeout(() => {
      if (!slideshowActive.current) return
      currentAngleRef.current = (currentAngleRef.current + 1) % SLIDESHOW_ANGLES.length
      tweenToAngle(currentAngleRef.current, scheduleNextAngle)
    }, angle.hold * 1000)
  }

  function stopSlideshow() {
    slideshowActive.current = false
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null }
    if (slideshowRef.current) { slideshowRef.current.kill(); slideshowRef.current = null }
  }

  function startSlideshow() {
    currentAngleRef.current = 0
    camera.position.copy(REVEAL_POS)
    lookTarget.current.copy(REVEAL_LOOK)
    camera.lookAt(lookTarget.current)
    slideshowActive.current = true
    scheduleNextAngle()
  }

  // ── Main effect (reacts to both view and configuratorMode) ────────────────
  useEffect(() => {
    const wasConfigurator = prevCfgRef.current
    prevCfgRef.current = configuratorMode

    // Always stop everything first
    if (flightRef.current) { flightRef.current.kill(); flightRef.current = null }
    stopSlideshow()

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
      // ── Case 2: returning from configurator → smooth transition → slideshow
      makeTween(camera, lookTarget, transitionRef, REVEAL_POS, REVEAL_LOOK, 1.2, 'power2.inOut', () => {
        if (view === 'showroom') {
          slideshowActive.current = true
          scheduleNextAngle()
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
      startSlideshow()
    }

    return () => {
      if (flightRef.current) flightRef.current.kill()
      stopSlideshow()
      if (transitionRef.current) { transitionRef.current.kill(); transitionRef.current = null }
    }
  }, [view, configuratorMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Frame loop ─────────────────────────────────────────────────────────────
  useFrame(() => {
    // When OrbitControls is active, don't clobber the camera
    if (cfgActiveRef.current) return
    camera.lookAt(lookTarget.current)
  })

  return null
}
