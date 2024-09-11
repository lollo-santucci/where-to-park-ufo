'use client';

import { Canvas } from '@react-three/fiber'
import { Stars } from "@/components/Stars"
import { OrbitControls } from '@react-three/drei';

export function SpaceScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1A3546' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Stars/>
        {/*<OrbitControls/>*/}
      </Canvas>
    </div>
  )
}