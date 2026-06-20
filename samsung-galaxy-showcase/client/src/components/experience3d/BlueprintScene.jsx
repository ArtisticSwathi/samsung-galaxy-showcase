import { Sparkles, Stars } from '@react-three/drei'

export default function BlueprintScene() {
  return (
    <group>
      {/* 1. ANIMATED DEEP STARFIELD */}
      {/* radius is reduced to 35 to bring stars closer, factor increased to 8 for larger bright points */}
      <Stars 
        radius={35} 
        depth={60} 
        count={2000} 
        factor={8} 
        saturation={0.2} 
        fade 
        speed={1.2} // Gentle continuous rotation animation
      />

      {/* 2. GLOWING FLOATING SPACE DUST (Sparkles shimmer and float in foreground) */}
      {/* Layer A: High-opacity white sparkles drifting near the camera */}
      <Sparkles
        count={150}
        scale={10}
        size={3.0}
        speed={0.3}
        color="#ffffff"
        opacity={0.8}
      />

      {/* Layer B: Cyan/Ice-blue sparkles for galactic ambient depth */}
      <Sparkles
        count={80}
        scale={14}
        size={4.0}
        speed={0.2}
        color="#22d3ee" // Cyan
        opacity={0.6}
      />

      {/* Layer C: Faint purple sparkles for nebula depth */}
      <Sparkles
        count={50}
        scale={12}
        size={2.5}
        speed={0.15}
        color="#a855f7" // Purple
        opacity={0.4}
      />
    </group>
  )
}
