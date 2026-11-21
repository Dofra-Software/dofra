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

## Pasos para el cambio (requieren autorización)

1. Crear el repositorio público `Dofra-Software/dofra-sitio` con README, publicar con los dos comandos de arriba y activar
   Pages (rama `main`, raíz). Antes del DNS, comprobar con
   `curl.exe -I --resolve www.dofrasoftware.com:80:185.199.108.153 http://www.dofrasoftware.com/`.
2. DNS en Cloudflare (dofrasoftware.com → DNS), todos en **solo DNS (nube gris)**:
   - `www`: `CNAME → dofra-software.github.io`.
   - Raíz `dofrasoftware.com`: reemplazar el `CNAME → dofra.pages.dev` por
     `A 185.199.108.153`, `A 185.199.109.153`, `A 185.199.110.153`, `A 185.199.111.153` y
     `AAAA 2606:50c0:8000::153`, `AAAA 2606:50c0:8001::153`, `AAAA 2606:50c0:8002::153`, `AAAA 2606:50c0:8003::153`.
   - **No tocar** los registros MX, TXT (SPF, DKIM) ni `relevo`.
3. Esperar el certificado de GitHub (unos 10 minutos para Relevo) y activar «Enforce HTTPS».
4. Verificar desde Movistar, otro operador y un iPhone, en horario de partido.

## Volver atrás

Restaurar `www → CNAME dofra.pages.dev` y la raíz `→ CNAME dofra.pages.dev`, ambos con proxy (nube naranja), y borrar
los A/AAAA de GitHub. Cloudflare Pages sigue con el sitio publicado.

## Dependencias externas que siguen en Cloudflare (pendiente)

Verificado el 21/11 desde Movistar, en horario de bloqueo:

| Servicio | IP | Estado |
|---|---|---|
| `formsubmit.co` (formulario de contacto) | 188.114.96.5 / 97.5 | **Bloqueado**: el formulario falla aunque el sitio cargue |
| `odonto.dofrasoftware.workers.dev`, `appfotos.dofrasoftware.workers.dev` (portfolio) | 188.114.96.5 / 97.5 | **Bloqueados** |
| `spa-gestor.pages.dev`, `rio-cine.pages.dev` (portfolio) | 172.66.x | Responden hoy, pero son IP compartidas de Cloudflare |

Mientras tanto, el enlace de correo (`mailto:`) del sitio sigue funcionando como alternativa al formulario.
