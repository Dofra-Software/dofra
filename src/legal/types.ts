/**
 * Estructura de los textos legales. Cada idioma (es.ts, en.ts, fr.ts) completa el mismo tipo, así el
 * compilador avisa si una traducción queda incompleta. El español es la versión jurídica de referencia.
 *
 * Formato de texto: párrafos simples con enlaces en el estilo [texto](destino). Destinos internos
 * («/privacidad»), externos («https://…») o de correo («mailto:…»).
 */

/**
 * Condiciones de los bloques: 'registry' = registro de solicitudes en Google Sheets activo;
 * 'turnstile' / 'noTurnstile' = Cloudflare Turnstile activo o no (src/turnstile.ts).
 */
export type Condition = 'registry' | 'turnstile' | 'noTurnstile'

/** Párrafo, lista o bloque condicionado. */
export type Block =
  | string
  | { list: string[] }
  | { when: Condition; block: Block }

export type LegalSection = { title: string; blocks: Block[] }

export type LegalDoc = {
  title: string
  description: string
  updated: string
  sections: LegalSection[]
}

export type RequestKind = 'withdrawal' | 'cancellation'

export type RequestFormText = {
  kicker: string
  title: string
  description: string
  service: string
  submit: string
  /** Nombre del tipo de solicitud tal como se muestra en la confirmación. */
  typeName: string
}

export type LegalLocale = {
  ui: {
    kicker: string
    updatedLabel: string
    toc: string
    backHome: string
    backTop: string
    newTab: string
    /** Aviso de traducción: solo en inglés y francés. */
    translationNote?: string
  }
  footer: {
    navLabel: string
    terms: string
    privacy: string
    cookies: string
    requestsLabel: string
    /**
     * Denominación exacta exigida por la Disposición 954/2025 (arts. 1 y 4): se muestra en español en todos
     * los idiomas. En inglés y francés, `withdrawalHint` / `cancellationHint` la explican a lectores de pantalla.
     */
    withdrawal: string
    cancellation: string
    withdrawalHint?: string
    cancellationHint?: string
  }
  contact: {
    /** Casilla obligatoria del formulario de contacto (con enlace a la política de privacidad). */
    consent: string
  }
  requests: {
    intro: string
    requiredNote: string
    name: string
    email: string
    reference: string
    details: string
    privacyNotice: string
    sending: string
    successTitle: string
    successId: string
    successType: string
    successDate: string
    successEmail: string
    successPending: string
    successKeep: string
    successNotFinal: string
    error: string
    newRequest: string
    withdrawal: RequestFormText
    cancellation: RequestFormText
  }
  docs: { terms: LegalDoc; privacy: LegalDoc; cookies: LegalDoc }
}
