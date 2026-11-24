# Dofra Software — Alojamiento del sitio

## Por qué se cambia

El 21/11/2026 `dofrasoftware.com` y `www.dofrasoftware.com` dejaron de abrir desde redes españolas. Resolvían a las
IP compartidas de Cloudflare `188.114.96.5` / `188.114.97.5`, que Movistar, Orange, Vodafone, DIGI y MásMóvil
bloquean durante los partidos de LaLiga (registrado en hayahora.futbol y comprobado desde Movistar: sin conexión
TCP, mientras el mismo sitio responde 200 con certificado válido por otras IP de Cloudflare).
No es un problema del código ni de los certificados. El mismo cambio ya se aplicó a `relevo.dofrasoftware.com`.

## Arquitectura

```
Dofra-Software/dofra (privado o no, sin cambios)  ──build:site──►  dist/  ──publish──►  Dofra-Software/dofra-sitio (público)  ──►  GitHub Pages
                                                                                                                       www.dofrasoftware.com
```

- `npm run build:site`: compila y agrega `404.html`, `CNAME` (`www.dofrasoftware.com`) y `.nojekyll`; quita `_redirects`
  (sólo sirve en Cloudflare). El sitio es de una sola página: no necesita más rutas.
- `node scripts/publish-static-site.mjs --confirm`: sube sólo `dist/` a `dofra-sitio`, con controles contra fugas de claves.
- GitHub Pages redirige automáticamente `dofrasoftware.com` → `www.dofrasoftware.com` (la URL canónica del sitio).
- Cloudflare Pages (`dofra`) sigue desplegando igual que hoy: sirve para vistas previas y para volver atrás.

## Estado: aplicado el 21/11/2026

1. Repositorio público `Dofra-Software/dofra-sitio` creado y publicado desde `dofra@762ad92`; Pages activo (rama `main`, raíz).
2. DNS en Cloudflare (dofrasoftware.com → DNS), ambos en **solo DNS (nube gris)**:
   - `www`: `CNAME → dofra-software.github.io`.
   - Raíz `dofrasoftware.com`: `CNAME → dofra-software.github.io`. Cloudflare lo «aplana» y responde con las IP de GitHub
     (185.199.108–111.153), así que no hizo falta reemplazarlo por registros A/AAAA.
   - Sin cambios: MX, SPF, DKIM y `relevo`.
3. Certificado de GitHub (Let's Encrypt) emitido a los ~12 minutos, cubre `dofrasoftware.com` y `www.dofrasoftware.com`.
   «Enforce HTTPS» activado. `http://` y la raíz redirigen a `https://www.dofrasoftware.com/`.

### Publicar cambios del sitio

Hasta automatizarlo: `npm run build:site` y luego `node scripts/publish-static-site.mjs --confirm`.
Cloudflare Pages sigue desplegando `main` en `dofra.pages.dev` (útil para revisar antes de publicar).

## Volver atrás

Editar `www` y la raíz a `CNAME → dofra.pages.dev` con proxy (nube naranja). Cloudflare Pages sigue con el sitio publicado.

## Dependencias externas que siguen en Cloudflare (pendiente)

Verificado el 21/11 desde Movistar, en horario de bloqueo:

| Servicio | IP | Estado |
|---|---|---|
| `formsubmit.co` (formulario de contacto) | 188.114.96.5 / 97.5 | **Bloqueado**: el formulario falla aunque el sitio cargue |
| `odonto.dofrasoftware.workers.dev`, `appfotos.dofrasoftware.workers.dev` (portfolio) | 188.114.96.5 / 97.5 | **Bloqueados** |
| `spa-gestor.pages.dev`, `rio-cine.pages.dev` (portfolio) | 172.66.x | Responden hoy, pero son IP compartidas de Cloudflare |

Mientras tanto, el enlace de correo (`mailto:`) del sitio sigue funcionando como alternativa al formulario.

## Historial de publicaciones

| Fecha | Código (dofra) | Publicación (dofra-sitio) | Anterior, para volver atrás |
|---|---|---|---|
| 24/11/2026 | `main@bcc2831`: documentación legal, botones de arrepentimiento y baja, Turnstile; más los commits de diseño `2fd519d` y `46ceaf3` | `af1dba0` (JavaScript `index-D6NHS9FA.js`) | `efc4b0f` (JavaScript `index-Ct45mhD_.js`) |

Para volver atrás, ver «Volver atrás ante un error» en `docs/LEGAL.md`.
