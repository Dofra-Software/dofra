import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import DofraParticles from './components/DofraParticles'

type Lang = 'es' | 'en'
type Faq = { q: string; a: string; /** true = borrador que necesita confirmación; no se publica */ pending?: boolean }

const CONTACT_EMAIL = 'dofrasoftware@gmail.com'

/** Redes oficiales. Un ícono solo se muestra si su URL está cargada. */
const SOCIAL_LINKS: { id: 'instagram' | 'linkedin'; name: string; url: string }[] = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/dofra.software/' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/company/dofra-software/' },
]

const content = {
  es: {
    skip: 'Saltar al contenido',
    nav: ['Inicio', 'Servicios', 'Nosotras', 'Contacto'], talk: 'Hablemos',
    navLabel: 'Navegación principal', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', langSwitch: 'Switch to English', brandLabel: 'Dofra Software, ir al inicio',
    eyebrow: 'DESARROLLO WEB Y SOFTWARE A MEDIDA',
    heroA: 'Páginas web y sistemas a medida', heroB: 'para tu negocio.',
    heroDesc: 'Ayudamos a emprendimientos, profesionales y pequeñas empresas a mostrar sus servicios, organizar su trabajo y ahorrar tiempo con tecnología adaptada a sus necesidades.',
    heroContact: 'Contanos qué necesitás', seeWork: 'Ver servicios',
    trust1: 'Pensado para crecer', trust2: 'Diseño + desarrollo', trust3: 'En todo el mundo',
    serviceKicker: 'QUÉ HACEMOS', serviceTitle: '¿Cómo podemos ayudar a tu negocio?', serviceDesc: 'Cuatro formas de usar la tecnología a tu favor, explicadas sin tecnicismos.',
    examplesLabel: 'Ejemplos',
    services: [
      { icon: 'code', title: 'Páginas web', desc: 'Mostrá tus servicios y facilitá que tus próximos clientes te contacten.', examples: ['Páginas de presentación', 'Sitios profesionales', 'Webs para empresas'] },
      { icon: 'layers', title: 'Aplicaciones web', desc: 'Herramientas que se usan desde el navegador para que tus clientes o tu equipo puedan realizar gestiones.', examples: ['Reservas online', 'Portales de clientes', 'Paneles de seguimiento'] },
      { icon: 'cpu', title: 'Sistemas a medida', desc: 'Organizá la información y los procesos de tu negocio en una herramienta adaptada a tu forma de trabajar.', examples: ['Gestión de clientes', 'Turnos', 'Cobros', 'Tareas internas'] },
      { icon: 'zap', title: 'Automatizaciones', desc: 'Reducí tareas repetitivas y evitá cargar la misma información en distintos lugares.', examples: ['Recordatorios', 'Formularios conectados con planillas', 'Avisos automáticos'] },
    ],
    processKicker: 'CÓMO TRABAJAMOS', processTitle: 'Un proceso simple y claro.',
    process: [
      { title: 'Escuchamos', desc: 'Nos contás cómo funciona tu negocio y qué te gustaría resolver.' },
      { title: 'Diseñamos', desc: 'Convertimos esas ideas en una propuesta clara y fácil de usar.' },
      { title: 'Desarrollamos', desc: 'Construimos la solución con tecnología actual y cuidando cada detalle.' },
      { title: 'Acompañamos', desc: 'Lanzamos el proyecto y lo mejoramos cuando tu negocio lo necesite.' },
    ],
    aboutKicker: 'SOBRE DOFRA', aboutTitle: 'Nosotras',
    aboutDesc: 'Dofra une dos miradas: la del negocio y la de la tecnología. Entre las dos sumamos experiencia en empresas internacionales y más de 4 años de trayectoria en sistemas. Por eso empezamos por entender cómo trabaja tu negocio y recién después pensamos la solución: clara, a medida y fácil de usar.',
    people: [
      { name: 'Franca', role: 'Contadora', desc: 'Aporta la mirada del negocio: costos, cobros y procesos administrativos, para que cada solución responda a necesidades reales.' },
      { name: 'Victoria', role: 'Ingeniera en software', desc: 'Se ocupa del diseño técnico y el desarrollo, para que cada herramienta funcione bien y sea fácil de usar.' },
    ],
    faqKicker: 'PREGUNTAS FRECUENTES', faqTitle: 'Antes de empezar.',
    faqs: [
      { q: '¿Qué necesitan de mí para empezar?', a: 'Para la primera conversación alcanza con que nos cuentes a qué se dedica tu negocio, qué te gustaría resolver y, si tenés, ejemplos de páginas o herramientas que te gusten. No hace falta que sepas de tecnología.' },
      { q: '¿Trabajan con negocios pequeños?', a: 'Sí. Trabajamos con emprendimientos, profesionales y empresas que buscan una solución digital acorde a su etapa.' },
      { q: '¿Puedo contratar solo una página web?', a: 'Por supuesto. Podemos hacer una página de presentación, un sitio profesional o una solución más completa, según lo que necesites.' },
      { q: '¿Cuánto puede tardar el proyecto?', a: '[A CONFIRMAR] Depende del tipo de proyecto y de cuánto haya que desarrollar. Por ejemplo, una página de presentación suele llevar alrededor de [PLAZO] y un sistema a medida, [PLAZO]. Antes de empezar te pasamos un plazo estimado.', pending: true },
      { q: '¿El dominio y el alojamiento están incluidos?', a: '[A CONFIRMAR] [Incluido / No incluido / Opcional]. El dominio es la dirección de tu página (por ejemplo, tunegocio.com) y el alojamiento es el servicio que la mantiene publicada en internet.', pending: true },
      { q: '¿Voy a poder actualizar la página?', a: '[A CONFIRMAR] Sí / Según el proyecto. [Explicar qué podrá cambiar el cliente por su cuenta —textos, fotos, precios— y qué cambios se hacen con nosotras].', pending: true },
      { q: '¿Cómo se define el presupuesto?', a: '[A CONFIRMAR] Lo armamos después de conocer qué necesitás, según el alcance del proyecto. [Indicar si es precio cerrado, si hay anticipo y medios de pago].', pending: true },
      { q: '¿Qué soporte ofrecen después de entregar?', a: 'Podemos acordar soporte, mejoras y mantenimiento después de la entrega, según las necesidades del proyecto.' },
      { q: '¿Trabajan con clientes de otros países?', a: 'Sí. Trabajamos de forma remota con clientes de cualquier parte del mundo.' },
    ] as Faq[],
    contactKicker: 'CONTACTO', contactTitle: 'Contanos qué necesitás.',
    contactDesc: 'Escribinos con tus propias palabras. No hace falta saber de tecnología: si todavía no tenés claro qué solución te conviene, te ayudamos a definirlo.',
    contactSubject: 'Consulta de proyecto — Dofra Software',
    form: {
      requiredNote: 'Los campos marcados con * son obligatorios.',
      name: 'Nombre y apellido', namePh: 'Tu nombre',
      email: 'Correo electrónico', emailPh: 'nombre@ejemplo.com',
      type: 'Qué necesitás', typePh: 'Elegí una opción',
      types: ['Página web', 'Aplicación web', 'Sistema a medida', 'Automatización', 'No sé qué necesito, quiero asesoramiento', 'Otro'],
      budget: 'Presupuesto aproximado (opcional)', budgetNone: 'Prefiero conversarlo',
      budgets: ['Menos de USD 500', 'USD 500 – 1.500', 'USD 1.500 – 5.000', 'Más de USD 5.000'],
      message: 'Contanos sobre tu proyecto', messagePh: 'Qué hace tu negocio, qué te gustaría resolver y cualquier detalle que quieras compartir.', messageHint: 'Mínimo 15 caracteres.',
      consent: 'Acepto que Dofra Software use mis datos solo para responder esta consulta. El envío se procesa mediante el servicio FormSubmit.',
      send: 'Enviar consulta', sending: 'Enviando…',
      success: '¡Gracias! Recibimos tu consulta y te vamos a responder por correo electrónico.',
      error: 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos o escribinos directamente a',
      subject: 'Nueva consulta desde la web de Dofra',
      orEmail: 'También podés escribirnos a',
    },
    contactSmall: ['En todo el mundo', 'Trabajo remoto'],
    footer: {
      kicker: 'TU PRÓXIMO PROYECTO EMPIEZA ACÁ', title: ['¿Tenés una idea?', 'Hagámosla realidad.'],
      desc: 'Contanos qué necesitás y vemos cómo ayudarte.', cta: 'Hablemos',
      navLabel: 'Navegación del pie de página', socialLabel: 'Redes sociales', newTab: 'se abre en una pestaña nueva',
      slogan: 'Your vision. Our code.',
    },
    rights: 'Todos los derechos reservados.',
    heroVisual: 'Logo de Dofra formado por partículas blancas y terracota.',
  },
  en: {
    skip: 'Skip to content',
    nav: ['Home', 'Services', 'About us', 'Contact'], talk: "Let's talk",
    navLabel: 'Main navigation', menuOpen: 'Open menu', menuClose: 'Close menu', langSwitch: 'Cambiar a español', brandLabel: 'Dofra Software, go to top',
    eyebrow: 'WEB DEVELOPMENT & CUSTOM SOFTWARE',
    heroA: 'Websites and custom systems', heroB: 'for your business.',
    heroDesc: 'We help startups, independent professionals and small businesses showcase their services, organize their work and save time with technology tailored to their needs.',
    heroContact: 'Tell us what you need', seeWork: 'View services',
    trust1: 'Built to grow', trust2: 'Design + development', trust3: 'Worldwide',
    serviceKicker: 'WHAT WE DO', serviceTitle: 'How can we help your business?', serviceDesc: 'Four ways to put technology to work for you, explained without jargon.',
    examplesLabel: 'Examples',
    services: [
      { icon: 'code', title: 'Websites', desc: 'Showcase your services and make it easy for new customers to get in touch.', examples: ['Single-page business sites', 'Professional websites', 'Company websites'] },
      { icon: 'layers', title: 'Web apps', desc: 'Tools that run in the browser so your customers or your team can get things done online.', examples: ['Online booking', 'Customer portals', 'Progress tracking panels'] },
      { icon: 'cpu', title: 'Custom systems', desc: 'Organize your business information and processes in a tool built around the way you work.', examples: ['Customer management', 'Appointments', 'Payments', 'Internal tasks'] },
      { icon: 'zap', title: 'Automation', desc: 'Cut down on repetitive tasks and stop entering the same information in different places.', examples: ['Reminders', 'Forms linked to spreadsheets', 'Automatic notifications'] },
    ],
    processKicker: 'HOW WE WORK', processTitle: 'A simple, clear process.',
    process: [
      { title: 'We listen', desc: 'You tell us how your business works and what you would like to solve.' },
      { title: 'We design', desc: 'We turn those ideas into a clear, easy-to-use proposal.' },
      { title: 'We build', desc: 'We develop the solution with current technology and attention to detail.' },
      { title: 'We support', desc: 'We launch the project and improve it whenever your business needs it.' },
    ],
    aboutKicker: 'ABOUT DOFRA', aboutTitle: 'About Dofra',
    aboutDesc: "Dofra brings together two perspectives: business and technology. Between us, we have experience at international companies and more than 4 years working in software systems. That's why we first get to know how your business works, and only then design the solution: clear, tailored and easy to use.",
    people: [
      { name: 'Franca', role: 'Accountant', desc: 'Brings the business perspective: costs, payments and admin processes, so every solution meets real needs.' },
      { name: 'Victoria', role: 'Software engineer', desc: 'Leads the technical design and development, so every tool works well and is easy to use.' },
    ],
    faqKicker: 'FREQUENTLY ASKED QUESTIONS', faqTitle: 'Before we begin.',
    faqs: [
      { q: 'What do you need from me to get started?', a: "For our first conversation, just tell us what your business does, what you'd like to solve and, if you have them, examples of websites or tools you like. No technical knowledge needed." },
      { q: 'Do you work with small businesses?', a: 'Yes. We work with startups, independent professionals and businesses looking for a digital solution that fits their stage.' },
      { q: 'Can I hire you just for a website?', a: 'Absolutely. We can build a single-page site, a professional website or a more complete solution, depending on what you need.' },
      { q: 'How long does a project take?', a: '[TO CONFIRM] It depends on the type of project and how much needs to be built. For example, a single-page site usually takes about [TIME] and a custom system [TIME]. We give you an estimated timeline before we start.', pending: true },
      { q: 'Are domain and hosting included?', a: '[TO CONFIRM] [Included / Not included / Optional]. The domain is your website address (for example, yourbusiness.com) and hosting is the service that keeps it online.', pending: true },
      { q: 'Will I be able to update my website?', a: '[TO CONFIRM] Yes / Depending on the project. [Explain what clients can change on their own —text, photos, prices— and what changes go through us].', pending: true },
      { q: 'How is the price defined?', a: "[TO CONFIRM] We put it together once we know what you need, based on the project scope. [State whether it's a fixed price, deposits and payment methods].", pending: true },
      { q: 'What support do you offer after delivery?', a: 'We can arrange ongoing support, improvements and maintenance after delivery, based on your project needs.' },
      { q: 'Do you work with clients in other countries?', a: 'Yes. We work remotely with clients anywhere in the world.' },
    ] as Faq[],
    contactKicker: 'CONTACT', contactTitle: 'Tell us what you need.',
    contactDesc: "Write to us in your own words. No technical knowledge needed: if you're not sure which solution is right for you, we'll help you figure it out.",
    contactSubject: 'Project inquiry — Dofra Software',
    form: {
      requiredNote: 'Fields marked with * are required.',
      name: 'Full name', namePh: 'Your name',
      email: 'Email', emailPh: 'name@example.com',
      type: 'What do you need?', typePh: 'Choose an option',
      types: ['Website', 'Web app', 'Custom system', 'Automation', "I'm not sure what I need, I'd like some advice", 'Other'],
      budget: 'Estimated budget (optional)', budgetNone: "I'd rather discuss it",
      budgets: ['Under USD 500', 'USD 500 – 1,500', 'USD 1,500 – 5,000', 'Over USD 5,000'],
      message: 'Tell us about your project', messagePh: "What your business does, what you'd like to solve and any other details you want to share.", messageHint: 'At least 15 characters.',
      consent: 'I agree that Dofra Software may use my details only to reply to this inquiry. The form is processed by the FormSubmit service.',
      send: 'Send inquiry', sending: 'Sending…',
      success: "Thank you! We've received your inquiry and will reply by email.",
      error: "We couldn't send your inquiry. Please try again in a few minutes or email us directly at",
      subject: 'New inquiry from the Dofra website',
      orEmail: 'You can also email us at',
    },
    contactSmall: ['Worldwide', 'Remote-first'],
    footer: {
      kicker: 'YOUR NEXT PROJECT STARTS HERE', title: ['Have an idea?', 'Let’s make it happen.'],
      desc: 'Tell us what you need and we’ll find the best way to help.', cta: 'Let’s talk',
      navLabel: 'Footer navigation', socialLabel: 'Social media', newTab: 'opens in a new tab',
      slogan: 'Your vision. Our code.',
    },
    rights: 'All rights reserved.',
    heroVisual: 'Dofra logo made of white and terracotta particles.',
  },
}

/** Valores que llegan en el correo: siempre en español, sin importar el idioma del visitante. */
const TYPE_VALUES = content.es.form.types
const BUDGET_VALUES = content.es.form.budgets

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    code: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m14 4-4 16" /></>,
    layers: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" /></>,
    zap: <path d="m13 2-9 12h7l-1 8 10-12h-7z" />,
    check: <path d="m5 12 5 5L20 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c6 5 6 13 0 18M12 3c-6 5-6 13 0 18" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5" /></>,
    trending: <><path d="m3 17 7-7 4 4 7-7M15 7h6v6" /></>,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></>,
    linkedin: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5V16M8 7.8v.2M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16" /></>,
  }
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Brand({ light = false, label }: { light?: boolean; label: string }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#inicio" aria-label={label}><img className="brand-logo" src="/dofra-logo.png" alt="" width="48" height="48" /></a>
}

/** Aparición suave de bloques al entrar en pantalla. Sin efecto con movimiento reducido. */
function useReveal() {
  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    root.classList.add('reveal-on')
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // También se muestran los bloques que quedaron arriba tras un salto de navegación.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) { entry.target.classList.add('is-visible'); io.unobserve(entry.target) }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => { io.disconnect(); root.classList.remove('reveal-on') }
  }, [])
}

function readStoredLang(): Lang {
  try { return window.localStorage.getItem('dofra-lang') === 'en' ? 'en' : 'es' } catch { return 'es' }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(readStoredLang)
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const t = content[lang]
  const f = t.form
  const faqs = t.faqs.filter(item => !item.pending)
  useReveal()

  useEffect(() => {
    document.documentElement.lang = lang
    try { window.localStorage.setItem('dofra-lang', lang) } catch { /* sin almacenamiento disponible */ }
    document.title = lang === 'es' ? 'Dofra Software | Páginas web y sistemas a medida' : 'Dofra Software | Websites and custom systems'
  }, [lang])

  const navIds = ['inicio', 'servicios', 'nosotras', 'contacto']
  // mailto: abre la aplicación de correo que use cada visitante (Gmail, Outlook, Apple Mail, etc.)
  const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.contactSubject)}`

  /** CTA del footer: lleva al formulario de contacto y enfoca el primer campo. */
  function goToContactForm(event: MouseEvent<HTMLAnchorElement>) {
    const section = document.getElementById('contacto')
    const field = document.querySelector<HTMLInputElement>('#contacto input[name="name"]')
    if (!section || !field) return // sin JS especial: el enlace #contacto funciona igual
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', '#contacto')
    window.setTimeout(() => field.focus({ preventScroll: true }), reduce ? 0 : 600)
  }

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (formStatus === 'sending') return
    const form = event.currentTarget
    const data = new FormData(form)
    if (data.get('_honey')) return // bot detectado: no se envía nada
    setFormStatus('sending')
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      const result = await response.json() as { success?: boolean | string }
      // FormSubmit responde success "false" (por ejemplo, si el formulario todavía no fue activado).
      if (!response.ok || String(result.success) !== 'true') throw new Error('Submission failed')
      form.reset()
      setFormStatus('success')
    } catch {
      setFormStatus('error')
    }
  }

  return <>
    <a className="skip-link" href="#contenido">{t.skip}</a>
    <header className="header"><div className="container nav-inner">
      <Brand label={t.brandLabel} />
      <nav id="menu-principal" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label={t.navLabel}>{t.nav.map((label, i) => <a key={navIds[i]} href={`#${navIds[i]}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <div className="nav-actions">
        <button type="button" className="lang-switch" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} aria-label={t.langSwitch} lang={lang === 'es' ? 'en' : 'es'}><Icon name="globe" size={16} /><span aria-hidden="true">{lang === 'es' ? 'EN' : 'ES'}</span></button>
        <a className="button button-primary nav-cta" href="#contacto">{t.talk}<Icon name="arrow" size={16} /></a>
        <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t.menuClose : t.menuOpen} aria-expanded={menuOpen} aria-controls="menu-principal"><Icon name={menuOpen ? 'close' : 'menu'} size={24} /></button>
      </div>
    </div></header>

    <main id="contenido" tabIndex={-1}>
      <section className="hero" id="inicio" aria-labelledby="hero-titulo"><div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />{t.eyebrow}</p>
          <h1 id="hero-titulo">{t.heroA} <span>{t.heroB}</span></h1>
          <p className="hero-lead">{t.heroDesc}</p>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#contacto">{t.heroContact}<Icon name="arrow" size={18} /></a>
            <a className="button button-ghost button-large" href="#servicios">{t.seeWork}<Icon name="arrow" size={18} /></a>
          </div>
          <ul className="hero-trust"><li><Icon name="check" size={15} />{t.trust1}</li><li><Icon name="check" size={15} />{t.trust2}</li><li><Icon name="globe" size={15} />{t.trust3}</li></ul>
        </div>
        <div className="hero-visual"><DofraParticles label={t.heroVisual} /></div>
      </div></section>

      <section className="section services" id="servicios" aria-labelledby="servicios-titulo"><div className="container">
        <header className="svc-intro" data-reveal><p className="svc-kicker">{t.serviceKicker}</p><h2 id="servicios-titulo">{t.serviceTitle}</h2><p>{t.serviceDesc}</p></header>
        <div className="svc-grid" data-reveal>{t.services.map((s, i) => <article className="svc-card" key={s.title}>
          <div className="svc-head">
            <span className="svc-icon"><Icon name={s.icon} size={20} /></span>
            <h3>{s.title}</h3>
            <span className="svc-index" aria-hidden="true">0{i + 1}</span>
          </div>
          <p className="svc-desc">{s.desc}</p>
          <div className="svc-examples">
            <p className="svc-label">{t.examplesLabel}</p>
            <ul className="svc-tags">{s.examples.map(ex => <li key={ex}>{ex}</li>)}</ul>
          </div>
        </article>)}</div>
      </div></section>

      <section className="section section-soft" aria-labelledby="proceso-titulo"><div className="container">
        <header className="section-head" data-reveal><p className="kicker">{t.processKicker}</p><h2 id="proceso-titulo">{t.processTitle}</h2></header>
        <ol className="grid grid-4 process-grid" data-reveal>{t.process.map((step, i) => <li className="card process-card" key={step.title}><span className="process-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
      </div></section>

      <section className="section section-dark" id="nosotras" aria-labelledby="nosotras-titulo"><div className="container about-grid" data-reveal>
        <div className="about-copy">
          <h2 id="nosotras-titulo">{t.aboutTitle}</h2>
          <p>{t.aboutDesc}</p>
        </div>
        <ul className="people">{t.people.map(person => <li className="person-card" key={person.name}><span className="person-initial" aria-hidden="true">{person.name[0]}</span><div><h3>{person.name}<span>{person.role}</span></h3><p>{person.desc}</p></div></li>)}</ul>
      </div></section>

      <section className="section section-soft" aria-labelledby="faq-titulo"><div className="container">
        <header className="section-head" data-reveal><p className="kicker">{t.faqKicker}</p><h2 id="faq-titulo">{t.faqTitle}</h2></header>
        <div className="faq-list" data-reveal>{faqs.map((item, i) => <div className={`faq-item ${faqOpen === i ? 'expanded' : ''}`} key={item.q}>
          <h3><button type="button" id={`faq-q-${i}`} aria-expanded={faqOpen === i} aria-controls={`faq-a-${i}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>{item.q}</span><span className="faq-icon" aria-hidden="true"><Icon name={faqOpen === i ? 'minus' : 'plus'} size={18} /></span></button></h3>
          <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={faqOpen !== i}><p>{item.a}</p></div>
        </div>)}</div>
      </div></section>

      <section className="section contact" id="contacto" aria-labelledby="contacto-titulo"><div className="container"><div className="contact-panel" data-reveal>
        <div className="contact-intro">
          <p className="kicker">{t.contactKicker}</p>
          <h2 id="contacto-titulo">{t.contactTitle}</h2>
          <p>{t.contactDesc}</p>
          <p className="quote-email">{f.orEmail} <a href={mailtoLink}>{CONTACT_EMAIL}</a></p>
          <ul className="contact-chips">{t.contactSmall.map(item => <li key={item}><Icon name="globe" size={15} />{item}</li>)}</ul>
        </div>
        <form className="quote-form" onSubmit={submitQuote} aria-describedby="form-required-note">
          <input type="hidden" name="_subject" value={f.subject} />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="idioma" value={lang === 'es' ? 'Español' : 'Inglés'} />
          <div className="quote-honey" aria-hidden="true"><label>Website<input name="_honey" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="quote-required" id="form-required-note">{f.requiredNote}</p>
          <div className="quote-grid">
            <label><span>{f.name} <span aria-hidden="true">*</span></span><input name="name" required maxLength={100} autoComplete="name" placeholder={f.namePh} /></label>
            <label><span>{f.email} <span aria-hidden="true">*</span></span><input type="email" name="email" required maxLength={150} autoComplete="email" placeholder={f.emailPh} /></label>
            <label><span>{f.type} <span aria-hidden="true">*</span></span><select name="project_type" required defaultValue=""><option value="" disabled>{f.typePh}</option>{f.types.map((label, i) => <option key={TYPE_VALUES[i]} value={TYPE_VALUES[i]}>{label}</option>)}</select></label>
            <label><span>{f.budget}</span><select name="budget" defaultValue=""><option value="">{f.budgetNone}</option>{f.budgets.map((label, i) => <option key={BUDGET_VALUES[i]} value={BUDGET_VALUES[i]}>{label}</option>)}</select></label>
          </div>
          <label><span>{f.message} <span aria-hidden="true">*</span></span><textarea name="message" required minLength={15} maxLength={3000} rows={4} placeholder={f.messagePh} aria-describedby="message-hint" /><span className="quote-hint" id="message-hint">{f.messageHint}</span></label>
          <label className="quote-consent"><input type="checkbox" required name="consent" value="Sí" /><span>{f.consent} <span aria-hidden="true">*</span></span></label>
          <div className="quote-submit">
            <button type="submit" className="button button-primary button-large" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? f.sending : f.send}<Icon name="arrow" size={18} /></button>
            <div className={`quote-feedback ${formStatus}`} role={formStatus === 'error' ? 'alert' : 'status'} aria-live="polite">
              {formStatus === 'success' && f.success}
              {formStatus === 'error' && <>{f.error} <a href={mailtoLink}>{CONTACT_EMAIL}</a>.</>}
            </div>
          </div>
        </form>
      </div></div></section>
    </main>

    <footer className="footer" aria-labelledby="footer-titulo"><div className="container">
      <div className="footer-cta">
        <div>
          <p className="footer-kicker">{t.footer.kicker}</p>
          <h2 id="footer-titulo"><span>{t.footer.title[0]}</span> <span>{t.footer.title[1]}</span></h2>
          <p className="footer-desc">{t.footer.desc}</p>
        </div>
        <a className="button button-primary button-large footer-cta-button" href="#contacto" onClick={goToContactForm}>{t.footer.cta}<Icon name="arrow" size={18} /></a>
      </div>
      <div className="footer-main">
        <a className="footer-brand" href="#inicio" aria-label={t.brandLabel}>
          <img src="/dofra-logo.png" alt="" width="40" height="40" />
          <span>DOFRA <span>SOFTWARE</span></span>
        </a>
        <nav className="footer-links" aria-label={t.footer.navLabel}>{t.nav.slice(1).map((label, i) => <a key={label} href={`#${navIds[i + 1]}`}>{label}</a>)}</nav>
        <ul className="footer-social" aria-label={t.footer.socialLabel}>{SOCIAL_LINKS.filter(link => link.url).map(link => <li key={link.id}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.name} (${t.footer.newTab})`}><Icon name={link.id} size={18} /></a>
        </li>)}</ul>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Dofra Software. {t.rights}</span><span className="footer-slogan" lang="en">{t.footer.slogan}</span></div>
    </div></footer>
  </>
}
