import React, { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Configurazione dettagliata del comportamento del cursore 3D
const CONFIG = {
  MAX_Z_POSITION: 8,        // Distanza massima del cursore dall'osservatore (in entrambe le direzioni)
  SCALE_FACTOR: 0.5,        // Fattore di scala per il modello 3D dell'UFO
  CURSOR_OFFSET: new THREE.Vector2(-0.1, -1.5),  // Offset del cursore rispetto alla posizione del puntatore
  Y_ROTATION_SPEED: 0.01,   // Velocità di rotazione costante dell'UFO sull'asse Y
  TILT_FACTOR: new THREE.Vector2(5, 1),  // Fattori di inclinazione (x: laterale, y: avanti/indietro)
  SMOOTHING: 0.08,          // Fattore di smussamento per i movimenti (più basso = più fluido)
  MAX_TILT: Math.PI / 4,    // Inclinazione massima dell'UFO (in radianti)
  VERTICAL_OSCILLATION: {
    SPEED: 2,               // Velocità dell'oscillazione verticale
    AMPLITUDE: 0.1          // Ampiezza dell'oscillazione verticale
  },
  DRIFT: {
    FACTOR: 0.97,           // Fattore di decelerazione per l'effetto drift
    THRESHOLD: 0.0001       // Soglia di velocità sotto la quale si attiva l'effetto drift
  }
}

const Cursor3D: React.FC = () => {
  // Hooks per accedere al contesto Three.js
  const { viewport, camera } = useThree()

  // Riferimenti agli oggetti 3D della scena
  const cursorGroup = useRef<THREE.Group>(null)  // Gruppo principale che contiene l'UFO
  const modelRef = useRef<THREE.Object3D>(null)  // Riferimento al modello 3D dell'UFO
  const lightRef = useRef<THREE.PointLight>(null)  // Riferimento alla luce che accompagna l'UFO

  // Vettori per la gestione del movimento (usando useRef per evitare re-render non necessari)
  const targetPosition = useRef(new THREE.Vector3())  // Posizione verso cui l'UFO si sta muovendo
  const currentPosition = useRef(new THREE.Vector3())  // Posizione attuale dell'UFO
  const velocity = useRef(new THREE.Vector3())  // Velocità corrente dell'UFO

  // Carica il modello 3D dell'UFO
  const { scene } = useGLTF('/models/ufo/scene.gltf')

  // Gestore per lo scroll del mouse (controlla la profondità Z del cursore)
  const handleWheel = useCallback((event: WheelEvent) => {
    // Aggiorna la posizione Z target, mantenendola entro i limiti configurati
    targetPosition.current.z = THREE.MathUtils.clamp(
      targetPosition.current.z - event.deltaY * 0.01,
      -CONFIG.MAX_Z_POSITION,
      CONFIG.MAX_Z_POSITION
    )
  }, [])

  // Effetto per gestire l'event listener della rotella del mouse
  useEffect(() => {
    window.addEventListener('wheel', handleWheel)
    // Funzione di pulizia per rimuovere l'event listener quando il componente viene smontato
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Loop di rendering principale (eseguito ad ogni frame)
  useFrame(({ pointer, clock }) => {
    // Verifica che tutti i riferimenti necessari siano disponibili
    if (!cursorGroup.current || !modelRef.current || !lightRef.current) return

    // Nasconde il cursore predefinito del browser
    document.body.style.cursor = 'none'

    const time = clock.getElapsedTime()

    // Calcola la nuova posizione target basata sul puntatore del mouse
    const depthScaleFactor = Math.abs(camera.position.z - currentPosition.current.z) / camera.position.z
    const x = (pointer.x * viewport.width) / 2 * depthScaleFactor
    const y = (pointer.y * viewport.height) / 2 * depthScaleFactor
    targetPosition.current.set(
      x + CONFIG.CURSOR_OFFSET.x,
      y + CONFIG.CURSOR_OFFSET.y,
      targetPosition.current.z
    )

    // Calcola la nuova velocità basata sulla differenza tra posizione target e attuale
    velocity.current.subVectors(targetPosition.current, currentPosition.current).multiplyScalar(CONFIG.SMOOTHING)

    // Applica l'effetto drift se la velocità è sotto la soglia configurata
    if (velocity.current.length() < CONFIG.DRIFT.THRESHOLD) {
      velocity.current.multiplyScalar(CONFIG.DRIFT.FACTOR)
    }

    // Aggiorna la posizione corrente dell'UFO
    currentPosition.current.add(velocity.current)

    // Applica l'oscillazione verticale per simulare il galleggiamento nello spazio
    const verticalOffset = Math.sin(time * CONFIG.VERTICAL_OSCILLATION.SPEED) * CONFIG.VERTICAL_OSCILLATION.AMPLITUDE
    cursorGroup.current.position.copy(currentPosition.current).add(new THREE.Vector3(0, verticalOffset, 0))

    // Calcola e applica l'inclinazione dell'UFO basata sulla sua velocità
    const tiltX = velocity.current.z * CONFIG.TILT_FACTOR.y
    const tiltZ = -velocity.current.x * CONFIG.TILT_FACTOR.x
    cursorGroup.current.rotation.x = THREE.MathUtils.lerp(
      cursorGroup.current.rotation.x,
      THREE.MathUtils.clamp(tiltX, -CONFIG.MAX_TILT, CONFIG.MAX_TILT),
      CONFIG.SMOOTHING
    )
    cursorGroup.current.rotation.z = THREE.MathUtils.lerp(
      cursorGroup.current.rotation.z,
      THREE.MathUtils.clamp(tiltZ, -CONFIG.MAX_TILT, CONFIG.MAX_TILT),
      CONFIG.SMOOTHING
    )

    // Applica la rotazione continua sull'asse Y per un effetto di "hover"
    modelRef.current.rotation.y += CONFIG.Y_ROTATION_SPEED

    // Aggiorna la posizione della luce per seguire l'UFO
    lightRef.current.position.set(0, 2, 0)
  })

  return (
    <group ref={cursorGroup}>
      {/* Renderizza il modello 3D dell'UFO caricato */}
      <primitive object={scene} ref={modelRef} scale={CONFIG.SCALE_FACTOR} />
      {/* Aggiunge una luce puntiforme che segue l'UFO per illuminarlo */}
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

// Precarica il modello 3D dell'UFO per migliorare le prestazioni di caricamento
useGLTF.preload('/models/ufo/scene.gltf')

export default Cursor3D