import { useEffect } from 'react'
import type { RefObject } from 'react'

const DESKTOP_MOTION = '(min-width: 1100px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const properties = ['shape', 'copy', 'mask', 'frame-opacity', 'opacity', 'description', 'link'] as const
const clamp = (value: number) => Math.max(0, Math.min(1, value))

function ease(value: number) {
  const progress = clamp(value)
  return progress * progress * (3 - 2 * progress)
}

export default function useProjectOpening(listRef: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const list = listRef.current
    if (!list || !('IntersectionObserver' in window) || !('ResizeObserver' in window) || !CSS.supports('clip-path', 'inset(0)')) return

    const media = window.matchMedia(DESKTOP_MOTION)
    const projects = Array.from(list.querySelectorAll<HTMLElement>('[data-project-motion]'), article => ({
      article,
      copy: article.querySelector<HTMLElement>('.work-copy')!,
      shot: article.querySelector<HTMLElement>('.work-shot')!,
      description: article.querySelector<HTMLElement>('.work-desc')!,
      progress: 0,
      lastPaint: '',
      complete: false,
    }))
    let stop = () => {}

    function configure() {
      stop()
      if (!media.matches) return

      const visible = new Set<HTMLElement>()
      let frame = 0

      function finish(project: typeof projects[number]) {
        project.complete = true
        project.article.setAttribute('data-project-opening', 'complete')
        for (const property of properties) project.article.style.removeProperty(`--opening-${property}`)
        resize.unobserve(project.article)
        resize.unobserve(project.copy)
        visible.delete(project.article)
        observer.unobserve(project.article)
      }

      function paint() {
        frame = 0
        const height = document.documentElement.clientHeight
        const start = height - Math.min(184, height * .20)
        const distance = Math.min(290, Math.max(180, height * .29))

        // Measure first, then write only for projects with new scroll progress or dimensions.
        const measurements = projects.filter(({ article }) => visible.has(article)).map(project => {
          const { article, copy, description, shot } = project
          const row = article.getBoundingClientRect()
          return {
            project,
            progress: Math.max(project.progress, clamp((start - row.top - row.height / 2) / distance)),
            centerX: row.width / 2 - copy.offsetLeft - copy.offsetWidth / 2,
            centerY: row.height / 2 - copy.offsetTop - (description.offsetTop + description.offsetHeight) / 2,
            frameSide: Math.max(0, (row.width - copy.offsetWidth - 64) / 2),
            frameEdge: Math.max(0, (row.height - description.offsetTop - description.offsetHeight - 56) / 2),
            width: row.width,
            height: row.height,
            shotTop: shot.offsetTop,
          }
        })

        for (const { project, progress, centerX, centerY, frameSide, frameEdge, width, height, shotTop } of measurements) {
          if (progress >= 1) {
            finish(project)
            continue
          }
          const measurement = [progress, centerX, centerY, frameSide, frameEdge, width, height, shotTop].join(',')
          if (measurement === project.lastPaint) continue
          project.lastPaint = measurement
          project.progress = progress
          const move = ease(progress / .86)
          const expand = ease(progress / .91)
          const reveal = ease((progress - .22) / .72)
          const link = ease((progress - .83) / .17)
          const shadow = -96 * ease((progress - .72) / .24)
          const mask = `calc(${(1 - reveal) * 100}% + ${shadow}px)`
          const { style, classList } = project.article
          const side = frameSide * (1 - expand)
          const edge = frameEdge * (1 - expand)
          style.setProperty('--opening-shape', `scale(${1 - 2 * side / width}, ${1 - 2 * edge / height})`)
          style.setProperty('--opening-copy', `translate3d(${centerX * (1 - move)}px, ${centerY * (1 - move) + 7 * (1 - ease(progress / .16))}px, 0)`)
          // Keep the reveal within the expanding frame, then uncover the original shadow.
          const outer = Math.max(0, side) + shadow
          const vertical = Math.max(0, edge - shotTop) + shadow
          const left = classList.contains('is-reverse') ? mask : `${outer}px`
          const right = classList.contains('is-reverse') ? `${outer}px` : mask
          style.setProperty('--opening-mask', `inset(${vertical}px ${right} ${vertical}px ${left})`)
          style.setProperty('--opening-frame-opacity', String(1 - ease((progress - .44) / .49)))
          style.setProperty('--opening-opacity', String(.95 + .05 * ease(progress / .18)))
          style.setProperty('--opening-link', String(link))
          style.setProperty('--opening-description', `${ease((progress - .35) / .65) * 100}%`)
        }
      }

      function schedule() {
        if (visible.size && !frame) frame = requestAnimationFrame(paint)
      }

      const observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
          const article = target as HTMLElement
          if (isIntersecting) visible.add(article)
          else visible.delete(article)
        }
        schedule()
      }, { rootMargin: '120px 0px' })

      const resize = new ResizeObserver(schedule)
      const onFocus = (event: FocusEvent) => {
        const project = projects.find(({ article }) => article.contains(event.target as Node))
        if (project && !project.complete) finish(project)
      }

      for (const project of projects) {
        project.article.setAttribute('data-project-opening', project.complete ? 'complete' : 'pending')
        if (project.complete) continue
        observer.observe(project.article)
        resize.observe(project.article)
        resize.observe(project.copy)
      }
      list?.addEventListener('focusin', onFocus)
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)

      stop = () => {
        observer.disconnect()
        resize.disconnect()
        cancelAnimationFrame(frame)
        list?.removeEventListener('focusin', onFocus)
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
        for (const project of projects) {
          project.article.removeAttribute('data-project-opening')
          for (const property of properties) project.article.style.removeProperty(`--opening-${property}`)
          project.progress = 0
          project.lastPaint = ''
        }
      }
    }

    configure()
    media.addEventListener('change', configure)
    return () => {
      stop()
      media.removeEventListener('change', configure)
    }
  }, [listRef])
}
