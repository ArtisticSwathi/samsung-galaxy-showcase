import { useRef } from 'react'

export default function Lighting() {
  const spotlightRef = useRef()

  return (
    <group>
      {/* 1. Low ambient light for soft cinematic shadow details */}
      <ambientLight intensity={0.15} />

      {/* 2. Key Shadow Light (Crisp directional light casting shadows onto the reflective floor) */}
      <directionalLight
        position={[2, 6, 2.5]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={12}
        shadow-camera-left={-25}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0002}
      />

      {/* 3. Crisp High-End Studio Spotlight (Centered on the phone centerpiece) */}
      <spotLight
        ref={spotlightRef}
        position={[0.5, 3.8, 2.5]}
        target-position={[0, 0.15, 0]}
        intensity={8.0}
        angle={Math.PI / 6.5}
        penumbra={0.65}
        castShadow
        color="#ffffff"
        shadow-bias={-0.0001}
      />

      {/* 4. Peach/Orange Ambient Fill Light (Left-side reflection reflecting background color) */}
      <pointLight
        position={[-2.8, 0.4, 0.8]}
        color="#fed7aa" // Peach orange
        intensity={6.0}
        distance={7}
        decay={1.6}
      />

      {/* 5. Sky Blue / Cyan Rim Accent Light (Right-side/rear reflection reflecting background color) */}
      <pointLight
        position={[2.5, 0.8, -1.2]}
        color="#38bdf8" // Sky blue
        intensity={8.5}
        distance={8}
        decay={1.5}
      />
      
      {/* 6. Base under-glow point light projecting upwards */}
      <pointLight
        position={[0, -0.22, 0]}
        color="#22d3ee" // Cyan
        intensity={4.0}
        distance={2.5}
        decay={2.0}
      />
    </group>
  )
}
