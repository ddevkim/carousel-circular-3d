#!/usr/bin/env node

/**
 * Automated package release script with Changeset integration
 * Usage: pnpm release
 *
 * Workflow:
 * 1. Validate Changeset installation
 * 2. Select package
 * 3. Choose version bump type (major/minor/patch)
 * 4. Enter change description
 * 5. Review and confirm release details
 * 6. Create Changeset file automatically
 * 7. Build package
 * 8. Update version and generate CHANGELOG
 * 9. Publish to NPM
 */

const { execSync } = require('node:child_process');
const { readdirSync, writeFileSync, mkdirSync } = require('node:fs');
const prompts = require('prompts');
const path = require('node:path');

// ============================================================================
// Constants
// ============================================================================

const PROMPTS = {
  SELECT_MODE: '🚀 Choose release mode:',
  SELECT_PACKAGE: '📦 Select package to release:',
  SELECT_BUMP: '🔄 Select version bump type:',
  ENTER_DESCRIPTION: '📝 Describe your changes:',
  CONFIRM_RELEASE: 'Proceed with release?',
  RETRY_RELEASE: 'Try again?',
};

const VERSION_BUMP = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major',
};

const ADJECTIVES = ['blue', 'happy', 'quick', 'lazy', 'silly', 'brave', 'bright', 'calm'];
const NOUNS = ['panda', 'tiger', 'eagle', 'dolphin', 'phoenix', 'wizard', 'knight'];

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate next semantic version based on bump type
 * @param {string} currentVersion - Current version (e.g., "0.1.0")ㅌ
 * @param {string} bumpType - Bump type: "major", "minor", or "patch"
 * @returns {string} Next version
 */
function calculateNextVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (bumpType) {
    case VERSION_BUMP.MAJOR:
      return `${major + 1}.0.0`;
    case VERSION_BUMP.MINOR:
      return `${major}.${minor + 1}.0`;
    case VERSION_BUMP.PATCH:
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

/**
 * Generate a unique, memorable changeset filename
 * @returns {string} Filename in format "adjective-noun-number"
 */
function generateChangesetFilename() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 10000);
  return `${adj}-${noun}-${num}`;
}

/**
 * Validate that Changeset is installed
 * @throws {Error} If Changeset is not installed
 */
function validateChangesetInstalled() {
  try {
    execSync('pnpm changeset --version', { stdio: 'pipe' });
  } catch (_error) {
    throw new Error(
      'Changeset is not installed.\n' +
        'Install it with: pnpm add -D @changesets/cli\n' +
        'Learn more: https://github.com/changesets/changesets'
    );
  }
}

/**
 * Get package information from package.json
 * @param {string} packagesDir - Path to packages directory
 * @param {string} packageDir - Package directory name
 * @returns {{name: string, version: string, private: boolean}} Package info
 * @throws {Error} If package.json cannot be read
 */
function getPackageInfo(packagesDir, packageDir) {
  const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
  try {
    const packageJson = require(packageJsonPath);
    return {
      name: packageJson.name || `@ddevkim/${packageDir}`,
      version: packageJson.version || '0.0.0',
      private: packageJson.private || false,
    };
  } catch (_error) {
    throw new Error(`Cannot read ${packageJsonPath}`);
  }
}

/**
 * Create changeset file programmatically
 * @param {string} changesetDir - Path to .changeset directory
 * @param {string} packageName - Package name (scoped)
 * @param {string} bumpType - Version bump type (major/minor/patch)
 * @param {string} description - Change description
 * @returns {string} Full path to created changeset file
 * @throws {Error} If file creation fails
 */
function createChangesetFile(changesetDir, packageName, bumpType, description) {
  mkdirSync(changesetDir, { recursive: true });

  const filename = `${generateChangesetFilename()}.md`;
  const filePath = path.join(changesetDir, filename);
  const content = `---\n"${packageName}": ${bumpType}\n---\n\n${description}\n`;

  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Execute shell command with enhanced error handling
 * @param {string} command - Shell command to execute
 * @param {string} cwd - Working directory
 * @throws {Error} With detailed context information
 */
function executeCommand(command, cwd) {
  try {
    execSync(command, { stdio: 'inherit', cwd });
  } catch (error) {
    const errorMsg =
      `Command failed: ${command}\n` +
      `Working directory: ${cwd}\n` +
      `Error: ${error.message}\n` +
      `💡 Tip: Verify your configuration files and permissions`;
    throw new Error(errorMsg);
  }
}

/**
 * Load packages from packages directory
 * @param {string} packagesDir - Path to packages directory
 * @returns {Array<{dir: string, name: string, version: string}>} List of public packages
 */
function loadPublicPackages(packagesDir) {
  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const packages = [];

  for (const packageDir of packageDirs) {
    try {
      const info = getPackageInfo(packagesDir, packageDir);
      if (!info.private) {
        packages.push({ dir: packageDir, name: info.name, version: info.version });
      }
    } catch (error) {
      console.warn(`⚠️  Could not read ${packageDir}: ${error.message}`);
    }
  }

  return packages;
}

/**
 * Interactive package selection with retry logic
 * @param {Array} packages - List of packages to choose from
 * @returns {Promise<object|null>} Selected package or null if cancelled
 */
async function selectPackageInteractive(packages) {
  const response = await prompts({
    type: 'select',
    name: 'package',
    message: PROMPTS.SELECT_PACKAGE,
    choices: packages.map((pkg) => ({
      title: pkg.name,
      description: `v${pkg.version} | ${pkg.dir}`,
      value: pkg,
    })),
    initial: 0,
  });

  return response.package || null;
}

/**
 * Interactive version bump selection
 * @returns {Promise<string|null>} Bump type or null if cancelled
 */
async function selectBumpType() {
  const response = await prompts({
    type: 'select',
    name: 'bump',
    message: PROMPTS.SELECT_BUMP,
    choices: [
      {
        title: 'Patch (0.0.x)',
        description: 'Bug fixes and minor improvements',
        value: VERSION_BUMP.PATCH,
      },
      {
        title: 'Minor (0.x.0)',
        description: 'New features (backward compatible)',
        value: VERSION_BUMP.MINOR,
      },
      { title: 'Major (x.0.0)', description: 'Breaking changes', value: VERSION_BUMP.MAJOR },
    ],
    initial: 0,
  });

  return response.bump || null;
}

/**
 * Interactive change description input with validation
 * @returns {Promise<string|null>} Description or null if cancelled
 */
async function getChangeDescription() {
  const response = await prompts({
    type: 'text',
    name: 'description',
    message: PROMPTS.ENTER_DESCRIPTION,
    validate: (value) =>
      !value || value.trim().length === 0 ? 'Description cannot be empty' : true,
  });

  return response.description || null;
}

/**
 * Display release summary and request confirmation
 * @param {object} pkg - Selected package
 * @param {string} bumpType - Version bump type
 * @param {string} description - Change description
 * @returns {Promise<boolean>} User confirmation
 */
async function confirmRelease(pkg, bumpType, description) {
  const nextVersion = calculateNextVersion(pkg.version, bumpType);

  console.log(`\n${'='.repeat(65)}`);
  console.log('📋 Release Summary');
  console.log('='.repeat(65));
  console.log(`Package:      ${pkg.name}`);
  console.log(`Current Ver:  ${pkg.version}`);
  console.log(`Next Ver:     ${nextVersion} ← (will be created)`);
  console.log(`Bump Type:    ${bumpType.toUpperCase()}`);
  console.log(`Description:  ${description}`);
  console.log(`${'='.repeat(65)}\n`);

  const response = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: PROMPTS.CONFIRM_RELEASE,
    initial: false,
  });

  return response.confirmed || false;
}

/**
 * Release retry prompt
 * @returns {Promise<boolean>} Whether to retry
 */
async function promptRetry() {
  const response = await prompts({
    type: 'confirm',
    name: 'retry',
    message: PROMPTS.RETRY_RELEASE,
    initial: false,
  });

  return response.retry || false;
}

/**
 * Select release mode: 'add' (PR workflow) or 'publish' (release workflow)
 * @returns {Promise<string>} Selected mode: 'add' or 'publish'
 */
async function selectReleaseMode() {
  const response = await prompts({
    type: 'select',
    name: 'mode',
    message: PROMPTS.SELECT_MODE,
    choices: [
      {
        title: '📝 Add Changeset (PR workflow)',
        description: 'Record changes for this PR, commit to git',
        value: 'add',
      },
      {
        title: '🚀 Publish Release (release workflow)',
        description: 'Compile all changesets and publish to npm',
        value: 'publish',
      },
    ],
    initial: 0,
  });

  return response.mode || null;
}

/**
 * Interactive changeset creation for PR workflow
 * @param {Array} packages - List of available packages
 * @returns {Promise<object|null>} Changeset details or null if cancelled
 */
async function createChangesetForPR(packages) {
  const selectedPackage = await selectPackageInteractive(packages);
  if (!selectedPackage) return null;

  const bumpType = await selectBumpType();
  if (!bumpType) {
    if (await promptRetry()) return createChangesetForPR(packages);
    return null;
  }

  const description = await getChangeDescription();
  if (!description) {
    if (await promptRetry()) return createChangesetForPR(packages);
    return null;
  }

  const confirmed = await confirmRelease(selectedPackage, bumpType, description);
  if (!confirmed) {
    if (await promptRetry()) return createChangesetForPR(packages);
    return null;
  }

  return { selectedPackage, bumpType, description };
}

/**
 * Execute changeset add (PR workflow)
 * @param {object} plan - Changeset details
 * @param {string} rootDir - Root directory path
 * @returns {Promise<void>} Throws on error
 */
async function executeChangesetAdd(plan, rootDir) {
  const { selectedPackage, bumpType, description } = plan;
  const changesetDir = path.join(rootDir, '.changeset');

  console.log('📝 Creating changeset file...\n');
  const changesetFilePath = createChangesetFile(
    changesetDir,
    selectedPackage.name,
    bumpType,
    description
  );
  console.log(`✅ Created: ${path.relative(rootDir, changesetFilePath)}`);

  console.log('\n📋 Next steps:');
  console.log('1. Review changeset file');
  console.log('2. Commit: git add && git commit');
  console.log('3. Push to remote and create PR\n');
}

/**
 * Execute changeset version + publish (release workflow)
 * Automatically compiles all changesets and publishes to npm
 * @param {string} rootDir - Root directory path
 * @returns {Promise<void>} Throws on error
 */
async function executeChangesetPublish(rootDir) {
  console.log('📌 Updating versions and generating CHANGELOG...\n');
  executeCommand('pnpm changeset version', rootDir);

  console.log('\n📤 Publishing to NPM...\n');
  executeCommand('pnpm changeset publish', rootDir);

  console.log('\n✅ Release completed successfully!\n');
}

/**
 * Main release workflow with dual mode support
 * Mode 1: 'add' - Create changeset for PR workflow
 * Mode 2: 'publish' - Publish all accumulated changesets
 */
async function main() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const rootDir = path.join(__dirname, '..');

  // Validate Changeset
  try {
    validateChangesetInstalled();
  } catch (error) {
    console.error(`\n❌ ${error.message}\n`);
    process.exit(1);
  }

  // Select release mode
  const mode = await selectReleaseMode();
  if (!mode) {
    console.log('\n❌ Cancelled.\n');
    return;
  }

  // Mode 1: Add changeset for PR workflow
  if (mode === 'add') {
    const packages = loadPublicPackages(packagesDir);
    if (packages.length === 0) {
      console.error('❌ No public packages available for release\n');
      process.exit(1);
    }

    const plan = await createChangesetForPR(packages);
    if (!plan) {
      console.log('\n❌ Changeset creation cancelled.\n');
      return;
    }

    try {
      await executeChangesetAdd(plan, rootDir);
    } catch (error) {
      console.error(`\n❌ Changeset creation failed: ${error.message}\n`);
      process.exit(1);
    }
    return;
  }

  // Mode 2: Publish all changesets
  if (mode === 'publish') {
    try {
      await executeChangesetPublish(rootDir);
    } catch (error) {
      console.error(`\n❌ Release failed: ${error.message}\n`);
      process.exit(1);
    }
  }
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error(`\n❌ Fatal error: ${error.message}\n`);
  process.exit(1);
});
