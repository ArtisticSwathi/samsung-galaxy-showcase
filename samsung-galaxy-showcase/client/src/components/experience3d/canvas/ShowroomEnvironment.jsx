import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function ShowroomEnvironment({ introProgressRef, view }) {
  const { scene } = useGLTF('/models/tabel.glb')
  const groupRef  = useRef()
  
  // Track table height dynamically
  const [tableHeight, setTableHeight] = useState(0.7)

  // Premium silver metallic table material
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

    // Scale table to 2.2 units max dimension — proportional pedestal for the phone
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
