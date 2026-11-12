import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'

type Lang = 'es' | 'en'
type Faq = { q: string; a: string; /** true = borrador que necesita confirmación; no se publica */ pending?: boolean }

const CONTACT_EMAIL = 'dofrasoftware@gmail.com'

const content = {
  es: {
    skip: 'Saltar al contenido',
    nav: ['Inicio', 'Servicios', 'Proyectos', 'Nosotras', 'Contacto'], talk: 'Hablemos',
    navLabel: 'Navegación principal', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', langSwitch: 'Switch to English', brandLabel: 'Dofra Software, ir al inicio',
    eyebrow: 'DESARROLLO WEB Y SOFTWARE A MEDIDA',
    heroA: 'Páginas web y sistemas a medida', heroB: 'para tu negocio.',
    heroDesc: 'Ayudamos a emprendimientos, profesionales y pequeñas empresas a mostrar sus servicios, organizar su trabajo y ahorrar tiempo con tecnología adaptada a sus necesidades.',
    heroContact: 'Contanos qué necesitás', seeWork: 'Ver proyectos',
    trust1: 'Pensado para crecer', trust2: 'Diseño + desarrollo', trust3: 'En todo el mundo',
    serviceKicker: 'QUÉ HACEMOS', serviceTitle: '¿Cómo podemos ayudar a tu negocio?', serviceDesc: 'Cuatro formas de usar la tecnología a tu favor, explicadas sin tecnicismos.',
    examplesLabel: 'Ejemplos',
    services: [
      { icon: 'code', title: 'Páginas web', desc: 'Mostrá tus servicios y facilitá que tus próximos clientes te contacten.', examples: ['Páginas de presentación', 'Sitios profesionales', 'Webs para empresas'] },
      { icon: 'layers', title: 'Aplicaciones web', desc: 'Herramientas que se usan desde el navegador para que tus clientes o tu equipo puedan realizar gestiones.', examples: ['Reservas online', 'Portales de clientes', 'Paneles de seguimiento'] },
      { icon: 'cpu', title: 'Sistemas a medida', desc: 'Organizá la información y los procesos de tu negocio en una herramienta adaptada a tu forma de trabajar.', examples: ['Gestión de clientes', 'Turnos', 'Cobros', 'Tareas internas'] },
      { icon: 'zap', title: 'Automatizaciones', desc: 'Reducí tareas repetitivas y evitá cargar la misma información en distintos lugares.', examples: ['Recordatorios', 'Formularios conectados con planillas', 'Avisos automáticos'] },
    ],
    workKicker: 'PROYECTOS', workTitle: 'Lo que construimos.', workDesc: 'Productos que diseñamos y desarrollamos nosotras, de punta a punta.',
    projectStatus: 'Desarrollo propio', imageNote: 'Captura real · datos de ejemplo', featuresLabel: 'Incluye',
    projects: [
      { img: 'appfotos', name: 'AppFotos', type: 'PLATAFORMA WEB · FOTOGRAFÍA', alt: 'Pantalla de inicio de AppFotos con una foto de paisaje y el título “Cada imagen merece un lugar especial”.',
        desc: 'Una plataforma para fotógrafos: cada uno publica sus galerías en un sitio profesional propio y vende sus fotos directamente a sus clientes, que pueden explorarlas y comprarlas online.',
        features: ['Galerías y portfolio', 'Sitio profesional propio', 'Venta de fotos online'] },
      { img: 'spa-gestor', name: 'Spa Gestor', type: 'SISTEMA DE GESTIÓN · CENTROS DE ESTÉTICA', alt: 'Pantalla de Spa Gestor con la agenda del día de un centro de estética vista en un celular.',
        desc: 'Un sistema para centros de estética que reúne todo el flujo de trabajo —agenda, pacientes y cobros— en un solo lugar, pensado para usarse desde el celular.',
        features: ['Agenda de turnos', 'Fichas de pacientes', 'Cobros', 'Avisos por WhatsApp'] },
      { img: 'odonto', name: 'Odonto', type: 'SISTEMA DE GESTIÓN · ODONTOLOGÍA', alt: 'Agenda semanal de Odonto con turnos por profesional y el menú de módulos de la clínica.',
        desc: 'Un sistema integral para clínicas odontológicas: agenda por profesional y consultorio, turnero, ficha clínica, presupuestos y pagos, con módulos específicos para implantología y ortodoncia.',
        features: ['Agenda y turnero', 'Ficha clínica', 'Implantología y ortodoncia', 'Presupuestos, pagos y reportes'] },
    ],
    processKicker: 'CÓMO TRABAJAMOS', processTitle: 'Un proceso simple y claro.',
    process: [
      { title: 'Escuchamos', desc: 'Nos contás cómo funciona tu negocio y qué te gustaría resolver.' },
      { title: 'Diseñamos', desc: 'Convertimos esas ideas en una propuesta clara y fácil de usar.' },
      { title: 'Desarrollamos', desc: 'Construimos la solución con tecnología actual y cuidando cada detalle.' },
      { title: 'Acompañamos', desc: 'Lanzamos el proyecto y lo mejoramos cuando tu negocio lo necesite.' },
    ],
    aboutKicker: 'SOBRE DOFRA', aboutTitle: 'Dos hermanas, un mismo proyecto.',
    aboutDesc: 'Dofra es un proyecto creado por dos hermanas que une dos miradas: la del negocio y la de la tecnología. Entre las dos sumamos experiencia en empresas internacionales y más de 4 años de trayectoria en sistemas. Por eso empezamos por entender cómo trabaja tu negocio y recién después pensamos la solución: clara, a medida y fácil de usar.',
    people: [
      { name: 'Franca', role: 'Contadora', desc: 'Aporta la mirada del negocio: costos, cobros y procesos administrativos, para que cada solución responda a necesidades reales.' },
      { name: 'Victoria', role: 'Ingeniera en software', desc: 'Se ocupa del diseño técnico y el desarrollo, para que cada herramienta funcione bien y sea fácil de usar.' },
    ],
    aboutQuote: 'Menos complejidad. Más posibilidades.', aboutCaption: 'DISEÑO · DESARROLLO · ENTREGA',
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
    footerTag: 'Tecnología pensada para tu negocio.', footerNote: 'Diseñado con intención. Construido con tecnología.', rights: 'Todos los derechos reservados.',
    demo: {
      label: 'DEMOSTRACIÓN ILUSTRATIVA', a11y: 'Ejemplo ilustrativo de un panel de gestión. Los datos que muestra son ficticios.',
      note: 'Ejemplo de panel de gestión. Las cifras son ficticias, no son resultados de Dofra.',
      breadcrumb: 'demo / panel', mini: 'Panel de gestión', title: 'Tu negocio, más simple.', status: 'Demo',
      clients: 'Clientes', bookings: 'Turnos', activity: 'Actividad', recent: 'Próximos turnos', today: 'Hoy', tomorrow: 'Mañana',
      confirmed: 'Confirmado', pending: 'Pendiente', months: ['ENE', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'], floating: 'hecho con dedicación',
    },
  },
  en: {
    skip: 'Skip to content',
    nav: ['Home', 'Services', 'Projects', 'About us', 'Contact'], talk: "Let's talk",
    navLabel: 'Main navigation', menuOpen: 'Open menu', menuClose: 'Close menu', langSwitch: 'Cambiar a español', brandLabel: 'Dofra Software, go to top',
    eyebrow: 'WEB DEVELOPMENT & CUSTOM SOFTWARE',
    heroA: 'Websites and custom systems', heroB: 'for your business.',
    heroDesc: 'We help startups, independent professionals and small businesses showcase their services, organize their work and save time with technology tailored to their needs.',
    heroContact: 'Tell us what you need', seeWork: 'View projects',
    trust1: 'Built to grow', trust2: 'Design + development', trust3: 'Worldwide',
    serviceKicker: 'WHAT WE DO', serviceTitle: 'How can we help your business?', serviceDesc: 'Four ways to put technology to work for you, explained without jargon.',
    examplesLabel: 'Examples',
    services: [
      { icon: 'code', title: 'Websites', desc: 'Showcase your services and make it easy for new customers to get in touch.', examples: ['Single-page business sites', 'Professional websites', 'Company websites'] },
      { icon: 'layers', title: 'Web apps', desc: 'Tools that run in the browser so your customers or your team can get things done online.', examples: ['Online booking', 'Customer portals', 'Progress tracking panels'] },
      { icon: 'cpu', title: 'Custom systems', desc: 'Organize your business information and processes in a tool built around the way you work.', examples: ['Customer management', 'Appointments', 'Payments', 'Internal tasks'] },
      { icon: 'zap', title: 'Automation', desc: 'Cut down on repetitive tasks and stop entering the same information in different places.', examples: ['Reminders', 'Forms linked to spreadsheets', 'Automatic notifications'] },
    ],
    workKicker: 'PROJECTS', workTitle: 'What we build.', workDesc: 'Products we designed and built ourselves, end to end.',
    projectStatus: 'In-house product', imageNote: 'Real screenshot · sample data', featuresLabel: 'Includes',
    projects: [
      { img: 'appfotos', name: 'AppFotos', type: 'WEB PLATFORM · PHOTOGRAPHY', alt: 'AppFotos home screen with a landscape photo and the headline “Every image deserves a special place”.',
        desc: 'A platform for photographers: each one publishes their galleries on their own professional website and sells their photos directly to clients, who can browse and buy them online.',
        features: ['Galleries and portfolio', 'Own professional website', 'Online photo sales'] },
      { img: 'spa-gestor', name: 'Spa Gestor', type: 'MANAGEMENT SYSTEM · BEAUTY CLINICS', alt: 'Spa Gestor screen showing a beauty clinic’s daily schedule on a phone.',
        desc: 'A system for beauty clinics that brings the whole workflow —appointments, clients and payments— into one place, designed to be used from a phone.',
        features: ['Appointment calendar', 'Client records', 'Payments', 'WhatsApp reminders'] },
      { img: 'odonto', name: 'Odonto', type: 'MANAGEMENT SYSTEM · DENTISTRY', alt: 'Odonto weekly calendar with appointments by practitioner and the clinic’s module menu.',
        desc: 'A complete system for dental clinics: scheduling by practitioner and treatment room, patient queue, clinical records, quotes and payments, with dedicated modules for implantology and orthodontics.',
        features: ['Scheduling and patient queue', 'Clinical records', 'Implantology and orthodontics', 'Quotes, payments and reports'] },
    ],
    processKicker: 'HOW WE WORK', processTitle: 'A simple, clear process.',
    process: [
      { title: 'We listen', desc: 'You tell us how your business works and what you would like to solve.' },
      { title: 'We design', desc: 'We turn those ideas into a clear, easy-to-use proposal.' },
      { title: 'We build', desc: 'We develop the solution with current technology and attention to detail.' },
      { title: 'We support', desc: 'We launch the project and improve it whenever your business needs it.' },
    ],
    aboutKicker: 'ABOUT DOFRA', aboutTitle: 'Two sisters, one shared project.',
    aboutDesc: "Dofra is a project created by two sisters that brings together two perspectives: business and technology. Between us, we have experience at international companies and more than 4 years working in software systems. That's why we first get to know how your business works, and only then design the solution: clear, tailored and easy to use.",
    people: [
      { name: 'Franca', role: 'Accountant', desc: 'Brings the business perspective: costs, payments and admin processes, so every solution meets real needs.' },
      { name: 'Victoria', role: 'Software engineer', desc: 'Leads the technical design and development, so every tool works well and is easy to use.' },
    ],
    aboutQuote: 'Less complexity. More possibility.', aboutCaption: 'DESIGN · DEVELOP · DELIVER',
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
    footerTag: 'Technology built around your business.', footerNote: 'Designed with intention. Built with technology.', rights: 'All rights reserved.',
    demo: {
      label: 'ILLUSTRATIVE DEMO', a11y: 'Illustrative example of a management dashboard. The data shown is fictional.',
      note: 'Sample management panel. Figures are fictional, not Dofra results.',
      breadcrumb: 'demo / panel', mini: 'Management panel', title: 'Business, simplified.', status: 'Demo',
      clients: 'Clients', bookings: 'Bookings', activity: 'Activity', recent: 'Upcoming bookings', today: 'Today', tomorrow: 'Tomorrow',
      confirmed: 'Confirmed', pending: 'Pending', months: ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'], floating: 'crafted with care',
    },
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
  }
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Brand({ light = false, label }: { light?: boolean; label: string }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#inicio" aria-label={label}><span className="brand-word">dofra<span className="brand-dot">.</span></span><span className="brand-caption">SOFTWARE</span></a>
}

/** Panel ilustrativo del inicio. Todo su contenido es ficticio y está marcado como demostración. */
function Dashboard({ lang }: { lang: Lang }) {
  const d = content[lang].demo
  return <div className="dashboard" role="img" aria-label={d.a11y}>
    <div className="dash-side" aria-hidden="true"><div className="dash-logo">d<span>.</span></div><div className="side-line active" /><div className="side-line" /><div className="side-line" /><div className="side-line" /><div className="side-bottom" /></div>
    <div className="dash-main" aria-hidden="true">
      <div className="dash-top"><span className="dash-breadcrumb">{d.breadcrumb}</span><span className="dash-avatar">D</span></div>
      <div className="dash-title"><div><small>{d.mini}</small><strong>{d.title}</strong></div><span className="dash-pill"><i />{d.status}</span></div>
      <div className="dash-metrics">
        <div><span className="metric-icon"><Icon name="users" size={17} /></span><small>{d.clients}</small><strong>1.248</strong><em>↗ 12,8%</em></div>
        <div><span className="metric-icon"><Icon name="calendar" size={17} /></span><small>{d.bookings}</small><strong>328</strong><em>↗ 8,2%</em></div>
        <div><span className="metric-icon"><Icon name="trending" size={17} /></span><small>{d.activity}</small><strong>+24%</strong><em>↗ 5,4%</em></div>
      </div>
      <div className="dash-chart"><div className="dash-chart-head"><strong>{d.activity}</strong><span>2026 <span className="chev">⌄</span></span></div><div className="chart-grid"><svg viewBox="0 0 500 140" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#398cff" stopOpacity=".24" /><stop offset="1" stopColor="#398cff" stopOpacity="0" /></linearGradient></defs><path d="M0 111 C30 101 43 108 70 92 S119 99 151 73 S195 91 228 61 S278 70 311 45 S360 58 394 32 S458 42 500 10 V140 H0Z" fill="url(#area)" /><path d="M0 111 C30 101 43 108 70 92 S119 99 151 73 S195 91 228 61 S278 70 311 45 S360 58 394 32 S458 42 500 10" stroke="#3487fa" strokeWidth="3" fill="none" /></svg></div><div className="chart-months">{d.months.map(m => <span key={m}>{m}</span>)}</div></div>
      <div className="dash-list"><strong>{d.recent}</strong><div><span className="dash-list-icon">✦</span><span>09:30 · {d.today}</span><span className="dash-list-tag">{d.confirmed}</span></div><div><span className="dash-list-icon alt">✦</span><span>11:00 · {d.tomorrow}</span><span className="dash-list-tag">{d.pending}</span></div></div>
    </div>
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

  useEffect(() => {
    document.documentElement.lang = lang
    try { window.localStorage.setItem('dofra-lang', lang) } catch { /* sin almacenamiento disponible */ }
    document.title = lang === 'es' ? 'Dofra Software | Páginas web y sistemas a medida' : 'Dofra Software | Websites and custom systems'
  }, [lang])

  const navIds = ['inicio', 'servicios', 'proyectos', 'nosotras', 'contacto']
  // mailto: abre la aplicación de correo que use cada visitante (Gmail, Outlook, Apple Mail, etc.)
  const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.contactSubject)}`

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
        <a className="button button-primary nav-cta" href="#contacto">{t.talk}<Icon name="arrow" size={17} /></a>
        <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t.menuClose : t.menuOpen} aria-expanded={menuOpen} aria-controls="menu-principal"><Icon name={menuOpen ? 'close' : 'menu'} size={24} /></button>
      </div>
    </div></header>

    <main id="contenido" tabIndex={-1}>
      <section className="hero" id="inicio"><div className="hero-glow" /><div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{t.eyebrow}</div>
          <h1>{t.heroA} <span>{t.heroB}</span></h1>
          <p>{t.heroDesc}</p>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#contacto">{t.heroContact}<Icon name="arrow" size={19} /></a>
            <a className="button button-text" href="#proyectos">{t.seeWork}<Icon name="arrow" size={18} /></a>
          </div>
          <div className="hero-trust"><span><Icon name="check" size={15} />{t.trust1}</span><span><Icon name="check" size={15} />{t.trust2}</span><span><Icon name="globe" size={15} />{t.trust3}</span></div>
        </div>
        <figure className="hero-art">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-art-label" aria-hidden="true"><span className="demo-dot" /> {t.demo.label}</div>
          <Dashboard lang={lang} />
          <div className="floating-code" aria-hidden="true"><span>&lt;/&gt;</span> {t.demo.floating}</div>
          <figcaption className="hero-demo-note">{t.demo.note}</figcaption>
        </figure>
      </div><div className="hero-bottom-line" /></section>

      <section className="section services" id="servicios" aria-labelledby="servicios-titulo"><div className="container">
        <div className="section-heading section-heading-split"><div><p className="kicker">{t.serviceKicker}</p><h2 id="servicios-titulo">{t.serviceTitle}</h2></div><p>{t.serviceDesc}</p></div>
        <div className="services-grid">{t.services.map((s, i) => <article className="service-card" key={s.title}>
          <div className="service-card-top"><span className="service-icon"><Icon name={s.icon} size={25} /></span><span className="service-num" aria-hidden="true">0{i + 1} / 04</span></div>
          <h3>{s.title}</h3><p>{s.desc}</p>
          <p className="examples-label">{t.examplesLabel}</p>
          <ul className="tag-list">{s.examples.map(ex => <li key={ex}>{ex}</li>)}</ul>
        </article>)}</div>
      </div></section>

      <section className="section work" id="proyectos" aria-labelledby="proyectos-titulo"><div className="container">
        <div className="section-heading"><p className="kicker">{t.workKicker}</p><h2 id="proyectos-titulo">{t.workTitle}</h2><p>{t.workDesc}</p></div>
        <div className="projects-grid">{t.projects.map(p => <article className="project-card" key={p.name}>
          <figure className="project-visual">
            <img src={`/proyectos/${p.img}.webp`} alt={p.alt} width={1350} height={597} loading="lazy" decoding="async" />
            <figcaption className="image-note">{t.imageNote}</figcaption>
          </figure>
          <div className="project-copy">
            <div className="project-meta"><span className="project-category">{p.type}</span><span className="status-badge"><span className="status-badge-dot" />{t.projectStatus}</span></div>
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <p className="examples-label">{t.featuresLabel}</p>
            <ul className="tag-list">{p.features.map(feat => <li key={feat}>{feat}</li>)}</ul>
          </div>
        </article>)}</div>
      </div></section>

      <section className="section process" aria-labelledby="proceso-titulo"><div className="container">
        <div className="section-heading"><p className="kicker">{t.processKicker}</p><h2 id="proceso-titulo">{t.processTitle}</h2></div>
        <ol className="process-grid">{t.process.map((step, i) => <li className="process-item" key={step.title}><div className="process-number">0{i + 1}<span aria-hidden="true">{i < 3 ? '↗' : '✓'}</span></div><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
      </div></section>

      <section className="section about" id="nosotras" aria-labelledby="nosotras-titulo"><div className="container about-grid">
        <div className="about-visual" aria-hidden="true"><div className="about-shape"><div className="about-shape-ring" /><div className="about-d">d<span>.</span></div><div className="about-shape-caption">{t.aboutCaption}</div></div><div className="about-quote">“{t.aboutQuote}”</div></div>
        <div className="about-copy"><p className="kicker">{t.aboutKicker}</p><h2 id="nosotras-titulo">{t.aboutTitle}</h2><p>{t.aboutDesc}</p><ul className="people">{t.people.map(person => <li key={person.name}><span className="person-initial" aria-hidden="true">{person.name[0]}</span><div><h3>{person.name}<span>{person.role}</span></h3><p>{person.desc}</p></div></li>)}</ul></div>
      </div></section>

      <section className="section faq" aria-labelledby="faq-titulo"><div className="container faq-grid">
        <div><p className="kicker">{t.faqKicker}</p><h2 id="faq-titulo">{t.faqTitle}</h2></div>
        <div className="faq-list">{faqs.map((item, i) => <div className={`faq-item ${faqOpen === i ? 'expanded' : ''}`} key={item.q}>
          <h3><button type="button" id={`faq-q-${i}`} aria-expanded={faqOpen === i} aria-controls={`faq-a-${i}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>{item.q}</span><Icon name={faqOpen === i ? 'minus' : 'plus'} size={19} /></button></h3>
          <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={faqOpen !== i}><p>{item.a}</p></div>
        </div>)}</div>
      </div></section>

      <section className="contact" id="contacto" aria-labelledby="contacto-titulo"><div className="container"><div className="contact-panel"><div className="contact-orb" />
        <p className="kicker">{t.contactKicker}</p><h2 id="contacto-titulo">{t.contactTitle}</h2><p>{t.contactDesc}</p>
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
          <label><span>{f.message} <span aria-hidden="true">*</span></span><textarea name="message" required minLength={15} maxLength={3000} rows={5} placeholder={f.messagePh} aria-describedby="message-hint" /><span className="quote-hint" id="message-hint">{f.messageHint}</span></label>
          <label className="quote-consent"><input type="checkbox" required name="consent" value="Sí" /><span>{f.consent} <span aria-hidden="true">*</span></span></label>
          <button type="submit" className="button button-white button-large" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? f.sending : f.send}<Icon name="arrow" size={19} /></button>
          <div className={`quote-feedback ${formStatus}`} role={formStatus === 'error' ? 'alert' : 'status'} aria-live="polite">
            {formStatus === 'success' && f.success}
            {formStatus === 'error' && <>{f.error} <a href={mailtoLink}>{CONTACT_EMAIL}</a>.</>}
          </div>
          <p className="quote-email">{f.orEmail} <a href={mailtoLink}>{CONTACT_EMAIL}</a></p>
        </form>
        <div className="contact-small">{t.contactSmall.map((item, i) => <span key={item}>{i > 0 && <span className="sep" aria-hidden="true">·</span>}{item}</span>)}</div>
      </div></div></section>
    </main>

    <footer className="footer"><div className="container">
      <div className="footer-main"><div><Brand light label={t.brandLabel} /><p>{t.footerTag}</p></div><nav className="footer-links" aria-label={t.navLabel}>{t.nav.slice(1).map((label, i) => <a key={label} href={`#${navIds[i + 1]}`}>{label}</a>)}</nav></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Dofra Software. {t.rights}</span><span>{t.footerNote}</span></div>
    </div></footer>
  </>
}
