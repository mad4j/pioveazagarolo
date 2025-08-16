#!/usr/bin/env node
/* Auto Changelog Generator */
const { execSync } = require('child_process');
const { writeFileSync, existsSync, readFileSync } = require('fs');

function run(cmd) { return execSync(cmd, { encoding: 'utf8' }).trim(); }
function safeRun(cmd) { try { return run(cmd); } catch { return ''; } }

const tagsRaw = safeRun('git tag --sort=creatordate');
if (!tagsRaw) { console.error('Nessun tag trovato'); process.exit(0); }
const tags = tagsRaw.split('\n').filter(Boolean);

const sections = [];
// Mappa tipo commit -> categoria changelog
const typeToCategory = {
  feat: 'features',
  fix: 'fixes',
  refactor: 'refactors',
  data: 'data',
  perf: 'performance',
  docs: 'docs',
  style: 'other',
  chore: 'other',
  build: 'build',
  ci: 'ci',
  test: 'tests',
  deps: 'dependencies',
  security: 'security',
  revert: 'other',
  ux: 'features',
  pwa: 'features'
};
for (let i = tags.length - 1; i >= 0; i--) {
  const current = tags[i];
  const previous = tags[i - 1];
  const range = previous ? `${previous}..${current}` : current;
  const date = run(`git log -1 --format=%ad --date=short ${current}`);
  const linesRaw = safeRun(`git log ${range} --pretty=format:%h%x09%s`);
  if (!linesRaw) continue;
  const lines = linesRaw.split('\n');
  const cats = { features: [], fixes: [], refactors: [], data: [], performance: [], docs: [], build: [], ci: [], tests: [], dependencies: [], security: [], other: [] };
  for (const line of lines) {
    const [hash, ...rest] = line.split('\t');
    const msg = rest.join('\t').trim();
    if (!msg || msg.startsWith('Merge ')) continue;
    const entry = `- ${msg} (${hash})`;
    // Conventional commit parse
    const conventionalMatch = msg.match(/^(\w+)(\([^()]+\))?(!)?:\s(.+)/);
    if (conventionalMatch) {
      const rawType = conventionalMatch[1].toLowerCase();
      const mapped = typeToCategory[rawType];
      if (mapped && cats[mapped]) {
        cats[mapped].push(entry);
        continue;
      }
    }
    if (/data updated/i.test(msg)) cats.data.push(entry);
    else if (/^data:/i.test(msg)) cats.data.push(entry);
    else if (/fix|corre(g|tt)|bug/i.test(msg)) cats.fixes.push(entry);
    else if (/refactor/i.test(msg)) cats.refactors.push(entry);
    else if (/perf|performance/i.test(msg)) cats.performance.push(entry);
    else if (/docs?:/i.test(msg)) cats.docs.push(entry);
    else if (/build:/i.test(msg)) cats.build.push(entry);
    else if (/ci:/i.test(msg)) cats.ci.push(entry);
    else if (/test:/i.test(msg)) cats.tests.push(entry);
    else if (/deps?:/i.test(msg)) cats.dependencies.push(entry);
    else if (/security:/i.test(msg)) cats.security.push(entry);
    else if (/(feat|feature|add|improve|overlay|plugin|caching|pwa|ux)/i.test(msg)) cats.features.push(entry);
    else cats.other.push(entry);
  }
  if (Object.values(cats).every(a => a.length === 0)) continue;
  let section = `## [${current}] - ${date}`;
  const pushCat = (title, arr) => { if (arr.length) section += `\n\n### ${title}\n` + arr.join('\n'); };
  pushCat('Features', cats.features);
  pushCat('Fix', cats.fixes);
  pushCat('Refactor', cats.refactors);
  pushCat('Performance', cats.performance);
  pushCat('Docs', cats.docs);
  pushCat('Build', cats.build);
  pushCat('CI', cats.ci);
  pushCat('Tests', cats.tests);
  pushCat('Dependencies', cats.dependencies);
  pushCat('Security', cats.security);
  // Sempre e solo il conteggio degli aggiornamenti dati (richiesta workflow release)
  if (cats.data.length) {
    pushCat('Data Updates', [ `${cats.data.length} commit di aggiornamento dati` ]);
  }
  pushCat('Other', cats.other);
  sections.push(section + '\n');
}

let header = '# Changelog (Auto-Generato)\n\nGenerato da _scripts/generate-changelog.js\n';
let existingManual = '';
if (existsSync('CHANGELOG.md')) {
  const current = readFileSync('CHANGELOG.md', 'utf8');
  const marker = '# Changelog (Auto-Generato)';
  if (!current.startsWith(marker)) {
    existingManual = '\n---\n\nContenuto precedente (archiviato):\n\n' + current.trim() + '\n';
  }
}
const output = header + '\n' + sections.join('\n') + existingManual + '\n';
writeFileSync('CHANGELOG.md', output, 'utf8');
console.log('CHANGELOG.md aggiornato.');
