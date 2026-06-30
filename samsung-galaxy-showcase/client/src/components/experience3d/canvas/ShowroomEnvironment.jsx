import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// ── Custom GLSL Shader for the Futuristic Digital Walls (Clean White Theme) ──
const DigitalWallShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uFade;
    
    void main() {
      vec2 uv = vUv;
      
      // 1. Futuristic clean premium white/light-gray digital background
      vec3 colorBg = vec3(0.94, 0.95, 0.97); // Soft off-white
      vec3 colorGlow = vec3(0.98, 0.99, 1.0); // Pure white glow
      
      // Dynamic moving ambient lighting wash
      float wash = sin(uv.x * 1.5 + uTime * 0.1) * cos(uv.y * 1.5 - uTime * 0.08) * 0.5 + 0.5;
      vec3 finalColor = mix(colorBg, colorGlow, wash * 0.6);
      
      // 2. Clean silver-gray digital grid
      float gridX = sin(uv.x * 32.0) * 0.5 + 0.5;
      gridX = smoothstep(0.98, 0.995, gridX);
      
      float gridY = sin(uv.y * 20.0) * 0.5 + 0.5;
      gridY = smoothstep(0.98, 0.995, gridY);
      
      float gridMask = clamp(gridX + gridY, 0.0, 1.0);
      finalColor = mix(finalColor, vec3(0.85, 0.88, 0.92), gridMask * 0.45);
      
      // 3. Glowing white light sweep
      float sweep = sin(uv.y * 2.5 - uTime * 0.4) * 0.5 + 0.5;
      sweep = pow(sweep, 8.0); // sharp glowing laser sweep
      finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), sweep * 0.35);
      
      // Soft vignette
      float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
      vignette = pow(vignette, 0.3);
      finalColor *= mix(0.97, 1.0, vignette);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

export default function ShowroomEnvironment({ introProgressRef, view }) {
  const { scene } = useGLTF('/models/tabel.glb')
  const groupRef  = useRef()
  
  // Track table height dynamically
  const [tableHeight, setTableHeight] = useState(0.7)
  
  // References for elements we want to animate/adjust
  const wallMaterialsRef = useRef(new Set())

  const leftStripRef = useRef()
  const rightStripRef = useRef()

  const leftDoorRef  = useRef()
  const rightDoorRef = useRef()

  const [doorTriggered, setDoorTriggered] = useState(false)
  const doorTriggerTime = useRef(0)

  const [doorCloseTriggered, setDoorCloseTriggered] = useState(false)
  const doorCloseTime = useRef(0)
  
  const leftDoorMatRef = useRef()
  const rightDoorMatRef = useRef()

  // Dimensions of walls (expanded for a spacious, luxurious flagship showroom)
  const wallHeight = 5.5
  const wallY = -tableHeight + wallHeight / 2
  const ceilingY = -tableHeight + wallHeight

  // Premium dark metallic table material
  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          // Premium silver metal - glossy clean look
          child.material.color             = new THREE.Color('#cbd5e1')
          child.material.metalness         = 0.95
          child.material.roughness         = 0.08
          child.material.emissive          = new THREE.Color('#111111')
          child.material.emissiveIntensity = 0.1
          child.material.transparent = false
          child.material.opacity = 1.0
        }
      }
    })

    // Scale table to 1.6 units max dimension — proportional pedestal for the phone
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    
    if (maxDim > 0) {
      scene.scale.set(2.2 / maxDim, 2.2 / maxDim, 2.2 / maxDim)
    }

    // Top of table at y = 0
    const lb = new THREE.Box3().setFromObject(scene)
    const c  = new THREE.Vector3()
    lb.getCenter(c)
    scene.position.set(-c.x, -lb.max.y, -c.z)
    
    // Get actual table height to position floor correctly
    const finalBox = new THREE.Box3().setFromObject(scene)
    const finalSize = new THREE.Vector3()
    finalBox.getSize(finalSize)
    setTableHeight(finalSize.y)
  }, [scene])

  // Orient vertical accent strips to face the origin
  useEffect(() => {
    if (leftStripRef.current) {
      leftStripRef.current.lookAt(0, wallY, 0)
    }
    if (rightStripRef.current) {
      rightStripRef.current.lookAt(0, wallY, 0)
    }
  }, [wallY])

  // Reset doors trigger states when intro view starts
  useEffect(() => {
    if (view === 'guided-intro') {
      setDoorTriggered(false)
      setDoorCloseTriggered(false)
      doorTriggerTime.current = 0
      doorCloseTime.current = 0
      if (leftDoorMatRef.current) leftDoorMatRef.current.emissiveIntensity = 0.12
      if (rightDoorMatRef.current) rightDoorMatRef.current.emissiveIntensity = 0.12
    }
  }, [view])

  // Update wall uTime and slide doors based on flight progress
  useFrame((state) => {
    // 1. Digital wall shader animation
    wallMaterialsRef.current.forEach((mat) => {
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = state.clock.getElapsedTime()
      }
    })

    // 2. Door opening, scanning, and closing animation progress
    let openProgress = 0.0
    let currentEmissive = 0.12

    if (view === 'guided-intro') {
      const camPos = state.camera.position
      const doorCenter = new THREE.Vector3(0, camPos.y, 8.0)
      const distance = camPos.distanceTo(doorCenter)
      const activationRadius = 4.0 // Trigger when camera is within 4 units of the doors (Z < 12.0)

      // Trigger door opening
      if (!doorTriggered && distance < activationRadius) {
        setDoorTriggered(true)
        doorTriggerTime.current = state.clock.getElapsedTime()
      }

      // Trigger door closing (only after camera Z is less than 8.0, meaning inside the showroom)
      if (doorTriggered && !doorCloseTriggered && camPos.z < 8.0) {
        setDoorCloseTriggered(true)
        doorCloseTime.current = state.clock.getElapsedTime()
      }

      if (doorCloseTriggered && doorCloseTime.current > 0) {
        // Doors are closing behind camera
        const elapsedClose = state.clock.getElapsedTime() - doorCloseTime.current
        const closeDuration = 0.6 // 600ms to slide shut
        const d = Math.min(1.0, elapsedClose / closeDuration)
        // openProgress goes from 1.0 to 0.0
        openProgress = 1.0 - d * d * (3 - 2 * d)
        currentEmissive = 0.12 * d
      } else if (doorTriggered && doorTriggerTime.current > 0) {
        // Doors are either scanning or opening
        const elapsed = state.clock.getElapsedTime() - doorTriggerTime.current
        
        if (elapsed < 0.3) {
          // Phase 1: Security Authorization Scan (0.3s duration)
          // Pulse the cyan emissive intensity rapidly to show activation
          openProgress = 0.0
          currentEmissive = 0.12 + 0.68 * Math.sin(elapsed * Math.PI * 6.0)
        } else {
          // Phase 2: Slide doors open (0.5s duration, total 0.8s)
          const openElapsed = elapsed - 0.3
          const openDuration = 0.5
          const d = Math.min(1.0, openElapsed / openDuration)
          openProgress = d * d * (3 - 2 * d) // Cubic smoothstep ease
          // Fade emissive glow back down to 0 as doors open
          currentEmissive = 0.12 * (1.0 - openProgress)
        }
      } else {
        openProgress = 0.0
        currentEmissive = 0.12
      }
    } else if (view === 'showroom') {
      openProgress = 0.0 // Keep fully closed in showroom mode to seal the entrance
      currentEmissive = 0.12
    }

    // Direct Y-rotation translations for curved doors
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = 0.436 * openProgress
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = -0.436 * openProgress
    }

    // Apply emissive intensity to the door glass materials
    if (leftDoorMatRef.current) {
      leftDoorMatRef.current.emissiveIntensity = currentEmissive
    }
    if (rightDoorMatRef.current) {
      rightDoorMatRef.current.emissiveIntensity = currentEmissive
    }
  })

  return (
    <group ref={groupRef}>

      {/* ── Polished Floor with Reflections (Clean White Theme) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -tableHeight, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          resolution={1024}
          mixBlur={1.0}
          mixStrength={3.0}
          roughness={0.05}
          depthScale={1.0}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.4}
          color="#fafafa" // Glossy clean white floor
          metalness={0.9} // Extremely glossy/reflective
        />
      </mesh>

      {/* ── Pedestal Stage Base (premium silver metal disc) ── */}
      <mesh position={[0, -tableHeight + 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.04, 64]} />
        <meshStandardMaterial
          color="#cbd5e1"  // Premium silver stage
          metalness={0.9}
          roughness={0.08}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* ── Enclosed Futuristic Curved Wall (Single digital panel wrapping 310 degrees) ── */}
      <mesh position={[0, wallY, 0]} receiveShadow>
        <cylinderGeometry args={[8.0, 8.0, wallHeight, 64, 1, true, 2.006, 5.410]} />
        <shaderMaterial
          ref={(el) => { if (el) wallMaterialsRef.current.add(el) }}
          uniforms={{ 
            uTime: { value: 0 },
            uFade: { value: 0 }
          }}
          vertexShader={DigitalWallShader.vertexShader}
          fragmentShader={DigitalWallShader.fragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Outer Shell Cylinder (Titanium space pod texture wrapping 310 degrees) ── */}
      <mesh position={[0, wallY, 0]} receiveShadow>
        <cylinderGeometry args={[8.08, 8.08, wallHeight, 64, 1, true, 2.006, 5.410]} />
        <meshStandardMaterial
          color="#e2e8f0" // Titanium white/light gray
          metalness={0.85}
          roughness={0.18}
          side={THREE.BackSide} // Only visible from the outside
        />
      </mesh>

      {/* ── Shelter Curved Ceiling/Roof (full 360-degree circle) ── */}
      <mesh position={[0, ceilingY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[8.0, 64]} />
        <meshStandardMaterial
          color="#f8fafc" // Bright clean ceiling
          metalness={0.8}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Outer Ceiling Cap (full 360-degree circle) ── */}
      <mesh position={[0, ceilingY + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.08, 64]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* ── Outer Floor Cap (full 360-degree circle) ── */}
      <mesh position={[0, -tableHeight - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.08, 64]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* ── Top Outer Glowing Neon Ring (full 360-degree ring) ── */}
      <mesh position={[0, ceilingY + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.08, 8.12, 64]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Bottom Outer Glowing Neon Ring (full 360-degree ring) ── */}
      <mesh position={[0, -tableHeight - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.08, 8.12, 64]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Solid 3D Metallic Door Frames / Jambs (bridges inner/outer shell gap) ── */}
      {/* Left Frame Box */}
      <mesh ref={leftStripRef} position={[-3.38, wallY, 7.25]}>
        <boxGeometry args={[0.15, wallHeight, 0.12]} />
        <meshStandardMaterial 
          color="#cbd5e1" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Right Frame Box */}
      <mesh ref={rightStripRef} position={[3.38, wallY, 7.25]}>
        <boxGeometry args={[0.15, wallHeight, 0.12]} />
        <meshStandardMaterial 
          color="#cbd5e1" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Curved Top Neon Framing Ring (full 360-degree ring) ── */}
      <mesh position={[0, ceilingY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.96, 8.0, 64]} />
        <meshBasicMaterial 
          color="#ffffff" // White glowing ring
          toneMapped={false} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Automatic Sliding Store Doors at Z = 8.0 (Curved Doors) ── */}
      {/* Left Sliding Door Group */}
      <group ref={leftDoorRef} position={[0, 0, 0]}>
        {/* Tinted glass pane */}
        <mesh position={[0, wallY, 0]}>
          <cylinderGeometry args={[8.04, 8.04, wallHeight, 32, 1, true, 1.57, 0.436]} />
          <meshStandardMaterial
            ref={leftDoorMatRef}
            color="#f1f5f9"
            emissive="#ffffff"
            emissiveIntensity={0.12}
            roughness={0.15}
            metalness={0.9}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Metal frame borders at the edges */}
        {/* Right edge bar (at 90 degrees) */}
        <mesh position={[0, wallY, 8.04]}>
          <boxGeometry args={[0.1, wallHeight, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Left edge bar (at 115 degrees) */}
        <mesh position={[-3.40, wallY, 7.29]} rotation={[0, 0.436, 0]}>
          <boxGeometry args={[0.1, wallHeight, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Soft white edge glows */}
        <mesh position={[0, wallY, 8.06]}>
          <planeGeometry args={[0.02, wallHeight]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh position={[-3.42, wallY, 7.31]} rotation={[0, 0.436, 0]}>
          <planeGeometry args={[0.02, wallHeight]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>

      {/* Right Sliding Door Group */}
      <group ref={rightDoorRef} position={[0, 0, 0]}>
        {/* Tinted glass pane */}
        <mesh position={[0, wallY, 0]}>
          <cylinderGeometry args={[8.04, 8.04, wallHeight, 32, 1, true, 1.134, 0.436]} />
          <meshStandardMaterial
            ref={rightDoorMatRef}
            color="#f1f5f9"
            emissive="#ffffff"
            emissiveIntensity={0.12}
            roughness={0.15}
            metalness={0.9}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Metal frame borders at the edges */}
        {/* Left edge bar (at 90 degrees) */}
        <mesh position={[0, wallY, 8.04]}>
          <boxGeometry args={[0.1, wallHeight, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Right edge bar (at 65 degrees) */}
        <mesh position={[3.40, wallY, 7.29]} rotation={[0, -0.436, 0]}>
          <boxGeometry args={[0.1, wallHeight, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Soft white edge glows */}
        <mesh position={[0, wallY, 8.06]}>
          <planeGeometry args={[0.02, wallHeight]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh position={[3.42, wallY, 7.31]} rotation={[0, -0.436, 0]}>
          <planeGeometry args={[0.02, wallHeight]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>

      {/* ── Product circle base (White glowing glass disc on the table) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[2.0, 128]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={0.35}
          metalness={0.9} 
          roughness={0.05} 
        />
      </mesh>

      {/* ── Table GLB model (sits on the platform, phone on top) ── */}
      <primitive object={scene} position={[0, 0, 0]} />

    </group>
  )
}

useGLTF.preload('/models/tabel.glb')

