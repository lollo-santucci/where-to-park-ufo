import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'

interface StarProps {
  position: [number, number, number]
  size?: number
}

export function Star({ position, size = 0.05 }: StarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const segments = Math.floor(Math.random() * (16 - 6 + 1)) + 6

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, -0.001]}>
        <circleGeometry args={[size, segments]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[size * 0.9, size * 1.1, segments]} />
        <meshBasicMaterial color="#000033" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function Stars() {
  const stars = useMemo(() => {
    const temp: [number, number, number][] = []
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 20
      const z = (Math.random() - 0.5) * 20
      temp.push([x, y, z])
    }
    return temp
  }, [])

  return (
    <>
      {stars.map((pos, index) => (
        <Star key={index} position={pos} size={Math.random() * 0.05 + 0.02} />
      ))}
    </>
  )
}