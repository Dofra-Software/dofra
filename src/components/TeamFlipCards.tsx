import { useEffect, useRef, useState } from 'react'

/** `formal`: nombre con título profesional para el dorso (si falta, se usa `name`). */
type Person = { name: string; formal?: string; role: string; desc: string }

type Props = {
  title: string
  titleId: string
  paragraphs: readonly string[]
  people: readonly Person[]
  moreLabel: string
  backLabel: string
}

/** Retraso entre el giro de una tarjeta y la siguiente cuando entran juntas (escritorio). */
const STAGGER_MS = 180
/** Duración de la entrada de las tarjetas: el giro empieza cuando terminó. */
const ENTER_MS = 520

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasObserver = () => typeof window !== 'undefined' && 'IntersectionObserver' in window

function FlipIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M18 3v3.6h-3.6" />
      <path d="M6 21v-3.6h3.6" />
    </svg>
  )
}

/**
 * Sección «Nosotras»: introducción centrada y dos tarjetas que giran en 3D.
 * El scroll sólo dispara la secuencia; después, cada tarjeta se controla a mano.
 * Al salir por completo de la sección, todo vuelve al inicio y la secuencia se repite al regresar.
 */
export default function TeamFlipCards({ title, titleId, paragraphs, people, moreLabel, backLabel }: Props) {
  // Sin observer o con movimiento reducido no hay estados ocultos de entrada.
  const [animate] = useState(() => hasObserver() && !prefersReducedMotion())
  const [introIn, setIntroIn] = useState(!animate)
  const [cardsIn, setCardsIn] = useState(!animate)
  const [flipped, setFlipped] = useState<boolean[]>(() => people.map(() => false))

  const introRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const buttonRefs = useRef<(HTMLButtonElement | null)[][]>([])
  /** Tarjetas que ya giraron solas o que la persona tocó: el scroll no vuelve a moverlas. */
  const settled = useRef<boolean[]>(people.map(() => false))
  const cardsEnteredAt = useRef<number | null>(animate ? null : 0)
  const focusAfterFlip = useRef<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  /** Cada vuelta a la sección arma de nuevo los observers de entrada y de giro. */
  const [cycle, setCycle] = useState(0)
  /** Si la sección estuvo en pantalla en esta visita (para no girar tarjetas que nunca se vieron). */
  const visited = useRef(false)

  // Reinicio: cuando la sección sale completamente de la pantalla, vuelve al estado inicial.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !hasObserver()) return
    let seen = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { seen = true; visited.current = true; return }
      if (!seen) return
      seen = false
      visited.current = false
      settled.current = people.map(() => false)
      cardsEnteredAt.current = animate ? null : 0
      focusAfterFlip.current = null
      setFlipped(people.map(() => false))
      if (animate) { setIntroIn(false); setCardsIn(false) }
      setCycle(c => c + 1)
    })
    io.observe(root)
    return () => io.disconnect()
  }, [animate, people])

  const setFace = (index: number, value: boolean) =>
    setFlipped(prev => (prev[index] === value ? prev : prev.map((f, i) => (i === index ? value : f))))

  // Fases 1 y 2: aparición de la introducción y de las tarjetas.
  useEffect(() => {
    if (!animate) return
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        if (entry.target === introRef.current) setIntroIn(true)
        if (entry.target === listRef.current) {
          cardsEnteredAt.current = performance.now()
          setCardsIn(true)
        }
        io.unobserve(entry.target)
      }
    }, { threshold: 0.15 })
    if (introRef.current) io.observe(introRef.current)
    if (listRef.current) io.observe(listRef.current)
    return () => io.disconnect()
  }, [animate, cycle])

  // Fase 3: giro automático al llegar a la zona central de la pantalla.
  useEffect(() => {
    if (!hasObserver()) return
    const timers: number[] = []
    const io = new IntersectionObserver(entries => {
      const now = performance.now()
      const ready = entries
        .filter(entry => {
          // También cuenta una tarjeta que se pasó de largo con un scroll rápido.
          const passed = visited.current && entry.rootBounds && entry.boundingClientRect.bottom < entry.rootBounds.top
          return entry.isIntersecting || passed
        })
        .map(entry => cardRefs.current.indexOf(entry.target as HTMLElement))
        .filter(index => index >= 0 && !settled.current[index])
        .sort((a, b) => a - b)
      ready.forEach((index, order) => {
        settled.current[index] = true
        io.unobserve(cardRefs.current[index]!)
        const entered = cardsEnteredAt.current
        const wait = entered === null ? ENTER_MS : Math.max(0, entered + ENTER_MS - now)
        timers.push(window.setTimeout(() => setFace(index, true), wait + order * STAGGER_MS))
      })
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 })
    cardRefs.current.forEach(card => card && io.observe(card))
    return () => {
      io.disconnect()
      timers.forEach(window.clearTimeout)
    }
  }, [cycle])

  // Al girar con teclado, el foco pasa al control de la cara que queda visible.
  useEffect(() => {
    const index = focusAfterFlip.current
    if (index === null) return
    focusAfterFlip.current = null
    buttonRefs.current[index]?.[flipped[index] ? 1 : 0]?.focus({ preventScroll: true })
  }, [flipped])

  const toggle = (index: number, fromKeyboardFocus: boolean) => {
    settled.current[index] = true
    if (fromKeyboardFocus) focusAfterFlip.current = index
    setFace(index, !flipped[index])
  }

  return (
    <div ref={rootRef} className={`container team${animate ? ' team-animated' : ''}`}>
      <header ref={introRef} className={`team-intro${introIn ? ' is-in' : ''}`}>
        <h2 id={titleId}>{title}</h2>
        {paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </header>

      <ul ref={listRef} className={`team-cards${cardsIn ? ' is-in' : ''}`}>
        {people.map((person, index) => {
          const isFlipped = flipped[index]
          const hidden = (face: 'front' | 'back') => (face === 'front') === isFlipped
          const faceProps = (face: 'front' | 'back') =>
            hidden(face) ? { 'aria-hidden': true as const, inert: '' } : {}
          return (
            <li key={person.name} className="team-card-slot" style={{ ['--i' as string]: index }}>
              <article
                ref={el => { cardRefs.current[index] = el }}
                className={`team-card${isFlipped ? ' is-flipped' : ''}`}
                onClick={event => {
                  const button = (event.target as HTMLElement).closest('button')
                  toggle(index, button !== null && button === document.activeElement && event.detail === 0)
                }}
              >
                <div className="team-card-inner">
                  <div className="team-face team-front" {...faceProps('front')}>
                    <span className="team-initial" aria-hidden="true">{person.name[0]}</span>
                    <h3 className="team-name">{person.name}</h3>
                    <p className="team-role">{person.role}</p>
                    <p className="sr-only">{person.desc}</p>
                    <button type="button" className="team-toggle" aria-expanded={isFlipped}
                      ref={el => { (buttonRefs.current[index] ??= [])[0] = el }}>
                      <span>{moreLabel}</span><span className="sr-only">: {person.name}</span><FlipIcon />
                    </button>
                  </div>
                  <div className="team-face team-back" {...faceProps('back')}>
                    <h3 className="team-name">{person.formal ?? person.name}</h3>
                    <p className="sr-only">{person.role}</p>
                    <p className="team-desc">{person.desc}</p>
                    <button type="button" className="team-toggle" aria-expanded={isFlipped}
                      ref={el => { (buttonRefs.current[index] ??= [])[1] = el }}>
                      <span>{backLabel}</span><span className="sr-only">: {person.name}</span><FlipIcon />
                    </button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
