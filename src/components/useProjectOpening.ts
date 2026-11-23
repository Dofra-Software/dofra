import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

const DESKTOP = '(min-width: 1100px) and (hover: hover) and (pointer: fine)'
const DESKTOP_MOTION = `${DESKTOP} and (prefers-reduced-motion: no-preference)`
const TRIGGER_RATIO = .45
const FINISH_FALLBACK_MS = 640
const geometry = ['copy-x', 'copy-y', 'frame-inline', 'frame-block'] as const

function clearGeometry(article: HTMLElement) {
  for (const property of geometry) article.style.removeProperty(`--opening-${property}`)
}

export default function useProjectOpening(listRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return

    const media = window.matchMedia(DESKTOP_MOTION)
    const projects = Array.from(list.querySelectorAll<HTMLElement>('.work-item'), article => ({
      article,
      copy: article.querySelector<HTMLElement>('.work-copy')!,
      description: article.querySelector<HTMLElement>('.work-desc')!,
      expanded: false,
      fallback: 0,
    }))
    type Project = typeof projects[number]
    const byArticle = new Map(projects.map(project => [project.article, project]))
    let observer: IntersectionObserver | undefined
    let resize: ResizeObserver | undefined
    let section: IntersectionObserver | undefined
    let seen = false
    const onResize = () => { if (seen) observeActivation() }

    function measure({ article, copy, description }: Project) {
      if (!article.offsetWidth || !article.offsetHeight) return
      const textHeight = description.offsetTop + description.offsetHeight
      const width = article.offsetWidth
      const height = article.offsetHeight
      article.style.setProperty('--opening-copy-x', `${(width - copy.offsetWidth) / 2 - copy.offsetLeft}px`)
      article.style.setProperty('--opening-copy-y', `${(height - textHeight) / 2 - copy.offsetTop}px`)
      article.style.setProperty('--opening-frame-inline', `${Math.max(0, (width - copy.offsetWidth - 64) / 2)}px`)
      article.style.setProperty('--opening-frame-block', `${Math.max(0, (height - textHeight - 48) / 2)}px`)
    }

    function expand(project: Project) {
      window.clearTimeout(project.fallback)
      project.expanded = true
      project.article.dataset.projectOpening = 'expanded'
      clearGeometry(project.article)
      observer?.unobserve(project.article)
      resize?.unobserve(project.article)
      resize?.unobserve(project.copy)
    }

    function start(project: Project) {
      if (project.article.dataset.projectOpening !== 'compact') return
      observer?.unobserve(project.article)
      project.article.dataset.projectOpening = 'opening'
      project.fallback = window.setTimeout(() => expand(project), FINISH_FALLBACK_MS)
    }

    function observeActivation() {
      observer?.disconnect()
      const viewport = document.documentElement.clientHeight
      const inset = Math.min(185, Math.round(viewport * .24))
      // Include cards already above the trigger so a large jump cannot skip them.
      const past = document.documentElement.scrollHeight
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < TRIGGER_RATIO) continue
          const project = byArticle.get(entry.target as HTMLElement)
          if (project) start(project)
        }
      }, { rootMargin: `${past}px 0px -${inset}px 0px`, threshold: TRIGGER_RATIO })
      for (const { article } of projects) {
        if (article.dataset.projectOpening === 'compact') observer.observe(article)
      }
    }

    function onAnimationEnd(event: AnimationEvent) {
      if (event.animationName !== 'project-opening-frame') return
      const project = byArticle.get(event.target as HTMLElement)
      if (project?.article.dataset.projectOpening === 'opening') expand(project)
    }

    function onFocus(event: FocusEvent) {
      const article = (event.target as HTMLElement).closest<HTMLElement>('.work-item')
      const project = article && byArticle.get(article)
      if (project && !project.expanded) expand(project)
    }

    /** Fuera de la sección, los proyectos vuelven a su estado inicial para abrirse otra vez al regresar. */
    function reset() {
      observer?.disconnect()
      for (const project of projects) {
        if (project.article.dataset.projectOpening === 'compact') continue
        window.clearTimeout(project.fallback)
        project.expanded = false
        project.article.dataset.projectOpening = 'compact'
        measure(project)
        resize?.observe(project.article)
        resize?.observe(project.copy)
      }
    }

    function cleanup() {
      section?.disconnect()
      observer?.disconnect()
      resize?.disconnect()
      window.removeEventListener('resize', onResize)
      list?.removeEventListener('animationend', onAnimationEnd)
      list?.removeEventListener('focusin', onFocus)
      for (const project of projects) {
        if (project.article.dataset.projectOpening === 'opening') project.expanded = true
        window.clearTimeout(project.fallback)
        delete project.article.dataset.projectOpening
        clearGeometry(project.article)
      }
    }

    function configure() {
      cleanup()
      if (!media.matches) return

      resize = new ResizeObserver(() => {
        for (const project of projects) {
          if (!project.expanded) measure(project)
        }
      })
      for (const project of projects) {
        project.article.dataset.projectOpening = project.expanded ? 'expanded' : 'compact'
        if (project.expanded) continue
        measure(project)
        resize.observe(project.article)
        resize.observe(project.copy)
      }
      observeActivation()
      seen = false
      section = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!seen) { seen = true; observeActivation() }
          return
        }
        if (!seen) return
        seen = false
        reset()
      })
      section.observe(list?.closest('section') ?? list!)
      window.addEventListener('resize', onResize)
      list?.addEventListener('animationend', onAnimationEnd)
      list?.addEventListener('focusin', onFocus)
    }

    configure()
    media.addEventListener('change', configure)
    // The fragment can be visited before React has inserted its destination.
    const initialNavigation = window.location.hash === '#proyectos' && window.matchMedia(DESKTOP).matches
      ? requestAnimationFrame(() => {
        if (window.scrollY === 0 && window.location.hash === '#proyectos') {
          list.closest('#proyectos')?.scrollIntoView({ behavior: 'instant' })
        }
      })
      : 0

    return () => {
      cancelAnimationFrame(initialNavigation)
      media.removeEventListener('change', configure)
      cleanup()
    }
  }, [listRef])
}
