import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, Suspense } from 'react'
import * as THREE from 'three'

// Procedural Frame Component
function Frame({ visible, scale = [1, 1, 1] }) {
  if (!visible) return null
  return (
    <group scale={scale}>
      {/* Center Body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1, 0.2, 2]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} clearcoat={0.3} />
      </mesh>
      
      {/* Arms (X config) */}
      <mesh position={[1, 0.1, 1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshPhysicalMaterial color="#111" roughness={0.5} metalness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[-1, 0.1, 1]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshPhysicalMaterial color="#111" roughness={0.5} metalness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[1, 0.1, -1]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshPhysicalMaterial color="#111" roughness={0.5} metalness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[-1, 0.1, -1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.3, 0.15, 2]} />
        <meshPhysicalMaterial color="#111" roughness={0.5} metalness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} />
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
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
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
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
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
          <meshStandardMaterial color="#cc0000" metalness={0.1} roughness={0.9} />
        )}
      </mesh>
    </group>
  )
}

// Procedural VTX Component
function VTX({ visible, onClick, ghost, scale = [1, 1, 1] }) {
  if (!visible && !ghost) return null
  
  return (
    <group position={[0, 0.65, -0.6]} scale={scale}>
      <mesh 
        onClick={ghost ? onClick : undefined}
        onPointerOver={ghost ? (e) => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={ghost ? (e) => (document.body.style.cursor = 'auto') : undefined}
      >
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.4} />
        )}
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.3, 0]}>
         <cylinderGeometry args={[0.02, 0.02, 0.4]} />
         {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshStandardMaterial color="#111" />
        )}
      </mesh>
    </group>
  )
}

// Procedural Propeller Component
function Prop({ position, visible, onClick, ghost, direction, scale = [1, 1, 1] }) {
  if (!visible && !ghost) return null
  
  return (
    <group position={position} scale={scale}>
      <mesh 
        onClick={ghost ? onClick : undefined}
        onPointerOver={ghost ? (e) => (document.body.style.cursor = 'pointer') : undefined}
        onPointerOut={ghost ? (e) => (document.body.style.cursor = 'auto') : undefined}
      >
        <cylinderGeometry args={[1.2, 1.2, 0.05, 32]} />
        {ghost ? (
          <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
        ) : (
          <meshPhysicalMaterial color="#00e5ff" transmission={0.6} opacity={1} transparent metalness={0.1} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
        )}
      </mesh>
      {(visible || ghost) && (
        <Text
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color={ghost ? '#00ffcc' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {direction}
        </Text>
      )}
    </group>
  )
}

export default function DroneScene({ parts, onAttach, activePart }) {
  return (
    <Canvas camera={{ position: [4, 4, 4], fov: 40 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      
      {/* 3D Environment Helpers */}
      <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.6, 0]} />
      <axesHelper args={[5]} position={[0, -0.59, 0]} />

      <Suspense fallback={null}>
        <group position={[0, -0.5, 0]}>
        {/* Frame */}
        <Frame visible={parts.frame} />
        
        {/* Motors (Only show ghost if motor is selected) */}
        <Motor 
          position={[1.5, 0.35, 1.5]} 
          visible={parts.m1} 
          ghost={activePart === 'motor' && !parts.m1} 
          onClick={() => onAttach('m1')} 
        />
        <Motor 
          position={[-1.5, 0.35, 1.5]} 
          visible={parts.m2} 
          ghost={activePart === 'motor' && !parts.m2} 
          onClick={() => onAttach('m2')} 
        />
        <Motor 
          position={[-1.5, 0.35, -1.5]} 
          visible={parts.m3} 
          ghost={activePart === 'motor' && !parts.m3} 
          onClick={() => onAttach('m3')} 
        />
        <Motor 
          position={[1.5, 0.35, -1.5]} 
          visible={parts.m4} 
          ghost={activePart === 'motor' && !parts.m4} 
          onClick={() => onAttach('m4')} 
        />

        {/* ESC */}
        <ESC 
          visible={parts.esc} 
          ghost={activePart === 'esc' && !parts.esc} 
          onClick={() => onAttach('esc')} 
        />

        {/* FC */}
        <FC 
          visible={parts.fc} 
          ghost={activePart === 'fc' && !parts.fc} 
          onClick={() => onAttach('fc')} 
        />

        {/* VTX */}
        <VTX 
          visible={parts.vtx} 
          ghost={activePart === 'vtx' && !parts.vtx} 
          onClick={() => onAttach('vtx')} 
        />

        {/* Propellers */}
        {/* m1: Rear Right (CW) */}
        <Prop 
          position={[1.5, 0.6, 1.5]} 
          visible={parts.p1} 
          ghost={activePart === 'prop' && !parts.p1} 
          direction="↻ CW"
          onClick={() => onAttach('p1')} 
        />
        {/* m2: Rear Left (CCW) */}
        <Prop 
          position={[-1.5, 0.6, 1.5]} 
          visible={parts.p2} 
          ghost={activePart === 'prop' && !parts.p2} 
          direction="↺ CCW"
          onClick={() => onAttach('p2')} 
        />
        {/* m3: Front Left (CW) */}
        <Prop 
          position={[-1.5, 0.6, -1.5]} 
          visible={parts.p3} 
          ghost={activePart === 'prop' && !parts.p3} 
          direction="↻ CW"
          onClick={() => onAttach('p3')} 
        />
        {/* m4: Front Right (CCW) */}
        <Prop 
          position={[1.5, 0.6, -1.5]} 
          visible={parts.p4} 
          ghost={activePart === 'prop' && !parts.p4} 
          direction="↺ CCW"
          onClick={() => onAttach('p4')} 
        />
        </group>
      </Suspense>

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
    </Canvas>
  )
}
