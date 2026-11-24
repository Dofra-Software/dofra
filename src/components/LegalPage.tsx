import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { Block, LegalDoc, LegalLocale } from '../legal/types'
import { REGISTRY_ACTIVE } from '../legal'
import { TURNSTILE_ACTIVE } from '../turnstile'
import RichText from './RichText'
import './legal.css'

const DESKTOP = '(min-width: 1000px)'

function useDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches)
  useEffect(() => {
    const media = window.matchMedia(DESKTOP)
    const onChange = () => setDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return desktop
}

/** Encabezado común de las páginas legales y de los formularios de solicitudes. */
export function LegalHero({ ui, kicker, title, updated, children }: {
  ui: LegalLocale['ui']
  kicker: string
  title: string
  updated?: string
  children?: ReactNode
}) {
  return <header className="legal-hero">
    <div className="container legal-hero-inner">
      <a className="legal-back" href="/"><span aria-hidden="true">←</span> {ui.backHome}</a>
      <p className="legal-kicker">{kicker}</p>
      <h1 id="legal-titulo">{title}</h1>
      {updated && <p className="legal-updated">{ui.updatedLabel} <time dateTime="2026-11-24">{updated}</time></p>}
      {updated && ui.translationNote && <p className="legal-translation">{ui.translationNote}</p>}
      {children}
    </div>
  </header>
}

function renderBlock(block: Block, key: number, newTab: string): ReactNode {
  if (typeof block === 'string') return <p key={key}><RichText text={block} newTabLabel={newTab} /></p>
  if ('list' in block) return <ul key={key}>{block.list.map(item => <li key={item}><RichText text={item} newTabLabel={newTab} /></li>)}</ul>
  const active = { registry: REGISTRY_ACTIVE, turnstile: TURNSTILE_ACTIVE, noTurnstile: !TURNSTILE_ACTIVE }[block.when]
  return active ? renderBlock(block.block, key, newTab) : null
}

/** Documento legal: título, fecha de actualización, índice con anclas y secciones numeradas. */
export default function LegalPage({ doc, ui }: { doc: LegalDoc; ui: LegalLocale['ui'] }) {
  const desktop = useDesktop()
  const [tocOpen, setTocOpen] = useState(false)
  const anchor = (i: number) => `s-${i + 1}`

  // Acceso directo a una sección (/privacidad#s-12): el contenido se dibuja después de que el navegador
  // intentó ir al ancla, así que se repite el desplazamiento una vez montada la página.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const go = () => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
    const frame = requestAnimationFrame(go)
    document.fonts?.ready.then(go) // las fuentes cambian la altura del texto: se ajusta al terminar de cargar
    return () => cancelAnimationFrame(frame)
  }, [])

  return <main id="contenido" tabIndex={-1} className="legal" aria-labelledby="legal-titulo">
    <LegalHero ui={ui} kicker={ui.kicker} title={doc.title} updated={doc.updated} />
    <div className="container legal-layout">
      <nav className="legal-toc" aria-label={ui.toc}>
        <details open={desktop || tocOpen} onToggle={event => { if (!desktop) setTocOpen(event.currentTarget.open) }}>
          <summary>{ui.toc}</summary>
          <ol>{doc.sections.map((section, i) => <li key={section.title}>
            <a href={`#${anchor(i)}`} onClick={() => { if (!desktop) setTocOpen(false) }}><span aria-hidden="true">{i + 1}.</span> {section.title}</a>
          </li>)}</ol>
        </details>
      </nav>
      <article className="legal-body">
        {doc.sections.map((section, i) => <section key={section.title} id={anchor(i)} aria-labelledby={`${anchor(i)}-t`}>
          <h2 id={`${anchor(i)}-t`}><span className="legal-num">{i + 1}.</span> {section.title}</h2>
          {section.blocks.map((block, j) => renderBlock(block, j, ui.newTab))}
        </section>)}
        <p className="legal-top"><a href="#contenido">{ui.backTop} <span aria-hidden="true">↑</span></a></p>
      </article>
    </div>
  </main>
}
