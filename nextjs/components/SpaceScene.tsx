'use client';

import { Canvas } from '@react-three/fiber'
import { Stars } from "@/components/Stars"
import Cursor3D from '@/components/Cursor3D'
import { EarthSystem } from '@/components/EarthSystem';
import Asteroid from '@/components/Asteroid'

export function SpaceScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1F3847' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <directionalLight 
          position={[-5, 5, 0]} 
          intensity={1} 
          color="#FFFFFF" 
        />
        <Stars/>
        <EarthSystem/>
        <Cursor3D/>
      </Canvas>
    </div>
  )
}