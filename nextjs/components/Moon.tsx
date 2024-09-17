import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MoonProps {
  scale?: number;
  position?: [number, number, number];
}

export function Moon({ scale = 0.03, position = [0, 0, -10] }: MoonProps): JSX.Element {
  const moonRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/moon/scene.gltf');

  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.05; // Moon's rotation
    }
  });

  return (
    <group ref={moonRef} position={position} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/moon/scene.gltf');