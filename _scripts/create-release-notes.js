#!/usr/bin/env node
/**
 * Estrae la sezione del CHANGELOG relativa alla versione passata e genera
 * un file RELEASE_NOTES_<version>.md con header standard.
 *
 * Uso: node _scripts/create-release-notes.js 1.3.0
 */
const { readFileSync, writeFileSync } = require('fs');

const version = process.argv[2];
if (!version) {
  console.error('Versione mancante. Uso: node _scripts/create-release-notes.js <version>');
  process.exit(1);
}
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Versione non valida. Atteso formato SemVer (es. 1.4.0)');
  process.exit(1);
}

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const marker = `## [${version}]`;
const idx = changelog.indexOf(marker);
if (idx === -1) {
  console.error(`Sezione ${marker} non trovata in CHANGELOG.md`);
  process.exit(2);
}
// Slice dalla riga della versione fino alla successiva sezione ## [
const rest = changelog.slice(idx);
const nextIdx = rest.indexOf('\n## [', marker.length);
const sectionRaw = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
const lines = sectionRaw.split('\n');
const headerLine = lines.shift();
let dateMatch = headerLine.match(/\-\s(\d{4}-\d{2}-\d{2})/);
const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0,10);
const body = lines.join('\n').trim() + '\n';
const out = `# Release ${version} (${dateStr})\n\n${body}`;
const outFile = `RELEASE_NOTES_${version}.md`;
writeFileSync(outFile, out, 'utf8');
console.log('Generato', outFile);
