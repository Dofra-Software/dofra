import type { FormEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import DofraParticles from './components/DofraParticles'
import ProcessTimeline from './components/ProcessTimeline'
import MobileProcessTimeline from './components/MobileProcessTimeline'
import useProjectOpening from './components/useProjectOpening'
import TeamFlipCards from './components/TeamFlipCards'
import ServicesSection from './components/ServicesSection'
import { frenchContent } from './content.fr'

const LANGUAGES = {
  es: { label: 'Español', flag: 'ar', formLabel: 'Español', title: 'Páginas web y sistemas a medida' },
  en: { label: 'English', flag: 'us', formLabel: 'Inglés', title: 'Websites and custom systems' },
  fr: { label: 'Français', flag: 'fr', formLabel: 'Francés', title: 'Sites web et logiciels sur mesure' },
} as const

type Lang = keyof typeof LANGUAGES
type Faq = { q: string; a: string; /** true = borrador que necesita confirmación; no se publica */ pending?: boolean }

const CONTACT_EMAIL = 'info@dofrasoftware.com'
// Receptor del formulario en Google Apps Script (apps-script/Code.gs, ver docs/FORMULARIO.md).
// FormSubmit está detrás de IP de Cloudflare que se bloquean en España en horario de partidos.
// Implementación «Formulario de contacto de dofrasoftware.com (v1)» en la cuenta de Google de Dofra.
// La URL es pública por diseño (no es un secreto). Si quedara vacía, se usaría FormSubmit.
const CONTACT_ENDPOINT: string = import.meta.env.VITE_CONTACT_ENDPOINT
  || 'https://script.google.com/macros/s/AKfycbwSA-ZG04CCYnQYxYMEwPSacMnW5oPlTI-V2UkFLodJk3BRfFY5PvLPFnnzJHdnpc1H/exec'

// sizes replica el contenedor de 1200 px, la grilla 7:5, su separación y
// el borde de 1 px. Si el navegador admite auto, usa el ancho medido.
const PROJECT_IMAGE_SIZES = 'auto, (max-width: 900px) calc(100vw - 2 * clamp(16px, 4vw, 40px) - 2px), calc((min(1200px, 100vw - 2 * clamp(16px, 4vw, 40px)) - clamp(24px, 4vw, 56px)) * 0.583333 - 2px)'
const projectImages: Record<string, { width: number; height: number; variants: readonly number[] }> = {
  'odonto360': { width: 1904, height: 908, variants: [480, 800, 1200, 1600] },
  'spa-gestor': { width: 1600, height: 960, variants: [480, 800, 1200] },
  relevo: { width: 2400, height: 1350, variants: [480, 800, 1200, 1600, 1920] },
  'r-mas-arquitectura': { width: 1905, height: 913, variants: [480, 800, 1200, 1600] },
  'rio-cine': { width: 2400, height: 1350, variants: [480, 800, 1200, 1600, 1920] },
}

function ProjectImage({ id, alt }: { id: string; alt: string }) {
  const { width, height, variants } = projectImages[id]
  const path = `/proyectos/${id}`
  const srcSet = [...variants.map(size => `${path}-${size}.webp ${size}w`), `${path}.webp ${width}w`].join(', ')
  return <img src={`${path}-800.webp`} srcSet={srcSet} sizes={PROJECT_IMAGE_SIZES}
    width={width} height={height} alt={alt} loading="lazy" decoding="async" />
}

/** Redes oficiales. Un ícono solo se muestra si su URL está cargada. */
const SOCIAL_LINKS: { id: 'instagram' | 'linkedin'; name: string; url: string }[] = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/dofra.software/' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/company/dofra-software/' },
]

const content = {
  es: {
    skip: 'Saltar al contenido',
    nav: ['Inicio', 'Servicios', 'Proyectos', 'Nosotras', 'Contacto'], talk: 'Hablemos',
    navLabel: 'Navegación principal', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', langSwitch: 'Elegir idioma', brandLabel: 'Dofra Software, ir al inicio',
    eyebrow: 'DESARROLLO WEB Y SOFTWARE A MEDIDA',
    heroA: 'Páginas web y sistemas a medida', heroB: 'para tu negocio.',
    heroDesc: 'Ayudamos a emprendimientos, profesionales y pequeñas empresas a mostrar sus servicios, organizar su trabajo y ahorrar tiempo con tecnología adaptada a sus necesidades.',
    heroContact: 'Contanos qué necesitás', seeWork: 'Ver servicios',
    trust1: 'Pensado para crecer', trust2: 'Diseño + desarrollo', trust3: 'En todo el mundo',
    serviceKicker: 'QUÉ HACEMOS', serviceTitle: '¿Cómo podemos ayudar a tu negocio?', serviceDesc: 'Elegí por dónde empezar: una web para tu negocio o una herramienta hecha a medida.',
    serviceTabsLabel: 'Elegir tipo de servicio',
    web: {
      title: 'Páginas web',
      plansTitle: 'Planes web',
      plansDesc: 'Elegí el punto de partida para tu negocio. Cada plan incorpora nuevas herramientas y funcionalidades.',
      plansLabel: 'Planes de páginas web',
      recommended: 'Recomendado',
      plans: [
        { id: 'esencial', name: 'Esencial', tagline: 'Tu web para mostrar lo que hacés.',
          desc: 'Página a medida para celular y computadora, con servicios, fotos, horarios y consultas por WhatsApp, correo electrónico u otros canales de contacto.',
          features: ["Página a medida para celular y computadora.","Servicios, fotos y horarios.","Consultas por WhatsApp, correo electrónico u otros canales de contacto."],
          changes: 'Cambios puntuales con cargo.',
          link: { label: 'Ver proyecto · RÍO CINE', url: 'https://rio-cine.pages.dev/' }, cta: 'Cotizar Esencial' },
        { id: 'pro', name: 'Pro', tagline: 'Tu web con reservas online.', featured: true,
          desc: 'Todo lo de Esencial, más reservas por servicio, profesional y horario, y un panel privado para administrar la agenda y los turnos.',
          features: ["Todo lo incluido en Esencial.","Reservas por servicio, profesional y horario.","Panel privado para gestionar agenda y turnos."],
          changes: '1 cambio simple al mes incluido.',
          link: { label: 'Ver ejemplo de agenda · Spa Gestor', url: 'https://spa-gestor.pages.dev/' }, cta: 'Cotizar Pro' },
        { id: 'advanced', name: 'Advanced', tagline: 'Tu web con reservas online y un panel de gestión.',
          desc: 'Todo lo de Pro, más fichas e historial de clientes, seguimiento de tratamientos, presupuestos, registro de pagos y saldos pendientes. Módulos según el rubro.',
          features: ["Todo lo incluido en Pro.","Fichas e historial de clientes; seguimiento de tratamientos y presupuestos.","Registro de pagos y saldos pendientes; módulos según el rubro."],
          changes: 'Hasta 3 cambios simples al mes incluidos.',
          link: { label: 'Ver ejemplo de gestión · odonto360', url: 'https://odonto.dofrasoftware.workers.dev/' }, cta: 'Cotizar Advanced' },
      ],
      plus: { title: 'Actualizaciones Plus', tag: 'Adicional opcional',
        lead: 'Sumá hasta 2 cambios simples de contenido al mes', desc: 'a cualquiera de nuestros planes. Por ejemplo, actualizar horarios, reemplazar una foto o cambiar los precios de una sección.' },
    },
    apps: {
      title: 'Sistemas a medida',
      kicker: 'DESARROLLO A MEDIDA',
      heading: ['Contanos qué necesitás.', 'Nosotros lo desarrollamos.'],
      desc: 'Diseñamos herramientas que se adaptan a la forma de trabajar de tu negocio, desde agendas y gestión de clientes hasta soluciones personalizadas.',
      cta: 'Hablemos de tu proyecto',
    },
    processKicker: 'CÓMO TRABAJAMOS', processTitle: 'Un proceso simple y claro.',
    process: [
      { title: 'Escuchamos', desc: 'Nos contás cómo funciona tu negocio, qué necesitás y qué te gustaría resolver.' },
      { title: 'Proponemos', desc: 'Definimos una solución a medida y te presentamos qué incluye, el presupuesto y los plazos.' },
      { title: 'Diseñamos y desarrollamos', desc: 'Damos forma a tu proyecto con un diseño claro y herramientas fáciles de usar.' },
      { title: 'Revisamos y ajustamos', desc: 'Te mostramos los avances, escuchamos tu opinión y realizamos los ajustes acordados.' },
      { title: 'Entregamos y acompañamos', desc: 'Ponemos en marcha la solución y te explicamos cómo usarla. También podemos acordar soporte, mantenimiento y futuras mejoras.' },
    ],
    aboutKicker: 'SOBRE DOFRA', aboutTitle: 'Nosotras', peopleMore: 'Ver más', peopleBack: 'Volver',
    aboutDesc: [
      'Somos Franca y Victoria, contadora pública e ingeniera en software. Creamos Dofra para ayudar a negocios y profesionales a transformar sus ideas y necesidades en herramientas digitales que les faciliten el trabajo.',
      'Combinamos experiencia en empresas internacionales y más de 4 años de trayectoria en sistemas con una forma de trabajar cercana: escuchamos, preguntamos y buscamos entender qué necesita cada proyecto. Así, desarrollamos soluciones a medida que tienen sentido para tu negocio y son fáciles de usar.',
    ],
    people: [
      { name: 'Franca', role: 'Contadora Pública', desc: 'Analiza los procesos administrativos y comerciales de cada cliente y define el alcance funcional de los proyectos.' },
      { name: 'Victoria', role: 'Ingeniera en Software', desc: 'Lidera el diseño técnico de las soluciones y su desarrollo, desde la arquitectura hasta la implementación.' },
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
      types: ['Página web · Plan Esencial', 'Página web · Plan Pro', 'Página web · Plan Advanced', 'Proyecto a medida', 'Página web', 'Aplicación web', 'Sistema a medida', 'Automatización', 'No sé qué necesito, quiero asesoramiento', 'Otro'],
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
      kicker: 'PROYECTOS', title: 'Proyectos que hablan por nosotras.', desc: 'Soluciones digitales diseñadas para necesidades reales.',
      view: 'Ver proyecto', newTab: 'se abre en una pestaña nueva',
      items: [
        { id: 'odonto360', name: 'odonto360', category: 'Salud · Gestión clínica', url: 'https://odonto.dofrasoftware.workers.dev/',
          desc: 'Gestión integral para clínicas odontológicas: pacientes con historia clínica y odontograma, agenda por profesional y consultorio, lista de espera, presupuestos, pagos con cuenta corriente, reportes y un visor 3D de tomografías.',
          alt: 'Odontograma de odonto360 con piezas marcadas como realizadas, pendientes y ausentes.' },
        { id: 'spa-gestor', name: 'Spa Gestor', category: 'Estética · Gestión y reservas', url: 'https://spa-gestor.pages.dev/',
          desc: 'Software para centros de estética y spas: agenda de turnos, fichas de clientes, tratamientos con catálogo público, pagos y deudas, promociones y reportes. Cada negocio trabaja en su propio espacio dentro de la misma plataforma.',
          alt: 'Agenda semanal de Spa Gestor con turnos de un centro de estética ficticio.' },
        { id: 'relevo', name: 'Relevo', category: 'Operaciones · Gestión de turnos', url: 'https://relevo.dofrasoftware.com/',
          desc: 'Aplicación para organizar la comunicación entre turnos de trabajo: registro de novedades, asignación de responsables, seguimiento de pendientes y entrega y recepción de cada turno, para que los equipos trabajen con información clara y actualizada.',
          alt: 'Panel Novedades de Relevo con las novedades abiertas de un hotel ficticio, con prioridad, sector, responsable y estado.' },
        { id: 'r-mas-arquitectura', name: 'R+ Arquitectura', category: 'Arquitectura · Desarrollo web', url: 'https://r-mas-arquitectura.pages.dev/',
          desc: 'Landing page para un estudio de arquitectura de Uruguay y Argentina. Presenta el estudio, sus servicios y una selección de obras, con acceso directo al contacto.',
          alt: 'Portada de R+ Arquitectura con el logotipo del estudio sobre un plano arquitectónico.' },
        { id: 'rio-cine', name: 'RÍO CINE', category: 'Audiovisual · Desarrollo web', url: 'https://rio-cine.pages.dev/',
          desc: 'Sitio web para una productora audiovisual de Uruguay, con una propuesta visual cinematográfica que destaca su identidad y sus producciones.',
          alt: 'Portada del sitio de RÍO CINE con cámara cinematográfica, logotipo y navegación sobre fondo oscuro.' },
      ],
    },
    rights: 'Todos los derechos reservados.',
    heroVisual: 'Logo de Dofra formado por partículas blancas y terracota.',
  },
  en: {
    skip: 'Skip to content',
    nav: ['Home', 'Services', 'Projects', 'About us', 'Contact'], talk: "Let's talk",
    navLabel: 'Main navigation', menuOpen: 'Open menu', menuClose: 'Close menu', langSwitch: 'Choose language', brandLabel: 'Dofra Software, go to top',
    eyebrow: 'WEB DEVELOPMENT & CUSTOM SOFTWARE',
    heroA: 'Websites and custom systems', heroB: 'for your business.',
    heroDesc: 'We help startups, independent professionals and small businesses showcase their services, organize their work and save time with technology tailored to their needs.',
    heroContact: 'Tell us what you need', seeWork: 'View services',
    trust1: 'Built to grow', trust2: 'Design + development', trust3: 'Worldwide',
    serviceKicker: 'WHAT WE DO', serviceTitle: 'How can we help your business?', serviceDesc: 'Choose where to start: a website for your business or a tool built just for you.',
    serviceTabsLabel: 'Choose a type of service',
    web: {
      title: 'Websites',
      plansTitle: 'Website plans',
      plansDesc: 'Choose the right starting point for your business. Each plan adds new tools and features.',
      plansLabel: 'Website plans',
      recommended: 'Recommended',
      plans: [
        { id: 'esencial', name: 'Essential', tagline: 'A website to show what you do.',
          desc: 'A custom site for mobile and desktop, with your services, photos, opening hours and enquiries through WhatsApp, email or other contact channels.',
          features: ["Custom website for mobile and desktop.","Services, photos and opening hours.","Customer enquiries through WhatsApp, email or other contact channels."],
          changes: 'One-off changes billed separately.',
          link: { label: 'View project · RÍO CINE', url: 'https://rio-cine.pages.dev/' }, cta: 'Get an Essential quote' },
        { id: 'pro', name: 'Pro', tagline: 'Your website with online booking.', featured: true,
          desc: 'Everything in Essential, plus booking by service, professional and time slot, and a private dashboard to manage your schedule and appointments.',
          features: ["Everything included in Essential.","Bookings by service, professional and time.","Private dashboard to manage appointments."],
          changes: '1 simple change per month included.',
          link: { label: 'See a booking example · Spa Gestor', url: 'https://spa-gestor.pages.dev/' }, cta: 'Get a Pro quote' },
        { id: 'advanced', name: 'Advanced', tagline: 'Your website with online booking and a management dashboard.',
          desc: 'Everything in Pro, plus client records and history, treatment tracking, quotes, payment records and outstanding balances. Modules tailored to your industry.',
          features: ["Everything included in Pro.","Client records, treatment tracking and estimates.","Payment records and outstanding balances; modules tailored to your industry."],
          changes: 'Up to 3 simple changes per month included.',
          link: { label: 'See a management example · odonto360', url: 'https://odonto.dofrasoftware.workers.dev/' }, cta: 'Get an Advanced quote' },
      ],
      plus: { title: 'Plus Updates', tag: 'Optional add-on',
        lead: 'Add up to 2 simple content changes per month', desc: 'to any of our plans. For example, updating opening hours, replacing a photo or changing the prices in a section.' },
    },
    apps: {
      title: 'Custom systems',
      kicker: 'CUSTOM DEVELOPMENT',
      heading: ['Tell us what you need.', 'We will build it.'],
      desc: 'We design tools that adapt to the way your business works, from calendars and client management to fully tailored solutions.',
      cta: 'Let’s talk about your project',
    },
    processKicker: 'HOW WE WORK', processTitle: 'A simple, clear process.',
    process: [
      { title: 'We listen', desc: 'You tell us how your business works, what you need and what you would like to solve.' },
      { title: 'We propose', desc: 'We define a tailored solution and walk you through what it includes, the budget and the timeline.' },
      { title: 'We design and build', desc: 'We shape your project with a clear design and easy-to-use tools.' },
      { title: 'We review and refine', desc: 'We show you our progress, listen to your feedback and make the agreed adjustments.' },
      { title: 'We deliver and support', desc: 'We launch the solution and show you how to use it. We can also arrange support, maintenance and future improvements.' },
    ],
    aboutKicker: 'ABOUT DOFRA', aboutTitle: 'About Dofra', peopleMore: 'See more', peopleBack: 'Back',
    aboutDesc: [
      'We are Franca and Victoria, a certified public accountant and a software engineer. We created Dofra to help businesses and professionals turn their ideas and needs into digital tools that make their work easier.',
      'We bring together experience at international companies and more than 4 years working in software systems with a hands-on, personal approach: we listen, ask questions and make sure we understand what each project needs. That way, we build tailored solutions that make sense for your business and are easy to use.',
    ],
    people: [
      { name: 'Franca', role: 'Public Accountant', desc: 'Analyzes each client’s administrative and business processes and defines the functional scope of each project.' },
      { name: 'Victoria', role: 'Software Engineer', desc: 'Leads the technical design and development of each solution, from architecture to implementation.' },
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
      types: ['Website · Essential plan', 'Website · Pro plan', 'Website · Advanced plan', 'Custom project', 'Website', 'Web app', 'Custom system', 'Automation', "I'm not sure what I need, I'd like some advice", 'Other'],
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
        { id: 'odonto360', name: 'odonto360', category: 'Healthcare · Clinic management', url: 'https://odonto.dofrasoftware.workers.dev/',
          desc: 'End-to-end management for dental clinics: patients with clinical records and dental charts, scheduling by practitioner and treatment room, waitlist, quotes, payments with account balances, reports and a 3D CT viewer.',
          alt: 'odonto360 dental chart showing completed and pending treatments and missing teeth.' },
        { id: 'spa-gestor', name: 'Spa Gestor', category: 'Beauty · Management and bookings', url: 'https://spa-gestor.pages.dev/',
          desc: 'Software for beauty clinics and spas: appointment calendar, client records, treatments with a public catalog, payments and balances, promotions and reports. Each business works in its own space within the same platform.',
          alt: 'Spa Gestor weekly calendar with appointments for a fictional beauty clinic.' },
        { id: 'relevo', name: 'Relevo', category: 'Operations · Shift management', url: 'https://relevo.dofrasoftware.com/',
          desc: 'An application for organizing communication between work shifts: recording updates, assigning responsibilities, tracking outstanding tasks and managing each shift handover, so teams work with clear, up-to-date information.',
          alt: 'Relevo Updates panel showing open items for a fictional hotel, with priority, area, assignee and status.' },
        { id: 'r-mas-arquitectura', name: 'R+ Arquitectura', category: 'Architecture · Web development', url: 'https://r-mas-arquitectura.pages.dev/',
          desc: 'Landing page for an architecture studio working in Uruguay and Argentina. It introduces the studio, its services and selected projects, with a direct link to get in touch.',
          alt: 'R+ Arquitectura homepage with the studio logo over an architectural floor plan.' },
        { id: 'rio-cine', name: 'RÍO CINE', category: 'Audiovisual · Web development', url: 'https://rio-cine.pages.dev/',
          desc: 'Website for an audiovisual production company in Uruguay, featuring a cinematic visual experience that highlights its identity and productions.',
          alt: 'RÍO CINE website hero with a cinema camera, brand logo and navigation against a dark background.' },
      ],
    },
    rights: 'All rights reserved.',
    heroVisual: 'Dofra logo made of white and terracotta particles.',
  },
  fr: frenchContent,
}

/** Valores que llegan en el correo: siempre en español, sin importar el idioma del visitante. */
const TYPE_VALUES = content.es.form.types
const BUDGET_VALUES = content.es.form.budgets
/** Opción del formulario que preselecciona cada botón de cotización de Servicios. */
const QUOTE_TYPES: Record<string, string> = { esencial: TYPE_VALUES[0], pro: TYPE_VALUES[1], advanced: TYPE_VALUES[2], custom: TYPE_VALUES[3] }

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
    chevronDown: <path d="m6 9 6 6 6-6" />,
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

/** Secciones cuyas apariciones se repiten: al salir por completo de la sección vuelven al inicio. */
const REPLAY_SECTIONS = '.process-section, #proyectos'

/** Aparición suave de bloques al entrar en pantalla. Sin efecto con movimiento reducido. */
function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        io.unobserve(entry.target)
      }
    })
    const replaySections = Array.from(document.querySelectorAll(REPLAY_SECTIONS))
    const sectionIo = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) continue
        entry.target.querySelectorAll('[data-reveal].is-visible').forEach(el => {
          el.classList.remove('is-visible')
          io.observe(el)
        })
      }
    })
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    replaySections.forEach(section => sectionIo.observe(section))
    return () => { io.disconnect(); sectionIo.disconnect() }
  }, [])
}

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem('dofra-lang')
    if (stored === 'en' || stored === 'fr') return stored
  } catch { /* sin almacenamiento disponible */ }
  return 'es'
}

function LanguagePicker({ lang, label, onChange }: { lang: Lang; label: string; onChange: (lang: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onOutsidePointer)
    return () => document.removeEventListener('pointerdown', onOutsidePointer)
  }, [open])

  function closeAndFocus() {
    setOpen(false)
    toggle.current?.focus()
  }

  return <div
    className="lang-picker"
    ref={root}
    onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}
    onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation()
        closeAndFocus()
      }
    }}
  >
    <button type="button" className="lang-switch" ref={toggle} aria-label={`${label} · ${LANGUAGES[lang].label}`}
      aria-expanded={open} aria-controls="language-options" onClick={() => setOpen(value => !value)}>
      <img className="lang-flag" src={`/flags/${LANGUAGES[lang].flag}.png`} width="20" height="14" alt="" />
      <span aria-hidden="true">{lang.toUpperCase()}</span>
      <Icon name="chevronDown" size={14} />
    </button>
    <ul className="lang-options" id="language-options" aria-label={label} hidden={!open}>
      {(Object.keys(LANGUAGES) as Lang[]).map(option => {
        const language = LANGUAGES[option]
        return <li key={option}>
          <button type="button" lang={option} aria-current={option === lang ? 'true' : undefined}
            onClick={() => {
              onChange(option)
              closeAndFocus()
            }}>
            <img className="lang-flag" src={`/flags/${language.flag}.png`} width="20" height="14" alt="" />
            {language.label}
            {option === lang && <Icon name="check" size={16} />}
          </button>
        </li>
      })}
    </ul>
  </div>
}

export default function App() {
  const [lang, setLang] = useState<Lang>(readStoredLang)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [projectType, setProjectType] = useState('')
  const t = content[lang]
  const f = t.form
  const faqs = t.faqs.filter((item: Faq) => !item.pending)
  useReveal()
  useProjectOpening(projectsRef)

  useEffect(() => {
    document.documentElement.lang = lang
    try { window.localStorage.setItem('dofra-lang', lang) } catch { /* sin almacenamiento disponible */ }
    document.title = `Dofra Software | ${LANGUAGES[lang].title}`
  }, [lang])

  function closeMenu() {
    setMenuOpen(false)
    menuToggleRef.current?.focus()
  }

  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector('a')?.focus({ preventScroll: true })
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

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

  /** Botones de cotización: preseleccionan el plan o el proyecto a medida y llevan al formulario. */
  function quote(kind: keyof typeof QUOTE_TYPES) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      setProjectType(QUOTE_TYPES[kind])
      if (formStatus !== 'sending') setFormStatus('idle')
      goToContactForm(event)
    }
  }

  const linkLabel = (label: string) => `${label} (${t.work.newTab})`

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
      // Apps Script: cuerpo urlencoded y sin cabeceras propias, para que sea una petición simple
      // (sin verificación previa CORS) y el script reciba los campos en e.parameter.
      const service = CONTACT_ENDPOINT ? 'Apps Script' : 'FormSubmit'
      const response = CONTACT_ENDPOINT
        ? await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            body: new URLSearchParams([...data.entries()].map(([k, v]) => [k, String(v)])),
            signal: controller.signal,
          })
        : await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          })
      let result: { success?: boolean | string; message?: string } = {}
      try { result = await response.json() } catch { throw new Error(`Respuesta no válida de ${service} (HTTP ${response.status})`) }
      // Éxito solo si el servicio confirma que aceptó el envío. Ej.: success "false" = formulario sin activar.
      if (!response.ok || String(result.success) !== 'true') {
        throw new Error(`${service} rechazó el envío (HTTP ${response.status}): ${result.message ?? 'sin detalle'}`)
      }
      form.reset()
      setProjectType('')
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
      {menuOpen && <button type="button" className="nav-backdrop" tabIndex={-1} aria-label={t.menuClose} onClick={closeMenu} />}
      <nav ref={menuRef} id="menu-principal" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label={t.navLabel}>{t.nav.map((label, i) => <a key={navIds[i]} href={`#${navIds[i]}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <div className="nav-actions">
        <LanguagePicker lang={lang} label={t.langSwitch} onChange={setLang} />
        <a className="button button-primary nav-cta" href="#contacto">{t.talk}<Icon name="arrow" size={16} /></a>
        <button type="button" className="menu-toggle" ref={menuToggleRef} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t.menuClose : t.menuOpen} aria-expanded={menuOpen} aria-controls="menu-principal"><Icon name={menuOpen ? 'close' : 'menu'} size={20} /></button>
      </div>
    </div></header>

    <main id="contenido" tabIndex={-1}>
      <section className="hero" id="inicio" aria-labelledby="hero-titulo"><div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p>
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

      <section className="section section-soft section-compact process-section" aria-labelledby="proceso-titulo"><div className="container">
        <header className="section-head" data-reveal><p className="kicker">{t.processKicker}</p><h2 id="proceso-titulo">{t.processTitle}</h2></header>
        <ol className="grid process-grid" data-reveal>{t.process.map((step, i) => <li className="card process-card" key={step.title}><span className="process-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><p>{step.desc}</p></li>)}</ol>
        <ProcessTimeline steps={t.process} label={t.processKicker} />
        <MobileProcessTimeline steps={t.process} label={t.processKicker} />
      </div></section>

      <section className="section work" id="proyectos" aria-labelledby="proyectos-titulo"><div className="container">
        <header className="work-head" data-reveal><p className="work-kicker">{t.work.kicker}</p><h2 id="proyectos-titulo">{t.work.title}</h2><p>{t.work.desc}</p></header>
        <div className="work-list" ref={projectsRef}>{t.work.items.filter(item => item.id !== 'spa-gestor').map((item, i) => <article className={`work-item${i % 2 ? ' is-reverse' : ''}`} key={item.id} data-reveal aria-labelledby={`proyecto-${item.id}`}>
          <figure className="work-shot">
            <ProjectImage id={item.id} alt={item.alt} />
          </figure>
          <div className="work-copy">
            <p className="work-category">{item.category}</p>
            <h3 id={`proyecto-${item.id}`}>{item.name}</h3>
            <p className="work-desc">{item.desc}</p>
            <a className="work-link" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.work.view}: ${item.name} (${t.work.newTab})`}>{t.work.view}<Icon name="arrow" size={18} /></a>
          </div>
        </article>)}</div>
      </div></section>

      <ServicesSection t={t} quote={quote} linkLabel={linkLabel} icon={(name, size) => <Icon name={name} size={size} />} />

      <section className="section section-dark section-compact" id="nosotras" aria-labelledby="nosotras-titulo">
        <TeamFlipCards title={t.aboutTitle} titleId="nosotras-titulo" paragraphs={t.aboutDesc} people={t.people}
          moreLabel={t.peopleMore} backLabel={t.peopleBack} />
      </section>

      <section className="section section-soft section-compact" aria-labelledby="faq-titulo"><div className="container">
        <header className="section-head" data-reveal><p className="kicker">{t.faqKicker}</p><h2 id="faq-titulo">{t.faqTitle}</h2></header>
        <div className="faq-list" data-reveal>{faqs.map((item, i) => <div className={`faq-item ${faqOpen === i ? 'expanded' : ''}`} key={item.q}>
          <h3><button type="button" id={`faq-q-${i}`} aria-expanded={faqOpen === i} aria-controls={`faq-a-${i}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>{item.q}</span><span className="faq-icon" aria-hidden="true"><Icon name={faqOpen === i ? 'minus' : 'plus'} size={18} /></span></button></h3>
          <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={faqOpen !== i}><p>{item.a}</p></div>
        </div>)}</div>
      </div></section>

      <section className="section contact section-compact" id="contacto" aria-labelledby="contacto-titulo"><div className="container"><div className="contact-panel" data-reveal>
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
          <input type="hidden" name="idioma" value={LANGUAGES[lang].formLabel} />
          <div className="quote-honey" aria-hidden="true"><label>Website<input name="_honey" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="quote-required" id="form-required-note">{f.requiredNote}</p>
          <div className="quote-grid">
            <label><span>{f.name} <span aria-hidden="true">*</span></span><input name="name" required maxLength={100} autoComplete="name" placeholder={f.namePh} /></label>
            <label><span>{f.email} <span aria-hidden="true">*</span></span><input type="email" name="email" required maxLength={150} autoComplete="email" placeholder={f.emailPh} /></label>
            <label><span>{f.type} <span aria-hidden="true">*</span></span><select name="project_type" required value={projectType} onChange={event => setProjectType(event.target.value)}><option value="" disabled>{f.typePh}</option>{f.types.map((label, i) => <option key={TYPE_VALUES[i]} value={TYPE_VALUES[i]}>{label}</option>)}</select></label>
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
        </li>)}<li className="footer-email-item"><a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email: ${CONTACT_EMAIL}`}><Icon name="mail" size={18} /></a></li></ul>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Dofra Software. {t.rights}</span><span className="footer-slogan" lang="en">{t.footer.slogan}</span></div>
    </div></footer>
  </>
}
