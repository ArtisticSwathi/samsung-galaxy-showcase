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
      
      // 1. Futuristic clean white digital background
      vec3 colorBg = vec3(0.97, 0.98, 0.99); // Crisp white
      vec3 colorGlow = vec3(0.94, 0.96, 0.98); // Very soft cool grey/blue
      
      // Dynamic moving ambient lighting wash (slow and smooth, no blobs)
      float wash = sin(uv.x * 1.5 + uTime * 0.1) * cos(uv.y * 1.5 - uTime * 0.08) * 0.5 + 0.5;
      vec3 finalColor = mix(colorBg, colorGlow, wash * 0.6);
      
      // 2. Extremely clean and thin digital tech grid
      float gridX = sin(uv.x * 24.0) * 0.5 + 0.5;
      gridX = smoothstep(0.98, 0.995, gridX);
      
      float gridY = sin(uv.y * 16.0) * 0.5 + 0.5;
      gridY = smoothstep(0.98, 0.995, gridY);
      
      float gridMask = clamp(gridX + gridY, 0.0, 1.0);
      finalColor = mix(finalColor, vec3(0.85, 0.88, 0.92), gridMask * 0.35);
      
      // 3. Cyber laser light sweep
      float sweep = sin(uv.y * 2.2 - uTime * 0.3) * 0.5 + 0.5;
      sweep = pow(sweep, 6.0); // Soft glowing band
      finalColor = mix(finalColor, vec3(0.75, 0.9, 0.98), sweep * 0.18);
      
      // Soft vignette
      float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
      vignette = pow(vignette, 0.3);
      finalColor *= mix(0.94, 1.0, vignette);
      
      gl_FragColor = vec4(finalColor * uFade, 1.0);
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

  // Dimensions of walls (expanded for a spacious, luxurious flagship showroom)
  const wallHeight = 5.5
  const wallY = -tableHeight + wallHeight / 2
  const ceilingY = -tableHeight + wallHeight

  // White futuristic emissive materials on the table GLB
  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.color             = new THREE.Color('#eef5ff')
          child.material.metalness         = 0.5
          child.material.roughness         = 0.1
          child.material.emissiveIntensity = 0.1
          child.material.transparent = false
          child.material.opacity = 1.0
        }
      }
    })

    // Bounding scale table model
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    
    if (maxDim > 0) {
      scene.scale.set(4.8 / maxDim, 4.8 / maxDim, 4.8 / maxDim)
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

  // Update wall uTime
  useFrame((state) => {
    wallMaterialsRef.current.forEach((mat) => {
      if (mat && mat.uniforms) {
        mat.uniforms.uTime.value = state.clock.getElapsedTime()
        if (mat.uniforms.uFade) {
          mat.uniforms.uFade.value = 1.0
        }
      }
    })
  })

  return (
    <group ref={groupRef}>

      {/* ── Polished Floor with Reflections (White Theme - Expanded) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -tableHeight, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          resolution={1024}
          mixBlur={1.0}
          mixStrength={3.0}
          roughness={0.08}
          depthScale={1.0}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.4}
          color="#f8fafc" // Polished white floor
          metalness={0.2} // Subtle glossy reflections
        />
      </mesh>

      {/* ── Pedestal Stage Base (sitting on floor - Expanded White/Silver Theme) ── */}
      <mesh position={[0, -tableHeight + 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.0, 3.0, 0.04, 64]} />
        <meshStandardMaterial
          color="#e2e8f0" // Soft white/grey pedestal
          metalness={0.25}
          roughness={0.12}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* ── Enclosed Futuristic Curved Wall (Single digital panel wrapping 230 degrees) ── */}
      <mesh position={[0, wallY, 0]} receiveShadow>
        <cylinderGeometry args={[8.0, 8.0, wallHeight, 64, 1, true, 2.705, 4.01]} />
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

      {/* ── Shelter Curved Ceiling/Roof (matching the 230-degree sector) ── */}
      <mesh position={[0, ceilingY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[8.0, 64, 2.705, 4.01]} />
        <meshStandardMaterial
          color="#f8fafc" // White roof ceiling
          metalness={0.1}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Neon Border Framing Light Strips (Soft ice blue / white accents) ── */}
      {/* Left Terminal Vertical strip */}
      <mesh ref={leftStripRef} position={[-7.25, wallY, 3.38]}>
        <planeGeometry args={[0.08, wallHeight]} />
        <meshBasicMaterial 
          color="#bae6fd" 
          toneMapped={false} 
        />
      </mesh>

      {/* Right Terminal Vertical strip */}
      <mesh ref={rightStripRef} position={[7.25, wallY, 3.38]}>
        <planeGeometry args={[0.08, wallHeight]} />
        <meshBasicMaterial 
          color="#bae6fd" 
          toneMapped={false} 
        />
      </mesh>

      {/* Curved Top Neon Framing Ring */}
      <mesh position={[0, ceilingY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.96, 8.0, 64, 1, 2.705, 4.01]} />
        <meshBasicMaterial 
          color="#ffffff" 
          toneMapped={false} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Product circle base (White Glass disc on the table - Scaled down to match phone) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[2.0, 128]} />
        <meshStandardMaterial 
          color="#f8fafc" 
          metalness={0.3} 
          roughness={0.05} 
        />
      </mesh>

      {/* ── Table GLB model (sits on the platform, phone on top) ── */}
      <primitive object={scene} position={[0, 0, 0]} />

    </group>
  )
}

useGLTF.preload('/models/tabel.glb')

