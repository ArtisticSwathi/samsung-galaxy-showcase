import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CameraRig() {
  useFrame((state) => {
    // state.pointer holds normalized mouse coordinates: x (-1 to 1) and y (-1 to 1)
    const { x, y } = state.pointer;
    
    // 1. Translation Parallax: camera moves in opposite direction of mouse
    // to translate stars in the direction of the mouse
    const targetX = -x * 2.5;
    const targetY = -y * 1.8;
    
    // Subtle organic floating breathing wave
    const elapsedTime = state.clock.getElapsedTime();
    const breatheX = Math.cos(elapsedTime * 0.4) * 0.12;
    const breatheY = Math.sin(elapsedTime * 0.3) * 0.12;
    
    const finalTargetX = targetX + breatheX;
    const finalTargetY = targetY + breatheY;
    const finalTargetZ = 6 + Math.sin(elapsedTime * 0.2) * 0.18; // gentle depth push/pull
    
    // Smoothly lerp camera coordinates (lerp factor 0.05 for elastic lag)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, finalTargetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, finalTargetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, finalTargetZ, 0.05);
    
    // 2. Rotation Parallax: tilt the camera's focus point toward the cursor slightly.
    // This creates a double-layered shift where closer sparkles move faster than deep background stars.
    const lookTargetX = x * 0.8;
    const lookTargetY = y * 0.6;
    
    state.camera.lookAt(lookTargetX, lookTargetY, 0);
  });
  
  return null;
}
