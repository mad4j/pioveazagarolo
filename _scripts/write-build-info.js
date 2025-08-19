#!/usr/bin/env node
/**
 * Genera build-info.json con timestamp build (UTC) e ultimo commit (hash corto e data).
 */
const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { readVersionFile } = require('./manage-version.js');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

let commitHash = 'unknown';
let commitDate = new Date().toISOString();
try {
  commitHash = run('git rev-parse --short HEAD');
  commitDate = run('git show -s --format=%cI HEAD');
} catch (e) {
  // ignore in environments without git
}

const buildDate = new Date().toISOString();
const versionData = readVersionFile();
const payload = { 
  buildDate, 
  commitHash, 
  commitDate,
  version: versionData.version,
  buildNumber: versionData.buildNumber
};
writeFileSync('build-info.json', JSON.stringify(payload, null, 2));
console.log('Generated build-info.json:', payload);
