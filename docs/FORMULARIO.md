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
  trampa `_honey`, limita a 20 envíos por hora y manda un correo a `info@dofrasoftware.com` con «Responder a» la
  persona que escribió. Responde `{ "success": true }` sólo si el correo se envió.
- El sitio (`src/App.tsx`) envía a la URL de `CONTACT_ENDPOINT`. Mantiene los 15 s de espera, el mensaje de error con el
  enlace de correo y no muestra éxito si el receptor no lo confirma.
- Mientras `CONTACT_ENDPOINT` esté vacío, se sigue usando FormSubmit: este cambio no altera nada hasta configurarlo.

## Puesta en marcha (requiere la cuenta de Google de Dofra)

1. Entrar a https://script.google.com con la cuenta de Google de Dofra → **Nuevo proyecto**. Nombre: «Formulario dofrasoftware.com».
2. Reemplazar el contenido de `Código.gs` por el de `apps-script/Code.gs` y guardar.
3. Elegir la función `probarEnvio` → **Ejecutar**. Google pide autorizar «Enviar correo electrónico en tu nombre»:
   aceptar (lo debe hacer una persona de Dofra). Debe llegar un correo de prueba a info@dofrasoftware.com.
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
sin URL configurada. 12/12 superadas. Falta repetir la prueba contra el Apps Script real una vez implementado (paso 7).

## Estado (21/11/2026)

- Proyecto «Formulario dofrasoftware.com» en la cuenta de Google de Dofra, autorizado y publicado como aplicación web
  (versión 1, ejecuta como dofrasoftware@gmail.com, acceso: cualquier usuario).
- `GET /exec` responde `{"ok":true}`. Un POST inválido responde `{"success":false,"message":"invalid"}` sin enviar correo.
  El 302 de Google incluye `Access-Control-Allow-Origin: *`, igual que el servidor de prueba.
- Envío real desde el sitio compilado: éxito en ~5,6 s y correo de prueba enviado a info@dofrasoftware.com.
