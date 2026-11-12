import { useEffect, useRef } from 'react'

/**
 * Logo "d." de Dofra formado por partículas (Canvas 2D, sin dependencias).
 * - Al cargar, las partículas se reúnen hasta formar el logo.
 * - Movimiento continuo: flotación del conjunto, deriva orgánica y vibración leve de cada partícula,
 *   siempre alrededor de su lugar para que la "d." se mantenga reconocible.
 * - Mouse: repulsión magnética y reconstrucción elástica (resorte con leve rebote).
 * - Celular: al deslizar la página, las partículas se dispersan en proporción a la velocidad del
 *   scroll y luego se reconstruyen. El listener es pasivo: no bloquea ni modifica el scroll.
 * - Se pausa fuera de pantalla y queda estático con prefers-reduced-motion.
 */

export const LOGO_COLORS = { d: '#FFFFFF', dot: '#C4938E' } as const

type Particle = {
  x: number; y: number; vx: number; vy: number
  tx: number; ty: number; r: number
  group: 0 | 1 | 2          // 0 = d (opaca), 1 = d (más tenue, da profundidad), 2 = punto
  phase: number; freq: number; amp: number; seed: number
}

const FONT = '800 100px Manrope, "DM Sans", sans-serif'
const GROUP_STYLE: { color: string; alpha: number }[] = [
  { color: LOGO_COLORS.d, alpha: 1 },
  { color: LOGO_COLORS.d, alpha: 0.62 },
  { color: LOGO_COLORS.dot, alpha: 1 },
]

type Target = Pick<Particle, 'tx' | 'ty' | 'r' | 'group' | 'phase' | 'freq' | 'amp' | 'seed'>

function sampleLogo(width: number, height: number, maxParticles: number): { targets: Target[]; step: number } {
  const off = document.createElement('canvas')
  off.width = Math.max(1, Math.round(width))
  off.height = Math.max(1, Math.round(height))
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { targets: [], step: 6 }

  // Medimos el texto a 100 px y lo escalamos para que entre con margen.
  ctx.font = FONT
  const mD = ctx.measureText('d')
  const mDot = ctx.measureText('.')
  const glyphW = mD.width + mDot.width * 0.9
  const glyphH = mD.actualBoundingBoxAscent + mD.actualBoundingBoxDescent
  const scale = Math.min((width * 0.78) / glyphW, (height * 0.78) / glyphH)
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

  const targets: Target[] = []
  for (let y = step / 2; y < off.height; y += step) {
    const shift = (Math.round(y / step) % 2) * (step / 2) // trama alternada, más orgánica
    for (let x = step / 2 + shift; x < off.width; x += step) {
      const idx = (Math.floor(y) * off.width + Math.floor(x)) * 4
      if (data[idx + 3] < 128) continue
      const isDot = data[idx + 1] > data[idx]
      targets.push({
        tx: x + (Math.random() - 0.5) * step * 0.35,
        ty: y + (Math.random() - 0.5) * step * 0.35,
        r: step * (0.2 + Math.random() * 0.12) * (isDot ? 1.2 : 1),
        group: isDot ? 2 : Math.random() < 0.22 ? 1 : 0,
        phase: Math.random() * Math.PI * 2,
        freq: 0.45 + Math.random() * 0.7,
        amp: step * (0.18 + Math.random() * 0.27),
        seed: Math.random() * 2 - 1,
      })
    }
  }
  return { targets, step }
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
    let raf = 0
    let last = 0
    let time = 0
    let visible = true
    let disposed = false
    const pointer = { x: -9999, y: -9999, active: false }

    const draw = (floatY: number) => {
      ctx.clearRect(0, 0, width, height)
      for (let g = 0; g < GROUP_STYLE.length; g++) {
        ctx.fillStyle = GROUP_STYLE[g].color
        ctx.globalAlpha = GROUP_STYLE[g].alpha
        ctx.beginPath()
        for (const p of particles) {
          if (p.group !== g) continue
          const y = p.y + floatY
          ctx.moveTo(p.x + p.r, y)
          ctx.arc(p.x, y, p.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      raf = 0
      if (disposed || !visible) return
      // Paso de tiempo normalizado a 60 fps, acotado para evitar saltos al volver a la pestaña.
      const dt = last ? Math.min((now - last) / 16.667, 2.5) : 1
      last = now
      time += dt / 60

      const radius = Math.min(width, height) * 0.2
      const r2 = radius * radius
      const k = 0.055 * dt         // rigidez del resorte (reconstrucción)
      const damping = Math.pow(0.88, dt) // amortiguación: deja un leve rebote elástico

      for (const p of particles) {
        // Deriva orgánica + vibración leve alrededor del punto de origen.
        const wob = time * p.freq + p.phase
        const hx = p.tx + Math.sin(wob) * p.amp + Math.sin(time * 7.3 + p.phase * 3) * step * 0.05
        const hy = p.ty + Math.cos(wob * 0.9) * p.amp + Math.cos(time * 6.1 + p.phase * 2) * step * 0.05

        let ax = (hx - p.x) * k
        let ay = (hy - p.y) * k

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const force = (1 - d / radius) ** 2 * 3.2 * dt // repulsión magnética
            ax += (dx / d) * force
            ay += (dy / d) * force
          }
        }
        p.vx = (p.vx + ax) * damping
        p.vy = (p.vy + ay) * damping
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
      // Flotación suave del conjunto.
      draw(Math.sin(time * 0.8) * height * 0.012)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!raf && visible && !reduced && !disposed && particles.length) { last = 0; raf = requestAnimationFrame(frame) }
    }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    const build = (animateIn: boolean) => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const sampled = sampleLogo(width, height, width < 420 ? 480 : 850)
      step = sampled.step
      particles = sampled.targets.map(t => {
        if (!animateIn || reduced) return { ...t, x: t.tx, y: t.ty, vx: 0, vy: 0 }
        // Formación inicial: parten de un anillo difuso alrededor del logo.
        const a = Math.random() * Math.PI * 2
        const dist = Math.max(width, height) * (0.35 + Math.random() * 0.4)
        return { ...t, x: width / 2 + Math.cos(a) * dist, y: height / 2 + Math.sin(a) * dist, vx: 0, vy: 0 }
      })
      if (reduced) { stop(); draw(0) } else { draw(0); start() }
    }

    // Esperamos la tipografía de la marca para que la figura sea fiel al logo.
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

    // --- Mouse / toque: repulsión magnética ---
    const onMove = (e: PointerEvent) => {
      if (reduced) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
    }
    const onLeave = () => { pointer.active = false; pointer.x = pointer.y = -9999 }
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') window.setTimeout(onLeave, 300) }

    // --- Celular: dispersión proporcional a la velocidad del scroll ---
    let lastScrollY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      lastScrollY = y
      if (reduced || !visible || !coarseQuery.matches || !particles.length) return
      const impulse = Math.max(-1, Math.min(1, delta / 60)) * step * 2.4
      const cx = width / 2
      const cy = height / 2
      for (const p of particles) {
        const dx = p.tx - cx
        const dy = p.ty - cy
        const len = Math.hypot(dx, dy) || 1
        const spread = Math.abs(impulse) * (0.55 + 0.45 * Math.abs(p.seed))
        p.vx += (dx / len) * spread + p.seed * Math.abs(impulse) * 0.5
        p.vy += (dy / len) * spread * 0.6 - impulse * (0.6 + 0.4 * Math.abs(p.seed))
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
