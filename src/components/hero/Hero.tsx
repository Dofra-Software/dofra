import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { LayerStack } from './layerStack'
import './hero.css'

type HeroText = {
  eyebrow: string; heroA: string; heroB: string; heroDesc: string; heroContact: string; seeWork: string
  trust1: string; trust2: string; trust3: string; heroVisual: string
}
type Mode = 'pending' | 'webgl' | 'css'

const SLOGAN = 'Built by Dofra.'
const SEEN_KEY = 'dofra-hero-seen'
const vars = (v: Record<string, number>) => v as CSSProperties

function canUseWebGL() {
  if (new URLSearchParams(window.location.search).get('hero') === 'css') return false // para revisar la alternativa liviana
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if ((nav.hardwareConcurrency || 8) <= 2 || (nav.deviceMemory || 8) <= 2 || nav.connection?.saveData) return false
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

// Se lee una sola vez por carga: en visitas repetidas de la misma sesión la entrada es más corta.
const SEEN = (() => {
  try { const seen = sessionStorage.getItem(SEEN_KEY) === '1'; sessionStorage.setItem(SEEN_KEY, '1'); return seen } catch { return false }
})()

/** Flecha que «atraviesa» el botón al pasar el mouse. */
function Arrow({ icon }: { icon: ReactNode }) {
  return <span className="hx-arrow" aria-hidden="true"><span>{icon}</span><span>{icon}</span></span>
}

/** Alternativa liviana (CSS 3D) para equipos sin WebGL, de bajo rendimiento o con movimiento reducido. */
function CssStack() {
  return <div className="hx-css"><div className="hx-css-rot">
    {['metal', 'glass', 'metal', 'glass'].map((k, i) => <span key={i} className={`hx-plate is-${k}`} style={vars({ '--l': i })} />)}
    <span className="hx-plate is-tile" style={vars({ '--l': 4 })} />
  </div></div>
}

export default function Hero({ t, arrow }: { t: HeroText; arrow: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<LayerStack | null>(null)
  const quick = SEEN
  const [mode, setMode] = useState<Mode>(() => (canUseWebGL() ? 'pending' : 'css'))

  // Carga diferida de la escena 3D; si tarda o falla, queda la versión CSS.
  useEffect(() => {
    if (mode !== 'pending') return
    let cancelled = false
    const timeout = window.setTimeout(() => { cancelled = true; setMode('css') }, 3000)
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    import('./layerStack').then(({ createLayerStack }) => {
      if (cancelled || !visualRef.current) return
      window.clearTimeout(timeout)
      sceneRef.current = createLayerStack(visualRef.current, { quick, fine, onLost: () => { sceneRef.current?.dispose(); sceneRef.current = null; setMode('css') } })
      setMode('webgl')
    }).catch(() => { window.clearTimeout(timeout); if (!cancelled) setMode('css') })
    return () => { cancelled = true; window.clearTimeout(timeout) }
  }, [mode, quick])
  useEffect(() => () => { sceneRef.current?.dispose(); sceneRef.current = null }, [])

  // Scroll (progreso 0–1 del hero) y puntero, en un solo cuadro por evento.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0, last = -1, mx = 0, my = 0, pointerDirty = false
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      if (Math.abs(p - last) > 1e-4) { last = p; el.style.setProperty('--p', p.toFixed(4)); sceneRef.current?.setProgress(p) }
      if (pointerDirty) {
        pointerDirty = false
        el.style.setProperty('--mx', mx.toFixed(3)); el.style.setProperty('--my', my.toFixed(3))
        sceneRef.current?.setPointer(mx, my)
      }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx = (e.clientX / window.innerWidth) * 2 - 1; my = (e.clientY / window.innerHeight) * 2 - 1
      pointerDirty = true; schedule()
    }
    const onLeave = () => { mx = 0; my = 0; pointerDirty = true; schedule() }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule)
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Botones magnéticos: sólo mouse, desplazamiento máximo de pocos píxeles.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const buttons = Array.from(el.querySelectorAll<HTMLElement>('.hx-btn'))
    const offs = buttons.map(btn => {
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect()
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2)
        btn.style.transform = `translate3d(${(dx * 5).toFixed(2)}px, ${(dy * 4).toFixed(2)}px, 0)`
      }
      const leave = () => { btn.style.transform = '' }
      btn.addEventListener('pointermove', move); btn.addEventListener('pointerleave', leave)
      return () => { btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerleave', leave) }
    })
    return () => offs.forEach(off => off())
  }, [])

  const letters = 'DOFRA'.split('')
  return <section ref={sectionRef} className={`hero hx${quick ? ' is-quick' : ''}`} id="inicio" aria-labelledby="hero-titulo">
    <div className="hx-bg" aria-hidden="true" />
    <div className="hx-inner">
      <div className="hx-guides" aria-hidden="true"><i /><i /><i /></div>

      <div className="hx-copy">
        <p className="eyebrow hx-in" style={vars({ '--d': 300 })}>{t.eyebrow}</p>
        <h1 id="hero-titulo" className="hx-in" style={vars({ '--d': 400 })}>{t.heroA} <span>{t.heroB}</span></h1>
        <p className="hx-lead hx-in" style={vars({ '--d': 560 })}>{t.heroDesc}</p>
        <div className="hx-actions hx-in" style={vars({ '--d': 680 })}>
          <a className="button hx-btn" href="#contacto">{t.heroContact}<Arrow icon={arrow} /></a>
          <a className="button hx-btn" href="#servicios">{t.seeWork}<Arrow icon={arrow} /></a>
        </div>
      </div>

      <div ref={visualRef} className={`hx-visual is-${mode}`} role="img" aria-label={t.heroVisual}>
        {mode === 'css' && <CssStack />}
      </div>

      <div className="hx-mark" aria-hidden="true">
        <span className="hx-baseline" />
        <span className="hx-word">
          {letters.map((c, i) => <span className="hx-ch" key={i} style={vars({ '--i': i })}><span>{c}</span></span>)}
          <span className="hx-ch hx-dot" style={vars({ '--i': letters.length })}><span /></span>
        </span>
      </div>

      <div className="hx-foot hx-in" style={vars({ '--d': 900 })}>
        <ul className="hx-facts"><li>{t.trust1}</li><li>{t.trust2}</li><li>{t.trust3}</li></ul>
        <p className="hx-sign">{SLOGAN}</p>
      </div>
    </div>
  </section>
}
