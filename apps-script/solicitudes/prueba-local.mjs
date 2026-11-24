// Pruebas locales del receptor de solicitudes (Code.gs) con servicios de Google simulados.
// No envía correos ni toca ninguna hoja real. Uso: node apps-script/solicitudes/prueba-local.mjs
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8')

function crearHoja(filas) {
  const rango = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => filas[r - 1 + i]?.[c - 1 + j] ?? '')),
    getValue: () => filas[r - 1]?.[c - 1] ?? '',
    setValue: v => { filas[r - 1][c - 1] = v },
    setValues: v => { v.forEach((f, i) => { filas[r - 1 + i] = [...f] }); return { setFontWeight() {} } },
  })
  return { filas, appendRow: v => filas.push([...v]), getLastRow: () => filas.length, getRange: rango, setFrozenRows() {} }
}

function crearEntorno({ fallaCorreoA = null, cuota = { valor: 100 }, turnstile = null, secreto = null } = {}) {
  const solicitudes = crearHoja([['encabezados']])
  const hojas = { Solicitudes: solicitudes }
  const props = new Map([['SHEET_ID', 'hoja-de-prueba']])
  if (secreto) props.set('TURNSTILE_SECRET', secreto)
  const cache = new Map()
  const enviados = []
  const eventos = []
  const bloqueo = { tomado: false }
  const enviadosSinBloqueo = []
  const libro = {
    getSheetByName: n => hojas[n] ?? null,
    insertSheet: n => (hojas[n] = crearHoja([])),
  }
  const ctx = {
    console: { error() {}, log: console.log },
    module: { exports: {} },
    SpreadsheetApp: { openById: () => libro, flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { bloqueo.tomado = true; return true }, releaseLock() { bloqueo.tomado = false } }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_a, text) => [...crypto.createHash('sha256').update(text, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
      formatDate: (d, tz, fmt) => {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]))
        return fmt === 'yyyy' ? p.year : `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`
      },
    },
    MailApp: {
      getRemainingDailyQuota: () => cuota.valor,
      sendEmail: m => {
        if (fallaCorreoA && m.to === fallaCorreoA.destino && fallaCorreoA.activo) throw new Error('Fallo simulado de correo')
        if (!bloqueo.tomado) enviadosSinBloqueo.push(m)
        cuota.valor -= 1
        enviados.push(m)
      },
    },
    CalendarApp: { getDefaultCalendar: () => ({ createEvent: (titulo, inicio, fin, op) => { const e = { titulo, op, recordatorios: [], addPopupReminder: m => e.recordatorios.push(m) }; eventos.push(e); return e } }) },
    UrlFetchApp: {
      fetch: (_url, op) => {
        if (!turnstile) throw new Error('UrlFetchApp no esperado')
        return turnstile(op.payload)
      },
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ contenido: s, setMimeType() { return this } }) },
  }
  vm.createContext(ctx)
  vm.runInContext(source, ctx)
  const api = ctx.module.exports
  const post = params => JSON.parse(api.doPost({ parameter: params }).contenido)
  return { api, post, filas: solicitudes.filas, hojas, enviados, eventos, enviadosSinBloqueo, cuota }
}

const respuestaTurnstile = (codigo, json) => ({ getResponseCode: () => codigo, getContentText: () => JSON.stringify(json) })

let ok = 0, fallas = 0
function prueba(nombre, condicion) {
  if (condicion) { ok++; console.log('  ✓ ' + nombre) } else { fallas++; console.log('  ✗ ' + nombre) }
}
let n = 0
const base = (extra = {}) => ({ kind: 'arrepentimiento', name: 'Persona Ficticia', email: 'prueba@example.com', service: 'Sitio web Esencial', reference: '', details: '', lang: 'es', requestKey: `clave-prueba-${++n}`, ...extra })
const anio = String(new Date().getFullYear())

console.log('Registro e identificadores')
{
  const e = crearEntorno()
  const r1 = e.post(base())
  prueba('arrepentimiento registrado con DOF-ARR-AAAA-0001', r1.success === true && r1.id === `DOF-ARR-${anio}-0001`)
  prueba('constancia enviada', r1.emailSent === true)
  prueba('la respuesta no incluye datos personales', !('name' in r1) && !JSON.stringify(r1).includes('Persona'))
  prueba('aviso interno con asunto diferenciado', e.enviados.some(m => m.to === 'dofrasoftware@gmail.com' && m.replyTo === 'prueba@example.com' && m.subject === `Nueva solicitud de arrepentimiento — DOF-ARR-${anio}-0001`))
  prueba('constancia al solicitante con asunto indicado', e.enviados.some(m => m.to === 'prueba@example.com' && m.replyTo === 'info@dofrasoftware.com' && m.subject === 'Dofra Software | Confirmación de solicitud' && m.body.includes(`DOF-ARR-${anio}-0001`) && m.body.includes('Built by Dofra.')))
  const r2 = e.post(base({ kind: 'baja', service: 'Mantenimiento mensual' }))
  prueba('baja con su propia numeración', r2.id === `DOF-BAJ-${anio}-0001`)
  prueba('aviso interno de baja diferenciado', e.enviados.some(m => m.subject === `Nueva solicitud de baja de servicio — DOF-BAJ-${anio}-0001`))
  const r3 = e.post(base({ service: 'Otro proyecto' }))
  prueba('segundo arrepentimiento: 0002', r3.id === `DOF-ARR-${anio}-0002`)
  prueba('estado inicial «Recibida»', e.filas[1][e.api.COL.estado - 1] === 'Recibida')
  prueba('los correos del envío inicial salen con el bloqueo tomado (sin carrera con el activador)', e.enviadosSinBloqueo.length === 0)
}

console.log('Duplicados')
{
  const e = crearEntorno()
  const datos = base()
  const r1 = e.post(datos)
  const correos = e.enviados.length
  const r2 = e.post(datos)
  prueba('reintento con la misma clave devuelve el mismo identificador', r2.id === r1.id)
  prueba('sin fila ni correos nuevos', e.filas.length === 2 && e.enviados.length === correos)
  const r3 = e.post({ ...datos, requestKey: 'otra-clave-distinta' })
  prueba('mismos datos en 10 minutos = misma solicitud', r3.id === r1.id && e.filas.length === 2)
  e.api.reintentarPendientes()
  prueba('el activador no reenvía lo ya enviado', e.enviados.length === correos)
}

console.log('Validación y saneamiento')
{
  const e = crearEntorno()
  prueba('correo inválido rechazado', e.post(base({ email: 'no-es-correo' })).message === 'invalid')
  prueba('servicio vacío rechazado', e.post(base({ service: '   ' })).message === 'invalid')
  prueba('tipo desconocido rechazado', e.post(base({ kind: 'reembolso' })).message === 'invalid')
  prueba('campo trampa rechazado', e.post(base({ _honey: 'bot' })).success === false)
  prueba('clave de envío inválida rechazada', e.post(base({ requestKey: '<x>' })).message === 'invalid')
  prueba('nada registrado con datos inválidos', e.filas.length === 1)
  const r = e.post(base({ name: '=HYPERLINK("http://x","y")', details: '+cmd', reference: '@ref' }))
  const fila = e.filas[e.filas.length - 1]
  prueba('fórmulas neutralizadas en la hoja', fila[e.api.COL.nombre - 1].startsWith("'=") && fila[e.api.COL.info - 1] === "'+cmd" && fila[e.api.COL.referencia - 1] === "'@ref")
  prueba('el aviso interno muestra el texto sin el apóstrofo', e.enviados.some(m => m.to === 'dofrasoftware@gmail.com' && m.body.includes('Nombre: =HYPERLINK')) && r.success)
}

console.log('Fallos de correo, reintentos y alertas')
{
  const falla = { destino: 'prueba@example.com', activo: true }
  const e = crearEntorno({ fallaCorreoA: falla })
  const r = e.post(base())
  const fila = () => e.filas[1]
  prueba('si falla la constancia, la solicitud igual queda registrada y se informa su número', r.success === true && r.id === `DOF-ARR-${anio}-0001` && r.emailSent === false)
  prueba('confirmación «Pendiente» con el error anotado', fila()[e.api.COL.confirmacion - 1] === 'Pendiente' && String(fila()[e.api.COL.error - 1]).includes('Fallo simulado'))
  falla.activo = false
  e.api.reintentarPendientes()
  prueba('el reintento envía la constancia y la marca «Enviada»', fila()[e.api.COL.confirmacion - 1] === 'Enviada' && fila()[e.api.COL.error - 1] === '')

  const falla2 = { destino: 'prueba@example.com', activo: true }
  const e2 = crearEntorno({ fallaCorreoA: falla2 })
  e2.post(base())
  for (let i = 0; i < 8; i++) e2.api.reintentarPendientes()
  const inc = e2.hojas.Incidencias?.filas ?? []
  prueba('tras 6 intentos queda «Fallida»', e2.filas[1][e2.api.COL.confirmacion - 1] === 'Fallida')
  prueba('queda constancia en la hoja «Incidencias» (una sola vez)', inc.filter(f => f[2] === 'Constancia fallida').length === 1)
  prueba('alerta por Google Calendar con aviso emergente', e2.eventos.length === 1 && e2.eventos[0].recordatorios.includes(0))
  prueba('y también por correo a la cuenta de Gmail de Dofra', e2.enviados.some(m => m.to === 'dofrasoftware@gmail.com' && m.subject.startsWith('ATENCIÓN')))
}

console.log('Cuota de correo')
{
  const cuota = { valor: 11 }
  const e = crearEntorno({ cuota })
  const r = e.post(base())
  const fila = () => e.filas[1]
  prueba('con poca cuota se registra igual y se envía el aviso interno', r.success && fila()[e.api.COL.aviso - 1] === 'Enviado')
  prueba('la constancia espera sin gastar la reserva', fila()[e.api.COL.confirmacion - 1] === 'Pendiente' && cuota.valor === e.api.RESERVA_CUOTA)
  prueba('la espera por cuota no cuenta como intento fallido', Number(fila()[e.api.COL.intentos - 1]) === 0)
  for (let i = 0; i < 10; i++) e.api.reintentarPendientes()
  prueba('no pasa a «Fallida» mientras solo falte cuota', fila()[e.api.COL.confirmacion - 1] === 'Pendiente')
  fila()[e.api.COL.recibidaIso - 1] = Date.now() - 3 * 3600 * 1000 // simula 3 horas de espera
  e.api.reintentarPendientes()
  e.api.reintentarPendientes()
  const inc = e.hojas.Incidencias?.filas ?? []
  prueba('tras 2 horas pendiente: incidencia y alerta por Calendar, una sola vez', inc.filter(f => f[2] === 'Constancia demorada').length === 1 && e.eventos.length === 1)
  cuota.valor = 100
  e.api.reintentarPendientes()
  prueba('al volver la cuota, la constancia se envía', fila()[e.api.COL.confirmacion - 1] === 'Enviada')
}

console.log('Cloudflare Turnstile')
{
  const sin = crearEntorno()
  prueba('sin TURNSTILE_SECRET funciona como antes (sin token)', sin.post(base()).success === true)

  let ultimo = null
  const e = crearEntorno({ secreto: 'secreto-prueba', turnstile: p => { ultimo = p; return p.response === 'token-bueno' ? respuestaTurnstile(200, { success: true, action: 'arrepentimiento' }) : respuestaTurnstile(200, { success: false, 'error-codes': ['invalid-input-response'] }) } })
  prueba('con TURNSTILE_SECRET, sin token se rechaza', e.post(base()).message === 'verification')
  prueba('token inválido se rechaza', e.post(base({ turnstileToken: 'token-malo' })).message === 'verification')
  prueba('nada se registra si la verificación falla', e.filas.length === 1)
  const ok1 = e.post(base({ turnstileToken: 'token-bueno' }))
  prueba('token válido: se registra', ok1.success === true && ultimo.secret === 'secreto-prueba')
  prueba('token de otra acción se rechaza', e.post(base({ kind: 'baja', turnstileToken: 'token-bueno' })).message === 'verification')

  const caido = crearEntorno({ secreto: 'secreto-prueba', turnstile: () => respuestaTurnstile(503, {}) })
  const r = caido.post(base({ turnstileToken: 'cualquiera' }))
  prueba('si Cloudflare no responde, se acepta igual (no se impide el derecho)', r.success === true)
  prueba('y queda anotado en «Incidencias»', (caido.hojas.Incidencias?.filas ?? []).some(f => f[2] === 'Turnstile no disponible'))
}

console.log('Límites')
{
  const e = crearEntorno()
  const respuestas = Array.from({ length: 6 }, (_, i) => e.post(base({ service: `Servicio ${i}` })))
  prueba('5 solicitudes por correo y hora; la 6.ª se rechaza', respuestas.slice(0, 5).every(r => r.success) && respuestas[5].message === 'rate_limited')
  prueba('GET no devuelve datos', JSON.parse(e.api.doGet().contenido).ok === true)
}

console.log(`\n${ok} correctas, ${fallas} con errores`)
process.exit(fallas ? 1 : 0)
