import { legalEs } from './es'
import { legalEn } from './en'
import { legalFr } from './fr'

/** Textos legales por idioma. El español (es.ts) es la versión jurídica de referencia. */
export const legal = { es: legalEs, en: legalEn, fr: legalFr }

/**
 * Receptor de las solicitudes de arrepentimiento y baja (apps-script/solicitudes/Code.gs, ver docs/LEGAL.md).
 * Es un proyecto de Apps Script distinto del formulario de contacto. La URL /exec es pública por diseño.
 * Va escrita acá (como CONTACT_ENDPOINT en App.tsx) para que la compilación local que se publica en
 * GitHub Pages la incluya sin depender de variables de entorno. VITE_REQUESTS_ENDPOINT la reemplaza.
 * Implementación «Solicitudes dofrasoftware.com» en la cuenta de Google de Dofra.
 */
export const REQUESTS_ENDPOINT: string = import.meta.env.VITE_REQUESTS_ENDPOINT
  || 'https://script.google.com/macros/s/AKfycbzo9rqUrkRlSNC1CWGiJBRkupruKsbcRIcIiZLmHOQttHytOv9Vn3vKhpu0ixwjMoAJ/exec'

/** true cuando el registro privado de solicitudes (Google Sheets) está en uso. */
export const REGISTRY_ACTIVE = REQUESTS_ENDPOINT !== ''
