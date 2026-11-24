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
| `src/legal/index.ts` | Reúne los idiomas y lee `VITE_REQUESTS_ENDPOINT`. |
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
- Si la constancia falla: la solicitud queda registrada, el sitio muestra el identificador y avisa que el correo se
  reenviará. Un activador reintenta cada 10 minutos. Tras 6 intentos (≈ 1 hora) la marca «Fallida» y manda una alerta a
  info@ para comunicar el número por otro medio **dentro de las 24 horas**.
- El formulario no cancela servicios, no borra datos, no interrumpe alojamientos ni emite devoluciones.
- Pruebas locales sin servicios reales: `node apps-script/solicitudes/prueba-local.mjs`.

### Hoja «Solicitudes»

Columnas: Identificador · Tipo de solicitud · Fecha y hora de recepción · Nombre · Correo electrónico · Servicio
contratado · Referencia contractual · Información adicional · **Estado de gestión** (Recibida / En gestión / Resuelta) ·
Confirmación al solicitante (Pendiente / Enviada / Fallida) · Fecha de resolución · Observaciones internas.
A la derecha hay columnas técnicas (idioma, clave de envío, intentos, último error, aviso interno, recepción, huella):
no editarlas a mano.

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
9. Compilar el sitio con la variable: en PowerShell, `$env:VITE_REQUESTS_ENDPOINT = '<URL /exec>'; npm run build:site`
   (o agregarla en Cloudflare Pages → Configuración → Variables de entorno para las vistas previas).
10. Probar con datos ficticios y un correo de prueba propio, en una vista previa (no en producción): una solicitud de
    cada tipo, verificar la fila en la hoja, la constancia, el aviso a info@ y el número en pantalla. Después borrar
    las filas de prueba y, si se quiere empezar en 0001, borrar `SEQ_ARR_AAAA` y `SEQ_BAJ_AAAA` en **Configuración del
    proyecto → Propiedades del script**.

Con la variable configurada, la política de privacidad agrega el párrafo sobre el registro en Google Sheets (bloque
`when: 'registry'`). Sin la variable, ese párrafo no aparece y los formularios no pueden registrar solicitudes:
**no publicar en producción sin completar estos pasos.**

Para cambiar el script más adelante: **Implementar → Gestionar implementaciones → Editar → Nueva versión** (la URL no
cambia).

## Publicar (solo después de la aprobación)

```powershell
git switch main
git merge feat/documentacion-legal
$env:VITE_REQUESTS_ENDPOINT = '<URL /exec del Apps Script de solicitudes>'
npm run build:site
node scripts/publish-static-site.mjs --confirm
```

Después de publicar, comprobar: las cinco rutas abren con acceso directo y recarga, el footer muestra los enlaces y
los dos botones, y `https://www.dofrasoftware.com/sitemap.xml` y `/robots.txt` responden.
