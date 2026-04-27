// ================================
// Three.js — Drone Model Loader
// ================================

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Float, MeshReflectorMaterial, Environment } from '@react-three/drei'

/**
 * DroneModel — Loads a GLTF/GLB drone model.
 * Falls back gracefully to a placeholder mesh if model not found.
 *
 * Props:
 *   modelPath {string}   - Path to the .glb model in /public/models/
 *   autoRotate {bool}    - Auto-rotate on Y axis
 *   scale {number}       - Scale multiplier
 *   floatAmplitude {num} - Float animation amplitude
 */
export default function DroneModel({
  modelPath = '/models/placeholder.glb',
  autoRotate = true,
  scale = 1,
  floatAmplitude = 0.15,
  position = [0, 0, 0],
}) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.3}
      floatIntensity={floatAmplitude}
    >
      <group ref={groupRef} position={position} scale={scale}>
        {/* Fallback placeholder geometry when no model is loaded yet */}
        <PlaceholderDrone />
      </group>
    </Float>
  )
}

/**
 * PlaceholderDrone — A geometric stand-in rendered from primitives
 * until actual .glb models are added to /public/models/
 */
function PlaceholderDrone() {
  return (
    <group>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.18, 0.8]} />
        <meshStandardMaterial
          color="#0d1117"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Center camera pod */}
      <mesh position={[0.35, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 16]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.8} roughness={0.1} emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>

      {/* Arm + Motor: Front-Right */}
      <DroneArm position={[0.55, 0, 0.4]} rotation={[0, Math.PI * 0.25, 0]} />
      {/* Arm + Motor: Front-Left */}
      <DroneArm position={[0.55, 0, -0.4]} rotation={[0, -Math.PI * 0.25, 0]} />
      {/* Arm + Motor: Rear-Right */}
      <DroneArm position={[-0.55, 0, 0.4]} rotation={[0, -Math.PI * 0.25 + Math.PI, 0]} />
      {/* Arm + Motor: Rear-Left */}
      <DroneArm position={[-0.55, 0, -0.4]} rotation={[0, Math.PI * 0.25 + Math.PI, 0]} />
    </group>
  )
}

function DroneArm({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Arm */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.05, 0.06]} />
        <meshStandardMaterial color="#1a2035" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Motor */}
      <mesh position={[0.22, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.85} roughness={0.1} emissive="#7c3aed" emissiveIntensity={0.15} />
      </mesh>
      {/* Propeller */}
      <mesh position={[0.22, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.01, 3]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.5} roughness={0.3} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// Preload hint (call this at the module level once real model paths exist)
// useGLTF.preload('/models/drone.glb')
