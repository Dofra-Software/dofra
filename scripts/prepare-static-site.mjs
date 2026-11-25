// Prepara dist/ para publicarse en un alojamiento estático sin reglas de reescritura (GitHub Pages).
// Motivo: en España los operadores bloquean IP compartidas de Cloudflare durante los partidos de LaLiga,
// y el sitio dejaba de abrir. Ver docs/HOSTING.md.
//
// - La raíz sirve la aplicación.
// - Las páginas legales (privacidad.html, cookies.html, etc.) y sitemap.xml los genera `vite build`
//   (ver vite.config.ts y docs/LEGAL.md).
// - Cualquier otra ruta cae en 404.html, que también es la aplicación y muestra la pantalla pública.
// - CNAME fija el dominio personalizado; .nojekyll evita que GitHub ignore archivos.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const DOMAIN = process.env.SITE_DOMAIN || 'www.dofrasoftware.com';
const ROUTES = []; // Las rutas legales ya salen de vite build como <ruta>.html.

const index = path.join(DIST, 'index.html');
if (!fs.existsSync(index)) {
  console.error('Falta dist/index.html: ejecutá `npm run build` antes.');
  process.exit(1);
}
const html = fs.readFileSync(index, 'utf8');
// Se admiten los datos estructurados (application/ld+json): no ejecutan código.
if (/<script(?![^>]*\b(?:src=|type="application\/ld\+json"))[^>]*>/.test(html)) {
  console.error('index.html tiene scripts en línea: revisar antes de publicar.');
  process.exit(1);
}

for (const route of ROUTES) {
  fs.mkdirSync(path.join(DIST, route), { recursive: true });
  fs.writeFileSync(path.join(DIST, route, 'index.html'), html);
}
fs.writeFileSync(path.join(DIST, '404.html'), html);
fs.writeFileSync(path.join(DIST, 'CNAME'), `${DOMAIN}\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
// Las cabeceras de Cloudflare no aplican en GitHub Pages; se quita el archivo para no inducir a error.
fs.rmSync(path.join(DIST, '_headers'), { force: true });
fs.rmSync(path.join(DIST, '_redirects'), { force: true });

console.log(`Sitio estático listo en dist/ para ${DOMAIN} (rutas: /, 404).`);
