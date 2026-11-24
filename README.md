# Dofra Software — Sitio web

Sitio institucional trilingüe (español, inglés y francés) creado con React 18, TypeScript y Vite.

## Requisitos
- Node.js 20 o superior (Node 24 funciona)
- npm

## Ejecutar en VS Code
1. Descomprimí el ZIP y abrí la carpeta `dofra-software` en VS Code.
2. Abrí la terminal integrada (`Ctrl + ñ` en algunos teclados, o Terminal > New Terminal).
3. Ejecutá:

```bash
npm install
npm run dev
```

4. Abrí la dirección que muestre Vite (normalmente http://localhost:5173).

## Antes de publicar (IMPORTANTE)

1. **Formulario de contacto:** se procesa con Google Apps Script (`apps-script/Code.gs`, ver `docs/FORMULARIO.md`). FormSubmit queda solo como alternativa en el código si `CONTACT_ENDPOINT` estuviera vacío; hoy no se usa.
2. **Botón de arrepentimiento y botón de baja:** usan su propio Apps Script con la hoja privada de solicitudes. Su URL `/exec` está en `src/legal/index.ts` (la variable `VITE_REQUESTS_ENDPOINT` la reemplaza si se define). Ver `docs/LEGAL.md`.
3. **Preguntas frecuentes pendientes:** en `src/App.tsx` hay respuestas con `pending: true` (plazos, dominio y alojamiento, actualizaciones, presupuesto). No se muestran hasta que se completen y se quite esa marca.
4. **Demos conceptuales:** se retiraron del listado hasta que haya versiones explorables con diseño propio.
5. **Proyectos:** odonto360, Spa Gestor y AppFotos, con capturas reales en `public/proyectos/` (versión grande y de 800 px). odonto360 y Spa Gestor usan datos sintéticos o ficticios; la foto de AppFotos es de Unsplash (uso aprobado). Los enlaces "Ver proyecto" apuntan a las demos y landings públicas. Relevo usa una captura real de su demo pública (relevo.dofrasoftware.com/demo, datos ficticios), en WebP de 480 a 2400 px.
6. **Sobre Dofra:** presentación de Franca y Victoria cargada; faltan las fotos (opcional).
7. **Panel del inicio:** es una demostración con datos ficticios y está identificado como tal.

## Compilar

```bash
npm run build
npm run preview
```

La salida queda en `dist/`.

## Subir al repositorio vacío

```bash
git clone https://github.com/victoriarecchia/dofra.git
```

Copiá el **contenido** de esta carpeta dentro de la carpeta clonada `dofra` (no copies `node_modules` ni `dist`). Luego, dentro de `dofra`:

```bash
git add .
git commit -m "feat: launch Dofra Software website"
git push origin main
```

Si tu rama por defecto no es `main`, usá el nombre correcto. Si GitHub solicita autenticación, iniciá sesión mediante VS Code o Git Credential Manager.

## Publicar gratis en Cloudflare Pages

- Conectá el repositorio GitHub.
- Framework: `Vite`.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Variable de entorno opcional: `VITE_REQUESTS_ENDPOINT` (URL `/exec` del Apps Script de solicitudes; si no se define, se usa la de `src/legal/index.ts`). Es pública por diseño, no es un secreto.

## Personalización

- Idiomas y textos: `src/App.tsx` (`content.es` / `content.en`) y `src/content.fr.ts`.
- Textos legales, formularios de arrepentimiento y baja y enlaces legales del footer: `src/legal/` (ver `docs/LEGAL.md`).
- Rutas y metadatos de cada página: `src/routes.ts`.
- Colores, tipografía y responsive: `src/styles.css`.
- Favicon: `public/favicon.svg`.
- Metadatos y SEO básico: `index.html`.

## Notas

- El dashboard del hero y la maqueta de Equilibrium son **representaciones ilustrativas**, no datos reales.
- Los números que aparecen en el dashboard son decorativos, no métricas de Dofra.
- Las tipografías se alojan en el propio sitio (`public/fonts/`); no se usa Google Fonts.
- El sitio guarda en `localStorage` la clave `dofra-lang` (idioma elegido), solo cuando la persona elige un idioma.
- Según la auditoría del 24/11/2026, no usa cookies propias ni de terceros, analítica web (Google Analytics, Cloudflare Web Analytics), Google Tag Manager, Meta Pixel ni otras herramientas de seguimiento publicitario. Si se agrega alguna, hay que actualizar `src/legal/` (política de cookies y de privacidad) antes de publicar.
- Cloudflare Turnstile (anti-bots) está activo con la clave del sitio de `src/turnstile.ts`. Se carga solo al usar un formulario y puede usar cookies técnicas de Cloudflare (con pre-clearance desactivado no emite `cf_clearance`); las políticas lo informan automáticamente. Ver `docs/LEGAL.md`.
# dofra
