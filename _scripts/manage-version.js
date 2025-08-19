#!/usr/bin/env node
/**
 * Automatic version management script
 * 
 * Rules:
 * - If no new features since last tag: increment PATCH by 1
 * - If new features since last tag: increment MINOR by 1
 * - Each intermediate build gets -rcN suffix where N increments per build
 * - On tag: version updates to tag version without suffix until next commit
 */
const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync } = require('fs');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function safeRun(cmd) {
  try {
    return run(cmd);
  } catch {
    return '';
  }
}

// Read current version.json
function readVersionFile() {
  if (!existsSync('version.json')) {
    // Initialize with package.json version if version.json doesn't exist
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return {
      version: packageJson.version,
      buildNumber: 0
    };
  }
  return JSON.parse(readFileSync('version.json', 'utf8'));
}

// Write version.json
function writeVersionFile(versionData) {
  writeFileSync('version.json', JSON.stringify(versionData, null, 2));
}

// Parse semantic version
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-rc(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    rc: match[4] ? parseInt(match[4]) : null
  };
}

// Format semantic version
function formatVersion(parts) {
  let version = `${parts.major}.${parts.minor}.${parts.patch}`;
  if (parts.rc !== null) {
    version += `-rc${parts.rc}`;
  }
  return version;
}

// Check if there are new features since last tag
function hasNewFeaturesSinceLastTag() {
  const lastTag = safeRun('git describe --tags --abbrev=0');
  if (!lastTag) {
    // No tags yet, check commits for features
    const commits = safeRun('git log --pretty=format:%s');
    return /^(feat|ux|pwa)(\([^()]+\))?:/.test(commits);
  }
  
  const commitsSinceTag = safeRun(`git log ${lastTag}..HEAD --pretty=format:%s`);
  if (!commitsSinceTag) {
    return false;
  }
  
  const lines = commitsSinceTag.split('\n');
  return lines.some(line => /^(feat|ux|pwa)(\([^()]+\))?:/.test(line.trim()));
}

// Check if current commit is a tag
function isCurrentCommitTagged() {
  const currentCommit = safeRun('git rev-parse HEAD');
  const taggedCommit = safeRun('git rev-list --tags --max-count=1');
  return currentCommit === taggedCommit;
}

// Get latest tag version
function getLatestTagVersion() {
  const latestTag = safeRun('git describe --tags --abbrev=0');
  return latestTag || null;
}

// Main version management logic
function manageVersion() {
  const versionData = readVersionFile();
  const currentVersion = parseVersion(versionData.version.replace(/-rc\d+$/, ''));
  
  // Check if current commit is tagged
  if (isCurrentCommitTagged()) {
    const tagVersion = getLatestTagVersion();
    if (tagVersion) {
      // Update to tag version without suffix
      const tagVersionParts = parseVersion(tagVersion);
      const newVersionData = {
        version: formatVersion({ ...tagVersionParts, rc: null }),
        buildNumber: 0
      };
      writeVersionFile(newVersionData);
      console.log(`Version updated to tag: ${newVersionData.version}`);
      return newVersionData;
    }
  }
  
  // Determine if we need to increment version
  const hasFeatures = hasNewFeaturesSinceLastTag();
  let newVersion = { ...currentVersion };
  
  // If this is a clean version (no -rc suffix), increment appropriately
  if (!versionData.version.includes('-rc')) {
    if (hasFeatures) {
      // Increment MINOR, reset PATCH
      newVersion.minor += 1;
      newVersion.patch = 0;
    } else {
      // Increment PATCH
      newVersion.patch += 1;
    }
    newVersion.rc = 1;
  } else {
    // Increment RC number
    const currentRc = versionData.version.match(/-rc(\d+)$/);
    newVersion.rc = currentRc ? parseInt(currentRc[1]) + 1 : 1;
  }
  
  const newVersionData = {
    version: formatVersion(newVersion),
    buildNumber: versionData.buildNumber + 1
  };
  
  writeVersionFile(newVersionData);
  console.log(`Version updated: ${versionData.version} -> ${newVersionData.version} (build #${newVersionData.buildNumber})`);
  return newVersionData;
}

// CLI execution
if (require.main === module) {
  try {
    manageVersion();
  } catch (error) {
    console.error('Error managing version:', error.message);
    process.exit(1);
  }
}

module.exports = { manageVersion, readVersionFile };