import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

// Procedural Frame Component
function Frame({ visible, scale = [1, 1, 1] }) {
  if (!visible) return null
  return (
    <group scale={scale}>
      {/* Center Body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1, 0.2, 2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>
      
      {/* Arms (X config) */}
      <mesh position={[1, 0.1, 1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[-1, 0.1, 1]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[1, 0.1, -1]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[-1, 0.1, -1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
    </group>
  )
}

// Procedural Motor Component
function Motor({ position, visible, onClick, ghost, scale = [1, 1, 1] }) {
  if (!visible && !ghost) return null
  
  return (
    <group position={position} scale={scale}>
      <mesh 
        onClick={ghost ? onClick : undefined}
        onPointerOver={ghost ? (e) => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={ghost ? (e) => (document.body.style.cursor = 'auto') : undefined}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
        {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        )}
      </mesh>
    </group>
  )
}

// Procedural ESC Component
function ESC({ visible, onClick, ghost, scale = [1, 1, 1] }) {
  if (!visible && !ghost) return null
  
  return (
    <group position={[0, 0.3, 0]} scale={scale}>
      <mesh 
        onClick={ghost ? onClick : undefined}
        onPointerOver={ghost ? (e) => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={ghost ? (e) => (document.body.style.cursor = 'auto') : undefined}
      >
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.6} />
        )}
      </mesh>
    </group>
  )
}

// Procedural FC Component
function FC({ visible, onClick, ghost, scale = [1, 1, 1] }) {
  if (!visible && !ghost) return null
  
  return (
    <group position={[0, 0.5, 0]} scale={scale}>
      <mesh 
        onClick={ghost ? onClick : undefined}
        onPointerOver={ghost ? (e) => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={ghost ? (e) => (document.body.style.cursor = 'auto') : undefined}
      >
        <boxGeometry args={[0.7, 0.05, 0.7]} />
        {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#8b0000" metalness={0.3} roughness={0.8} />
        )}
      </mesh>
    </group>
  )
}

export default function DroneScene({ parts, onAttach }) {
  return (
    <Canvas camera={{ position: [4, 4, 4], fov: 40 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      
      {/* 3D Environment Helpers */}
      <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.6, 0]} />
      <axesHelper args={[5]} position={[0, -0.59, 0]} />

      <group position={[0, -0.5, 0]}>
        {/* Frame */}
        <Frame visible={parts.frame} />
        
        {/* Motors (Only show ghost if frame is attached and motor is NOT attached) */}
        <Motor 
          position={[1.5, 0.35, 1.5]} 
          visible={parts.m1} 
          ghost={parts.frame && !parts.m1} 
          onClick={() => onAttach('m1')} 
        />
        <Motor 
          position={[-1.5, 0.35, 1.5]} 
          visible={parts.m2} 
          ghost={parts.frame && !parts.m2} 
          onClick={() => onAttach('m2')} 
        />
        <Motor 
          position={[-1.5, 0.35, -1.5]} 
          visible={parts.m3} 
          ghost={parts.frame && !parts.m3} 
          onClick={() => onAttach('m3')} 
        />
        <Motor 
          position={[1.5, 0.35, -1.5]} 
          visible={parts.m4} 
          ghost={parts.frame && !parts.m4} 
          onClick={() => onAttach('m4')} 
        />

        {/* ESC (Ghost if frame attached, but ESC not attached) */}
        <ESC 
          visible={parts.esc} 
          ghost={parts.frame && !parts.esc} 
          onClick={() => onAttach('esc')} 
        />

        {/* FC (Ghost if ESC attached, but FC not attached) */}
        <FC 
          visible={parts.fc} 
          ghost={parts.esc && !parts.fc} 
          onClick={() => onAttach('fc')} 
        />
      </group>

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
    </Canvas>
  )
}
