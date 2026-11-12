import { useEffect, useRef } from 'react'

/**
 * Logo "d." de Dofra formado por partículas (Canvas 2D, sin dependencias).
 * - Al cargar, las partículas se reúnen hasta formar el logo.
 * - Cerca del puntero se apartan suavemente y vuelven a su lugar (resorte amortiguado).
 * - El bucle se detiene cuando todo está quieto, cuando el logo no está visible
 *   o si el sistema pide movimiento reducido.
 */

type Particle = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; r: number; color: 0 | 1 | 2 }

const COLORS = ['#ffffff', '#3188ff', '#8cc2ff'] // blanco, azul eléctrico, azul claro
const FONT = '800 100px Manrope, "DM Sans", sans-serif'

function sampleLogo(width: number, height: number, maxParticles: number): Omit<Particle, 'x' | 'y' | 'vx' | 'vy'>[] {
  const off = document.createElement('canvas')
  off.width = Math.max(1, Math.round(width))
  off.height = Math.max(1, Math.round(height))
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []

  // Medimos el texto a 100 px y lo escalamos para que entre con margen.
  ctx.font = FONT
  const mD = ctx.measureText('d')
  const mDot = ctx.measureText('.')
  const glyphW = mD.width + mDot.width * 0.9
  const glyphH = mD.actualBoundingBoxAscent + mD.actualBoundingBoxDescent
  const scale = Math.min((width * 0.78) / glyphW, (height * 0.78) / glyphH)
  const size = 100 * scale
  ctx.font = FONT.replace('100px', `${size}px`)
  const dW = mD.width * scale
  const totalW = glyphW * scale
  const x0 = (width - totalW) / 2
  const baseline = (height + glyphH * scale) / 2 - mD.actualBoundingBoxDescent * scale

  ctx.fillStyle = '#f00' // canal rojo = "d"
  ctx.fillText('d', x0, baseline)
  ctx.fillStyle = '#0f0' // canal verde = "."
  ctx.fillText('.', x0 + dW * 0.97, baseline)

  const data = ctx.getImageData(0, 0, off.width, off.height).data
  // Paso de muestreo según el área ocupada, para no superar el máximo de partículas.
  let filled = 0
  for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++
  const area = filled * 4
  const step = Math.max(4, Math.sqrt(area / maxParticles))

  const out: Omit<Particle, 'x' | 'y' | 'vx' | 'vy'>[] = []
  for (let y = step / 2; y < off.height; y += step) {
    // Fila alternada desplazada: trama más orgánica que una grilla perfecta.
    const shift = (Math.round(y / step) % 2) * (step / 2)
    for (let x = step / 2 + shift; x < off.width; x += step) {
      const idx = (Math.floor(y) * off.width + Math.floor(x)) * 4
      if (data[idx + 3] < 128) continue
      const isDot = data[idx + 1] > data[idx]
      const rnd = Math.random()
      out.push({
        tx: x + (Math.random() - 0.5) * step * 0.35,
        ty: y + (Math.random() - 0.5) * step * 0.35,
        r: step * (0.2 + Math.random() * 0.12),
        color: isDot ? 1 : rnd < 0.12 ? 1 : rnd < 0.22 ? 2 : 0,
      })
    }
  }
  return out
}

export default function DofraParticles({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = media.matches
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let raf = 0
    let visible = true
    let disposed = false
    const pointer = { x: -9999, y: -9999, active: false }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (let c = 0; c < COLORS.length; c++) {
        ctx.fillStyle = COLORS[c]
        ctx.beginPath()
        for (const p of particles) {
          if (p.color !== c) continue
          ctx.moveTo(p.x + p.r, p.y)
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
    }

    const step = () => {
      raf = 0
      const radius = Math.min(width, height) * 0.16
      const r2 = radius * radius
      let moving = false
      for (const p of particles) {
        // Resorte hacia la posición del logo.
        let ax = (p.tx - p.x) * 0.045
        let ay = (p.ty - p.y) * 0.045
        // Repulsión suave cerca del puntero.
        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const force = (1 - d / radius) ** 2 * 2.6
            ax += (dx / d) * force
            ay += (dy / d) * force
          }
        }
        p.vx = (p.vx + ax) * 0.84
        p.vy = (p.vy + ay) * 0.84
        p.x += p.vx
        p.y += p.vy
        if (!moving && (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || Math.abs(p.tx - p.x) > 0.3 || Math.abs(p.ty - p.y) > 0.3)) moving = true
      }
      draw()
      // Solo seguimos animando si algo se mueve: en reposo no consume CPU.
      if ((moving || pointer.active) && visible && !disposed) raf = requestAnimationFrame(step)
    }

    const kick = () => { if (!raf && visible && !reduced && !disposed) raf = requestAnimationFrame(step) }

    const build = (animateIn: boolean) => {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const max = width < 420 ? 520 : 900
      const targets = sampleLogo(width, height, max)
      particles = targets.map(t => {
        if (!animateIn || reduced) return { ...t, x: t.tx, y: t.ty, vx: 0, vy: 0 }
        // Formación: parten de un anillo difuso alrededor del logo.
        const a = Math.random() * Math.PI * 2
        const dist = Math.max(width, height) * (0.35 + Math.random() * 0.4)
        return { ...t, x: width / 2 + Math.cos(a) * dist, y: height / 2 + Math.sin(a) * dist, vx: 0, vy: 0 }
      })
      draw()
      kick()
    }

    // Esperamos la tipografía del logo para que la figura sea fiel a la marca.
    const fontsReady = document.fonts?.load ? document.fonts.load(FONT).catch(() => undefined) : Promise.resolve()
    fontsReady.then(() => { if (!disposed) build(true) })

    let resizeTimer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => build(false), 120)
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
      else if (raf) { cancelAnimationFrame(raf); raf = 0 }
    })
    io.observe(wrap)

    const onMove = (e: PointerEvent) => {
      if (reduced) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
      kick()
    }
    const onLeave = () => { pointer.active = false; pointer.x = pointer.y = -9999; kick() }
    const onTouchEnd = (e: PointerEvent) => { if (e.pointerType !== 'mouse') window.setTimeout(onLeave, 350) }
    const onMotionChange = () => { reduced = media.matches; build(false) }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onMove) // en pantallas táctiles, un toque dispersa las partículas
    wrap.addEventListener('pointerup', onTouchEnd)
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('pointercancel', onLeave)
    media.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onMove)
      wrap.removeEventListener('pointerup', onTouchEnd)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('pointercancel', onLeave)
      media.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div ref={wrapRef} className="particles" role="img" aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
