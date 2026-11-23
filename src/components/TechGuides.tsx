import { useEffect, useRef } from 'react'
import './tech.css'

const CELL = 64 // tamaño de la grilla (px); debe coincidir con --tg-cell en tech.css

/**
 * Capa decorativa de «construcción digital» para una sección: grilla sutil, línea guía superior con
 * marcas terracota y guías verticales en los bordes del contenedor. Se dibuja al entrar en pantalla.
 * En el inicio (hero) agrega una mira que se ajusta a la grilla siguiendo el mouse y la medida del título.
 * No ocupa lugar ni recibe eventos; con movimiento reducido queda estática.
 */
export default function TechGuides({ tone = 'dark', grid = true, hero = false }: { tone?: 'dark' | 'light'; grid?: boolean; hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-drawn')
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-drawn'); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(host)
    return () => io.disconnect()
  }, [])

  // Inicio: mira ajustada a la grilla y medida del título al pasar el mouse (sólo mouse, sin movimiento reducido).
  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!hero || !el || !host || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let raf = 0, px = 0, py = 0
    const update = () => {
      raf = 0
      const r = host.getBoundingClientRect()
      const ox = (((r.width - CELL) / 2) % CELL + CELL) % CELL
      const x = Math.round((px - r.left - ox) / CELL) * CELL + ox
      const y = Math.round((py - r.top) / CELL) * CELL
      el.style.setProperty('--tg-x', `${x}px`)
      el.style.setProperty('--tg-y', `${y}px`)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX; py = e.clientY
      el.classList.add('is-aiming')
      if (!raf) raf = requestAnimationFrame(update)
    }
    const leave = () => el.classList.remove('is-aiming')
    const title = host.querySelector<HTMLElement>('h1')
    const measure = () => { if (title) title.dataset.size = `${Math.round(title.offsetWidth)} × ${Math.round(title.offsetHeight)}` }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    title?.addEventListener('pointerenter', measure)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      title?.removeEventListener('pointerenter', measure)
    }
  }, [hero])

  return <div ref={ref} className={`tg tg-${tone}${grid ? ' has-grid' : ''}`} aria-hidden="true">
    {grid && <i className="tg-grid" />}
    <div className="tg-frame">
      <i className="tg-v tg-v-start" /><i className="tg-v tg-v-end" />
      <i className="tg-rule" /><i className="tg-mark tg-mark-start" /><i className="tg-mark tg-mark-end" />
    </div>
    {hero && <><i className="tg-aim-x" /><i className="tg-aim-y" /><i className="tg-aim-dot" /></>}
  </div>
}

/** Línea de medición con el eslogan, bajo el logo de partículas del inicio. */
export function TechMeasure({ label }: { label: string }) {
  return <span className="tg-measure" aria-hidden="true"><i /><span>{label}</span><i /></span>
}
