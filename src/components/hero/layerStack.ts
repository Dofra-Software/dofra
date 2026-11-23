import {
  ACESFilmicToneMapping, BoxGeometry, Color, CylinderGeometry, DirectionalLight, EdgesGeometry, Group, LineBasicMaterial, LineSegments,
  Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Bloque de láminas (Three.js): estructura, diseño y sistema apilados.
 * - Entrada: las capas caen y se ensamblan; la pieza terracota (el «punto») llega última.
 * - Mouse: inclinación de pocos grados y la luz principal sigue al cursor.
 * - Scroll: vista explotada (las capas se separan) con un giro lento.
 * - Renderiza sólo cuando algo cambia y se pausa fuera de pantalla.
 */

export type LayerStack = { setPointer(x: number, y: number): void; setProgress(p: number): void; dispose(): void }
type Options = { quick?: boolean; fine?: boolean; onLost?: () => void }

const T = 0.07          // espesor de cada lámina
const GAP = 0.02        // separación en reposo
const SPREAD = 0.52     // separación extra en la vista explotada
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function createLayerStack(host: HTMLElement, { quick = false, fine = false, onLost }: Options = {}): LayerStack {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fine ? 1.75 : 1.5))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.className = 'hx-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envRT = pmrem.fromScene(room, 0.04)
  scene.environment = envRT.texture
  pmrem.dispose()
  room.traverse(o => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshStandardMaterial).dispose() } })

  const camera = new PerspectiveCamera(28, 1, 0.1, 50)
  camera.position.set(0, 0, 7.6)
  const key = new DirectionalLight(0xffffff, 1.4)
  key.position.set(3, 4, 5)
  scene.add(key)

  const root = new Group()
  scene.add(root)

  const plateGeo = new BoxGeometry(2, T, 2)
  const plateEdges = new EdgesGeometry(plateGeo)
  const tileGeo = new CylinderGeometry(0.22, 0.22, T, 64) // el «punto» terracota del logo
  const tileEdges = new EdgesGeometry(tileGeo, 40)

  const make = (kind: 'metal' | 'glass' | 'tile') => {
    if (kind === 'glass') return new MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.14, transparent: true, opacity: 0.14,
      clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.5, depthWrite: false,
    })
    return new MeshStandardMaterial({
      color: new Color(kind === 'tile' ? '#C4938E' : '#1B2B47'),
      metalness: kind === 'tile' ? 0.5 : 0.8, roughness: kind === 'tile' ? 0.3 : 0.42, transparent: true,
    })
  }

  const kinds = ['metal', 'glass', 'metal', 'glass', 'tile'] as const
  const layers = kinds.map(kind => {
    const mat = make(kind)
    const edgeMat = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    const mesh = new Mesh(kind === 'tile' ? tileGeo : plateGeo, mat)
    mesh.add(new LineSegments(kind === 'tile' ? tileEdges : plateEdges, edgeMat))
    if (kind === 'tile') mesh.position.set(0.68, 0, 0.68)
    mesh.renderOrder = kind === 'glass' ? 1 : 0
    root.add(mesh)
    return { mesh, mat, edgeMat, opacity: kind === 'glass' ? 0.14 : 1, edge: kind === 'tile' ? 0 : kind === 'glass' ? 0.42 : 0.22, opaque: kind !== 'glass' }
  })

  let px = 0, py = 0, cx = 0, cy = 0, p = 0, cp = 0
  let raf = 0, visible = true, introDone = false, disposed = false
  const t0 = performance.now()
  const delay = quick ? 60 : 240
  const dur = quick ? 900 : 1800
  const n = layers.length

  const frame = (now: number) => {
    raf = 0
    const it = clamp((now - t0 - delay) / dur)
    cx += (px - cx) * 0.06
    cy += (py - cy) * 0.06
    cp += (p - cp) * 0.14
    const breathe = fine ? Math.sin(now * 0.00032) * 0.03 : 0
    const ex = easeInOut(clamp(cp * 1.5))
    const gap = GAP + ex * SPREAD
    const center = ((n - 1) * (T + gap)) / 2

    root.rotation.x = 0.66 + cy * 0.14 + ex * 0.12
    root.rotation.y = -0.74 + cx * 0.24 + breathe + ex * 0.5 - (1 - easeOutCubic(it)) * 0.45
    root.scale.setScalar(1 - ex * 0.1)
    key.position.set(3 + cx * 4, 4 - cy * 3, 5)

    layers.forEach((L, i) => {
      const e = easeOutExpo(clamp((it - i * 0.09) / (1 - (n - 1) * 0.09)))
      L.mesh.position.y = i * (T + gap) - center + (1 - e) * (1.2 + i * 0.4)
      L.mat.opacity = L.opacity * e
      L.edgeMat.opacity = L.edge * e
    })
    if (it >= 1 && !introDone) {
      introDone = true
      layers.forEach(L => { if (L.opaque) { L.mat.transparent = false; L.mat.needsUpdate = true } })
    }
    renderer.render(scene, camera)

    const settled = introDone && Math.abs(px - cx) < 1e-4 && Math.abs(py - cy) < 1e-4 && Math.abs(p - cp) < 1e-4
    if (visible && !disposed && (!settled || fine)) raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && visible && !disposed) raf = requestAnimationFrame(frame) }

  const ro = new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    kick()
  })
  ro.observe(host)
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick() })
  io.observe(host)

  const lost = (ev: Event) => { ev.preventDefault(); onLost?.() }
  canvas.addEventListener('webglcontextlost', lost)

  return {
    setPointer(x, y) { px = x; py = y; kick() },
    setProgress(v) { p = v; kick() },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect()
      canvas.removeEventListener('webglcontextlost', lost)
      layers.forEach(L => { L.mat.dispose(); L.edgeMat.dispose() })
      plateGeo.dispose(); plateEdges.dispose(); tileGeo.dispose(); tileEdges.dispose()
      envRT.dispose(); renderer.dispose()
      canvas.remove()
    },
  }
}
