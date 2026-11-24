import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { PATHS, SITE_URL, STATIC_META } from './src/routes'

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Genera un HTML por ruta (p. ej. dist/privacidad.html) a partir de dist/index.html, con su título,
 * descripción y URL canónica, más dist/sitemap.xml. GitHub Pages y Cloudflare Pages sirven
 * /privacidad desde privacidad.html, así que el acceso directo y la recarga responden 200.
 */
function routePages(): Plugin {
  return {
    name: 'dofra-route-pages',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve('dist')
      const indexFile = path.join(dist, 'index.html')
      if (!fs.existsSync(indexFile)) return
      const html = fs.readFileSync(indexFile, 'utf8')
      for (const [id, meta] of Object.entries(STATIC_META)) {
        const url = `${SITE_URL}${PATHS[id as keyof typeof STATIC_META]}`
        const page = html
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(meta.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeAttr(meta.description)}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escapeAttr(meta.title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escapeAttr(meta.description)}`)
        fs.writeFileSync(path.join(dist, `${PATHS[id as keyof typeof STATIC_META].slice(1)}.html`), page)
      }
      const urls = Object.values(PATHS).map(p => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')
      fs.writeFileSync(path.join(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
    },
  }
}

export default defineConfig({ plugins: [react(), routePages()] })
