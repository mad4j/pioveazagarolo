#!/usr/bin/env node
/**
 * Incrementa automaticamente il numero CACHE_NAME nel service-worker.js
 * e aggiunge una nuova riga di commento con la descrizione della release.
 * Uso: node _scripts/bump-cache.js 1.6.0
 */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const releaseVersion = process.argv[2];
if (!releaseVersion) {
  console.error('Uso: node _scripts/bump-cache.js <version>');
  process.exit(1);
}

const swPath = path.join(process.cwd(), 'service-worker.js');
let content = readFileSync(swPath, 'utf8');

const cacheRegex = /const CACHE_NAME = "piove-a-zagarolo-cache-v(\d+)";/;
const match = content.match(cacheRegex);
if (!match) {
  console.error('CACHE_NAME non trovato in service-worker.js');
  process.exit(2);
}
const current = parseInt(match[1], 10);
const next = current + 1;

// Aggiorna CACHE_NAME
content = content.replace(cacheRegex, `const CACHE_NAME = "piove-a-zagarolo-cache-v${next}";`);

// Inserisce commento versione dopo l'ultimo blocco di commenti versione
const lines = content.split(/\r?\n/);
let lastIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\/\/ v\d+:/.test(lines[i].trim())) {
    lastIdx = i;
  }
}
if (lastIdx !== -1) {
  lines.splice(lastIdx + 1, 0, `// v${next}: release ${releaseVersion}`);
}

writeFileSync(swPath, lines.join('\n'));
console.log(`CACHE_NAME incrementato: v${current} -> v${next}`);
