/**
 * Formulario de contacto de dofrasoftware.com — receptor en Google Apps Script.
 *
 * Reemplaza a FormSubmit, que está detrás de IP compartidas de Cloudflare bloqueadas en España
 * en horario de partidos. Google no figura en esos bloqueos. Ver docs/FORMULARIO.md.
 *
 * Recibe el formulario (application/x-www-form-urlencoded), valida los campos y envía un correo a
 * DESTINO con «Responder a» la persona que escribió. Responde JSON { success: true|false }.
 * No guarda los mensajes en ningún lado: sólo los reenvía por correo.
 *
 * Después del aviso interno, envía una confirmación automática a quien escribió (en su idioma, «Responder a»
 * info@). Es un texto fijo, sin nada de lo que escribió la persona, para que el formulario no sirva para mandar
 * spam a terceros. Como máximo una por dirección cada 6 horas y MAX_CONFIRMACIONES_DIA por día, y solo si quedan
 * más de RESERVA_CUOTA envíos de correo en el día. Si no se envía, la consulta igual llegó: no cambia la respuesta.
 */
// Notificación interna directa a la cuenta de Gmail de Dofra. info@dofrasoftware.com redirige a esta misma
// cuenta y Gmail puede descartar el reenvío de un correo que salió de ella. info@ sigue siendo el correo público.
const DESTINO = 'dofrasoftware@gmail.com';
const CORREO_PUBLICO = 'info@dofrasoftware.com';
const LOGO_URL = 'https://www.dofrasoftware.com/dofra-logo.png'; // logo original publicado en el sitio
const ZONA = 'America/Argentina/Cordoba';
const RESERVA_CUOTA = 20;              // envíos diarios que quedan libres para avisos internos y solicitudes
const MAX_CONFIRMACIONES_DIA = 30;
const VENTANA_CONFIRMACION_S = 21600;  // 6 horas: una sola confirmación por dirección
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
    // Casilla opcional que el sitio muestra solo con un plan web (Esencial, Pro o Advanced). La fila aparece solo si
    // se marcó: así el correo no cambia para el resto de las consultas ni para versiones anteriores del sitio.
    if (p.plus_updates === 'Sí') filas.splice(4, 0, ['Actualizaciones Plus', 'Le interesa (adicional opcional)']);
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
    // La consulta ya llegó: un problema con la confirmación no cambia la respuesta al sitio.
    try {
      enviarConfirmacion_(correo, idioma_(p.idioma));
    } catch (err) {
      console.error('Confirmación: ' + err);
    }
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

/**
 * Confirmación automática a quien escribió. Devuelve el motivo si no se envía (para las pruebas y «Ejecuciones»).
 */
function enviarConfirmacion_(correo, idioma) {
  const cache = CacheService.getScriptCache();
  const clave = 'conf_' + hash_(correo.toLowerCase()).slice(0, 40);
  if (cache.get(clave)) return 'duplicada';
  if (MailApp.getRemainingDailyQuota() <= RESERVA_CUOTA) return 'sin_cuota';

  const props = PropertiesService.getScriptProperties();
  const hoy = Utilities.formatDate(new Date(), ZONA, 'yyyyMMdd');
  const [dia, cantidad] = String(props.getProperty('CONFIRMACIONES') || '').split('|');
  const usadas = dia === hoy ? Number(cantidad || 0) : 0;
  if (usadas >= MAX_CONFIRMACIONES_DIA) return 'limite_diario';

  const t = TEXTOS_CONFIRMACION[idioma] || TEXTOS_CONFIRMACION.es;
  MailApp.sendEmail({
    to: correo,
    replyTo: CORREO_PUBLICO,
    name: 'Dofra Software',
    subject: t.asunto,
    body: [t.saludo, t.parrafos.join('\n\n'), t.aviso, 'Dofra Software — Built by Dofra.\nwww.dofrasoftware.com'].join('\n\n'),
    htmlBody: htmlConfirmacion_(t, idioma),
  });
  cache.put(clave, '1', VENTANA_CONFIRMACION_S);
  props.setProperty('CONFIRMACIONES', hoy + '|' + (usadas + 1));
  return 'enviada';
}

const TEXTOS_CONFIRMACION = {
  es: {
    asunto: 'Dofra Software | Recibimos tu consulta',
    saludo: 'Hola:',
    parrafos: [
      'Gracias por escribirnos. Recibimos tu consulta y te vamos a responder por correo electrónico a la brevedad.',
      'Si querés sumar información, respondé este correo o escribinos a info@dofrasoftware.com.',
    ],
    aviso: 'Este es un mensaje automático de confirmación. No implica la aceptación de un presupuesto ni la contratación de servicios.',
  },
  en: {
    asunto: 'Dofra Software | We have received your inquiry',
    saludo: 'Hello,',
    parrafos: [
      'Thank you for getting in touch. We have received your inquiry and will reply by email shortly.',
      'If you would like to add any information, reply to this email or write to us at info@dofrasoftware.com.',
    ],
    aviso: 'This is an automatic confirmation message. It does not imply the acceptance of a quote or the contracting of services.',
  },
  fr: {
    asunto: 'Dofra Software | Nous avons bien reçu votre demande',
    saludo: 'Bonjour,',
    parrafos: [
      'Merci de nous avoir écrit. Nous avons bien reçu votre demande et nous vous répondrons par e-mail dans les meilleurs délais.',
      'Pour ajouter des informations, répondez à cet e-mail ou écrivez-nous à info@dofrasoftware.com.',
    ],
    aviso: 'Ceci est un message de confirmation automatique. Il n’implique ni l’acceptation d’un devis ni la souscription de services.',
  },
};

/** Correo HTML sobrio: franja azul con el logo original, texto azul sobre blanco y filete terracota. */
function htmlConfirmacion_(t, idioma) {
  const p = function (texto, estilo) {
    return '<p style="margin:0 0 16px;' + (estilo || '') + '">' + escapar_(texto).replace('info@dofrasoftware.com',
      '<a href="mailto:info@dofrasoftware.com" style="color:#0B1930;text-decoration:underline">info@dofrasoftware.com</a>') + '</p>';
  };
  return '<!doctype html><html lang="' + idioma + '"><body style="margin:0;padding:0;background:#F4F5F7">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7;padding:24px 12px">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-collapse:collapse">' +
    '<tr><td style="background:#0B1930;padding:20px 28px">' +
    '<img src="' + LOGO_URL + '" width="40" height="40" alt="Dofra Software" style="display:block;border:0">' +
    '</td></tr>' +
    '<tr><td style="height:3px;background:#C4938E;font-size:0;line-height:0">&nbsp;</td></tr>' +
    '<tr><td style="padding:32px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B1930">' +
    p(t.saludo) + t.parrafos.map(function (x) { return p(x); }).join('') +
    p(t.aviso, 'font-size:13px;color:#5B6475') +
    '</td></tr>' +
    '<tr><td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#0B1930;border-top:1px solid #E5E5E5">' +
    '<p style="margin:16px 0 0"><strong>Dofra Software</strong> — Built by Dofra.<br>' +
    '<a href="https://www.dofrasoftware.com" style="color:#0B1930">www.dofrasoftware.com</a></p>' +
    '</td></tr></table></td></tr></table></body></html>';
}

/** El sitio envía el idioma como «Español», «Inglés» o «Francés» (campo «idioma» del formulario). */
function idioma_(valor) {
  const v = String(valor || '').toLowerCase();
  if (v.indexOf('ingl') === 0 || v === 'en' || v === 'english') return 'en';
  if (v.indexOf('franc') === 0 || v === 'fr' || v === 'français') return 'fr';
  return 'es';
}

function hash_(texto) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
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


// Solo para las pruebas locales con Node (apps-script/prueba-local.mjs). Apps Script lo ignora.
if (typeof module !== 'undefined') module.exports = { doPost: doPost, idioma_: idioma_ };
