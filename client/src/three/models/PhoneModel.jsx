import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function PhoneModel({ color = 'titanium-gray' }) {
  const meshRef = useRef();

  // Gentle rotation over time
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Simple color mapping
  const getColorHex = (name) => {
    switch (name) {
      case 'titanium-gray': return '#8a8f9f';
      case 'titanium-black': return '#121216';
      case 'titanium-violet': return '#4b3f72';
      case 'titanium-yellow': return '#e0c068';
      default: return '#8a8f9f';
    }
  };

  return (
    <group ref={meshRef} scale={[1.2, 1.2, 1.2]}>
      {/* Phone Body/Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.2, 0.15]} />
        <meshStandardMaterial 
          color={getColorHex(color)} 
          metalness={0.9} 
          roughness={0.15} 
        />
      </mesh>

      {/* Screen Front Face */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.5, 3.1]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.05} 
          metalness={0.9} 
          emissive="#2d62ff"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Camera Module Back Face */}
      <group position={[-0.4, 0.9, -0.09]}>
        {/* Module Plate */}
        <mesh>
          <boxGeometry args={[0.5, 0.8, 0.05]} />
          <meshStandardMaterial color="#0f0f12" roughness={0.3} />
        </mesh>
        {/* Lenses */}
        <mesh position={[0, 0.2, -0.03]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.01} />
        </mesh>
        <mesh position={[0, -0.2, -0.03]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.01} />
        </mesh>
      </group>
    </group>
  );
}

export default PhoneModel;
