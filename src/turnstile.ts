import { useCallback, useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile (gratuito) para los formularios. Ver docs/LEGAL.md.
 *
 * - Clave del sitio: pública por diseño (widget «dofrasoftware.com», modo Managed, pre-clearance desactivado).
 *   Vacía = Turnstile desactivado (los formularios funcionan como antes
 *   y la política de privacidad no lo menciona). La clave secreta va SOLO en las propiedades de Apps Script.
 * - El script de Cloudflare se carga recién cuando la persona empieza a completar un formulario: visitar el
 *   sitio no genera ninguna conexión a Cloudflare.
 * - Si Turnstile no carga (bloqueo de red, extensiones), el envío falla y el formulario muestra el correo de
 *   contacto como canal alternativo.
 */
export const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAGRXAvTQt7jRhd__'
export const TURNSTILE_ACTIVE = TURNSTILE_SITE_KEY !== ''

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TOKEN_TIMEOUT_MS = 15000

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global { interface Window { turnstile?: TurnstileApi } }

let loader: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile no disponible'))
    script.onerror = () => { loader = null; script.remove(); reject(new Error('No se pudo cargar Turnstile')) }
    document.head.appendChild(script)
  })
  return loader
}

/**
 * Turnstile para un formulario. `prepare()` carga y dibuja el widget (llamarlo al primer foco del formulario);
 * `getToken()` espera el token (null si Turnstile está desactivado); `reset()` pide uno nuevo después de enviar.
 */
export function useTurnstile({ action, theme, lang }: { action: string; theme: 'light' | 'dark'; lang: string }) {
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const token = useRef<string | null>(null)
  const failure = useRef<Error | null>(null)
  const waiters = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void }[]>([])

  const settle = useCallback((value: string | Error) => {
    const pending = waiters.current
    waiters.current = []
    for (const w of pending) {
      if (typeof value === 'string') w.resolve(value)
      else w.reject(value)
    }
  }, [])

  const prepare = useCallback(async () => {
    if (!TURNSTILE_ACTIVE || widget.current || !container.current) return
    try {
      const api = await loadTurnstile()
      if (widget.current || !container.current) return
      failure.current = null
      widget.current = api.render(container.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        theme,
        language: lang,
        appearance: 'interaction-only',
        'refresh-expired': 'auto',
        callback: (t: string) => { token.current = t; failure.current = null; settle(t) },
        'expired-callback': () => { token.current = null },
        'error-callback': (code: string) => {
          token.current = null
          failure.current = new Error(`Turnstile: error ${code}`)
          settle(failure.current)
        },
        'timeout-callback': () => { token.current = null },
      })
    } catch (error) {
      failure.current = error instanceof Error ? error : new Error(String(error))
      settle(failure.current)
    }
  }, [action, theme, lang, settle])

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!TURNSTILE_ACTIVE) return null
    if (token.current) return token.current
    await prepare()
    if (token.current) return token.current
    if (failure.current) throw failure.current
    return new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Turnstile: tiempo de espera agotado')), TOKEN_TIMEOUT_MS)
      waiters.current.push({
        resolve: t => { window.clearTimeout(timer); resolve(t) },
        reject: e => { window.clearTimeout(timer); reject(e) },
      })
    })
  }, [prepare])

  /** Cada token sirve una sola vez: después de cada envío (bueno o malo) se pide otro. */
  const reset = useCallback(() => {
    token.current = null
    failure.current = null
    if (widget.current && window.turnstile) window.turnstile.reset(widget.current)
  }, [])

  // Si cambia el idioma o se desmonta el formulario, se quita el widget (se vuelve a dibujar al usarlo).
  useEffect(() => () => {
    if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
    widget.current = null
    token.current = null
  }, [action, theme, lang])

  return { container, prepare, getToken, reset }
}
