import React from 'react';
import { Sparkles, Center } from '@react-three/drei';

function WelcomeScene() {
  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      
      {/* Visual background sparkles */}
      <Sparkles count={50} scale={10} size={2} speed={0.4} color="#2d62ff" />
      
      <Center>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#2d62ff" roughness={0.1} metalness={0.8} />
        </mesh>
      </Center>
    </group>
  );
}

export default WelcomeScene;
