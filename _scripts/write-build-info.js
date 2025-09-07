#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generates build-info.json with build timestamp and commit information
 */

const buildInfoPath = path.join(__dirname, '..', 'build-info.json');

try {
  // Get current timestamp
  const buildTimestamp = new Date().toISOString();
  
  // Get git commit information
  let gitCommit = '';
  let gitBranch = '';
  
  try {
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn('Could not get git information:', e.message);
  }
  
  // Get package version
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const buildInfo = {
    version: packageInfo.version,
    buildTimestamp,
    gitCommit,
    gitBranch,
    buildNumber: Math.floor(Date.now() / 1000)
  };
  
  // Write build-info.json
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  
  console.log('Generated build-info.json with build timestamp:', buildTimestamp);
  
} catch (error) {
  console.error('Error generating build-info.json:', error);
  process.exit(1);
}