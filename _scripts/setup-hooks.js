#!/usr/bin/env node
/**
 * Installa un hook pre-commit puramente Node (cross-platform) che:
 *  - aggiorna versione e build-info
 *  - valida JSON critici
 *  - aggiunge i file generati allo staging
 */
const { writeFileSync, mkdirSync, existsSync, chmodSync } = require('fs');
const { join } = require('path');

const gitDir = join(process.cwd(), '.git');
if (!existsSync(gitDir)) {
  console.log('Nessuna cartella .git trovata: skip install hooks');
  process.exit(0);
}

const hooksDir = join(gitDir, 'hooks');
try { mkdirSync(hooksDir, { recursive: true }); } catch {}

// Script Node eseguito dal pre-commit
const runnerTarget = join(process.cwd(), '_scripts', 'run-pre-commit.js');

// Hook POSIX
const preCommitPath = join(hooksDir, 'pre-commit');
const nodeHook = `#!/usr/bin/env node
require('../_scripts/run-pre-commit.js');
`;
writeFileSync(preCommitPath, nodeHook, 'utf8');
try { chmodSync(preCommitPath, 0o755); } catch {}

// Hook Windows (.cmd) – Git for Windows invoca anche questo se presente
const preCommitCmdPath = join(hooksDir, 'pre-commit.cmd');
const cmdContent = `@echo off
node "%~dp0..\\_scripts\\run-pre-commit.js"
if errorlevel 1 exit /b 1
exit /b 0
`;
writeFileSync(preCommitCmdPath, cmdContent, 'utf8');

// File runner: crea se non esiste (per non sovrascrivere personalizzazioni future)
if (!existsSync(runnerTarget)) {
  const runnerTemplate = `#!/usr/bin/env node\n/* Auto-generated: esegue le operazioni pre-commit */\nconst { execSync } = require('child_process');\nfunction run(cmd){return execSync(cmd,{stdio:'inherit'});}\ntry {\n  console.log('[pre-commit] Aggiorno versione & build-info');\n  run('npm run manage-version --silent');\n  run('npm run build-info --silent');\n  run('git add version.json build-info.json');\n  // Validazione JSON opzionale\n  ['data.json','manifest.json'].forEach(f=>{\n    const fs=require('fs'); if(fs.existsSync(f)){\n      try{JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){\n        console.error('[pre-commit] JSON non valido:', f); process.exit(1);\n      }\n    }\n  });\n  console.log('[pre-commit] OK');\n} catch (e){\n  console.error('[pre-commit] ERRORE:', e.message);\n  process.exit(1);\n}\n`;
  writeFileSync(runnerTarget, runnerTemplate, 'utf8');
  try { chmodSync(runnerTarget, 0o755); } catch {}
}

console.log('Hook pre-commit Node installato.');
