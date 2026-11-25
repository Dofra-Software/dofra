/**
 * Entrada de prerenderizado (solo compilación, ver scripts/prerender.mjs y docs/SEO.md).
 * Genera el HTML de cada ruta para que buscadores y vistas previas vean el contenido sin ejecutar JS.
 * App calcula la página al cargarse el módulo (window.location), así que cada ruta se renderiza en un
 * proceso de Node propio, con un `window` mínimo definido antes de importar este archivo.
 */
import { renderToString } from 'react-dom/server'
import App from './App'

export function render(): string {
  return renderToString(<App />)
}
