import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function PhoneModel({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/samsung_s23_ultra_free.glb')

  useEffect(() => {
    if (scene) {
      // 1. Refine materials for metallic reflections
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          if (child.material) {
            child.material.roughness = THREE.MathUtils.clamp(child.material.roughness * 0.8, 0.1, 0.6)
            child.material.metalness = THREE.MathUtils.clamp(child.material.metalness * 1.1, 0.5, 1.0)
            child.material.envMapIntensity = 1.5
          }
        }
      })

      // 2. Normalize scale: force the phone to be exactly 0.42 units tall/wide
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const targetScale = 0.42 / maxDim
        scene.scale.set(targetScale, targetScale, targetScale)
      }

      // 3. Center X/Z and align bottom edge to local y = 0
      const localBox = new THREE.Box3().setFromObject(scene)
      const center = new THREE.Vector3()
      localBox.getCenter(center)
      scene.position.set(-center.x, -localBox.min.y, -center.z)
    }
  }, [scene])

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/samsung_s23_ultra_free.glb')

