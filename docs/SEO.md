# SEO técnico del sitio

Estrategia general y decisiones de marketing: `../marketing/` (fuera del repo, en la carpeta Dofra).

## Prerenderizado (HTML con contenido)
- `npm run build` hace `vite build`, después `vite build --ssr src/entry-server.tsx --outDir dist-ssr` y por último `node scripts/prerender.mjs`.
- `prerender.mjs` renderiza cada ruta (inicio y páginas legales) en un proceso de Node propio, con un `window` mínimo, y escribe el resultado dentro de `<div id="root">` en `dist/<ruta>.html`. Al terminar borra `dist-ssr/`.
- `src/main.tsx`: en el inicio, con idioma español, usa `hydrateRoot` (React se engancha al HTML sin redibujar). Con otro idioma guardado o en las páginas legales (dependen del ancho de pantalla) usa `createRoot`, que reemplaza el HTML previo.
- **Regla para el código nuevo:** no leer `window`, `document` ni `localStorage` durante el render (solo dentro de `useEffect` o de eventos). Si no, el prerenderizado falla o la hidratación no coincide.
- El aviso «useLayoutEffect does nothing on the server» durante la compilación es esperable y no afecta el resultado.
- Si se agrega una ruta en `src/routes.ts`, sumarla también a `ROUTES` en `scripts/prerender.mjs`.

## Metadatos y datos estructurados (`index.html`)
- `title` y `description` incluyen Córdoba. Para el español, `LANGUAGES.es` en `src/App.tsx` debe coincidir, porque la aplicación los reescribe en el navegador.
- JSON-LD `WebSite` + `ProfessionalService` (nombre, logo, área de servicio, fundadoras y `sameAs` con Instagram, LinkedIn y GitHub). Al sumar perfiles, como el Perfil de Empresa de Google, agregarlos a `sameAs`. Validar con https://search.google.com/test/rich-results y https://validator.schema.org/.
- `prepare-static-site.mjs` rechaza scripts en línea, salvo `application/ld+json`.
- `og:image` = `public/og-image.png` (1200×628), generada desde `../google-perfil/_fuente/portada.html`.

## Favicons
- `favicon.ico` (48 px), `icon-192.png` y `apple-touch-icon.png` (180 px) se generan a partir de `../google-perfil/2-logotipo-720x720.png`, que es el logo original sin redibujar sobre #0B1930.
- No usar `dofra-logo.png` (la «d» blanca sobre transparente) como favicon: no se ve sobre fondo blanco, como en los resultados de Google. Tampoco `favicon.svg`, que es una versión redibujada del logo.
