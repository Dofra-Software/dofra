# Dofra Software — Sitio web

Sitio institucional bilingüe (español/inglés) creado con React 18, TypeScript y Vite.

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

1. **Formulario (FormSubmit):** el primer envío hacia `info@dofrasoftware.com` dispara un correo de activación de FormSubmit. Hay que abrirlo y confirmar; hasta entonces el formulario muestra el mensaje de error (nunca uno de éxito falso).
2. **Preguntas frecuentes pendientes:** en `src/App.tsx` hay respuestas con `pending: true` (plazos, dominio y alojamiento, actualizaciones, presupuesto). No se muestran hasta que se completen y se quite esa marca.
3. **Demos conceptuales:** se retiraron del listado hasta que haya versiones explorables con diseño propio.
4. **Proyectos:** odonto360, Spa Gestor y AppFotos, con capturas reales en `public/proyectos/` (versión grande y de 800 px). odonto360 y Spa Gestor usan datos sintéticos o ficticios; la foto de AppFotos es de Unsplash (uso aprobado). Los enlaces "Ver proyecto" apuntan a las demos y landings públicas.
5. **Sobre Dofra:** presentación de Franca y Victoria cargada; faltan las fotos (opcional).
6. **Panel del inicio:** es una demostración con datos ficticios y está identificado como tal.

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
- No necesitás variables de entorno para esta versión.

## Personalización

- Idiomas y textos: `src/App.tsx` (`content.es` / `content.en`).
- Colores, tipografía y responsive: `src/styles.css`.
- Favicon: `public/favicon.svg`.
- Metadatos y SEO básico: `index.html`.

## Notas

- El dashboard del hero y la maqueta de Equilibrium son **representaciones ilustrativas**, no datos reales.
- Los números que aparecen en el dashboard son decorativos, no métricas de Dofra.
- La fuente de Google Fonts requiere internet; el sitio usa una fuente de respaldo si no está disponible.
- No se usan cookies de analítica ni servicios externos de formularios.
# dofra
