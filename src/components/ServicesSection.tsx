import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import './services.css'

type Plan = {
  id: string; name: string; tagline: string; featured?: boolean
  features: string[]; changes: string; link: { label: string; url: string }; cta: string
}
type ServicesText = {
  serviceKicker: string; serviceTitle: string; serviceDesc: string; serviceTabsLabel: string
  web: {
    title: string; plansTitle: string; plansDesc: string; plansLabel: string; recommended: string; plans: Plan[]
    plus: { title: string; tag: string; lead: string; desc: string }
  }
  apps: { title: string; kicker: string; heading: string[]; desc: string; cta: string }
}
type Tab = 'web' | 'apps'
type QuoteKind = 'esencial' | 'pro' | 'advanced' | 'custom'
type Props = {
  t: ServicesText
  quote: (kind: QuoteKind) => (event: MouseEvent<HTMLAnchorElement>) => void
  linkLabel: (label: string) => string
  icon: (name: string, size: number) => ReactNode
}

const PANEL_IDS: Record<Tab, string> = { web: 'paginas-web', apps: 'apps-a-medida' }
const TABS: Tab[] = ['web', 'apps']

/** Línea gráfica de cada plan: se dibuja al entrar en pantalla; el punto marca el plan. */
const GRAPHICS: Record<string, ReactNode> = {
  esencial: <><path className="svc-draw" d="M4 42H77V9H155V42H236V20H308" stroke="#0B1930" strokeWidth="1.5" /><circle className="svc-dot" cx="155" cy="9" r="5" fill="#C4938E" /></>,
  pro: <><path className="svc-draw" d="M4 42H58V27H108V9H162V27H214V42H307" stroke="#0B1930" strokeWidth="1.5" /><path d="M108 27H162V9" stroke="#0B1930" strokeWidth="1" opacity=".35" /><circle className="svc-dot" cx="162" cy="9" r="5" fill="#FFFFFF" /></>,
  advanced: <><path className="svc-draw" d="M4 42H66V12H133V31H202V10H266V42H308" stroke="#FFFFFF" strokeWidth="1.5" /><circle className="svc-dot" cx="202" cy="10" r="5" fill="#C4938E" /></>,
}

export default function ServicesSection({ t, quote, linkLabel, icon }: Props) {
  const [tab, setTab] = useState<Tab>('web')
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ web: null, apps: null })

  // Enlaces directos (#paginas-web, #apps-a-medida): abren la pestaña correspondiente.
  useEffect(() => {
    function fromHash() {
      const next = TABS.find(key => `#${PANEL_IDS[key]}` === window.location.hash)
      if (!next) return
      setTab(next)
      requestAnimationFrame(() => document.getElementById(PANEL_IDS[next])?.scrollIntoView())
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = TABS[(keys[event.key] + TABS.length) % TABS.length]
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  const tabLabel: Record<Tab, string> = { web: t.web.title, apps: t.apps.title }

  return <section className="section services" id="servicios" aria-labelledby="servicios-titulo"><div className="container">
    <header className="svc-intro" data-reveal>
      <div><p className="svc-kicker">{t.serviceKicker}</p><h2 id="servicios-titulo">{t.serviceTitle}</h2></div>
      <p>{t.serviceDesc}</p>
    </header>

    <div className="svc-switcher" role="tablist" aria-label={t.serviceTabsLabel}>
      {TABS.map((key, index) => <button type="button" role="tab" key={key} id={`tab-${PANEL_IDS[key]}`}
        ref={el => { tabRefs.current[key] = el }} className="svc-switch"
        aria-selected={tab === key} aria-controls={PANEL_IDS[key]} tabIndex={tab === key ? 0 : -1}
        onClick={() => setTab(key)} onKeyDown={event => onTabKey(event, index)}>
        <strong>{tabLabel[key]}</strong><span className="svc-switch-arrow" aria-hidden="true">{icon('arrow', 20)}</span>
      </button>)}
    </div>

    <div className="svc-panel" id={PANEL_IDS.web} role="tabpanel" aria-labelledby={`tab-${PANEL_IDS.web}`} tabIndex={-1} hidden={tab !== 'web'}>
      <header className="svc-panel-head"><h3>{t.web.plansTitle}</h3><p>{t.web.plansDesc}</p></header>
      <ul className="svc-cards" aria-label={t.web.plansLabel} data-reveal>
        {t.web.plans.map((plan, i) => <li key={plan.id} className={`svc-card is-${plan.id}`} style={{ '--i': i } as CSSProperties} aria-labelledby={`plan-${plan.id}`}>
          <div className="svc-card-top">{plan.featured && <span className="svc-pill">{t.web.recommended}</span>}</div>
          <h4 id={`plan-${plan.id}`}>{plan.name}</h4>
          <p className="svc-tagline">{plan.tagline}</p>
          <div className="svc-graphic" aria-hidden="true"><svg viewBox="0 0 315 54" fill="none">{GRAPHICS[plan.id]}</svg></div>
          <ul className="svc-features">{plan.features.map(feature => <li key={feature}>{icon('check', 15)}<span>{feature}</span></li>)}</ul>
          <p className="svc-changes">{plan.changes}</p>
          <div className="svc-card-foot">
            <a className="svc-example" href={plan.link.url} target="_blank" rel="noopener noreferrer" aria-label={linkLabel(plan.link.label)}>
              <span>{plan.link.label}</span><span className="svc-example-arrow" aria-hidden="true">{icon('arrow', 15)}</span>
            </a>
            <a className="svc-quote" href="#contacto" onClick={quote(plan.id as QuoteKind)}>
              <span>{plan.cta}</span><span className="svc-quote-arrow" aria-hidden="true">{icon('arrow', 16)}</span>
            </a>
          </div>
        </li>)}
      </ul>
      <aside className="svc-plus" aria-labelledby="plus-titulo" data-reveal>
        <p className="svc-plus-head"><strong id="plus-titulo">{t.web.plus.title}</strong><small>{t.web.plus.tag}</small></p>
        <p><strong>{t.web.plus.lead}</strong> {t.web.plus.desc}</p>
      </aside>
    </div>

    <div className="svc-panel" id={PANEL_IDS.apps} role="tabpanel" aria-labelledby={`tab-${PANEL_IDS.apps}`} tabIndex={-1} hidden={tab !== 'apps'}>
      <div className="svc-system" data-reveal>
        <div>
          <p className="svc-system-kicker">{t.apps.kicker}</p>
          <h3>{t.apps.heading.map((line, i) => <span key={line}>{i > 0 && ' '}{line}</span>)}</h3>
          <p>{t.apps.desc}</p>
          <a className="svc-quote" href="#contacto" onClick={quote('custom')}>
            <span>{t.apps.cta}</span><span className="svc-quote-arrow" aria-hidden="true">{icon('arrow', 16)}</span>
          </a>
        </div>
        <div className="svc-design" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
    </div>
  </div></section>
}
