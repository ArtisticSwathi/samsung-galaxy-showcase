import React from 'react';
import PhoneModel from '../models/PhoneModel';

function ConfiguratorScene({ color = 'titanium-gray' }) {
  return (
    <group>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      <PhoneModel color={color} />
      
      {/* Floor Shadow Grid */}
      <gridHelper args={[30, 30, '#535661', '#1c1c28']} position={[0, -2, 0]} />
    </group>
  );
}

export default ConfiguratorScene;
