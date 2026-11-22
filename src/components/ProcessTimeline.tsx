import { useEffect, useRef, useState } from 'react'

type ProcessStep = { title: string; desc: string }

const DESKTOP = '(min-width: 1100px) and (hover: hover) and (pointer: fine)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export default function ProcessTimeline({ steps, label }: { steps: ProcessStep[]; label: string }) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const scrollStep = useRef(0)
  const manualScrollStep = useRef<number | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const lastStep = steps.length - 1

  useEffect(() => {
    const timeline = timelineRef.current
    const rail = railRef.current
    if (!timeline || !rail) return

    const desktop = window.matchMedia(DESKTOP)
    const reduced = window.matchMedia(REDUCED_MOTION)
    const section = timeline.closest('section') ?? timeline
    const header = document.querySelector<HTMLElement>('.header')
    let headerHeight = header?.offsetHeight ?? 0
    let visible = false
    let frame = 0
    let scrolled = false

    function update() {
      frame = 0
      const fromScroll = scrolled
      scrolled = false
      if (!timeline || !rail || !visible || !desktop.matches || reduced.matches) return

      // Advance while the rail crosses a short band in the middle of the viewport.
      const available = window.innerHeight - headerHeight
      const start = headerHeight + available * 0.55
      const distance = Math.min(420, available * 0.34)
      const progress = Math.max(0, Math.min(1, (start - rail.getBoundingClientRect().top) / distance))
      const stage = Math.min(lastStep, Math.floor(progress * lastStep + 0.0001))
      scrollStep.current = stage

      // A click owns the position until scrolling actually crosses a stage boundary.
      if (manualScrollStep.current !== null) {
        if (!fromScroll || stage === manualScrollStep.current) return
        manualScrollStep.current = null
      }

      delete timeline.dataset.manual
      timeline.style.setProperty('--process-progress', String(progress))
      setActiveStep(stage)
    }

    function schedule() {
      if (visible && desktop.matches && !reduced.matches && !frame) {
        frame = window.requestAnimationFrame(update)
      }
    }

    function onScroll() {
      scrolled = true
      schedule()
    }

    function onResize() {
      headerHeight = header?.offsetHeight ?? 0
      schedule()
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && desktop.matches) timeline.dataset.entered = 'true'
      schedule()
    })
    observer.observe(section)

    function onMediaChange() {
      if (visible && desktop.matches && timeline) timeline.dataset.entered = 'true'
      schedule()
    }

    desktop.addEventListener('change', onMediaChange)
    reduced.addEventListener('change', onMediaChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      desktop.removeEventListener('change', onMediaChange)
      reduced.removeEventListener('change', onMediaChange)
    }
  }, [lastStep])

  function selectStep(index: number) {
    const timeline = timelineRef.current
    if (!timeline) return
    manualScrollStep.current = scrollStep.current
    timeline.dataset.manual = 'true'
    timeline.style.setProperty('--process-progress', String(index / lastStep))
    setActiveStep(index)
  }

  return (
    <div className="process-timeline" ref={timelineRef}>
      <div className="timeline-rail" ref={railRef}>
        <div className="timeline-track" aria-hidden="true">
          <span className="timeline-progress" />
        </div>
        <ol className="timeline-steps" aria-label={label}>
          {steps.map((step, index) => (
            <li key={index}>
              <button
                type="button"
                className="timeline-node"
                aria-current={index === activeStep ? 'step' : undefined}
                aria-controls="process-timeline-panel"
                aria-label={step.title}
                title={step.title}
                onClick={() => selectStep(index)}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div id="process-timeline-panel" className="timeline-panel">
        {steps.map((step, index) => (
          <div key={index} className="timeline-copy" aria-hidden={index !== activeStep}>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
