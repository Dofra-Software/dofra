// Pruebas locales del receptor de solicitudes (Code.gs) con servicios de Google simulados.
// No envía correos ni toca ninguna hoja real. Uso: node apps-script/solicitudes/prueba-local.mjs
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8')

function crearEntorno({ fallaCorreoA = null } = {}) {
  const filas = [['encabezados']]
  const props = new Map([['SHEET_ID', 'hoja-de-prueba']])
  const cache = new Map()
  const enviados = []
  const rango = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => filas[r - 1 + i]?.[c - 1 + j] ?? '')),
    getValue: () => filas[r - 1]?.[c - 1] ?? '',
    setValue: v => { filas[r - 1][c - 1] = v },
  })
  const hoja = { appendRow: v => filas.push([...v]), getLastRow: () => filas.length, getRange: rango }
  const ctx = {
    console,
    module: { exports: {} },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => hoja }), flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: k => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_a, text) => [...crypto.createHash('sha256').update(text, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
      formatDate: (d, tz, fmt) => {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]))
        return fmt === 'yyyy' ? p.year : `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`
      },
    },
    MailApp: {
      getRemainingDailyQuota: () => 100,
      sendEmail: m => {
        if (fallaCorreoA && m.to === fallaCorreoA.destino && fallaCorreoA.activo) throw new Error('Fallo simulado de correo')
        enviados.push(m)
      },
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ contenido: s, setMimeType() { return this } }) },
  }
  vm.createContext(ctx)
  vm.runInContext(source, ctx)
  const api = ctx.module.exports
  const post = params => JSON.parse(api.doPost({ parameter: params }).contenido)
  return { api, post, filas, enviados, props }
}

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
  prueba('aviso interno con asunto diferenciado', e.enviados.some(m => m.to === 'info@dofrasoftware.com' && m.subject === `Nueva solicitud de arrepentimiento — DOF-ARR-${anio}-0001`))
  prueba('constancia al solicitante con asunto indicado', e.enviados.some(m => m.to === 'prueba@example.com' && m.subject === 'Dofra Software | Confirmación de solicitud' && m.body.includes(`DOF-ARR-${anio}-0001`) && m.body.includes('Built by Dofra.')))
  const r2 = e.post(base({ kind: 'baja', service: 'Mantenimiento mensual' }))
  prueba('baja con su propia numeración', r2.id === `DOF-BAJ-${anio}-0001`)
  prueba('aviso interno de baja diferenciado', e.enviados.some(m => m.subject === `Nueva solicitud de baja de servicio — DOF-BAJ-${anio}-0001`))
  const r3 = e.post(base({ service: 'Otro proyecto' }))
  prueba('segundo arrepentimiento: 0002', r3.id === `DOF-ARR-${anio}-0002`)
  prueba('estado inicial «Recibida»', e.filas[1][e.api.COL.estado - 1] === 'Recibida')
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
  prueba('el aviso interno muestra el texto sin el apóstrofo', e.enviados.some(m => m.to === 'info@dofrasoftware.com' && m.body.includes('Nombre: =HYPERLINK')) && r.success)
}

console.log('Fallos de correo y reintentos')
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
  for (let i = 0; i < 6; i++) e2.api.reintentarPendientes()
  prueba('tras 6 intentos queda «Fallida»', e2.filas[1][e2.api.COL.confirmacion - 1] === 'Fallida')
  prueba('y se alerta a info@ para comunicarla dentro de las 24 horas', e2.enviados.some(m => m.to === 'info@dofrasoftware.com' && m.subject.startsWith('ATENCIÓN')))
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
