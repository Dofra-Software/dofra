/**
 * Botón de arrepentimiento y botón de baja de servicios de dofrasoftware.com — receptor en Google Apps Script.
 *
 * Proyecto SEPARADO del formulario de contacto (apps-script/Code.gs), vinculado a una hoja de cálculo
 * privada de Google Sheets en la cuenta de Dofra. Ver docs/LEGAL.md para la puesta en marcha.
 *
 * - Valida y sanea los datos del lado del servidor (incluida la inyección de fórmulas en Sheets).
 * - Genera el identificador (DOF-ARR-AAAA-0001 / DOF-BAJ-AAAA-0001) con un bloqueo, sin duplicados.
 * - Evita solicitudes duplicadas (misma clave de envío o mismos datos en los últimos 10 minutos).
 * - Registra la solicitud ANTES de responder: si no quedó registrada, nunca devuelve éxito.
 * - Envía la constancia al solicitante y el aviso a info@dofrasoftware.com. Si el correo falla, la
 *   solicitud queda registrada con el envío «Pendiente» y un activador la reintenta cada 10 minutos;
 *   si sigue fallando, avisa a info@ para que la constancia se comunique a mano dentro de las 24 horas.
 * - No cancela servicios, no borra datos, no interrumpe alojamientos ni emite devoluciones.
 * - Nunca devuelve al navegador datos de la hoja ni de otros solicitantes.
 */

const DESTINO_INTERNO = 'info@dofrasoftware.com';
const ZONA = 'America/Argentina/Cordoba';
const HOJA = 'Solicitudes';
const MAX_POR_HORA = 40;           // Todas las solicitudes juntas.
const MAX_POR_CORREO_HORA = 5;     // Por dirección de correo.
const VENTANA_DUPLICADO_S = 600;   // Mismos datos en 10 minutos = misma solicitud.
const MAX_INTENTOS = 6;            // Reintentos de correo (cada 10 min ≈ 1 hora) antes de alertar.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIPOS = {
  arrepentimiento: { codigo: 'ARR', nombre: 'Arrepentimiento', asunto: 'Nueva solicitud de arrepentimiento' },
  baja: { codigo: 'BAJ', nombre: 'Baja de servicio', asunto: 'Nueva solicitud de baja de servicio' },
};
const ESTADOS = ['Recibida', 'En gestión', 'Resuelta'];

// Columnas de la hoja (1 = A). Las de la derecha son técnicas: no editarlas a mano.
const COL = {
  id: 1, tipo: 2, fecha: 3, nombre: 4, correo: 5, servicio: 6, referencia: 7, info: 8,
  estado: 9, confirmacion: 10, resolucion: 11, observaciones: 12,
  idioma: 13, clave: 14, intentos: 15, error: 16, aviso: 17, recibidaIso: 18, huella: 19,
};
const ENCABEZADOS = [
  'Identificador', 'Tipo de solicitud', 'Fecha y hora de recepción', 'Nombre', 'Correo electrónico',
  'Servicio contratado', 'Referencia contractual', 'Información adicional', 'Estado de gestión',
  'Confirmación al solicitante', 'Fecha de resolución', 'Observaciones internas',
  'Idioma', 'Clave de envío', 'Intentos de envío', 'Último error de envío', 'Aviso interno',
  'Recepción (ms)', 'Huella',
];

// ---------------------------------------------------------------------------------------------
// Web app
// ---------------------------------------------------------------------------------------------

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p._honey) return respuesta_({ success: false, message: 'invalid' });

    const datos = validar_(p);
    if (!datos) return respuesta_({ success: false, message: 'invalid' });

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return respuesta_({ success: false, message: 'busy' });
    let fila;
    try {
      const hoja = hoja_();
      // 1) Reintento del mismo envío: se devuelve la solicitud ya registrada.
      const existente = buscarFila_(hoja, COL.clave, datos.clave) || buscarPorHuella_(hoja, datos.huella);
      if (existente) return respuesta_(recibo_(hoja, existente));

      // 2) Protección contra envíos abusivos.
      if (!dentroDelLimite_('total', MAX_POR_HORA) || !dentroDelLimite_('correo_' + datos.correo, MAX_POR_CORREO_HORA)) {
        return respuesta_({ success: false, message: 'rate_limited' });
      }

      // 3) Registro.
      const ahora = new Date();
      const id = siguienteId_(hoja, TIPOS[datos.tipo].codigo, ahora);
      const valores = [];
      valores[COL.id - 1] = id;
      valores[COL.tipo - 1] = TIPOS[datos.tipo].nombre;
      valores[COL.fecha - 1] = celda_(Utilities.formatDate(ahora, ZONA, 'dd/MM/yyyy HH:mm:ss'));
      valores[COL.nombre - 1] = celda_(datos.nombre);
      valores[COL.correo - 1] = celda_(datos.correo);
      valores[COL.servicio - 1] = celda_(datos.servicio);
      valores[COL.referencia - 1] = celda_(datos.referencia);
      valores[COL.info - 1] = celda_(datos.info);
      valores[COL.estado - 1] = 'Recibida';
      valores[COL.confirmacion - 1] = 'Pendiente';
      valores[COL.resolucion - 1] = '';
      valores[COL.observaciones - 1] = '';
      valores[COL.idioma - 1] = datos.idioma;
      valores[COL.clave - 1] = celda_(datos.clave);
      valores[COL.intentos - 1] = 0;
      valores[COL.error - 1] = '';
      valores[COL.aviso - 1] = 'Pendiente';
      valores[COL.recibidaIso - 1] = ahora.getTime();
      valores[COL.huella - 1] = celda_(datos.huella);
      hoja.appendRow(valores);
      SpreadsheetApp.flush();
      fila = hoja.getLastRow();
      if (hoja.getRange(fila, COL.id).getValue() !== id) throw new Error('No se pudo verificar el registro de ' + id);
    } finally {
      lock.releaseLock();
    }

    // 4) Correos (fuera del bloqueo). Un fallo no deshace el registro: queda para reintento.
    const hoja = hoja_();
    enviarPendientes_(hoja, fila);
    return respuesta_(recibo_(hoja, fila));
  } catch (err) {
    console.error(err); // Visible en «Ejecuciones»; nunca se devuelve al navegador.
    return respuesta_({ success: false, message: 'error' });
  }
}

/** Comprobación de que la implementación responde. No devuelve ningún dato de la hoja. */
function doGet() {
  return respuesta_({ ok: true });
}

// ---------------------------------------------------------------------------------------------
// Puesta en marcha y tareas programadas (ejecutar desde el editor)
// ---------------------------------------------------------------------------------------------

/** Ejecutar UNA vez desde el editor de la hoja: prepara la hoja, guarda su id y crea el activador. */
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  if (!libro) throw new Error('Abrí el script desde la hoja (Extensiones → Apps Script).');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', libro.getId());
  const hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]).setFontWeight('bold');
  hoja.setFrozenRows(1);
  const reglaEstado = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  hoja.getRange(2, COL.estado, hoja.getMaxRows() - 1, 1).setDataValidation(reglaEstado);
  const proteccion = hoja.getRange(1, 1, 1, ENCABEZADOS.length).protect().setDescription('Encabezados del registro');
  proteccion.setWarningOnly(true);
  instalarActivador();
}

/** Crea (o recrea) el activador que reintenta los correos pendientes cada 10 minutos. */
function instalarActivador() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'reintentarPendientes'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('reintentarPendientes').timeBased().everyMinutes(10).create();
}

/** Activador: reintenta constancias y avisos pendientes; alerta a info@ si siguen fallando. */
function reintentarPendientes() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    const hoja = hoja_();
    const ultima = hoja.getLastRow();
    if (ultima < 2) return;
    const filas = hoja.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues();
    filas.forEach(function (v, i) {
      if (v[COL.confirmacion - 1] === 'Pendiente' || v[COL.aviso - 1] === 'Pendiente') enviarPendientes_(hoja, i + 2);
    });
  } finally {
    lock.releaseLock();
  }
}

/** Prueba de envío de la constancia a una dirección autorizada (sin registrar nada en la hoja). */
function probarCorreos() {
  const destino = Session.getEffectiveUser().getEmail();
  const prueba = { id: 'DOF-ARR-0000-0000 (PRUEBA)', tipo: 'Arrepentimiento', fecha: 'fecha de prueba', idioma: 'es' };
  MailApp.sendEmail({ to: destino, replyTo: DESTINO_INTERNO, name: 'Dofra Software', subject: asuntoConstancia_('es') + ' (PRUEBA)', body: cuerpoConstancia_(prueba) });
}

// ---------------------------------------------------------------------------------------------
// Internos
// ---------------------------------------------------------------------------------------------

function validar_(p) {
  const tipo = String(p.kind || '');
  if (!TIPOS[tipo]) return null;
  const nombre = limpiar_(p.name, 120);
  const correo = limpiar_(p.email, 150).toLowerCase();
  const servicio = limpiar_(p.service, 200);
  const referencia = limpiar_(p.reference, 80);
  const info = limpiar_(p.details, 2000);
  const idioma = ['es', 'en', 'fr'].indexOf(p.lang) >= 0 ? p.lang : 'es';
  const clave = String(p.requestKey || '');
  if (!nombre || !servicio || !EMAIL_RE.test(correo) || !/^[A-Za-z0-9-]{8,64}$/.test(clave)) return null;
  const huella = hash_([tipo, correo, servicio.toLowerCase(), referencia.toLowerCase()].join('|'));
  return { tipo: tipo, nombre: nombre, correo: correo, servicio: servicio, referencia: referencia, info: info, idioma: idioma, clave: clave, huella: huella };
}

/** Recorta, normaliza saltos de línea y quita caracteres de control. */
function limpiar_(valor, max) {
  return String(valor == null ? '' : valor)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

/**
 * Guarda el valor como texto literal: el apóstrofo inicial impide que Sheets lo interprete como fórmula
 * (=, +, -, @), número o fecha. Sheets no lo muestra ni lo devuelve al leer la celda.
 */
function celda_(valor) {
  const texto = String(valor == null ? '' : valor);
  return texto ? "'" + texto : '';
}

function hash_(texto) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
}

function hoja_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Falta configurar: ejecutá configurar() desde el editor.');
  const hoja = SpreadsheetApp.openById(id).getSheetByName(HOJA);
  if (!hoja) throw new Error('No existe la hoja «' + HOJA + '».');
  return hoja;
}

function buscarFila_(hoja, columna, valor) {
  const ultima = hoja.getLastRow();
  if (ultima < 2 || !valor) return 0;
  const valores = hoja.getRange(2, columna, ultima - 1, 1).getValues();
  for (let i = valores.length - 1; i >= 0; i--) if (texto_(valores[i][0]) === valor) return i + 2;
  return 0;
}

/** Misma solicitud (tipo, correo, servicio y referencia) dentro de la ventana de duplicados. */
function buscarPorHuella_(hoja, huella) {
  const fila = buscarFila_(hoja, COL.huella, huella);
  if (!fila) return 0;
  const recibida = Number(hoja.getRange(fila, COL.recibidaIso).getValue());
  return Date.now() - recibida < VENTANA_DUPLICADO_S * 1000 ? fila : 0;
}

function dentroDelLimite_(clave, maximo) {
  const cache = CacheService.getScriptCache();
  const nombre = 'lim_' + hash_(clave).slice(0, 32);
  const usados = Number(cache.get(nombre) || 0);
  if (usados >= maximo) return false;
  cache.put(nombre, String(usados + 1), 3600);
  return true;
}

/** Siguiente identificador del tipo y año, guardado en las propiedades del script (llamar con el bloqueo tomado). */
function siguienteId_(hoja, codigo, fecha) {
  const anio = Utilities.formatDate(fecha, ZONA, 'yyyy');
  const props = PropertiesService.getScriptProperties();
  const nombre = 'SEQ_' + codigo + '_' + anio;
  let n = Number(props.getProperty(nombre) || 0);
  let id;
  do {
    n += 1;
    id = 'DOF-' + codigo + '-' + anio + '-' + String(n).padStart(4, '0');
  } while (buscarFila_(hoja, COL.id, id)); // Defensa extra ante una propiedad borrada a mano.
  props.setProperty(nombre, String(n));
  return id;
}

function recibo_(hoja, fila) {
  const v = hoja.getRange(fila, 1, 1, ENCABEZADOS.length).getValues()[0];
  const tipo = v[COL.tipo - 1] === TIPOS.baja.nombre ? 'baja' : 'arrepentimiento';
  return {
    success: true,
    id: v[COL.id - 1],
    type: tipo,
    receivedAt: new Date(Number(v[COL.recibidaIso - 1])).toISOString(),
    emailSent: v[COL.confirmacion - 1] === 'Enviada',
  };
}

/** Envía la constancia y/o el aviso interno pendientes de una fila y actualiza su estado. */
function enviarPendientes_(hoja, fila) {
  const v = hoja.getRange(fila, 1, 1, ENCABEZADOS.length).getValues()[0];
  const datos = {
    id: v[COL.id - 1], tipo: v[COL.tipo - 1], fecha: texto_(v[COL.fecha - 1]), idioma: v[COL.idioma - 1] || 'es',
    nombre: v[COL.nombre - 1], correo: v[COL.correo - 1], servicio: v[COL.servicio - 1],
    referencia: v[COL.referencia - 1], info: v[COL.info - 1],
  };
  const errores = [];

  if (v[COL.aviso - 1] === 'Pendiente') {
    try {
      const asunto = (datos.tipo === TIPOS.baja.nombre ? TIPOS.baja.asunto : TIPOS.arrepentimiento.asunto) + ' — ' + datos.id;
      MailApp.sendEmail({ to: DESTINO_INTERNO, replyTo: texto_(datos.correo), name: 'Solicitudes dofrasoftware.com', subject: asunto, body: cuerpoInterno_(datos) });
      hoja.getRange(fila, COL.aviso).setValue('Enviado');
    } catch (err) {
      errores.push('Aviso interno: ' + err);
    }
  }

  if (v[COL.confirmacion - 1] === 'Pendiente') {
    const intentos = Number(v[COL.intentos - 1] || 0) + 1;
    hoja.getRange(fila, COL.intentos).setValue(intentos);
    try {
      if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Cuota diaria de correo agotada');
      MailApp.sendEmail({ to: texto_(datos.correo), replyTo: DESTINO_INTERNO, name: 'Dofra Software', subject: asuntoConstancia_(datos.idioma), body: cuerpoConstancia_(datos) });
      hoja.getRange(fila, COL.confirmacion).setValue('Enviada');
    } catch (err) {
      errores.push('Constancia (intento ' + intentos + '): ' + err);
      if (intentos >= MAX_INTENTOS) {
        hoja.getRange(fila, COL.confirmacion).setValue('Fallida');
        alertar_(datos);
      }
    }
  }

  hoja.getRange(fila, COL.error).setValue(errores.length ? celda_(errores.join(' | ').slice(0, 500)) : '');
}

function alertar_(datos) {
  try {
    MailApp.sendEmail({
      to: DESTINO_INTERNO,
      name: 'Solicitudes dofrasoftware.com',
      subject: 'ATENCIÓN: no se pudo enviar la constancia de ' + datos.id,
      body: 'No se pudo enviar automáticamente la constancia de la solicitud ' + datos.id + ' (' + datos.tipo + '), recibida el ' + datos.fecha + '.\n\n' +
        'Comunicá el número de solicitud a ' + texto_(datos.correo) + ' por otro medio, dentro de las 24 horas desde la recepción.\n' +
        'Después, en la hoja, cambiá «Confirmación al solicitante» a «Enviada» y anotá cómo se comunicó en «Observaciones internas».',
    });
  } catch (err) {
    console.error('No se pudo enviar la alerta de ' + datos.id + ': ' + err);
  }
}

/** Quita el apóstrofo que se agrega para evitar fórmulas, al usar el valor fuera de la hoja. */
function texto_(valor) {
  return String(valor || '').replace(/^'/, '');
}

function asuntoConstancia_(idioma) {
  return { es: 'Dofra Software | Confirmación de solicitud', en: 'Dofra Software | Request confirmation', fr: 'Dofra Software | Confirmation de demande' }[idioma] ||
    'Dofra Software | Confirmación de solicitud';
}

function cuerpoConstancia_(d) {
  const tipos = {
    en: { Arrepentimiento: 'Withdrawal', 'Baja de servicio': 'Service cancellation' },
    fr: { Arrepentimiento: 'Rétractation', 'Baja de servicio': 'Résiliation de service' },
  };
  const tipo = (tipos[d.idioma] && tipos[d.idioma][d.tipo]) || d.tipo;
  const fecha = d.fecha + ' (Argentina)';
  if (d.idioma === 'en') {
    return 'Hello,\n\nWe have received your request.\n\nIn this email you will find its identification number, the type of request and the date it was received.\n\n' +
      'Request number: ' + d.id + '\nType of request: ' + tipo + '\nDate received: ' + fecha + '\n\n' +
      'Keep this information as proof of submission.\n\nWe will handle your request in accordance with the contractual terms and the rights provided by applicable law.\n\n' +
      'If you have any questions, you can contact us at info@dofrasoftware.com.\n\nDofra Software\nBuilt by Dofra.';
  }
  if (d.idioma === 'fr') {
    return 'Bonjour,\n\nNous avons bien reçu votre demande.\n\nVous trouverez dans cet e-mail son numéro d’identification, le type de demande et la date de réception.\n\n' +
      'Numéro de demande : ' + d.id + '\nType de demande : ' + tipo + '\nDate de réception : ' + fecha + '\n\n' +
      'Conservez ces informations comme preuve du dépôt de votre demande.\n\nNous traiterons votre demande conformément aux conditions contractuelles et aux droits prévus par la législation applicable.\n\n' +
      'Pour toute question, vous pouvez nous écrire à info@dofrasoftware.com.\n\nDofra Software\nBuilt by Dofra.';
  }
  return 'Hola:\n\nHemos recibido tu solicitud.\n\nEn este correo encontrarás su número de identificación, el tipo de solicitud y la fecha de recepción.\n\n' +
    'Número de solicitud: ' + d.id + '\nTipo de solicitud: ' + tipo + '\nFecha de recepción: ' + fecha + '\n\n' +
    'Conservá esta información como constancia de presentación.\n\nGestionaremos tu solicitud conforme a las condiciones contractuales y los derechos previstos por la legislación aplicable.\n\n' +
    'Para consultas, podés comunicarte con info@dofrasoftware.com.\n\nDofra Software\nBuilt by Dofra.';
}

function cuerpoInterno_(d) {
  return [
    ['Identificador', d.id], ['Tipo', d.tipo], ['Recibida', d.fecha + ' (Argentina)'], ['Nombre', texto_(d.nombre)],
    ['Correo', texto_(d.correo)], ['Servicio', texto_(d.servicio)], ['Referencia', texto_(d.referencia) || 'Sin indicar'],
    ['Información adicional', texto_(d.info) || 'Sin indicar'], ['Idioma', d.idioma],
  ].map(function (f) { return f[0] + ': ' + f[1]; }).join('\n') +
    '\n\nEstado inicial: Recibida. Actualizalo en la hoja «Solicitudes» (Recibida → En gestión → Resuelta).' +
    '\nEste formulario no cancela servicios ni emite devoluciones: la gestión la hacen las responsables de Dofra.';
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Solo para las pruebas locales con Node (apps-script/solicitudes/prueba-local.mjs). Apps Script lo ignora.
if (typeof module !== 'undefined') module.exports = { doPost: doPost, doGet: doGet, reintentarPendientes: reintentarPendientes, celda_: celda_, COL: COL };
