import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { LegalLocale, RequestKind } from '../legal/types'
import { REQUESTS_ENDPOINT } from '../legal'
import { useTurnstile } from '../turnstile'
import { LegalHero } from './LegalPage'
import RichText from './RichText'
import './legal.css'

/** Valor que recibe el servidor según el tipo de solicitud (apps-script/solicitudes/Code.gs). */
const KIND_VALUE: Record<RequestKind, string> = { withdrawal: 'arrepentimiento', cancellation: 'baja' }
const ID_PATTERN = /^DOF-(ARR|BAJ)-\d{4}-\d{4,}$/
const LOCALES = { es: 'es-AR', en: 'en-US', fr: 'fr-FR' } as const

type Receipt = { id: string; receivedAt: string; emailSent: boolean }

/** Clave para que un reintento del mismo envío no genere una segunda solicitud en el servidor. */
function newRequestKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Formulario reutilizable para el botón de arrepentimiento y el botón de baja de servicio.
 * Solo muestra la confirmación si el servidor devolvió un identificador válido (la solicitud quedó registrada).
 */
export default function RequestForm({ kind, lang, t }: { kind: RequestKind; lang: keyof typeof LOCALES; t: LegalLocale }) {
  const r = t.requests
  const text = r[kind]
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const requestKey = useRef(newRequestKey())
  const receiptRef = useRef<HTMLDivElement>(null)
  const turnstile = useTurnstile({ action: KIND_VALUE[kind], theme: 'light', lang })

  useEffect(() => {
    if (status === 'success') receiptRef.current?.focus()
  }, [status])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const data = new FormData(form)
    if (data.get('_honey')) return
    // Campos obligatorios: no se aceptan solo espacios.
    for (const name of ['name', 'service']) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null
      if (field && !field.value.trim()) {
        field.value = ''
        field.reportValidity()
        return
      }
    }
    setStatus('sending')
    // Verificación anti-bots (solo si Turnstile está activo). Si no carga, el error ofrece el correo como alternativa.
    let turnstileToken: string | null = null
    try {
      turnstileToken = await turnstile.getToken()
    } catch (error) {
      console.error('[Dofra] No se pudo verificar la solicitud:', error instanceof Error ? error.message : String(error))
      turnstile.reset()
      setStatus('error')
      return
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      if (!REQUESTS_ENDPOINT) throw new Error('Receptor de solicitudes sin configurar (VITE_REQUESTS_ENDPOINT)')
      const body = new URLSearchParams({
        kind: KIND_VALUE[kind],
        name: String(data.get('name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        service: String(data.get('service') ?? '').trim(),
        reference: String(data.get('reference') ?? '').trim(),
        details: String(data.get('details') ?? '').trim(),
        lang,
        requestKey: requestKey.current,
      })
      if (turnstileToken) body.set('turnstileToken', turnstileToken)
      // Petición simple (sin cabeceras propias), igual que el formulario de contacto.
      const response = await fetch(REQUESTS_ENDPOINT, { method: 'POST', body, signal: controller.signal })
      const result = await response.json() as { success?: boolean; id?: string; receivedAt?: string; emailSent?: boolean; message?: string }
      if (!response.ok || result.success !== true || !result.id || !ID_PATTERN.test(result.id) || !result.receivedAt) {
        throw new Error(`Solicitud no registrada (HTTP ${response.status}): ${result.message ?? 'sin detalle'}`)
      }
      setReceipt({ id: result.id, receivedAt: result.receivedAt, emailSent: result.emailSent === true })
      setStatus('success')
      form.reset()
      requestKey.current = newRequestKey()
    } catch (error) {
      const reason = controller.signal.aborted ? 'Tiempo de espera agotado (20 s)' : error instanceof Error ? error.message : String(error)
      console.error('[Dofra] No se pudo registrar la solicitud:', reason)
      setStatus('error')
    } finally {
      window.clearTimeout(timeout)
      turnstile.reset() // cada token sirve para un solo envío
    }
  }

  const receivedAt = receipt ? new Intl.DateTimeFormat(LOCALES[lang], {
    // dateStyle/timeStyle no se pueden combinar con timeZoneName: se piden los campos por separado.
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Cordoba', timeZoneName: 'short',
  }).format(new Date(receipt.receivedAt)) : ''

  return <main id="contenido" tabIndex={-1} className="legal" aria-labelledby="legal-titulo">
    <LegalHero ui={t.ui} rights={t.footer} kicker={text.kicker} title={text.title}>
      <p className="legal-lead">{text.description}</p>
    </LegalHero>
    <div className="container legal-form-wrap">
      {status === 'success' && receipt && <div className="request-receipt" ref={receiptRef} tabIndex={-1} role="status" aria-labelledby="request-receipt-title">
        <h2 id="request-receipt-title">{r.successTitle}</h2>
        <dl>
          <div><dt>{r.successId}</dt><dd className="request-id">{receipt.id}</dd></div>
          <div><dt>{r.successType}</dt><dd>{text.typeName}</dd></div>
          <div><dt>{r.successDate}</dt><dd>{receivedAt}</dd></div>
        </dl>
        <p>{receipt.emailSent ? r.successEmail : r.successPending}</p>
        <p>{r.successKeep}</p>
        <p>{r.successNotFinal}</p>
        <button type="button" className="request-again" onClick={() => { setStatus('idle'); setReceipt(null) }}>{r.newRequest}</button>
      </div>}
      <form className="request-form" hidden={status === 'success'} onSubmit={submit} onFocus={() => { void turnstile.prepare() }} aria-describedby="request-required-note request-intro">
        <p className="request-intro" id="request-intro">{r.intro}</p>
        <p className="request-required" id="request-required-note">{r.requiredNote}</p>
        <div className="quote-honey" aria-hidden="true"><label>Website<input name="_honey" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="request-grid">
          <label><span>{r.name} <span aria-hidden="true">*</span></span><input name="name" required maxLength={120} autoComplete="name" /></label>
          <label><span>{r.email} <span aria-hidden="true">*</span></span><input type="email" name="email" required maxLength={150} autoComplete="email" /></label>
        </div>
        <label><span>{text.service} <span aria-hidden="true">*</span></span><input name="service" required maxLength={200} /></label>
        <label><span>{r.reference}</span><input name="reference" maxLength={80} /></label>
        <label><span>{r.details}</span><textarea name="details" rows={4} maxLength={2000} /></label>
        <div className="turnstile-slot" ref={turnstile.container} />
        <p className="request-privacy"><RichText text={r.privacyNotice} newTabLabel={t.ui.newTab} internalInNewTab /></p>
        <div className="request-submit">
          <button type="submit" className="button button-primary button-large" disabled={status === 'sending'}>{status === 'sending' ? r.sending : text.submit}</button>
          <div className={`request-feedback ${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
            {status === 'error' && <RichText text={r.error} newTabLabel={t.ui.newTab} />}
          </div>
        </div>
      </form>
    </div>
  </main>
}
