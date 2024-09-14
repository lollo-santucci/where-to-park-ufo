import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Costanti per configurare il comportamento del cursore 3D
const MAX_Z_POSITION = 8 // Posizione Z massima del cursore
const SCALE_FACTOR = 0.5 // Fattore di scala per il modello 3D
const CURSOR_OFFSET = { x: -0.1, y: -1.5 } // Offset del cursore rispetto alla posizione del puntatore
const Y_ROTATION_SPEED = 0.01 // Velocità di rotazione sull'asse Y
const X_TILT_FACTOR = 5 // Fattore di inclinazione per il movimento sull'asse X
const Z_TILT_FACTOR = 1 // Fattore di inclinazione per il movimento sull'asse Z
const SMOOTHING = 0.08 // Fattore di smussamento per i movimenti
const MAX_TILT = Math.PI / 4 // Inclinazione massima (45 gradi)

const Cursor3D: React.FC = () => {
  // Ottiene riferimenti all'ambiente Three.js
  const { viewport, camera } = useThree()

  // Riferimenti agli elementi 3D
  const cursorGroup = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Object3D>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  // Stati per gestire la posizione Z del cursore
  const [targetZPosition, setTargetZPosition] = useState(0)
  const [currentZPosition, setCurrentZPosition] = useState(0)
  
  // Riferimenti per memorizzare le posizioni precedenti
  const lastZPositionRef = useRef(0)
  const lastXPositionRef = useRef(0)
  
  // Carica il modello 3D
  const { scene } = useGLTF('/models/ufo/scene.gltf')
  
  // Gestore dell'evento della rotellina del mouse
  const handleWheel = useCallback((event: WheelEvent) => {
    setTargetZPosition(prev => 
      Math.max(-MAX_Z_POSITION, Math.min(MAX_Z_POSITION, prev - event.deltaY * 0.01))
    )
  }, [])
  
  // Configura e pulisce gli event listener
  useEffect(() => {
    window.addEventListener('wheel', handleWheel)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Aggiorna la posizione e la rotazione del cursore ad ogni frame
  useFrame(({ pointer }) => {
    if (!cursorGroup.current || !modelRef.current || !lightRef.current) return

    // Nasconde il cursore del mouse predefinito
    document.body.style.cursor = 'none'
    
    // Calcola la nuova posizione Z con smussamento
    const zDiff = targetZPosition - currentZPosition
    const newZPosition = currentZPosition + zDiff * SMOOTHING
    setCurrentZPosition(newZPosition)
    
    // Calcola la posizione del cursore 3D basata sul puntatore e sulla profondità
    const depthScaleFactor = Math.abs(camera.position.z - currentZPosition) / camera.position.z
    const x = (pointer.x * viewport.width) / 2 * depthScaleFactor
    const y = (pointer.y * viewport.height) / 2 * depthScaleFactor
    
    // Imposta la posizione del gruppo del cursore
    cursorGroup.current.position.set(x + CURSOR_OFFSET.x, y + CURSOR_OFFSET.y, currentZPosition)

    // Calcola e applica l'inclinazione per i movimenti sull'asse X (rotazione intorno all'asse Z)
    const xVelocity = x - lastXPositionRef.current
    const targetTiltZ = -xVelocity * X_TILT_FACTOR
    const clampedTiltZ = THREE.MathUtils.clamp(targetTiltZ, -MAX_TILT, MAX_TILT)
    cursorGroup.current.rotation.z += (clampedTiltZ - cursorGroup.current.rotation.z) * (SMOOTHING - 0.04)

    // Calcola e applica l'inclinazione per i movimenti sull'asse Z (rotazione intorno all'asse X)
    const zVelocity = newZPosition - lastZPositionRef.current
    const targetTiltX = zVelocity * Z_TILT_FACTOR
    const clampedTiltX = THREE.MathUtils.clamp(targetTiltX, -MAX_TILT, MAX_TILT)
    modelRef.current.rotation.x += (clampedTiltX - modelRef.current.rotation.x) * SMOOTHING

    // Applica una rotazione continua sull'asse Y
    modelRef.current.rotation.y += Y_ROTATION_SPEED
    
    // Aggiorna le posizioni precedenti per il prossimo frame
    lastZPositionRef.current = newZPosition
    lastXPositionRef.current = x
    
    // Posiziona la luce sopra il modello
    lightRef.current.position.set(0, 2, 0)
  })

  // Renderizza il gruppo del cursore 3D
  return (
    <group ref={cursorGroup}>
      {/* Renderizza il modello 3D caricato */}
      <primitive object={scene} ref={modelRef} scale={SCALE_FACTOR} />
      {/* Aggiunge una luce puntiforme al cursore */}
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

// Precarica il modello 3D per migliorare le prestazioni
useGLTF.preload('/models/ufo/scene.gltf')

export default Cursor3D