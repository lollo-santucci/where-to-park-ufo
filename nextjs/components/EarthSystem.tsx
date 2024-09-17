import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Moon } from './Moon';

interface EarthSystemProps {
  scale?: number;
}

export function EarthSystem({ scale = 1 }: EarthSystemProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const earthOrbitRef = useRef<THREE.Group>(null);
  const moonOrbitRef = useRef<THREE.Group>(null);

  useFrame(({clock}) => {
    const time = clock.getElapsedTime()/2;
    const orbitDist = 8;
    if (moonOrbitRef.current) {
      moonOrbitRef.current.position.x = orbitDist * Math.sin(time);
      moonOrbitRef.current.position.z = orbitDist * Math.cos(time);
      moonOrbitRef.current.position.y = orbitDist * Math.cos(1 + time);
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <group ref={earthOrbitRef}>
        <group position={[13, 0, -5]}>
          <Earth scale={0.5}/>
          <group ref={moonOrbitRef}>
            <group position={[0, 0, 0]}>
              <Moon scale={0.03}/>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}