import { useEffect, useRef } from 'react'

/**
 * Logo "d." de Dofra en partículas con profundidad 3D (Canvas 2D + proyección en perspectiva).
 *
 * Por qué Canvas 2D y no Three.js: son ~600–1100 puntos; rotarlos y proyectarlos por cuadro es
 * trivial para la CPU, evita ~150 KB de librería y un contexto WebGL (más batería, posibles
 * pérdidas de contexto en móviles) y funciona en cualquier navegador.
 *
 * - La silueta "d." se extruye: cada partícula tiene profundidad (z) dentro de un espesor.
 * - Rotación lenta sobre el eje Y que oscila ±12° (nunca da vueltas completas).
 * - Movimiento orgánico constante alrededor de la posición de cada partícula.
 * - Escritorio: repulsión magnética del mouse con reconstrucción elástica.
 * - Celular: el scroll dispersa levemente en X, Y y Z; al detenerse, se reconstruye por amortiguación.
 * - Se pausa fuera de pantalla y queda estático con prefers-reduced-motion.
 */

export const LOGO_COLORS = { d: '#FFFFFF', dot: '#C4938E' } as const

type Particle = {
  // posición actual y velocidad (espacio 3D, origen en el centro del logo)
  x: number; y: number; z: number; vx: number; vy: number; vz: number
  // posición objetivo dentro de la silueta extruida
  tx: number; ty: number; tz: number
  r: number; dot: boolean
  phase: number; freq: number; amp: number; seed: number
  // proyección del último cuadro (para la interacción con el puntero)
  sx: number; sy: number; ps: number
}

const FONT = '800 100px Manrope, "DM Sans", sans-serif'
const MAX_ANGLE = (12 * Math.PI) / 180 // ±12°
const DEPTH_BUCKETS = 5                // capas de profundidad para dibujar de atrás hacia adelante

type Sample = { tx: number; ty: number; dot: boolean }

/** Muestrea la silueta 2D del logo y devuelve puntos centrados en (0,0). */
function sampleLogo(width: number, height: number, maxParticles: number): { points: Sample[]; step: number; size: number } {
  const off = document.createElement('canvas')
  off.width = Math.max(1, Math.round(width))
  off.height = Math.max(1, Math.round(height))
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { points: [], step: 6, size: 1 }

  ctx.font = FONT
  const mD = ctx.measureText('d')
  const mDot = ctx.measureText('.')
  const glyphW = mD.width + mDot.width * 0.9
  const glyphH = mD.actualBoundingBoxAscent + mD.actualBoundingBoxDescent
  const scale = Math.min((width * 0.78) / glyphW, (height * 0.78) / glyphH) // misma escala que antes
  ctx.font = FONT.replace('100px', `${100 * scale}px`)
  const dW = mD.width * scale
  const x0 = (width - glyphW * scale) / 2
  const baseline = (height + glyphH * scale) / 2 - mD.actualBoundingBoxDescent * scale

  ctx.fillStyle = '#f00' // canal rojo = "d"
  ctx.fillText('d', x0, baseline)
  ctx.fillStyle = '#0f0' // canal verde = "."
  ctx.fillText('.', x0 + dW * 0.97, baseline)

  const data = ctx.getImageData(0, 0, off.width, off.height).data
  let filled = 0
  for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++
  const step = Math.max(4, Math.sqrt((filled * 4) / maxParticles))

  const cx = width / 2
  const cy = height / 2
  const points: Sample[] = []
  for (let y = step / 2; y < off.height; y += step) {
    const shift = (Math.round(y / step) % 2) * (step / 2)
    for (let x = step / 2 + shift; x < off.width; x += step) {
      const idx = (Math.floor(y) * off.width + Math.floor(x)) * 4
      if (data[idx + 3] < 128) continue
      points.push({
        tx: x - cx + (Math.random() - 0.5) * step * 0.35,
        ty: y - cy + (Math.random() - 0.5) * step * 0.35,
        dot: data[idx + 1] > data[idx],
      })
    }
  }
  return { points, step, size: glyphH * scale }
}

export default function DofraParticles({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    let reduced = motionQuery.matches
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let step = 6
    let depth = 40   // espesor de la extrusión
    let focal = 900  // distancia focal de la perspectiva
    let raf = 0
    let last = 0
    let time = 0
    let visible = true
    let disposed = false
    const pointer = { x: -9999, y: -9999, active: false }
    // Listas reutilizadas por capa de profundidad (evitan crear arrays en cada cuadro).
    const buckets: Particle[][] = Array.from({ length: DEPTH_BUCKETS }, () => [])

    /** Proyecta, ordena por profundidad y dibuja. angle = rotación sobre Y. */
    const render = (angle: number, floatY: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const cx = width / 2
      const cy = height / 2 + floatY
      for (const b of buckets) b.length = 0
      const zRange = depth * 0.5 + width * Math.abs(sin) * 0.5 + step * 3

      for (const p of particles) {
        // Rotación sobre el eje Y.
        const rx = p.x * cos + p.z * sin
        const rz = -p.x * sin + p.z * cos
        const s = focal / (focal + rz) // perspectiva: lo lejano se achica
        p.sx = cx + rx * s
        p.sy = cy + p.y * s
        const t = Math.min(DEPTH_BUCKETS - 1, Math.max(0, Math.floor(((zRange - rz) / (2 * zRange)) * DEPTH_BUCKETS)))
        p.ps = s
        buckets[t].push(p) // 0 = más lejano, último = más cercano
      }

      ctx.clearRect(0, 0, width, height)
      for (let b = 0; b < DEPTH_BUCKETS; b++) {
        const list = buckets[b]
        if (!list.length) continue
        ctx.globalAlpha = 0.5 + (0.5 * b) / (DEPTH_BUCKETS - 1) // lejos más tenue
        for (let pass = 0; pass < 2; pass++) {
          const dotPass = pass === 1
          ctx.fillStyle = dotPass ? LOGO_COLORS.dot : LOGO_COLORS.d
          ctx.beginPath()
          for (const p of list) {
            if (p.dot !== dotPass) continue
            const r = p.r * p.ps
            ctx.moveTo(p.sx + r, p.sy)
            ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
          }
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      raf = 0
      if (disposed || !visible) return
      const dt = last ? Math.min((now - last) / 16.667, 2.5) : 1
      last = now
      time += dt / 60

      const radius = Math.min(width, height) * 0.2
      const r2 = radius * radius
      const k = 0.05 * dt
      const damping = Math.pow(0.88, dt)

      for (const p of particles) {
        // Movimiento orgánico: deriva lenta en 3D + vibración muy leve.
        const w = time * p.freq + p.phase
        const hx = p.tx + Math.sin(w) * p.amp + Math.sin(time * 7.1 + p.phase * 3) * step * 0.04
        const hy = p.ty + Math.cos(w * 0.9) * p.amp + Math.cos(time * 6.3 + p.phase * 2) * step * 0.04
        const hz = p.tz + Math.sin(w * 0.7 + p.seed) * p.amp * 1.4

        let ax = (hx - p.x) * k
        let ay = (hy - p.y) * k
        let az = (hz - p.z) * k

        if (pointer.active) {
          const dx = p.sx - pointer.x
          const dy = p.sy - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = (1 - d / radius) ** 2 * 3 * dt // repulsión magnética
            ax += (dx / d) * f
            ay += (dy / d) * f
            az -= f * 0.8 // se acercan levemente al espectador: refuerza la profundidad
          }
        }
        p.vx = (p.vx + ax) * damping
        p.vy = (p.vy + ay) * damping
        p.vz = (p.vz + az) * damping
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
      }

      // Oscilación suave sobre Y (±12°, período ~10 s) y flotación del conjunto.
      render(Math.sin(time * 0.63) * MAX_ANGLE, Math.sin(time * 0.8) * height * 0.01)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!raf && visible && !reduced && !disposed && particles.length) { last = 0; raf = requestAnimationFrame(frame) }
    }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }
    const renderStatic = () => render(-MAX_ANGLE * 0.6, 0) // pose fija que deja ver la profundidad

    const build = (animateIn: boolean) => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const sampled = sampleLogo(width, height, width < 420 ? 620 : 1100)
      step = sampled.step
      depth = sampled.size * 0.22 // espesor de la extrusión, proporcional al logo
      focal = sampled.size * 3.2  // perspectiva sutil

      particles = sampled.points.map(pt => {
        // Más densidad en las caras delantera y trasera, algunas en el interior: volumen legible.
        const u = Math.random()
        const tz = (u < 0.4 ? -0.5 : u < 0.8 ? 0.5 : Math.random() - 0.5) * depth + (Math.random() - 0.5) * step * 0.3
        const base = {
          tx: pt.tx, ty: pt.ty, tz, dot: pt.dot,
          r: step * (0.19 + Math.random() * 0.11) * (pt.dot ? 1.2 : 1),
          phase: Math.random() * Math.PI * 2,
          freq: 0.45 + Math.random() * 0.6,
          amp: step * (0.15 + Math.random() * 0.22),
          seed: Math.random() * 2 - 1,
          vx: 0, vy: 0, vz: 0, sx: 0, sy: 0, ps: 1,
        }
        if (!animateIn || reduced) return { ...base, x: pt.tx, y: pt.ty, z: tz }
        // Formación inicial: llegan desde un volumen difuso alrededor del logo.
        const a = Math.random() * Math.PI * 2
        const dist = Math.max(width, height) * (0.35 + Math.random() * 0.35)
        return { ...base, x: Math.cos(a) * dist, y: Math.sin(a) * dist, z: (Math.random() - 0.5) * depth * 6 }
      })
      if (reduced) { stop(); renderStatic() } else { render(0, 0); start() }
    }

    const fontsReady = document.fonts?.load ? document.fonts.load(FONT).catch(() => undefined) : Promise.resolve()
    fontsReady.then(() => { if (!disposed) build(true) })

    let resizeTimer = 0
    let lastWidth = 0
    const ro = new ResizeObserver(([entry]) => {
      // En celulares la barra del navegador cambia la altura al hacer scroll: solo reconstruimos si cambia el ancho.
      const w = Math.round(entry.contentRect.width)
      if (w === lastWidth) return
      lastWidth = w
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => build(particles.length === 0), 120)
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start(); else stop()
    })
    io.observe(wrap)

    // --- Mouse: repulsión magnética ---
    const onMove = (e: PointerEvent) => {
      if (reduced) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
    }
    const onLeave = () => { pointer.active = false; pointer.x = pointer.y = -9999 }
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') window.setTimeout(onLeave, 300) }

    // --- Celular: dispersión leve en X, Y y Z proporcional a la velocidad del scroll ---
    let lastScrollY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      lastScrollY = y
      if (reduced || !visible || !coarseQuery.matches || !particles.length) return
      // Impulso acotado y suave: la silueta sigue reconocible; el resorte la reconstruye al frenar.
      const impulse = Math.max(-1, Math.min(1, delta / 80)) * step * 0.9 // dispersión muy sutil
      const mag = Math.abs(impulse)
      for (const p of particles) {
        const len = Math.hypot(p.tx, p.ty) || 1
        const spread = mag * (0.5 + 0.5 * Math.abs(p.seed))
        p.vx += (p.tx / len) * spread
        p.vy += (p.ty / len) * spread * 0.6 - impulse * 0.5
        p.vz += p.seed * mag * 1.3
      }
    }

    const onMotionChange = () => { reduced = motionQuery.matches; build(false) }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onMove)
    wrap.addEventListener('pointerup', onUp)
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('pointercancel', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    motionQuery.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      stop()
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onMove)
      wrap.removeEventListener('pointerup', onUp)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('pointercancel', onLeave)
      window.removeEventListener('scroll', onScroll)
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div ref={wrapRef} className="particles" role="img" aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
