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
// Notificación interna directa a la cuenta de Gmail de Dofra. info@dofrasoftware.com redirige a esta misma
// cuenta y Gmail puede descartar el reenvío de un correo que salió de ella. info@ sigue siendo el correo público.
const DESTINO = 'dofrasoftware@gmail.com';
const MAX_ENVIOS_POR_HORA = 20; // Protección simple contra abuso (cuota de Gmail: ~100 correos/día).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    // Campo trampa para bots: se responde como si nada para no darles pistas, pero no se envía.
    if (p._honey) return respuesta_({ success: true });
    // Cloudflare Turnstile (opcional, ver docs/LEGAL.md): solo se exige si existe la propiedad TURNSTILE_SECRET.
    if (verificarTurnstile_(p.turnstileToken) === 'invalido') return respuesta_({ success: false, message: 'verification' });

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

/**
 * Sin la propiedad TURNSTILE_SECRET está desactivado ('ok'). Si Cloudflare no responde ('no_disponible'),
 * el mensaje se acepta igual: el límite por hora sigue protegiendo el formulario.
 */
function verificarTurnstile_(token) {
  const secreto = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secreto) return 'ok';
  if (!token || String(token).length > 2048) return 'invalido';
  try {
    const r = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'post', payload: { secret: secreto, response: String(token) }, muteHttpExceptions: true });
    if (r.getResponseCode() >= 500) return 'no_disponible';
    const json = JSON.parse(r.getContentText());
    if (json.success === true) return !json.action || json.action === 'contacto' ? 'ok' : 'invalido';
    return (json['error-codes'] || []).indexOf('internal-error') >= 0 ? 'no_disponible' : 'invalido';
  } catch (err) {
    console.error('Turnstile: ' + err);
    return 'no_disponible';
  }
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
