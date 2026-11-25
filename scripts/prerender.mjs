// Prerenderiza el HTML de cada ruta dentro de dist/ (inicio y páginas legales). Ver docs/SEO.md.
//
// Por qué: el sitio es una aplicación React; sin esto, el HTML que recibe un buscador es un
// <div id="root"></div> vacío. Con el contenido ya escrito en el HTML, Google lo indexa sin depender
// de ejecutar JavaScript, y Bing, LinkedIn o WhatsApp también lo leen.
//
// Uso (lo ejecuta `npm run build`): node scripts/prerender.mjs
// Requiere dist/ (vite build) y dist-ssr/entry-server.js (vite build --ssr src/entry-server.tsx).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'

const DIST = path.resolve('dist')
const ENTRY = path.resolve('dist-ssr', 'entry-server.js')
const ROUTES = { '/': 'index.html', '/terminos-y-condiciones': 'terminos-y-condiciones.html', '/privacidad': 'privacidad.html',
  '/cookies': 'cookies.html', '/arrepentimiento': 'arrepentimiento.html', '/baja-de-servicio': 'baja-de-servicio.html' }

// Modo hijo: renderiza una ruta y escribe el HTML por stdout.
if (process.argv[2] === '--route') {
  const pathname = process.argv[3]
  const noop = () => {}
  const media = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop })
  globalThis.window = { location: { pathname, hash: '', search: '' }, matchMedia: media, innerHeight: 800, scrollY: 0,
    addEventListener: noop, removeEventListener: noop, setTimeout, clearTimeout }
  const { render } = await import(pathToFileURL(ENTRY).href)
  process.stdout.write(render())
  process.exit(0)
}

if (!fs.existsSync(ENTRY)) { console.error('Falta dist-ssr/entry-server.js.'); process.exit(1) }
for (const [route, file] of Object.entries(ROUTES)) {
  const target = path.join(DIST, file)
  if (!fs.existsSync(target)) { console.error(`Falta ${file} en dist/.`); process.exit(1) }
  const markup = execFileSync(process.execPath, [process.argv[1], '--route', route], { encoding: 'utf8', maxBuffer: 20e6 })
  if (markup.length < 500) { console.error(`El HTML de ${route} salió vacío.`); process.exit(1) }
  const html = fs.readFileSync(target, 'utf8')
  if (!html.includes('<div id="root"></div>')) { console.error(`${file} no tiene <div id="root"></div>.`); process.exit(1) }
  fs.writeFileSync(target, html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`))
  console.log(`prerender ${route} → ${file} (${Math.round(markup.length / 1024)} KB)`)
}
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true })
