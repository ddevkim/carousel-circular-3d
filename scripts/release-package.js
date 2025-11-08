#!/usr/bin/env node

/**
 * Automated package release script with Changeset integration
 * Usage: pnpm release
 *
 * Workflow:
 * 1. Select package
 * 2. Choose version bump type (major/minor/patch)
 * 3. Enter change description
 * 4. Create Changeset file automatically
 * 5. Run 'changeset version' to update package.json and generate CHANGELOG
 * 6. Run 'changeset publish' to publish to NPM
 */

const { execSync } = require('node:child_process');
const { readdirSync, writeFileSync, mkdirSync } = require('node:fs');
const prompts = require('prompts');
const path = require('node:path');

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
 * {{string} bumpType - Version bump type (major/minor/patch)
 * @param {string} description - Change description
 * @returns {string} Changeset filename
 */
function createChangesetFile(changesetDir, packageName, bumpType, description) {
  // Create .changeset directory if it doesn't exist
  mkdirSync(changesetDir, { recursive: true });

  // Generate unique changeset filename (e.g., .changeset/blue-panda-123.md)
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filename = `${randomStr}-${timestamp}.md`;
  const filePath = path.join(changesetDir, filename);

  // Changeset file format: package name + version bump type + description
  const content = `---
"${packageName}": ${bumpType}
---

${description}
`;

  writeFileSync(filePath, content, 'utf-8');
  return filename;
}

/**
 * Execute shell command with error handling
 * @param {string} command - Shell command to execute
 * @param {string} cwd - Working directory
 * @throws {Error} If command fails
 */
function executeCommand(command, cwd) {
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd,
    });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

/**
 * Main release workflow
 */
async function main() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const rootDir = path.join(__dirname, '..');

  // Get list of packages
  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  if (packageDirs.length === 0) {
    console.error('❌ No packages found in packages/ directory\n');
    process.exit(1);
  }

  // Collect package information
  const packages = [];
  for (const packageDir of packageDirs) {
    try {
      const info = getPackageInfo(packagesDir, packageDir);
      // Exclude private packages
      if (!info.private) {
        packages.push({
          dir: packageDir,
          name: info.name,
          version: info.version,
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not read ${packageDir}: ${error.message}`);
    }
  }

  if (packages.length === 0) {
    console.error('❌ No public packages available for release\n');
    process.exit(1);
  }

  try {
    // Step 1: Select package
    const packageResponse = await prompts({
      type: 'select',
      name: 'package',
      message: '📦 Select package to release:',
      choices: packages.map((pkg) => ({
        title: `${pkg.name}`,
        description: `Current version: ${pkg.version} | Directory: ${pkg.dir}`,
        value: pkg,
      })),
      initial: 0,
    });

    if (!packageResponse.package) {
      console.log('\n❌ Release cancelled.\n');
      process.exit(0);
    }

    const selectedPackage = packageResponse.package;

    // Step 2: Select version bump type
    const bumpResponse = await prompts({
      type: 'select',
      name: 'bump',
      message: '🔄 Select version bump type:',
      choices: [
        {
          title: 'Patch (0.0.x)',
          description: 'Bug fixes and minor improvements',
          value: 'patch',
        },
        {
          title: 'Minor (0.x.0)',
          description: 'New features (backward compatible)',
          value: 'minor',
        },
        {
          title: 'Major (x.0.0)',
          description: 'Breaking changes',
          value: 'major',
        },
      ],
      initial: 0,
    });

    if (!bumpResponse.bump) {
      console.log('\n❌ Release cancelled.\n');
      process.exit(0);
    }

    // Step 3: Enter change description
    const descriptionResponse = await prompts({
      type: 'text',
      name: 'description',
      message: '📝 Describe your changes:',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Description cannot be empty';
        }
        return true;
      },
    });

    if (!descriptionResponse.description) {
      console.log('\n❌ Release cancelled.\n');
      process.exit(0);
    }

    // Step 4: Summary and confirmation
    console.log(`\n${'='.repeat(60)}`);
    console.log('📋 Release Summary');
    console.log('='.repeat(60));
    console.log(`Package:      ${selectedPackage.name}`);
    console.log(`Current Ver:  ${selectedPackage.version}`);
    console.log(`Bump Type:    ${bumpResponse.bump.toUpperCase()}`);
    console.log(`Description:  ${descriptionResponse.description}`);
    console.log(`${'='.repeat(60)}\n`);

    const confirmResponse = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: 'Proceed with release?',
      initial: false,
    });

    if (!confirmResponse.confirmed) {
      console.log('\n❌ Release cancelled.\n');
      process.exit(0);
    }

    // Step 5: Create Changeset file
    console.log(`\n📝 Creating changeset file...\n`);
    const changesetDir = path.join(rootDir, '.changeset');
    const changesetFile = createChangesetFile(
      changesetDir,
      selectedPackage.name,
      bumpResponse.bump,
      descriptionResponse.description
    );
    console.log(`✅ Created: .changeset/${changesetFile}`);

    // Step 6: Build
    console.log(`\n🔨 Building ${selectedPackage.name}...\n`);
    executeCommand(`pnpm --filter ${selectedPackage.name} build`, rootDir);

    // Step 7: Update version and generate CHANGELOG
    console.log(`\n📌 Updating version and CHANGELOG...\n`);
    executeCommand('pnpm changeset version', rootDir);

    // Step 8: Publish to NPM
    console.log(`\n📤 Publishing to NPM...\n`);
    executeCommand('pnpm changeset publish', rootDir);

    console.log(`\n✅ ${selectedPackage.name} released successfully!\n`);
  } catch (error) {
    console.error(`\n❌ Release failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
