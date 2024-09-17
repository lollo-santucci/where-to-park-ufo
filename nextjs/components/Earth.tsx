import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface EarthProps {
  scale?: number;
  position?: [number, number, number];
}

export function Earth({ scale = 0.5, position = [0, 0, -10] }: EarthProps): JSX.Element {
  const earthRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/earth/scene.gltf');

  useEffect(() => {
    if (earthRef.current) {
      earthRef.current.rotation.x = THREE.MathUtils.degToRad(23.5); // Earth's axial tilt
    }
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1; // Earth's rotation
    }
  });

  return (
    <group ref={earthRef} position={position} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/earth/scene.gltf');
