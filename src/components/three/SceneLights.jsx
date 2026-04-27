// ================================
// Three.js — Scene Lights
// ================================

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SceneLights({ animate = false }) {
  const pointRef = useRef()

  useFrame(({ clock }) => {
    if (animate && pointRef.current) {
      const t = clock.elapsedTime
      pointRef.current.position.x = Math.sin(t * 0.5) * 3
      pointRef.current.position.z = Math.cos(t * 0.5) * 3
    }
  })

  return (
    <>
      {/* Ambient base light */}
      <ambientLight intensity={0.4} color="#c0d8ff" />

      {/* Key light — cool blue from front-left */}
      <directionalLight
        position={[-4, 6, 4]}
        intensity={1.5}
        color="#00d4ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Fill light — purple from right */}
      <directionalLight
        position={[4, 2, -4]}
        intensity={0.8}
        color="#7c3aed"
      />

      {/* Rim / backlight */}
      <directionalLight
        position={[0, -3, -4]}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Orbiting point light */}
      <pointLight
        ref={pointRef}
        position={[2, 2, 2]}
        intensity={2}
        color="#00d4ff"
        distance={10}
        decay={2}
      />

      {/* Ground bounce */}
      <pointLight
        position={[0, -3, 0]}
        intensity={0.6}
        color="#1a0533"
        distance={6}
      />
    </>
  )
}
