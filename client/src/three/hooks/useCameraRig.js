import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function useCameraRig(targetPosition, targetLookAt, speed = 0.05) {
  const { camera } = useThree();
  const currentTarget = new THREE.Vector3();

  useFrame(() => {
    // Smoothly interpolate position
    if (targetPosition) {
      camera.position.lerp(new THREE.Vector3(...targetPosition), speed);
    }

    // Smoothly interpolate lookAt target
    if (targetLookAt) {
      currentTarget.lerp(new THREE.Vector3(...targetLookAt), speed);
      camera.lookAt(currentTarget);
    }
  });
}
export default useCameraRig;
