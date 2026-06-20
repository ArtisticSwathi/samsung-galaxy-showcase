import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

export default function ShowroomEnvironment({ revealed }) {
  const { scene } = useGLTF('/models/tabel.glb')
  const groupRef  = useRef()
  const tweenRef  = useRef(null)

  // White futuristic emissive materials on the table GLB
  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.color             = new THREE.Color('#d8e8ff')
          child.material.metalness         = 0.85
          child.material.roughness         = 0.08
     
          child.material.emissiveIntensity = 0.3
          child.material.needsUpdate       = true
        }
      }
    })

    // Table at 1.6 units — prominent but phone still hero
// Table at a larger uniform size (scaled equally from all sides)
    const box = new THREE.Box3().setFromObject(scene)
    const sz  = new THREE.Vector3()
    box.getSize(sz)
    const maxDim = Math.max(sz.x, sz.y, sz.z)
    
if (maxDim > 0) {
      // 4.8 is the exact width between your light beams!
      scene.scale.set(4.8 / maxDim, 4.8 / maxDim, 4.8 / maxDim)
    }

    // Top of table at y = 0
    const lb = new THREE.Box3().setFromObject(scene)
    const c  = new THREE.Vector3()
    lb.getCenter(c)
    scene.position.set(-c.x, -lb.max.y, -c.z)
  }, [scene])

  // Reveal animation
  useEffect(() => {
    if (!groupRef.current) return
    if (tweenRef.current) tweenRef.current.kill()

    if (revealed) {
      gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
      tweenRef.current = gsap.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1, duration: 0.5, ease: 'power2.out',
      })
    } else {
      gsap.set(groupRef.current.scale, { x: 0, y: 0, z: 0 })
    }

    return () => { if (tweenRef.current) tweenRef.current.kill() }
  }, [revealed])

  return (
    <group ref={groupRef}>

      {/* ── Large metallic platform / stage ── */}
      {/* Main stage surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
     
        <meshStandardMaterial
          color="#8090aa"
          metalness={0.92}
          roughness={0.12}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* Stage raised lip / edge — gives it physical thickness */}
      <mesh position={[0, -0.035, 0]} receiveShadow castShadow>

      </mesh>



  {/* ── Product circle base (dark disc where phone sits) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        {/* Changed 0.32 to 2.4 so it perfectly touches the light beams */}
        <circleGeometry args={[2.4, 128]} />
        <meshStandardMaterial color="#f3f3f3" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Table GLB model (sits on the platform, phone on top) ── */}
      <primitive object={scene} position={[0, 0, 0]} />



    </group>
  )
}

useGLTF.preload('/models/tabel.glb')
