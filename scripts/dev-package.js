#!/usr/bin/env node

/**
 * Interactive 패키지 선택 및 playground 실행 스크립트
 * 사용법: pnpm dev
 * 또는: pnpm dev <package-name> (직접 패키지 이름 지정)
 */

const { execSync } = require('node:child_process');
const { readdirSync, existsSync } = require('node:fs');
const prompts = require('prompts');
const path = require('node:path');

/**
 * 패키지 정보 가져오기 및 playground 패키지 정보 결합
 * @param {string} packagesDir 패키지들이 위치한 루트 경로
 * @param {string} packageDir 개별 패키지 디렉토리 이름
 * @returns {{ name: string, dir: string, hasPlayground: boolean, playgroundName: string | null }} 패키지 정보
 * @throws {Error} package.json을 읽지 못했을 때 발생
 */
function getPackageInfo(packagesDir, packageDir) {
  const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
  try {
    const packageJson = require(packageJsonPath);
    const playgroundPath = path.join(packagesDir, packageDir, 'playground');
    const hasPlayground = existsSync(playgroundPath);
    let playgroundName = null;

    if (hasPlayground) {
      const playgroundPackageJsonPath = path.join(playgroundPath, 'package.json');

      if (existsSync(playgroundPackageJsonPath)) {
        const playgroundPackageJson = require(playgroundPackageJsonPath);
        playgroundName = playgroundPackageJson.name || null;
      }
    }

    return {
      name: packageJson.name || `@ddevkim/${packageDir}`,
      dir: packageDir,
      hasPlayground,
      playgroundName,
    };
  } catch (_error) {
    throw new Error(`❌ ${packageJsonPath} 파일을 읽을 수 없습니다.`);
  }
}

/**
 * playground를 가진 패키지 목록을 수집
 * @param {string} packagesDir 패키지 루트 디렉토리 경로
 * @returns {{ packages: Array<{ name: string, dir: string, hasPlayground: boolean, playgroundName: string | null }>, totalPackageCount: number }} playground 보유 패키지와 전체 패키지 수
 */
function loadPackagesWithPlayground(packagesDir) {
  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const packages = [];

  for (const packageDir of packageDirs) {
    try {
      const info = getPackageInfo(packagesDir, packageDir);
      if (info.hasPlayground) {
        packages.push(info);
      }
    } catch (error) {
      console.warn(`⚠️  ${packageDir} 패키지 정보를 읽을 수 없습니다: ${error.message}`);
    }
  }

  return {
    packages,
    totalPackageCount: packageDirs.length,
  };
}

/**
 * 패키지 선택 (CLI 인자 또는 Interactive)
 * @param {string | undefined} packageName 사용자가 전달한 패키지 이름
 * @param {Array<{ name: string, dir: string, playgroundName: string | null }>} packages 선택 가능한 패키지 목록
 * @returns {Promise<object | null>} 선택된 패키지 정보 또는 취소 시 null
 * @throws {Error} 선택 과정에서 오류가 발생한 경우
 */
async function selectPackage(packageName, packages) {
  if (packageName) {
    const normalize = (value) => value.replace(/[-_]/g, '');
    const normalizedName = normalize(packageName);
    const matchedPackage = packages.find((pkg) => {
      const candidates = [pkg.dir, pkg.name, pkg.playgroundName].filter(Boolean);

      for (const candidate of candidates) {
        const normalizedCandidate = normalize(candidate);

        if (
          normalizedCandidate.includes(normalizedName) ||
          normalizedName.includes(normalizedCandidate) ||
          candidate.includes(packageName)
        ) {
          return true;
        }
      }

      return false;
    });

    if (!matchedPackage) {
      const availablePackages = packages.map((pkg) => pkg.name).join(', ');
      const error = new Error(`패키지를 찾을 수 없습니다: ${packageName}`);
      error.availablePackages = availablePackages;
      throw error;
    }

    return matchedPackage;
  }

  try {
    const response = await prompts({
      type: 'select',
      name: 'package',
      message: '🚀 실행할 패키지의 playground를 선택하세요:',
      choices: packages.map((pkg) => ({
        title: `${pkg.name}`,
        description: `디렉토리: ${pkg.dir}`,
        value: pkg,
      })),
      initial: 0,
    });

    return response.package ?? null;
  } catch (error) {
    throw new Error(`오류: ${error.message}`);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const packageName = process.argv[2];
  const packagesDir = path.join(__dirname, '..', 'packages');

  const { packages, totalPackageCount } = loadPackagesWithPlayground(packagesDir);

  if (packages.length === 0) {
    const message =
      totalPackageCount === 0
        ? '❌ packages 폴더에 패키지가 없습니다.\n'
        : '❌ playground가 있는 패키지가 없습니다.\n';
    console.error(message);
    process.exit(1);
  }

  let selectedPackage;
  try {
    selectedPackage = await selectPackage(packageName, packages);
  } catch (error) {
    const availablePackages = error.availablePackages
      ? `\n사용 가능한 패키지: ${error.availablePackages}\n`
      : '';
    console.error(`❌ ${error.message}${availablePackages}`);
    process.exit(1);
  }

  if (!selectedPackage) {
    console.log('\n❌ 취소되었습니다.\n');
    process.exit(0);
  }

  console.log(`\n🚀 ${selectedPackage.name} playground 실행 중...\n`);

  try {
    const playgroundTarget = selectedPackage.playgroundName || selectedPackage.name;

    execSync(`pnpm --filter ${playgroundTarget} dev`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error) {
    console.error(`\n❌ ${selectedPackage.name} playground 실행 실패`, error.message);
    process.exit(1);
  }
}

// 실행
main().catch((error) => {
  console.error(`\n❌ 오류: ${error.message}\n`);
  process.exit(1);
});
