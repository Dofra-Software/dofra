// Publica el sitio compilado (dist/) en el repositorio público Dofra-Software/dofra-sitio.
// Sólo se sube el resultado de la compilación: el código fuente sigue en el repositorio privado.
//
// Uso local:  npm run build && node scripts/prepare-static-site.mjs && node scripts/publish-static-site.mjs --confirm
// Usa las credenciales de git ya configuradas en la máquina (o SITE_REPO con SSH en GitHub Actions).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = process.env.SITE_REPO || 'https://github.com/Dofra-Software/dofra-sitio.git';
const BRANCH = process.env.SITE_BRANCH || 'main';
const DIST = path.resolve('dist');

if (!process.argv.includes('--confirm')) {
  console.error('Publica en un repositorio PÚBLICO. Repetí con --confirm para continuar.');
  process.exit(1);
}
for (const f of ['index.html', '404.html', 'CNAME']) {
  if (!fs.existsSync(path.join(DIST, f))) {
    console.error(`Falta dist/${f}: ejecutá build y prepare-static-site antes.`);
    process.exit(1);
  }
}
// Defensa: nada que parezca una clave o variables de entorno puede salir al repositorio público.
const leaks = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/^\.env/.test(e.name) || /\.(map|pem|key)$/.test(e.name)) leaks.push(p);
    else if (/\.(js|html|css|json|webmanifest)$/.test(e.name) && /service_role|sb_secret_|SUPABASE_SERVICE/i.test(fs.readFileSync(p, 'utf8'))) leaks.push(p);
  }
})(DIST);
if (leaks.length) {
  console.error('Se detectaron archivos sensibles; no se publica:\n' + leaks.join('\n'));
  process.exit(1);
}

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' }).trim();
const source = git(['rev-parse', '--short', 'HEAD'], process.cwd());
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'dofra-sitio-'));
try {
  git(['clone', '--depth', '1', '--branch', BRANCH, REPO, work]);
  for (const e of fs.readdirSync(work)) if (e !== '.git') fs.rmSync(path.join(work, e), { recursive: true, force: true });
  fs.cpSync(DIST, work, { recursive: true });
  fs.writeFileSync(path.join(work, 'README.md'),
    '# Dofra Software — sitio público\n\nVersión compilada del sitio de Dofra Software, publicada con GitHub Pages en ' +
    `https://${fs.readFileSync(path.join(DIST, 'CNAME'), 'utf8').trim()}/.\n\n` +
    'Este repositorio se genera automáticamente. No editar a mano.\n\nBuilt by Dofra.\n');
  git(['add', '-A'], work);
  if (!git(['status', '--porcelain'], work)) {
    console.log('Sin cambios: el sitio ya está actualizado.');
  } else {
    git(['-c', 'user.name=Dofra Software', '-c', 'user.email=noreply@dofrasoftware.com', 'commit', '-m', `Publicar sitio desde dofra@${source}`], work);
    git(['push', 'origin', BRANCH], work);
    console.log(`Publicado dofra@${source} en ${REPO} (${BRANCH}).`);
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
