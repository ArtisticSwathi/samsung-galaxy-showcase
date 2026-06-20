import { useEffect, useRef } from 'react'
import { useGLTF, Sparkles, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

export default function ShowroomEnvironment({ view }) {
  const { scene } = useGLTF('/models/tabel.glb')
  const contentRef = useRef()

  // Apply materials and normalize table scale/center
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          if (child.material) {
            child.material.metalness = 0.95
            child.material.roughness = 0.12
            child.material.color = new THREE.Color('#0a0d16') // Dark cosmic base
            child.material.envMapIntensity = 2.5
          }
        }
      })

      // Normalize scale: force table to be exactly 0.95 units wide/deep
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const targetScale = 0.95 / maxDim
        scene.scale.set(targetScale, targetScale, targetScale)
      }

      // Center the table locally and offset so the table top sits at local y = 0
      const localBox = new THREE.Box3().setFromObject(scene)
      const center = new THREE.Vector3()
      localBox.getCenter(center)
      scene.position.set(-center.x, -localBox.max.y, -center.z)
    }
  }, [scene])

  const tweenRef = useRef(null)

  // Control scale dynamically based on view to avoid mount/compile lag
  useEffect(() => {
    if (!contentRef.current) return

    if (view === 'welcome') {
      gsap.set(contentRef.current.scale, { x: 0, y: 0, z: 0 })
    } else if (view === 'guided-intro') {
      gsap.set(contentRef.current.scale, { x: 0, y: 0, z: 0 })
      if (tweenRef.current) tweenRef.current.kill()
      tweenRef.current = gsap.to(contentRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        ease: 'power2.out',
        delay: 4.0 // Starts precisely at t=4.0s (when flight ends)
      })
    } else if (view === 'showroom') {
      if (tweenRef.current) tweenRef.current.kill()
      gsap.to(contentRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: 'power2.out'
      })
    }

    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [view])

  return (
    <group>
      {/* 2. Scaled Table Content group (holographically scales up together) */}
      <group ref={contentRef}>
        {/* Reflective Ground Table Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.23, 0]} receiveShadow>
          <planeGeometry args={[22, 22]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1.0}
            mixStrength={35}
            roughness={0.12}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#060812" // Slate-dark metallic table
            metalness={0.92}
          />
        </mesh>

        {/* Table Pedestal Model */}
        <primitive 
          object={scene} 
          position={[0, -0.23, 0]} 
        />

        {/* Localized Table Sparkles */}
        <Sparkles 
          count={35} 
          scale={[1.2, 0.9, 1.2]} 
          position={[0, -0.15, 0]} 
          color="#22d3ee" 
          size={3.0} 
          speed={0.4} 
          opacity={0.65} 
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/tabel.glb')
