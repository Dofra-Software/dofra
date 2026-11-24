# Documentación legal del sitio y botones de arrepentimiento y baja

Alcance: solo el sitio institucional www.dofrasoftware.com. No incluye Relevo, odonto360, Spa Gestor ni las demos.

## Rutas

| Ruta | Página | Archivo generado |
|---|---|---|
| `/terminos-y-condiciones` | Términos y condiciones | `dist/terminos-y-condiciones.html` |
| `/privacidad` | Política de privacidad | `dist/privacidad.html` |
| `/cookies` | Política de cookies y almacenamiento local | `dist/cookies.html` |
| `/arrepentimiento` | Botón de arrepentimiento (formulario) | `dist/arrepentimiento.html` |
| `/baja-de-servicio` | Botón de baja de servicios (formulario) | `dist/baja-de-servicio.html` |

- Las rutas y sus metadatos en español (título, descripción, URL canónica) están en `src/routes.ts`.
- Al compilar (`npm run build`), el complemento de `vite.config.ts` copia `dist/index.html` en un HTML por ruta con su
  título, descripción y canónica, y genera `dist/sitemap.xml`. `public/robots.txt` apunta al sitemap.
- GitHub Pages y Cloudflare Pages sirven `/privacidad` desde `privacidad.html`: el acceso directo y la recarga
  responden 200. Con barra final (`/privacidad/`) GitHub responde 404, pero `404.html` es la misma aplicación y muestra
  la página correcta.
- Cada ruta es una carga completa de la aplicación (`src/App.tsx` elige la página con `pageFromPath`). No hay
  enrutador ni dependencias nuevas. En las páginas internas, el menú y el footer apuntan a `/#seccion`.
- El idioma no cambia la URL: hay una sola versión por página (sin duplicados para buscadores). El HTML estático
  lleva los metadatos en español y la aplicación los reemplaza según el idioma elegido.

## Dónde están los textos

| Archivo | Contenido |
|---|---|
| `src/legal/es.ts` | **Versión jurídica de referencia.** Términos, privacidad, cookies, textos de los formularios, etiquetas del footer y casilla de consentimiento del contacto. |
| `src/legal/en.ts`, `src/legal/fr.ts` | Traducciones fieles, con el mismo orden de secciones y bloques. |
| `src/legal/types.ts` | Estructura común: si una traducción queda incompleta, `npm run typecheck` falla. |
| `src/legal/index.ts` | Reúne los idiomas y define la URL del receptor de solicitudes (`VITE_REQUESTS_ENDPOINT` la reemplaza). |
| `src/components/LegalPage.tsx` | Página de documento: encabezado, fecha, índice con anclas (`#s-1`, `#s-2`…), secciones numeradas. |
| `src/components/RequestForm.tsx` | Formulario reutilizable para arrepentimiento y baja. |
| `src/components/legal.css` | Estilos de las páginas legales y de los formularios. |

Formato de los textos: cada sección es una lista de párrafos (`'texto'`) o listas (`{ list: [...] }`). Los enlaces se
escriben `[texto](/privacidad)`. Un bloque `{ when: 'registry', block: ... }` solo se muestra si el registro de
solicitudes está activo (ver abajo).

Para actualizar un texto legal: cambiar `es.ts`, trasladar el cambio a `en.ts` y `fr.ts`, y actualizar la fecha
`UPDATED` de los tres archivos.

## Formulario de contacto

- Casilla obligatoria, sin marcar, con enlace a `/privacidad` (se abre en otra pestaña para no perder lo escrito).
- Debajo, «El formulario se procesa mediante Google Apps Script.».
- El valor de la casilla sigue siendo `Sí`: el receptor ya publicado (`apps-script/Code.gs`) solo acepta envíos con
  `consent === 'Sí'`. **No cambiar ese valor** sin actualizar el script.
- No hay casilla de newsletter (todavía no existe ese servicio).

## Botones en el primer acceso (Disposición 954/2025)

- Arts. 1 y 4: enlaces denominados «BOTÓN DE ARREPENTIMIENTO» y «BOTÓN DE BAJA DE SERVICIO» (singular), «a simple vista,
  en lugar destacado y en el primer acceso», sin registración previa ni trámites adicionales.
- Se muestran en una franja fina arriba del encabezado, en todas las páginas, y también en el footer. La denominación
  va en español en los tres idiomas; en inglés y francés se agrega una explicación solo para lectores de pantalla.
- Art. 5: el código de la solicitud debe informarse dentro de las 24 horas y por el mismo medio. El sitio lo muestra en
  pantalla en el momento y lo envía por correo.

## Botón de arrepentimiento y botón de baja

Proyecto de Apps Script **separado** del formulario de contacto (`apps-script/solicitudes/Code.gs`), vinculado a una
hoja de Google Sheets privada. El formulario de contacto no cambia.

- Identificadores generados en el servidor con bloqueo: `DOF-ARR-AAAA-0001` y `DOF-BAJ-AAAA-0001`, numeración propia por
  tipo y año.
- Antes de responder, la solicitud queda escrita en la hoja. Si no se pudo registrar, el sitio **no** muestra
  confirmación: muestra el error con el correo de contacto.
- Duplicados: un reintento con la misma clave de envío, o los mismos datos dentro de los 10 minutos, devuelven la
  solicitud ya registrada.
- Límites: 40 solicitudes por hora en total y 5 por correo y hora.
- Saneamiento: recorte de longitud, sin caracteres de control y todo valor guardado como texto literal (protección
  contra la inyección de fórmulas).
- Correos: constancia al solicitante («Dofra Software | Confirmación de solicitud», en su idioma) y aviso a
  info@dofrasoftware.com («Nueva solicitud de arrepentimiento — …» / «Nueva solicitud de baja de servicio — …»).
- Los correos del envío inicial salen con el bloqueo del script tomado: el activador de reintentos no puede mandar la
  misma constancia al mismo tiempo (sin correos duplicados).
- Cuota de correo (Gmail gratuito: unos 100 destinatarios por día, compartidos con el formulario de contacto si ambos
  scripts usan la misma cuenta): la constancia solo se envía si quedan más de 10 envíos en el día. Si no, queda
  «Pendiente» sin contar como intento fallido y se reintenta cada 10 minutos. El aviso interno tiene prioridad.
- Si la constancia falla: la solicitud queda registrada, el sitio muestra el identificador y avisa que el correo se
  reenviará. Tras 6 errores de envío (≈ 1 hora) la marca «Fallida».
- Alertas (una por solicitud y motivo) cuando la constancia queda «Fallida» o sigue «Pendiente» después de 2 horas:
  1. fila en la hoja **«Incidencias»** (constancia persistente: fecha, identificador, motivo, detalle, alertas enviadas,
     resuelta);
  2. evento con aviso en **Google Calendar** de la cuenta de Dofra (no depende de la cuota de correo);
  3. correo a info@, solo si queda cuota.
  La constancia se debe comunicar por otro medio **dentro de las 24 horas** desde la recepción. Revisar «Incidencias» a
  diario y marcar «Resuelta: Sí» al terminar.
- El formulario no cancela servicios, no borra datos, no interrumpe alojamientos ni emite devoluciones.
- Pruebas locales sin servicios reales: `node apps-script/solicitudes/prueba-local.mjs`.

### Hoja «Solicitudes»

Columnas: Identificador · Tipo de solicitud · Fecha y hora de recepción · Nombre · Correo electrónico · Servicio
contratado · Referencia contractual · Información adicional · **Estado de gestión** (Recibida / En gestión / Resuelta) ·
Confirmación al solicitante (Pendiente / Enviada / Fallida) · Fecha de resolución · Observaciones internas.
A la derecha hay columnas técnicas (idioma, clave de envío, intentos, último error, aviso interno, recepción, huella):
no editarlas a mano.

### Cloudflare Turnstile (anti-bots, gratuito)

Activo desde el 24/11/2026: widget «dofrasoftware.com», modo Managed, pre-clearance desactivado. Si se vacía
`TURNSTILE_SITE_KEY`, queda desactivado: los formularios funcionan como antes y las políticas no lo mencionan.

- Navegador (`src/turnstile.ts`): el script de Cloudflare se carga recién cuando la persona hace foco en un formulario
  (visitar el sitio no conecta con Cloudflare). Modo «solo si hace falta interacción». Si no carga, el envío no sale y
  el formulario muestra el correo info@ como canal alternativo.
- Servidor (los dos Apps Script): si existe la propiedad `TURNSTILE_SECRET`, el token es obligatorio y se valida con
  Cloudflare (también la acción: `contacto`, `arrepentimiento` o `baja`). Si Cloudflare no responde, se acepta
  igual para no impedir el ejercicio del derecho (en solicitudes queda anotado en «Incidencias»).
- Con la clave del sitio cargada, las políticas muestran los bloques `when: 'turnstile'` (privacidad: proveedor y
  cookies técnicas; cookies técnicas de terceros, estrictamente necesarias). Con pre-clearance desactivado, la documentación de Cloudflare
  indica que no se emite `cf_clearance`; no detalla si el marco de Cloudflare usa otras cookies internas, por eso el texto
  dice «puede utilizar».
- Riesgo conocido: `challenges.cloudflare.com` está en IP de Cloudflare (104.18.94.41 / 104.18.95.41 el 24/11/2026). No
  son las IP bloqueadas en España en horario de LaLiga (188.114.96.x / 97.x), pero puede cambiar: en ese caso, el
  formulario ofrece el correo.

**Activación** (en este orden, para no romper el formulario de contacto de www mientras tanto):

1. Cloudflare (cuenta de Dofra) → **Turnstile → Add widget**. Nombre: «dofrasoftware.com». Hostnames:
   `dofrasoftware.com`, `www.dofrasoftware.com` y `dofra.pages.dev` (vistas previas). Modo: **Managed**.
   Copiar la **Site Key** (pública) y la **Secret Key** (secreta: no va en el código ni en el repositorio).
2. Actualizar los dos Apps Script con el código nuevo (pasos de abajo), todavía **sin** `TURNSTILE_SECRET`.
3. Poner la Site Key en `TURNSTILE_SITE_KEY` (`src/turnstile.ts`, como valor por defecto) y probar en la vista previa.
4. Script de **solicitudes**: **Configuración del proyecto → Propiedades del script → Agregar**: `TURNSTILE_SECRET` =
   Secret Key. Probar en la vista previa.
5. Publicar www (sección «Publicar»).
6. Recién entonces, script de **contacto**: agregar `TURNSTILE_SECRET`. Antes de publicar www, el sitio actual no
   envía el token y el contacto quedaría rechazado.

### Actualizar los Apps Script ya publicados (se conserva la URL /exec)

Solicitudes (hoja «Solicitudes dofrasoftware.com» → Extensiones → Apps Script):

1. Reemplazar `Código.gs` por `apps-script/solicitudes/Code.gs` y guardar.
2. Ejecutar `configurar`. Google pide permisos nuevos (Google Calendar y, si ya hay `TURNSTILE_SECRET`, conexión a
   servicios externos): revisarlos y aceptarlos. Crea la hoja «Incidencias» y recrea el activador. No borra filas.
3. **Implementar → Gestionar implementaciones** → lápiz (Editar) → Versión: **Nueva versión** → **Implementar**.
   La URL `/exec` no cambia.
4. Abrir la URL: debe mostrar `{"ok":true}`.

Contacto (proyecto «Formulario dofrasoftware.com»):

1. Reemplazar `Código.gs` por `apps-script/Code.gs` y guardar.
2. Ejecutar `probarEnvio` y aceptar el permiso nuevo de conexión a servicios externos (Turnstile).
3. **Implementar → Gestionar implementaciones** → Editar → **Nueva versión** → Implementar. La URL no cambia.

### Puesta en marcha (la tienen que hacer las responsables, con la cuenta de Google de Dofra)

1. En Google Drive de la cuenta de Dofra: **Nuevo → Hojas de cálculo de Google**. Nombre: «Solicitudes
   dofrasoftware.com». No compartirla con nadie más que las responsables.
2. En la hoja: **Extensiones → Apps Script**. Nombre del proyecto: «Solicitudes dofrasoftware.com».
3. Reemplazar el contenido de `Código.gs` por el de `apps-script/solicitudes/Code.gs` y guardar.
4. **Configuración del proyecto** (ícono de engranaje) → Zona horaria: `(GMT-03:00) Córdoba` o Buenos Aires.
5. Elegir la función `configurar` → **Ejecutar**. Google pide permisos para la hoja, el envío de correos y los
   activadores: revisarlos y aceptarlos (lo debe hacer una persona de Dofra). Crea la hoja «Solicitudes», sus
   encabezados, la lista de estados y el activador de reintentos.
6. Elegir `probarCorreos` → **Ejecutar**: llega una constancia de PRUEBA a la cuenta que ejecuta el script.
   No registra nada en la hoja.
7. **Implementar → Nueva implementación** → tipo **Aplicación web**: Ejecutar como **Yo**; Quién tiene acceso:
   **Cualquier persona**. Copiar la URL que termina en `/exec` (es pública por diseño, no es un secreto).
8. Abrir esa URL en el navegador: debe mostrar `{"ok":true}`.
9. Poner la URL en `REQUESTS_ENDPOINT` (`src/legal/index.ts`). Así la incluyen la compilación local que se publica
   en GitHub Pages y las vistas previas de Cloudflare. `VITE_REQUESTS_ENDPOINT` la reemplaza si se define
   (hecho el 24/11/2026 con la implementación «Solicitudes dofrasoftware.com»).
10. Probar con datos ficticios y un correo de prueba propio, en una vista previa (no en producción): una solicitud de
    cada tipo, verificar la fila en la hoja, la constancia, el aviso a info@ y el número en pantalla. Después borrar
    las filas de prueba y, si se quiere empezar en 0001, borrar `SEQ_ARR_AAAA` y `SEQ_BAJ_AAAA` en **Configuración del
    proyecto → Propiedades del script**.

Con la URL configurada, la política de privacidad agrega el párrafo sobre el registro en Google Sheets (bloque
`when: 'registry'`). Sin URL, ese párrafo no aparece y los formularios no pueden registrar solicitudes.

Para cambiar el script más adelante: **Implementar → Gestionar implementaciones → Editar → Nueva versión** (la URL no
cambia).

## Publicar (solo después de la aprobación)

```powershell
git switch main
git merge feat/documentacion-legal
npm run build:site
node scripts/publish-static-site.mjs --confirm
```

Después de publicar, comprobar: las cinco rutas abren con acceso directo y recarga, el footer muestra los enlaces y
los dos botones, y `https://www.dofrasoftware.com/sitemap.xml` y `/robots.txt` responden.
