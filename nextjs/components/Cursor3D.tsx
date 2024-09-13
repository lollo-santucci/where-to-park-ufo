import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MAX_Z_POSITION = 8
const SCALE_FACTOR = 0.5
const CURSOR_OFFSET = { x: -0.1, y: -1.5 }
const ROTATION_FACTOR = 0.2
const ANIMATION_DURATION = 2000

const Cursor3D: React.FC = () => {
  const { viewport, camera } = useThree()
  const cursorGroup = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Object3D>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  const [targetZPosition, setTargetZPosition] = useState(0)
  const [currentZPosition, setCurrentZPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  
  const { scene } = useGLTF('/models/ufo/scene.gltf')
  
  const handleWheel = useCallback((event: WheelEvent) => {
    setTargetZPosition(prev => 
      Math.max(-MAX_Z_POSITION, Math.min(MAX_Z_POSITION, prev - event.deltaY * 0.01))
    )
  }, [])
  
  const handleClick = useCallback(() => {
    setIsAnimating(true)
  }, [])
  
  useEffect(() => {
    window.addEventListener('wheel', handleWheel)
    window.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('click', handleClick)
    }
  }, [handleWheel, handleClick])

  useFrame(({ pointer, clock }) => {
    if (!cursorGroup.current || !modelRef.current || !lightRef.current) return

    const zDiff = targetZPosition - currentZPosition
    setCurrentZPosition(prev => 
      Math.max(-MAX_Z_POSITION, Math.min(MAX_Z_POSITION, prev + zDiff * 0.1))
    )
    
    const depthScaleFactor = Math.abs(camera.position.z - currentZPosition) / camera.position.z
    const x = (pointer.x * viewport.width) / 2 * depthScaleFactor
    const y = (pointer.y * viewport.height) / 2 * depthScaleFactor
    
    cursorGroup.current.position.set(x + CURSOR_OFFSET.x, y + CURSOR_OFFSET.y, currentZPosition)
    cursorGroup.current.rotation.x = -pointer.y * ROTATION_FACTOR
    cursorGroup.current.rotation.y = pointer.x * ROTATION_FACTOR
    
    lightRef.current.position.set(0, 2, 0)
    
    if (isAnimating) {
      modelRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 5) * 0.2
      
      if (!animationRef.current) {
        animationRef.current = window.setTimeout(() => {
          setIsAnimating(false)
          animationRef.current = null
        }, ANIMATION_DURATION)
      }
    }
  })

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.clearTimeout(animationRef.current)
      }
    }
  }, [])

  return (
    <group ref={cursorGroup}>
      <primitive object={scene} ref={modelRef} scale={SCALE_FACTOR} />
      <pointLight
        ref={lightRef}
        intensity={2}
        distance={10}
        color="white"
        castShadow
      />
    </group>
  )
}

useGLTF.preload('/models/ufo/scene.gltf')

export default Cursor3D