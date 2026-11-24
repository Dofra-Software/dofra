/**
 * Rutas del sitio institucional. Fuente única para la aplicación (src/App.tsx) y para la compilación
 * (vite.config.ts), que genera un HTML por ruta con su título, descripción y URL canónica en español.
 * Ver docs/LEGAL.md.
 */
export const SITE_URL = 'https://www.dofrasoftware.com'

export type PageId = 'home' | 'terms' | 'privacy' | 'cookies' | 'withdrawal' | 'cancellation'

/** Ruta pública de cada página (sin barra final). */
export const PATHS: Record<PageId, string> = {
  home: '/',
  terms: '/terminos-y-condiciones',
  privacy: '/privacidad',
  cookies: '/cookies',
  withdrawal: '/arrepentimiento',
  cancellation: '/baja-de-servicio',
}

/**
 * Metadatos en español (versión de referencia) que se escriben en el HTML de cada ruta al compilar.
 * En el navegador, la aplicación los reemplaza según el idioma elegido.
 */
export const STATIC_META: Record<Exclude<PageId, 'home'>, { title: string; description: string }> = {
  terms: {
    title: 'Términos y condiciones | Dofra Software',
    description: 'Términos y condiciones de uso del sitio institucional de Dofra Software: servicios, cotizaciones, contratación, propiedad intelectual y derechos de los consumidores.',
  },
  privacy: {
    title: 'Política de privacidad | Dofra Software',
    description: 'Cómo Dofra Software trata los datos personales recabados en su sitio institucional, con qué finalidades y cómo ejercer los derechos de acceso, rectificación y supresión.',
  },
  cookies: {
    title: 'Política de cookies y almacenamiento local | Dofra Software',
    description: 'Tecnologías de almacenamiento del sitio institucional de Dofra Software: sin cookies ni analítica; solo almacenamiento local para recordar el idioma.',
  },
  withdrawal: {
    title: 'Botón de arrepentimiento | Dofra Software',
    description: 'Formulario para solicitar la revocación de una contratación con Dofra Software, sin necesidad de registro ni de indicar el motivo.',
  },
  cancellation: {
    title: 'Botón de baja de servicio | Dofra Software',
    description: 'Formulario para solicitar la baja de un servicio contratado con Dofra Software, sin necesidad de registro ni de indicar el motivo.',
  },
}

/** Página que corresponde a una ruta. Acepta barra final y «.html» (GitHub Pages sirve ambas formas). */
export function pageFromPath(pathname: string): PageId {
  const clean = pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/'
  const match = (Object.keys(PATHS) as PageId[]).find(id => PATHS[id] === clean)
  return match ?? 'home'
}
