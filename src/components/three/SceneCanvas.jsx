// ================================
// Three.js — Scene Canvas
// ================================

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, AdaptiveDpr } from '@react-three/drei'
import SceneLights from './SceneLights'
import styles from './SceneCanvas.module.css'

/**
 * SceneCanvas — Base R3F canvas wrapper
 * Wrap any 3D content as children.
 *
 * Props:
 *   orbit {bool}         - Enable orbit controls
 *   stars {bool}         - Render starfield background
 *   className {string}   - Additional CSS class
 *   height {string}      - Canvas height
 *   animateLights {bool} - Animate the scene lights
 */
export default function SceneCanvas({
  children,
  orbit = false,
  stars = true,
  className = '',
  height = '100%',
  animateLights = false,
  autoRotate = false,
}) {
  return (
    <div className={`${styles.canvasWrapper} ${className}`} style={{ height }}>
      <Canvas
        camera={{ fov: 50, position: [0, 0, 5], near: 0.1, far: 100 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Performance */}
        <AdaptiveDpr pixelated />

        {/* Lighting */}
        <SceneLights animate={animateLights} />

        {/* Environment map for reflections */}
        <Environment preset="city" />

        {/* Starfield */}
        {stars && (
          <Stars
            radius={80}
            depth={50}
            count={3000}
            factor={3}
            saturation={0.5}
            fade
            speed={0.5}
          />
        )}

        {/* Orbit Controls */}
        {orbit && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={12}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
          />
        )}

        {/* Scene children (models, meshes, etc.) */}
        {children}
      </Canvas>
    </div>
  )
}
