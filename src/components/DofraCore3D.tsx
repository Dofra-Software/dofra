import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Escultura 3D decorativa e interactiva del hero de Dofra.
 * - Sin assets externos: el reflejo se genera localmente con RoomEnvironment.
 * - Se pausa cuando no está en pantalla y respeta prefers-reduced-motion.
 */

/** Mapa de reflejos generado en el navegador (reemplaza a un HDR descargado). */
function LocalEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const envMap = pmrem.fromScene(room, 0.04).texture
    scene.environment = envMap
    return () => {
      scene.environment = null
      envMap.dispose()
      pmrem.dispose()
      room.traverse(obj => { if (obj instanceof THREE.Mesh) obj.geometry.dispose() })
    }
  }, [gl, scene])
  return null
}

const SATELLITES: { p: [number, number, number]; s: number }[] = [
  { p: [1.5, 0.7, 0.35], s: 0.11 },
  { p: [-1.43, -0.66, 0.5], s: 0.085 },
  { p: [0.42, -1.72, -0.15], s: 0.065 },
]

function Sculpture({ animate }: { animate: boolean }) {
  const float = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const pointer = useRef(new THREE.Vector2())
  const { viewport } = useThree()

  useFrame((state, delta) => {
    if (!animate || !root.current || !inner.current) return
    const dt = Math.min(delta, 0.1) // evita saltos al volver de una pestaña inactiva
    pointer.current.lerp(state.pointer, Math.min(1, dt * 2.5))
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.current.x * 0.24, 3, dt)
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.current.y * 0.15, 3, dt)
    inner.current.rotation.y += dt * 0.075
    if (ringA.current) ringA.current.rotation.z += dt * 0.065
    if (ringB.current) ringB.current.rotation.x += dt * 0.045
    if (float.current) float.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.07 // flotación suave
  })

  // Escala según el ancho visible para que los anillos nunca se corten.
  const scale = Math.min(1, Math.max(0.6, Math.min(viewport.width, viewport.height) / 4.4))

  return (
    <group ref={float}>
      <group ref={root} scale={scale}>
        <group ref={inner}>
          <mesh>
            <icosahedronGeometry args={[1.05, 5]} />
            <meshPhysicalMaterial color="#0c315b" metalness={0.42} roughness={0.13} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.7} />
          </mesh>
          <mesh scale={0.93}>
            <icosahedronGeometry args={[1.05, 2]} />
            <meshStandardMaterial color="#237df1" metalness={0.65} roughness={0.28} wireframe transparent opacity={0.18} />
          </mesh>
          <mesh scale={0.48}>
            <icosahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color="#3188ff" emissive="#146cf4" emissiveIntensity={1.8} metalness={0.2} roughness={0.24} />
          </mesh>
        </group>
        <mesh ref={ringA} rotation={[0.58, 0.28, 0.38]}>
          <torusGeometry args={[1.48, 0.035, 16, 160]} />
          <meshStandardMaterial color="#a6d6ff" metalness={0.85} roughness={0.18} emissive="#236cc1" emissiveIntensity={0.2} />
        </mesh>
        <mesh ref={ringB} rotation={[1.13, -0.25, -0.6]}>
          <torusGeometry args={[1.73, 0.017, 12, 160]} />
          <meshStandardMaterial color="#377fca" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh rotation={[-0.4, 0.35, 0.2]}>
          <torusGeometry args={[1.95, 0.008, 8, 160]} />
          <meshBasicMaterial color="#2e6ea9" transparent opacity={0.5} />
        </mesh>
        {SATELLITES.map(({ p, s }, i) => (
          <mesh key={i} position={p} rotation={[0.4, 0.3, 0.5]}>
            <octahedronGeometry args={[s, 0]} />
            <meshStandardMaterial color={i === 1 ? '#e0f2ff' : '#4c9dff'} metalness={0.72} roughness={0.22} emissive="#246bd0" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function DofraCoreFallback() {
  return <div className="dofra-core-fallback" aria-hidden="true">d<span>.</span></div>
}

export default function DofraCore3D({ label }: { label: string }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // Pausa el render cuando el hero sale de pantalla (ahorra batería y CPU/GPU).
  useEffect(() => {
    const el = wrapper.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const animate = visible && !reducedMotion

  return (
    <div ref={wrapper} className="dofra-core-3d" role="img" aria-label={label}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={animate ? 'always' : 'demand'}
        camera={{ position: [0, 0, 6.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        fallback={<DofraCoreFallback />}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 5, 6]} intensity={3} color="#b8dcff" />
        <pointLight position={[-3, -2, 3]} intensity={35} color="#237cff" distance={10} />
        <LocalEnvironment />
        <Sculpture animate={animate} />
      </Canvas>
    </div>
  )
}
