import { useEffect, useRef, useState } from 'react'

type ProcessStep = { title: string; desc: string }

const MOBILE = '(max-width: 767px)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const readingLine = () => window.innerHeight * 0.45

export default function MobileProcessTimeline({ steps, label }: { steps: ProcessStep[]; label: string }) {
  const listRef = useRef<HTMLOListElement>(null)
  const scrollStep = useRef(-1)
  const manualStep = useRef<number | null>(null)
  const smoothTarget = useRef<number | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const mobile = window.matchMedia(MOBILE)
    const motion = window.matchMedia(REDUCED_MOTION)
    const rows = Array.from(list.children) as HTMLElement[]
    let centers: number[] = []
    let frame = 0

    function update() {
      frame = 0
      if (!list || !mobile.matches || !centers.length) return

      const readTo = readingLine() - list.getBoundingClientRect().top
      const first = centers[0]
      const span = centers[centers.length - 1] - first
      const reached = Math.max(0, centers.filter(center => center <= readTo + 1).length - 1)
      const progress = span ? Math.max(0, Math.min(1, (readTo - first) / span)) : 0

      if (motion.matches) {
        list.style.setProperty('--mobile-process-progress', '0')
        return
      }
      if (smoothTarget.current !== null) {
        if (Math.abs(window.scrollY - smoothTarget.current) > 2) return
        smoothTarget.current = null
        manualStep.current = reached
      }
      scrollStep.current = reached
      if (manualStep.current === reached) return
      manualStep.current = null

      list.style.setProperty('--mobile-process-progress', String(progress))
      setActiveStep(current => current === reached ? current : reached)
    }

    function schedule() {
      if (mobile.matches && !frame) frame = window.requestAnimationFrame(update)
    }

    function measure() {
      if (!list || !mobile.matches) return
      centers = rows.map(row => row.offsetTop + 22)
      list.style.setProperty('--mobile-process-rail', `${centers[centers.length - 1] - centers[0]}px`)
      schedule()
    }

    function interruptScroll() {
      smoothTarget.current = null
    }

    function onKeyDown(event: KeyboardEvent) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interruptScroll()
    }

    // Al salir por completo de la sección se olvida la selección manual: al volver, manda el scroll.
    const section = list.closest('section') ?? list
    const leave = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return
      manualStep.current = null
      smoothTarget.current = null
      schedule()
    })
    leave.observe(section)
    const resize = new ResizeObserver(measure)
    rows.forEach(row => resize.observe(row))
    mobile.addEventListener('change', measure)
    motion.addEventListener('change', schedule)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('touchstart', interruptScroll, { passive: true })
    window.addEventListener('wheel', interruptScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    measure()

    return () => {
      resize.disconnect()
      leave.disconnect()
      window.cancelAnimationFrame(frame)
      mobile.removeEventListener('change', measure)
      motion.removeEventListener('change', schedule)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('touchstart', interruptScroll)
      window.removeEventListener('wheel', interruptScroll)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [steps.length])

  function selectStep(index: number, row: HTMLElement) {
    const list = listRef.current
    if (!list) return
    setActiveStep(index)
    manualStep.current = scrollStep.current
    smoothTarget.current = null
    if (window.matchMedia(REDUCED_MOTION).matches) return

    const first = list.firstElementChild as HTMLElement
    const last = list.lastElementChild as HTMLElement
    const span = last.offsetTop - first.offsetTop
    list.style.setProperty('--mobile-process-progress', String(span ? (row.offsetTop - first.offsetTop) / span : 0))

    const rect = row.getBoundingClientRect()
    const header = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0
    if (rect.top >= header + 8 && rect.bottom <= window.innerHeight - 8) return

    const limit = document.documentElement.scrollHeight - window.innerHeight
    const target = Math.max(0, Math.min(limit, window.scrollY + rect.top + 22 - readingLine()))
    if (Math.abs(window.scrollY - target) <= 2) return
    smoothTarget.current = target
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <ol className="mobile-process-timeline" ref={listRef} aria-label={label}>
      {steps.map((step, index) => (
        <li key={index} className="mobile-process-step">
          <button
            type="button"
            className="mobile-process-node"
            aria-labelledby={`mobile-process-title-${index}`}
            aria-current={activeStep === index ? 'step' : undefined}
            onClick={event => {
              const row = event.currentTarget.parentElement
              if (row) selectStep(index, row)
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
          <div className="mobile-process-copy">
            <h3 id={`mobile-process-title-${index}`}>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
