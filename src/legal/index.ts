import { legalEs } from './es'
import { legalEn } from './en'
import { legalFr } from './fr'

/** Textos legales por idioma. El español (es.ts) es la versión jurídica de referencia. */
export const legal = { es: legalEs, en: legalEn, fr: legalFr }

/**
 * Receptor de las solicitudes de arrepentimiento y baja (apps-script/solicitudes/Code.gs, ver docs/LEGAL.md).
 * Es un proyecto de Apps Script distinto del formulario de contacto. La URL /exec es pública por diseño.
 * Mientras esté vacía, los formularios muestran el error con el correo de contacto y la política de
 * privacidad no menciona el registro en Google Sheets.
 */
export const REQUESTS_ENDPOINT: string = import.meta.env.VITE_REQUESTS_ENDPOINT || ''

/** true cuando el registro privado de solicitudes (Google Sheets) está en uso. */
export const REGISTRY_ACTIVE = REQUESTS_ENDPOINT !== ''
