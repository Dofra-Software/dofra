// Pruebas locales del receptor del formulario de contacto (Code.gs) con servicios de Google simulados.
// No envía correos. Las respuestas de Turnstile replican las reales de Cloudflare (siteverify con sus
// claves de prueba). Uso: node apps-script/prueba-local.mjs
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8')

// Respuestas reales de https://challenges.cloudflare.com/turnstile/v0/siteverify (24/11/2026).
const SITEVERIFY = {
  ok: { success: true, 'error-codes': [], action: 'contacto', hostname: 'www.dofrasoftware.com' },
  otraAccion: { success: true, 'error-codes': [], action: 'baja', hostname: 'www.dofrasoftware.com' },
  invalido: { success: false, 'error-codes': ['invalid-input-response'] },
  reutilizado: { success: false, 'error-codes': ['timeout-or-duplicate'] },
  ausente: { success: false, 'error-codes': ['missing-input-response'] },
  interno: { success: false, 'error-codes': ['internal-error'] },
}

function crearEntorno({ secreto = null, cuota = { valor: 100 } } = {}) {
  const props = new Map()
  if (secreto) props.set('TURNSTILE_SECRET', secreto)
  const cache = new Map()
  const enviados = []
  const verificaciones = []
  const ctx = {
    console: { error() {}, log: console.log },
    module: { exports: {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_a, text) => [...crypto.createHash('sha256').update(text, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
      formatDate: (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, ''),
    },
    MailApp: { getRemainingDailyQuota: () => cuota.valor, sendEmail: m => { cuota.valor -= 1; enviados.push(m) } },
    UrlFetchApp: {
      fetch: (_url, op) => {
        verificaciones.push(op.payload)
        // Un token sirve una sola vez, como en Cloudflare.
        const usados = ctx.__usados ??= new Set()
        let r = SITEVERIFY[op.payload.response] ?? SITEVERIFY.invalido
        if (r.success && usados.has(op.payload.response)) r = SITEVERIFY.reutilizado
        if (r.success) usados.add(op.payload.response)
        return { getResponseCode: () => 200, getContentText: () => JSON.stringify(r) }
      },
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ contenido: s, setMimeType() { return this } }) },
  }
  vm.createContext(ctx)
  vm.runInContext(source, ctx)
  const post = params => JSON.parse(ctx.module.exports.doPost({ parameter: params }).contenido)
  return { post, enviados, verificaciones, cuota, props }
}

let ok = 0, fallas = 0
function prueba(nombre, condicion) {
  if (condicion) { ok++; console.log('  ✓ ' + nombre) } else { fallas++; console.log('  ✗ ' + nombre) }
}
const base = (extra = {}) => ({ name: 'Persona Ficticia', email: 'prueba@example.com', message: 'Mensaje de prueba', consent: 'Sí', idioma: 'Español', project_type: 'Página web', ...extra })
const internos = e => e.enviados.filter(m => m.to === 'dofrasoftware@gmail.com')
const confirmaciones = e => e.enviados.filter(m => m.to !== 'dofrasoftware@gmail.com')

console.log('Aviso interno (sin cambios)')
{
  const e = crearEntorno()
  const r = e.post(base())
  prueba('consulta aceptada', r.success === true)
  prueba('aviso a dofrasoftware@gmail.com con «Responder a» quien escribió', internos(e).length === 1 && internos(e)[0].replyTo === 'prueba@example.com')
}

console.log('Confirmación automática')
{
  const e = crearEntorno()
  e.post(base())
  const c = confirmaciones(e)[0]
  prueba('se envía a quien escribió', confirmaciones(e).length === 1 && c.to === 'prueba@example.com')
  prueba('«Responder a» info@dofrasoftware.com y remitente «Dofra Software»', c.replyTo === 'info@dofrasoftware.com' && c.name === 'Dofra Software')
  prueba('asunto y firma en español', c.subject === 'Dofra Software | Recibimos tu consulta' && c.body.includes('Dofra Software — Built by Dofra.'))
  prueba('HTML con el logo original, colores de Dofra y lang="es"', c.htmlBody.includes('https://www.dofrasoftware.com/dofra-logo.png') && c.htmlBody.includes('#0B1930') && c.htmlBody.includes('#C4938E') && c.htmlBody.includes('lang="es"'))
  prueba('no repite nada de lo que escribió la persona (no sirve para spam)', !c.body.includes('Persona') && !c.htmlBody.includes('Persona') && !c.body.includes('Mensaje de prueba'))

  const en = crearEntorno(); en.post(base({ idioma: 'Inglés' }))
  prueba('inglés', confirmaciones(en)[0].subject === 'Dofra Software | We have received your inquiry' && confirmaciones(en)[0].htmlBody.includes('lang="en"'))
  const fr = crearEntorno(); fr.post(base({ idioma: 'Francés' }))
  prueba('francés', confirmaciones(fr)[0].subject === 'Dofra Software | Nous avons bien reçu votre demande' && confirmaciones(fr)[0].htmlBody.includes('lang="fr"'))

  const html = crearEntorno(); html.post(base({ name: '<script>alert(1)</script>' }))
  prueba('el aviso interno escapa el HTML del nombre', internos(html)[0].htmlBody.includes('&lt;script&gt;'))
}

console.log('Duplicados, cuota y abuso')
{
  const e = crearEntorno()
  e.post(base()); e.post(base({ message: 'Segundo mensaje' })); e.post(base({ email: 'PRUEBA@example.com' }))
  prueba('una sola confirmación por dirección cada 6 horas (sin distinguir mayúsculas)', confirmaciones(e).length === 1)
  prueba('los avisos internos siguen llegando todos', internos(e).length === 3)

  const cuota = { valor: 21 }
  const c = crearEntorno({ cuota })
  const r = c.post(base())
  prueba('con poca cuota: la consulta llega, la confirmación no se envía', r.success && internos(c).length === 1 && confirmaciones(c).length === 0 && cuota.valor === 20)

  const d = crearEntorno()
  for (let i = 0; i < 20; i++) d.post(base({ email: `persona${i}@example.com` }))
  d.props.set('CONFIRMACIONES', d.props.get('CONFIRMACIONES').replace(/\|\d+$/, '|30'))
  const mas = crearEntorno()
  prueba('tope diario de confirmaciones', (() => { const hoy = d.props.get('CONFIRMACIONES').split('|')[0]; mas.props.set('CONFIRMACIONES', hoy + '|30'); mas.post(base()); return confirmaciones(mas).length === 0 && internos(mas).length === 1 })())
  prueba('límite de 20 consultas por hora (sin cambios)', d.post(base({ email: 'otra@example.com' })).message === 'rate_limited')
}

console.log('Turnstile con la protección activada')
{
  const e = crearEntorno({ secreto: 'secreto-de-prueba' })
  prueba('token ausente: rechazado sin consultar a Cloudflare', e.post(base()).message === 'verification' && e.verificaciones.length === 0)
  prueba('token inválido: rechazado', e.post(base({ turnstileToken: 'invalido' })).message === 'verification')
  prueba('token válido: aceptado', e.post(base({ turnstileToken: 'ok' })).success === true)
  prueba('el mismo token reutilizado: rechazado (timeout-or-duplicate)', e.post(base({ turnstileToken: 'ok', email: 'otra@example.com' })).message === 'verification')
  prueba('token de otro formulario (acción «baja»): rechazado', e.post(base({ turnstileToken: 'otraAccion' })).message === 'verification')
  prueba('token demasiado largo: rechazado', e.post(base({ turnstileToken: 'x'.repeat(3000) })).message === 'verification')
  prueba('ningún correo por los envíos rechazados', e.enviados.length === 2)
  prueba('se envía la clave secreta a Cloudflare, nunca al navegador', e.verificaciones.every(v => v.secret === 'secreto-de-prueba'))
  const caido = crearEntorno({ secreto: 'secreto-de-prueba' })
  prueba('si Cloudflare falla (internal-error) se acepta igual', caido.post(base({ turnstileToken: 'interno' })).success === true)
  const sin = crearEntorno()
  prueba('sin TURNSTILE_SECRET funciona como antes', sin.post(base()).success === true)
}

console.log(`\n${ok} correctas, ${fallas} con errores`)
process.exit(fallas ? 1 : 0)
