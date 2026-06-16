import React from 'react';
import { Center, Float } from '@react-three/drei';

function RevealScene() {
  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[-5, 5, 5]} intensity={1} />
      <pointLight position={[0, -2, 2]} intensity={1.5} color="#00f0ff" />
      
      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.5}>
        <Center>
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.05} />
          </mesh>
        </Center>
      </Float>
    </group>
  );
}

export default RevealScene;
