import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import DofraParticles from './components/DofraParticles'

type Lang = 'es' | 'en'
type Faq = { q: string; a: string; /** true = borrador que necesita confirmación; no se publica */ pending?: boolean }

const CONTACT_EMAIL = 'info@dofrasoftware.com'

/** Redes oficiales. Un ícono solo se muestra si su URL está cargada. */
const SOCIAL_LINKS: { id: 'instagram' | 'linkedin'; name: string; url: string }[] = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/dofra.software/' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/company/dofra-software/' },
]

const content = {
  es: {
    skip: 'Saltar al contenido',
    nav: ['Inicio', 'Servicios', 'Proyectos', 'Nosotras', 'Contacto'], talk: 'Hablemos',
    navLabel: 'Navegación principal', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', langSwitch: 'Switch to English', brandLabel: 'Dofra Software, ir al inicio',
    eyebrow: 'DESARROLLO WEB Y SOFTWARE A MEDIDA',
    heroA: 'Páginas web y sistemas a medida', heroB: 'para tu negocio.',
    heroDesc: 'Ayudamos a emprendimientos, profesionales y pequeñas empresas a mostrar sus servicios, organizar su trabajo y ahorrar tiempo con tecnología adaptada a sus necesidades.',
    heroContact: 'Contanos qué necesitás', seeWork: 'Ver servicios',
    trust1: 'Pensado para crecer', trust2: 'Diseño + desarrollo', trust3: 'En todo el mundo',
    serviceKicker: 'QUÉ HACEMOS', serviceTitle: '¿Cómo podemos ayudar a tu negocio?', serviceDesc: 'Cuatro formas de usar la tecnología a tu favor, explicadas sin tecnicismos.',
    examplesLabel: 'Ejemplos',
    carousel: { label: 'Servicios', prev: 'Ver servicios anteriores', next: 'Ver más servicios', of: 'de', goTo: 'Ir al servicio' },
    services: [
      { icon: 'code', title: 'Páginas web', desc: 'Mostrá tus servicios y facilitá que tus próximos clientes te contacten.', examples: ['Páginas de presentación', 'Sitios profesionales', 'Webs para empresas'] },
      { icon: 'layers', title: 'Aplicaciones web', desc: 'Herramientas que se usan desde el navegador para que tus clientes o tu equipo puedan realizar gestiones.', examples: ['Reservas online', 'Portales de clientes', 'Paneles de seguimiento'] },
      { icon: 'cpu', title: 'Sistemas a medida', desc: 'Organizá la información y los procesos de tu negocio en una herramienta adaptada a tu forma de trabajar.', examples: ['Gestión de clientes', 'Turnos', 'Cobros', 'Tareas internas'] },
      { icon: 'zap', title: 'Automatizaciones', desc: 'Reducí tareas repetitivas y evitá cargar la misma información en distintos lugares.', examples: ['Recordatorios', 'Formularios conectados con planillas', 'Avisos automáticos'] },
    ],
    processKicker: 'CÓMO TRABAJAMOS', processTitle: 'Un proceso simple y claro.',
    process: [
      { title: 'Escuchamos', desc: 'Nos contás cómo funciona tu negocio, qué necesitás y qué te gustaría resolver.' },
      { title: 'Proponemos', desc: 'Definimos una solución a medida y te presentamos qué incluye, el presupuesto y los plazos.' },
      { title: 'Diseñamos y desarrollamos', desc: 'Damos forma a tu proyecto con un diseño claro y herramientas fáciles de usar.' },
      { title: 'Revisamos y ajustamos', desc: 'Te mostramos los avances, escuchamos tu opinión y realizamos los ajustes acordados.' },
      { title: 'Entregamos y acompañamos', desc: 'Ponemos en marcha la solución y te explicamos cómo usarla. También podemos acordar soporte, mantenimiento y futuras mejoras.' },
    ],
    aboutKicker: 'SOBRE DOFRA', aboutTitle: 'Nosotras',
    aboutDesc: [
      'Somos Franca y Victoria, contadora pública e ingeniera en software. Creamos Dofra para ayudar a negocios y profesionales a transformar sus ideas y necesidades en herramientas digitales que les faciliten el trabajo.',
      'Combinamos experiencia en empresas internacionales y más de 4 años de trayectoria en sistemas con una forma de trabajar cercana: escuchamos, preguntamos y buscamos entender qué necesita cada proyecto. Así, desarrollamos soluciones a medida que tienen sentido para tu negocio y son fáciles de usar.',
    ],
    people: [
      { name: 'Franca', role: 'Contadora', desc: 'Aporta la mirada de negocio: costos, cobros y procesos administrativos, para que cada solución responda a necesidades reales.' },
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
    contactDesc: 'Escribinos con tus propias palabras. No hace falta saber de tecnología. Si todavía no tenés claro qué solución te conviene, te ayudamos a definirla.',
    contactSubject: 'Consulta de proyecto — Dofra Software',
    form: {
      requiredNote: 'Los campos marcados con * son obligatorios.',
      name: 'Nombre y apellido', namePh: 'Tu nombre',
      email: 'Correo electrónico', emailPh: 'nombre@ejemplo.com',
      type: 'Qué necesitás', typePh: 'Elegí una opción',
      types: ['Página web', 'Aplicación web', 'Sistema a medida', 'Automatización', 'No sé qué necesito, quiero asesoramiento', 'Otro'],
      budget: 'Presupuesto aproximado (opcional)', budgetNone: 'Prefiero conversarlo',
      budgets: ['Menos de USD 500', 'USD 500 – 1.500', 'USD 1.500 – 5.000', 'Más de USD 5.000'],
      message: 'Contanos sobre tu proyecto', messagePh: 'Qué hace tu negocio, qué te gustaría resolver y cualquier detalle que quieras compartir.', messageEmpty: 'Escribí tu mensaje.',
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
      slogan: 'Built by Dofra.',
    },
    work: {
      kicker: 'PROYECTOS', title: 'Proyectos que hablan por nosotros.', desc: 'Soluciones digitales diseñadas para necesidades reales.',
      view: 'Ver proyecto', newTab: 'se abre en una pestaña nueva',
      items: [
        { id: 'odonto', name: 'Odonto App', category: 'Salud · Gestión clínica', url: 'https://odonto.dofrasoftware.workers.dev/', w: 1600, h: 1000,
          desc: 'Gestión integral para clínicas odontológicas: pacientes con historia clínica y odontograma, agenda por profesional y consultorio, lista de espera, presupuestos, pagos con cuenta corriente, reportes y un visor 3D de tomografías.',
          note: 'Captura real · datos sintéticos', alt: 'Pantalla de inicio de Odonto App con casos clínicos recientes, actividad y estado de los módulos, con datos sintéticos.' },
        { id: 'spa-gestor', name: 'Spa Gestor', category: 'Estética · Gestión y reservas', url: 'https://spa-gestor.pages.dev/', w: 1600, h: 960,
          desc: 'Software para centros de estética y spas: agenda de turnos, fichas de clientes, tratamientos con catálogo público, pagos y deudas, promociones y reportes. Cada negocio trabaja en su propio espacio dentro de la misma plataforma.',
          note: 'Captura real · datos ficticios', alt: 'Agenda semanal de Spa Gestor con turnos de un centro de estética ficticio.' },
        { id: 'appfotos', name: 'AppFotos', category: 'Fotografía · Galerías y ventas', url: 'https://appfotos.dofrasoftware.workers.dev/', w: 1325, h: 590,
          desc: 'Plataforma para fotógrafos profesionales: galerías con búsqueda y filtros, un sitio web propio con plantillas —incluida una para fotografía deportiva—, carrito y gestión de pedidos. La venta online con Mercado Pago está preparada para activarse.',
          note: 'Captura real', alt: 'Portada de AppFotos con un paisaje de montaña y el título «Cada imagen merece un lugar especial».' },
      ],
    },
    rights: 'Todos los derechos reservados.',
    heroVisual: 'Logo de Dofra formado por partículas blancas y terracota.',
  },
  en: {
    skip: 'Skip to content',
    nav: ['Home', 'Services', 'Projects', 'About us', 'Contact'], talk: "Let's talk",
    navLabel: 'Main navigation', menuOpen: 'Open menu', menuClose: 'Close menu', langSwitch: 'Cambiar a español', brandLabel: 'Dofra Software, go to top',
    eyebrow: 'WEB DEVELOPMENT & CUSTOM SOFTWARE',
    heroA: 'Websites and custom systems', heroB: 'for your business.',
    heroDesc: 'We help startups, independent professionals and small businesses showcase their services, organize their work and save time with technology tailored to their needs.',
    heroContact: 'Tell us what you need', seeWork: 'View services',
    trust1: 'Built to grow', trust2: 'Design + development', trust3: 'Worldwide',
    serviceKicker: 'WHAT WE DO', serviceTitle: 'How can we help your business?', serviceDesc: 'Four ways to put technology to work for you, explained without jargon.',
    examplesLabel: 'Examples',
    carousel: { label: 'Services', prev: 'Show previous services', next: 'Show more services', of: 'of', goTo: 'Go to service' },
    services: [
      { icon: 'code', title: 'Websites', desc: 'Showcase your services and make it easy for new customers to get in touch.', examples: ['Single-page business sites', 'Professional websites', 'Company websites'] },
      { icon: 'layers', title: 'Web apps', desc: 'Tools that run in the browser so your customers or your team can get things done online.', examples: ['Online booking', 'Customer portals', 'Progress tracking panels'] },
      { icon: 'cpu', title: 'Custom systems', desc: 'Organize your business information and processes in a tool built around the way you work.', examples: ['Customer management', 'Appointments', 'Payments', 'Internal tasks'] },
      { icon: 'zap', title: 'Automation', desc: 'Cut down on repetitive tasks and stop entering the same information in different places.', examples: ['Reminders', 'Forms linked to spreadsheets', 'Automatic notifications'] },
    ],
    processKicker: 'HOW WE WORK', processTitle: 'A simple, clear process.',
    process: [
      { title: 'We listen', desc: 'You tell us how your business works, what you need and what you would like to solve.' },
      { title: 'We propose', desc: 'We define a tailored solution and walk you through what it includes, the budget and the timeline.' },
      { title: 'We design and build', desc: 'We shape your project with a clear design and easy-to-use tools.' },
      { title: 'We review and refine', desc: 'We show you our progress, listen to your feedback and make the agreed adjustments.' },
      { title: 'We deliver and support', desc: 'We launch the solution and show you how to use it. We can also arrange support, maintenance and future improvements.' },
    ],
    aboutKicker: 'ABOUT DOFRA', aboutTitle: 'About Dofra',
    aboutDesc: [
      'We are Franca and Victoria, a certified public accountant and a software engineer. We created Dofra to help businesses and professionals turn their ideas and needs into digital tools that make their work easier.',
      'We bring together experience at international companies and more than 4 years working in software systems with a hands-on, personal approach: we listen, ask questions and make sure we understand what each project needs. That way, we build tailored solutions that make sense for your business and are easy to use.',
    ],
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
    contactDesc: "Write to us in your own words. No technical knowledge needed. If you're not sure which solution is right for you, we'll help you figure it out.",
    contactSubject: 'Project inquiry — Dofra Software',
    form: {
      requiredNote: 'Fields marked with * are required.',
      name: 'Full name', namePh: 'Your name',
      email: 'Email', emailPh: 'name@example.com',
      type: 'What do you need?', typePh: 'Choose an option',
      types: ['Website', 'Web app', 'Custom system', 'Automation', "I'm not sure what I need, I'd like some advice", 'Other'],
      budget: 'Estimated budget (optional)', budgetNone: "I'd rather discuss it",
      budgets: ['Under USD 500', 'USD 500 – 1,500', 'USD 1,500 – 5,000', 'Over USD 5,000'],
      message: 'Tell us about your project', messagePh: "What your business does, what you'd like to solve and any other details you want to share.", messageEmpty: 'Please write your message.',
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
      slogan: 'Built by Dofra.',
    },
    work: {
      kicker: 'PROJECTS', title: 'Projects that speak for us.', desc: 'Digital solutions designed for real needs.',
      view: 'View project', newTab: 'opens in a new tab',
      items: [
        { id: 'odonto', name: 'Odonto App', category: 'Healthcare · Clinic management', url: 'https://odonto.dofrasoftware.workers.dev/', w: 1600, h: 1000,
          desc: 'End-to-end management for dental clinics: patients with clinical records and dental charts, scheduling by practitioner and treatment room, waitlist, quotes, payments with account balances, reports and a 3D CT viewer.',
          note: 'Real screenshot · synthetic data', alt: 'Odonto App home screen with recent clinical cases, activity and module status, using synthetic data.' },
        { id: 'spa-gestor', name: 'Spa Gestor', category: 'Beauty · Management and bookings', url: 'https://spa-gestor.pages.dev/', w: 1600, h: 960,
          desc: 'Software for beauty clinics and spas: appointment calendar, client records, treatments with a public catalog, payments and balances, promotions and reports. Each business works in its own space within the same platform.',
          note: 'Real screenshot · sample data', alt: 'Spa Gestor weekly calendar with appointments for a fictional beauty clinic.' },
        { id: 'appfotos', name: 'AppFotos', category: 'Photography · Galleries and sales', url: 'https://appfotos.dofrasoftware.workers.dev/', w: 1325, h: 590,
          desc: 'A platform for professional photographers: galleries with search and filters, their own website with templates —including one for sports photography—, cart and order management. Online sales with Mercado Pago are ready to be switched on.',
          note: 'Real screenshot', alt: 'AppFotos home page with a mountain landscape and the headline “Every image deserves a special place”.' },
      ],
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

type Service = { icon: string; title: string; desc: string; examples: string[] }
type CarouselText = { label: string; prev: string; next: string; of: string; goTo: string }

/**
 * Carrusel de servicios: desplazamiento horizontal nativo (scroll-snap), sin librerías.
 * Las tarjetas son informativas: no se abren ni enlazan a nada.
 */
function ServicesCarousel({ services, examplesLabel, text }: { services: Service[]; examplesLabel: string; text: CarouselText }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const cards = [...track.children] as HTMLElement[]
    const left = track.scrollLeft
    let best = 0
    cards.forEach((card, i) => { if (Math.abs(card.offsetLeft - left) < Math.abs(cards[best].offsetLeft - left)) best = i })
    setActive(best)
    setAtStart(left <= 2)
    setAtEnd(left + track.clientWidth >= track.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    track.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(track)
    update()
    return () => { cancelAnimationFrame(frame); track.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [update])

  const goTo = (index: number) => {
    const track = trackRef.current
    const card = track?.children[Math.max(0, Math.min(services.length - 1, index))] as HTMLElement | undefined
    if (!track || !card) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: card.offsetLeft, behavior: reduce ? 'instant' : 'smooth' })
  }

  return <div className="svc-carousel" role="region" aria-roledescription="carrusel" aria-label={text.label}>
    <div className="svc-nav">
      <button type="button" className="svc-arrow svc-arrow-prev" onClick={() => goTo(active - 1)} disabled={atStart} aria-label={text.prev}><Icon name="arrow" size={18} /></button>
      <button type="button" className="svc-arrow" onClick={() => goTo(active + 1)} disabled={atEnd} aria-label={text.next}><Icon name="arrow" size={18} /></button>
    </div>
    <div className="svc-track" ref={trackRef} tabIndex={0} aria-label={text.label}>
      {services.map((s, i) => <article className="svc-card" key={s.title} role="group" aria-roledescription="slide" aria-label={`${i + 1} ${text.of} ${services.length}: ${s.title}`}>
        <span className="svc-icon" aria-hidden="true"><Icon name={s.icon} size={20} /></span>
        <h3>{s.title}</h3>
        <p className="svc-desc">{s.desc}</p>
        <p className="svc-examples"><span className="svc-label">{examplesLabel}:</span> {s.examples.map((ex, j) => <span key={ex}>{j > 0 && <span className="svc-sep" aria-hidden="true"> · </span>}{ex}</span>)}</p>
      </article>)}
    </div>
    <div className="svc-dots">{services.map((s, i) => <button type="button" key={s.title} className={i === active ? 'is-active' : ''} aria-label={`${text.goTo} ${i + 1} ${text.of} ${services.length}`} aria-current={i === active ? 'true' : undefined} onClick={() => goTo(i)} />)}</div>
  </div>
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

  const navIds = ['inicio', 'servicios', 'proyectos', 'nosotras', 'contacto']
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
    // El mensaje es obligatorio y no puede ser solo espacios (sin mínimo de caracteres).
    const messageField = form.elements.namedItem('message') as HTMLTextAreaElement | null
    if (messageField && !messageField.value.trim()) {
      messageField.setCustomValidity(f.messageEmpty)
      messageField.reportValidity()
      return
    }
    const data = new FormData(form)
    if (data.get('_honey')) return // bot detectado: no se envía nada
    data.set('message', String(data.get('message') ?? '').trim())
    setFormStatus('sending')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      let result: { success?: boolean | string; message?: string } = {}
      try { result = await response.json() } catch { throw new Error(`Respuesta no válida de FormSubmit (HTTP ${response.status})`) }
      // Éxito solo si el servicio confirma que aceptó el envío. Ej.: success "false" = formulario sin activar.
      if (!response.ok || String(result.success) !== 'true') {
        throw new Error(`FormSubmit rechazó el envío (HTTP ${response.status}): ${result.message ?? 'sin detalle'}`)
      }
      form.reset()
      setFormStatus('success')
    } catch (error) {
      // Diagnóstico técnico solo en la consola; el visitante ve un mensaje genérico y conserva sus datos.
      const reason = controller.signal.aborted ? 'Tiempo de espera agotado (15 s)' : error instanceof Error ? error.message : String(error)
      console.error('[Dofra] No se pudo enviar el formulario de contacto:', reason)
      setFormStatus('error')
    } finally {
      window.clearTimeout(timeout)
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
        <div data-reveal><ServicesCarousel services={t.services} examplesLabel={t.examplesLabel} text={t.carousel} /></div>
      </div></section>

      <section className="section work" id="proyectos" aria-labelledby="proyectos-titulo"><div className="container">
        <header className="work-head" data-reveal><p className="work-kicker">{t.work.kicker}</p><h2 id="proyectos-titulo">{t.work.title}</h2><p>{t.work.desc}</p></header>
        <div className="work-list">{t.work.items.map((item, i) => <article className={`work-item${i % 2 ? ' is-reverse' : ''}`} key={item.id} data-reveal aria-labelledby={`proyecto-${item.id}`}>
          <figure className="work-shot">
            <img src={`/proyectos/${item.id}.webp`} srcSet={`/proyectos/${item.id}-800.webp 800w, /proyectos/${item.id}.webp ${item.w}w`} sizes="(max-width: 900px) calc(100vw - 32px), 680px"
              width={item.w} height={item.h} alt={item.alt} loading="lazy" decoding="async" />
          </figure>
          <div className="work-copy">
            <p className="work-category">{item.category}</p>
            <h3 id={`proyecto-${item.id}`}>{item.name}</h3>
            <p className="work-desc">{item.desc}</p>
            <p className="work-note">{item.note}</p>
            <a className="work-link" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.work.view}: ${item.name} (${t.work.newTab})`}>{t.work.view}<Icon name="arrow" size={18} /></a>
          </div>
        </article>)}</div>
      </div></section>

      <section className="section section-soft" aria-labelledby="proceso-titulo"><div className="container">
        <header className="section-head" data-reveal><p className="kicker">{t.processKicker}</p><h2 id="proceso-titulo">{t.processTitle}</h2></header>
        <ol className="grid process-grid" data-reveal>{t.process.map((step, i) => <li className="card process-card" key={step.title}><span className="process-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
      </div></section>

      <section className="section section-dark" id="nosotras" aria-labelledby="nosotras-titulo"><div className="container about-grid" data-reveal>
        <div className="about-copy">
          <h2 id="nosotras-titulo">{t.aboutTitle}</h2>
          {t.aboutDesc.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
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
          <label><span>{f.message} <span aria-hidden="true">*</span></span><textarea name="message" required maxLength={3000} rows={4} placeholder={f.messagePh} onInput={event => event.currentTarget.setCustomValidity('')} /></label>
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
