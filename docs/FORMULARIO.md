# Formulario de contacto — Google Apps Script

## Por qué

El formulario enviaba a `formsubmit.co`, que está detrás de IP compartidas de Cloudflare (`188.114.96.5` / `97.5`).
En España esas IP se bloquean en horario de partidos de LaLiga: el sitio carga (está en GitHub Pages), pero el envío
falla y, a los 15 s, se muestra el error con el enlace de correo. Google no figura en esos bloqueos.

Alternativas evaluadas el 21/11/2026: Formspree, Web3Forms, Basin, EmailJS y Formcarry también están en Cloudflare.
Getform y Formspark usan AWS, pero suman un proveedor nuevo con límites o costo. Apps Script es gratis, usa la cuenta
de Google de Dofra y no guarda los mensajes: sólo los reenvía por correo.

## Cómo funciona

- `apps-script/Code.gs` recibe el formulario, valida (nombre, correo, mensaje, consentimiento), descarta el campo
  trampa `_honey`, limita a 20 envíos por hora y manda un correo a `dofrasoftware@gmail.com` con «Responder a» la
  persona que escribió. Responde `{ "success": true }` sólo si el correo se envió.
- El sitio (`src/App.tsx`) envía a la URL de `CONTACT_ENDPOINT`. Mantiene los 15 s de espera, el mensaje de error con el
  enlace de correo y no muestra éxito si el receptor no lo confirma.
- Mientras `CONTACT_ENDPOINT` esté vacío, se sigue usando FormSubmit: este cambio no altera nada hasta configurarlo.
- Campo opcional `plus_updates` (26/11/2026): casilla de interés en Actualizaciones Plus, visible solo con un plan web.
  Si llega con valor `Sí`, el aviso interno suma la fila «Actualizaciones Plus: Le interesa (adicional opcional)»
  después de «Presupuesto». Sin la casilla, el correo queda igual que antes, así que el script y el sitio se pueden
  actualizar en cualquier orden sin perder datos (con el script anterior, la casilla simplemente no figura en el aviso).

## Confirmación automática a quien escribe

Después del aviso interno, el script envía una confirmación a la persona que completó el formulario:

- Asunto: «Dofra Software | Recibimos tu consulta» (o en inglés / francés, según el campo «idioma» del formulario).
- Remitente «Dofra Software», «Responder a» info@dofrasoftware.com. Firma «Dofra Software — Built by Dofra.».
- HTML sobrio: franja azul #0B1930 con el logo original (`https://www.dofrasoftware.com/dofra-logo.png`), filete
  terracota #C4938E y texto azul sobre blanco; incluye versión de texto plano.
- Contra el abuso: el texto es fijo y **no repite nada de lo que escribió la persona** (nombre, mensaje), así el
  formulario no sirve para mandar spam a terceros. Como máximo una confirmación por dirección cada 6 horas y 30 por
  día, y solo si quedan más de 20 envíos de Gmail en el día (la reserva es para los avisos internos y las solicitudes).
  Con Turnstile activo, además hace falta un token válido.
- Si la confirmación no sale (cuota, límite o error), la consulta igual llegó: el sitio muestra éxito igual.
- Pruebas locales sin servicios reales: `node apps-script/prueba-local.mjs` (incluye tokens de Turnstile ausentes,
  inválidos, reutilizados y de otro formulario, con las respuestas reales de Cloudflare).

### Actualizar el script publicado (se conserva la URL /exec)

1. Proyecto «Formulario dofrasoftware.com» → reemplazar todo `Código.gs` por `apps-script/Code.gs` y guardar.
2. **Implementar → Gestionar implementaciones** → lápiz (Editar) → Versión: **Nueva versión** → **Implementar**.
3. No pide permisos nuevos. Probar una consulta con un correo propio: tienen que llegar el aviso a
   dofrasoftware@gmail.com y la confirmación al correo propio, con «Responder a» info@.

## Puesta en marcha (requiere la cuenta de Google de Dofra)

1. Entrar a https://script.google.com con la cuenta de Google de Dofra → **Nuevo proyecto**. Nombre: «Formulario dofrasoftware.com».
2. Reemplazar el contenido de `Código.gs` por el de `apps-script/Code.gs` y guardar.
3. Elegir la función `probarEnvio` → **Ejecutar**. Google pide autorizar «Enviar correo electrónico en tu nombre»:
   aceptar (lo debe hacer una persona de Dofra). Debe llegar un correo de prueba a dofrasoftware@gmail.com.
4. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo** (la cuenta de Dofra).
   - Quién tiene acceso: **Cualquier persona**.
   Copiar la URL que termina en `/exec`.
5. Abrir esa URL en el navegador: debe mostrar `{"ok":true}`.
6. En `src/App.tsx`, poner la URL en `CONTACT_ENDPOINT`, compilar y publicar (hecho el 21/11/2026 con la versión 1):
   `npm run build:site` y `node scripts/publish-static-site.mjs --confirm`.
7. Enviar una consulta real desde https://www.dofrasoftware.com/#contacto y confirmar que llega el correo.

La URL `/exec` es pública por diseño (cualquier formulario web lo es); no es un secreto. Para cambiar el script más
adelante: **Implementar → Gestionar implementaciones → Editar → Nueva versión** (la URL no cambia).

## Pruebas hechas

Chromium contra un servidor local que imita a Apps Script (redirección 302 a otro origen con CORS, como Google):
envío correcto, rechazo del receptor, conexión bloqueada (error a los 15 s con enlace de correo) y caída a FormSubmit
sin URL configurada. 12/12 superadas. Después se probó contra el Apps Script real (ver «Estado»).

## Estado

- Proyecto «Formulario dofrasoftware.com» en la cuenta de Google de Dofra, autorizado y publicado como aplicación web
  (versión 1, ejecuta como dofrasoftware@gmail.com, acceso: cualquier usuario).
- `GET /exec` responde `{"ok":true}`. Un POST inválido responde `{"success":false,"message":"invalid"}` sin enviar correo.
  El 302 de Google incluye `Access-Control-Allow-Origin: *`, igual que el servidor de prueba.
- Envío real desde el sitio compilado: éxito en ~5,6 s y correo de prueba enviado a info@dofrasoftware.com.
- 24/11/2026: el aviso pasa a enviarse directo a dofrasoftware@gmail.com. info@dofrasoftware.com redirige a esa
  misma cuenta, que es la que envía, y Gmail puede descartar el reenvío como duplicado. info@ sigue siendo el correo
  público del sitio (enlace de correo, mensajes de error y políticas).
- 24/11/2026: confirmación automática a quien escribe y Cloudflare Turnstile (`TURNSTILE_SECRET` cargada después de
  publicar www).
- 25/11/2026: pruebas reales en producción correctas (aviso interno, confirmación y Reply-To). La confirmación llegó a
  Spam en las primeras pruebas; no es un error del código ni de cuota. Mejora pendiente de entregabilidad: ver
  «Mejoras futuras» en `docs/LEGAL.md`.
- 26/11/2026: versión 5 publicada en la misma implementación (la URL `/exec` no cambia): fila «Actualizaciones Plus»
  solo si se marcó la casilla. El repositorio incluye `verCuota()`, que se había agregado directamente en el editor;
  `apps-script/Code.gs` quedó idéntico a la versión 5. Prueba real desde la vista previa
  (`mejora-formulario-contacto.dofra.pages.dev`, Plan Pro + Plus): Turnstile aprobado, aviso recibido con todas las
  filas y confirmación enviada a info@ (figura en «Enviados»; por la redirección de info@ a la misma cuenta, Gmail no
  la muestra en Recibidos).
