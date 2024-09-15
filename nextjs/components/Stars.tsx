import React, { useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';

// Interface for Star component props
interface StarProps {
  position: [number, number, number];
  size?: number;
}

// Star component
const Star: React.FC<StarProps> = React.memo(({ position, size = 0.05 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Memoize the segments calculation
  const segments = useMemo(() => Math.floor(Math.random() * 11) + 6, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Main star circle */}
      <mesh position={[0, 0, -0.001]}>
        <circleGeometry args={[size, segments]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[size * 0.9, size * 1.1, segments]} />
        <meshBasicMaterial color="#000033" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});

// Interface for Stars component props
interface StarsProps {
  count?: number;
  spread?: number;
}

// Stars component
export const Stars: React.FC<StarsProps> = ({ count = 200, spread = 20 }) => {
  // Generate star positions
  const starPositions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
    ] as [number, number, number]);
  }, [count, spread]);

  // Memoize star size calculation
  const getStarSize = useCallback(() => Math.random() * 0.05 + 0.02, []);

  return (
    <>
      {starPositions.map((pos, index) => (
        <Star key={index} position={pos} size={getStarSize()} />
      ))}
    </>
  );
};