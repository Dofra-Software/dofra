/**
 * Formulario de contacto de dofrasoftware.com — receptor en Google Apps Script.
 *
 * Reemplaza a FormSubmit, que está detrás de IP compartidas de Cloudflare bloqueadas en España
 * en horario de partidos. Google no figura en esos bloqueos. Ver docs/FORMULARIO.md.
 *
 * Recibe el formulario (application/x-www-form-urlencoded), valida los campos y envía un correo a
 * DESTINO con «Responder a» la persona que escribió. Responde JSON { success: true|false }.
 * No guarda los mensajes en ningún lado: sólo los reenvía por correo.
 */
const DESTINO = 'info@dofrasoftware.com';
const MAX_ENVIOS_POR_HORA = 20; // Protección simple contra abuso (cuota de Gmail: ~100 correos/día).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    // Campo trampa para bots: se responde como si nada para no darles pistas, pero no se envía.
    if (p._honey) return respuesta_({ success: true });

    const nombre = limpiar_(p.name, 100);
    const correo = limpiar_(p.email, 150);
    const mensaje = limpiar_(p.message, 3000);
    if (!nombre || !mensaje || !EMAIL_RE.test(correo) || p.consent !== 'Sí') {
      return respuesta_({ success: false, message: 'invalid' });
    }

    const cache = CacheService.getScriptCache();
    const enviados = Number(cache.get('enviados') || 0);
    if (enviados >= MAX_ENVIOS_POR_HORA) return respuesta_({ success: false, message: 'rate_limited' });
    cache.put('enviados', String(enviados + 1), 3600);

    const filas = [
      ['Nombre', nombre],
      ['Correo', correo],
      ['Tipo de proyecto', limpiar_(p.project_type, 60) || 'Sin indicar'],
      ['Presupuesto', limpiar_(p.budget, 60) || 'Sin indicar'],
      ['Idioma', limpiar_(p.idioma, 20) || 'Sin indicar'],
      ['Mensaje', mensaje],
    ];
    MailApp.sendEmail({
      to: DESTINO,
      replyTo: correo,
      name: 'Formulario dofrasoftware.com',
      subject: limpiar_(p._subject, 150) || 'Nueva consulta desde dofrasoftware.com',
      body: filas.map(function (f) { return f[0] + ': ' + f[1]; }).join('\n'),
      htmlBody: '<table style="font-family:Arial,sans-serif;font-size:14px">' + filas.map(function (f) {
        return '<tr><th align="left" valign="top" style="padding:4px 16px 4px 0;color:#0B1930">' + escapar_(f[0]) +
          '</th><td style="padding:4px 0;white-space:pre-wrap">' + escapar_(f[1]) + '</td></tr>';
      }).join('') + '</table>',
    });
    return respuesta_({ success: true });
  } catch (err) {
    console.error(err); // Visible en «Ejecuciones» del proyecto; nunca se devuelve al navegador.
    return respuesta_({ success: false, message: 'error' });
  }
}

/** Comprobación rápida de que la implementación responde (abrir la URL en el navegador). */
function doGet() {
  return respuesta_({ ok: true });
}

/** Ejecutar una vez desde el editor para autorizar el envío de correos y probarlo. */
function probarEnvio() {
  MailApp.sendEmail(DESTINO, 'Prueba del formulario de dofrasoftware.com', 'Si recibís este correo, el receptor funciona.');
}

function limpiar_(valor, max) {
  return String(valor == null ? '' : valor).replace(/\r\n?/g, '\n').trim().slice(0, max);
}

function escapar_(texto) {
  return String(texto).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
