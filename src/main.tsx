import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// El HTML llega prerenderizado en español (scripts/prerender.mjs). En el inicio, si el idioma es español,
// React se engancha a ese HTML sin volver a dibujarlo. En los demás casos (otro idioma guardado, páginas
// legales que dependen del ancho de pantalla) se dibuja de cero: createRoot reemplaza el HTML previo.
const root = document.getElementById('root')!
const app = <React.StrictMode><App /></React.StrictMode>
let lang = 'es'
try { lang = window.localStorage.getItem('dofra-lang') || 'es' } catch { /* sin almacenamiento disponible */ }
const isHome = (window.location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/') === '/'
if (root.hasChildNodes() && isHome && lang === 'es') ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
