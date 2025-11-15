# Pull Request Workflow: Public → Private Repository

> How to handle pull requests from the public repository and sync them back to the private monorepo

## Overview

Since development happens in the private monorepo (`ddevkim/packages`) and syncs to the public repo (`ddevkim/carousel-circular-3d`), we need a special workflow to handle PRs from external contributors.

## Workflow Options

### Option 1: Cherry-pick (Recommended) ⭐

This is the safest and most controlled approach.

#### Process

```
1. User submits PR to public repo
2. Review PR in public repo (code review, CI checks)
3. If approved, cherry-pick changes to private repo
4. Test in private repo
5. Merge in private repo
6. Auto-sync pushes changes back to public repo
7. Close PR in public repo with reference
```

#### Step-by-Step Guide

**1. Review PR in Public Repository**

```bash
# View the PR
gh pr view 42 --repo ddevkim/carousel-circular-3d

# Check out PR locally for testing
gh pr checkout 42 --repo ddevkim/carousel-circular-3d

# Test the changes
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm build
```

**2. Add Remote for Public Repository** (One-time setup)

```bash
# In your private monorepo
cd /path/to/ddevkim  # private monorepo

# Add public repo as remote
git remote add public https://github.com/ddevkim/carousel-circular-3d.git

# Fetch from public repo
git fetch public
```

**3. Cherry-pick Changes to Private Repo**

```bash
# In private monorepo
cd /path/to/ddevkim

# Fetch latest from public repo
git fetch public

# Create a new branch for the PR
git checkout -b pr/42-add-feature main

# Cherry-pick the commits from the PR
# First, find the commit hashes from the public PR
gh pr view 42 --repo ddevkim/carousel-circular-3d --json commits --jq '.commits[].oid'

# Cherry-pick each commit
git cherry-pick <commit-hash>

# If there are multiple commits, cherry-pick them all
git cherry-pick <commit-hash-1> <commit-hash-2> <commit-hash-3>
```

**4. Adjust Paths (Important!)**

Since the public repo only contains the package contents, you need to adjust paths:

```bash
# The cherry-picked commits will have paths like:
# src/components/Feature.tsx

# But in the private monorepo, they should be:
# packages/carousel-circular-3d/src/components/Feature.tsx

# Use interactive rebase to fix paths
git rebase -i main

# Mark all commits as 'edit', then for each commit:
git mv src packages/carousel-circular-3d/src
git mv *.md packages/carousel-circular-3d/
# ... move other files as needed

git commit --amend --no-edit
git rebase --continue
```

**Better approach: Use git format-patch**

```bash
# In public repo checkout
gh pr checkout 42 --repo ddevkim/carousel-circular-3d

# Create patches
git format-patch main..HEAD -o /tmp/pr-42-patches

# In private monorepo
cd /path/to/ddevkim
git checkout -b pr/42-add-feature main

# Apply patches with path adjustment
for patch in /tmp/pr-42-patches/*.patch; do
  git am --directory=packages/carousel-circular-3d "$patch"
done
```

**5. Test in Private Monorepo**

```bash
# In private monorepo
cd packages/carousel-circular-3d

pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm build

# Test in playground
pnpm --filter @ddevkim/carousel-circular-3d-playground dev
```

**6. Update PR Information**

```bash
# Update commit message to credit original author
git commit --amend

# Add to commit message:
# Co-authored-by: Original Author <email@example.com>
# PR: https://github.com/ddevkim/carousel-circular-3d/pull/42
```

**7. Merge to Main in Private Repo**

```bash
# In private monorepo
git checkout main
git merge pr/42-add-feature

# Or squash if preferred
git merge --squash pr/42-add-feature
git commit

# Push to private repo
git push origin main
```

**8. GitHub Actions Auto-Sync**

The workflow will automatically sync to public repo:
```
Private repo (main) → GitHub Actions → Public repo (main)
```

**9. Close Public PR**

```bash
# Close the PR with a comment
gh pr close 42 --repo ddevkim/carousel-circular-3d --comment "Thank you for your contribution! This has been merged via the main development repository. Changes are now available in the latest version.

The commit in the public repository: $(git rev-parse HEAD)

Thanks again! 🎉"
```

---

### Option 2: Automated Sync with GitHub Actions

Create a workflow to automatically sync PRs from public to private repo.

**⚠️ Note**: This is more complex and requires careful setup.

#### Create Workflow in Public Repository

Create `.github/workflows/sync-pr-to-private.yml` in the **public repository**:

```yaml
name: Sync PR to Private Repository

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  sync-pr:
    runs-on: ubuntu-latest
    if: github.event.pull_request.head.repo.full_name != github.repository  # Only for external PRs

    steps:
      - name: Notify Private Repo
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.PRIVATE_REPO_TOKEN }}
          script: |
            const { data: issue } = await github.rest.issues.create({
              owner: 'ddevkim',
              repo: 'packages',  // private repo
              title: `[Public PR #${context.payload.pull_request.number}] ${context.payload.pull_request.title}`,
              body: `
            ## External PR Notification

            A pull request was submitted to the public repository:

            - **PR**: ${context.payload.pull_request.html_url}
            - **Author**: @${context.payload.pull_request.user.login}
            - **Branch**: ${context.payload.pull_request.head.ref}

            ### Description

            ${context.payload.pull_request.body}

            ### Actions Required

            1. Review the PR in the public repository
            2. Cherry-pick changes to this repository
            3. Test and merge here
            4. Auto-sync will push changes back to public repo
            5. Close the public PR with a reference

            ### Commands

            \`\`\`bash
            # Fetch public repo
            git fetch public pull/${context.payload.pull_request.number}/head:pr-${context.payload.pull_request.number}

            # Create branch
            git checkout -b external-pr/${context.payload.pull_request.number} main

            # Cherry-pick commits (adjust paths)
            git format-patch main..pr-${context.payload.pull_request.number} -o /tmp/patches
            for patch in /tmp/patches/*.patch; do
              git am --directory=packages/carousel-circular-3d "$patch"
            done
            \`\`\`
              `,
              labels: ['external-pr', 'needs-review']
            });

            console.log('Created issue:', issue.number);
```

---

### Option 3: Contributor Fork Workflow (Alternative)

Ask contributors to fork the **private repository** instead (if it's open source).

**Pros**: Direct PRs to main repo
**Cons**: Exposes entire monorepo structure

---

## Recommended Workflow Summary

### For Maintainer (You)

```bash
# 1. Review PR in public repo
gh pr view <PR_NUMBER> --repo ddevkim/carousel-circular-3d
gh pr checks <PR_NUMBER> --repo ddevkim/carousel-circular-3d

# 2. If approved, create patches
gh pr checkout <PR_NUMBER> --repo ddevkim/carousel-circular-3d
git format-patch origin/main..HEAD -o /tmp/pr-patches

# 3. Apply to private monorepo
cd /path/to/private-monorepo
git checkout -b external-pr/<PR_NUMBER> main
for patch in /tmp/pr-patches/*.patch; do
  git am --directory=packages/carousel-circular-3d "$patch"
done

# 4. Test thoroughly
cd packages/carousel-circular-3d
pnpm lint && pnpm type-check && pnpm build && pnpm dev

# 5. Merge to main
git checkout main
git merge external-pr/<PR_NUMBER>
git push origin main

# 6. Auto-sync pushes to public repo

# 7. Close public PR
gh pr close <PR_NUMBER> --repo ddevkim/carousel-circular-3d \
  --comment "Merged! Thank you for your contribution! 🎉"
```

### For Contributors (Public Repo)

They just need to:
```bash
# 1. Fork public repo
# 2. Create feature branch
# 3. Make changes
# 4. Submit PR to public repo
# 5. Wait for review
```

---

## CONTRIBUTING.md Update

Add this section to CONTRIBUTING.md:

```markdown
## Note for External Contributors

This package is maintained as part of a private monorepo and automatically synced to this public repository.

### Pull Request Process

1. **Submit your PR** to this repository as normal
2. **We will review** your PR here
3. **If approved**, we will:
   - Merge changes into our main development repository
   - Changes will automatically sync back to this repo
   - Your PR will be closed with a reference to the sync commit
4. **You will be credited** in:
   - Commit message (`Co-authored-by`)
   - Release notes
   - Contributors list

### Why This Workflow?

We maintain the package in a monorepo for:
- Shared development tools
- Cross-package testing
- Coordinated releases

Your contributions are valuable and this workflow ensures they integrate properly with our development process!
```

---

## Automation Script

Create a helper script for processing public PRs:

```bash
#!/bin/bash
# scripts/import-public-pr.sh

PR_NUMBER=$1
PUBLIC_REPO="ddevkim/carousel-circular-3d"
PACKAGE_PATH="packages/carousel-circular-3d"

if [ -z "$PR_NUMBER" ]; then
  echo "Usage: ./scripts/import-public-pr.sh <PR_NUMBER>"
  exit 1
fi

echo "📥 Importing PR #$PR_NUMBER from $PUBLIC_REPO..."

# 1. Fetch PR info
echo "Fetching PR information..."
PR_INFO=$(gh pr view $PR_NUMBER --repo $PUBLIC_REPO --json title,author,headRefName)
PR_TITLE=$(echo $PR_INFO | jq -r '.title')
PR_AUTHOR=$(echo $PR_INFO | jq -r '.author.login')
PR_BRANCH=$(echo $PR_INFO | jq -r '.headRefName')

echo "  Title: $PR_TITLE"
echo "  Author: @$PR_AUTHOR"
echo "  Branch: $PR_BRANCH"

# 2. Create temporary directory
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# 3. Clone public repo and checkout PR
echo "Cloning public repository..."
gh repo clone $PUBLIC_REPO .
gh pr checkout $PR_NUMBER

# 4. Create patches
echo "Creating patches..."
PATCH_DIR=$(mktemp -d)
git format-patch origin/main..HEAD -o $PATCH_DIR

# 5. Return to private monorepo
cd - > /dev/null

# 6. Create branch
BRANCH_NAME="external-pr/$PR_NUMBER-$PR_BRANCH"
echo "Creating branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME main

# 7. Apply patches
echo "Applying patches to $PACKAGE_PATH..."
for patch in $PATCH_DIR/*.patch; do
  echo "  Applying: $(basename $patch)"
  git am --directory=$PACKAGE_PATH "$patch"
done

# 8. Cleanup
rm -rf $TEMP_DIR $PATCH_DIR

echo "✅ Done!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff main"
echo "  2. Test: cd $PACKAGE_PATH && pnpm dev"
echo "  3. Merge: git checkout main && git merge $BRANCH_NAME"
echo "  4. Push: git push origin main"
echo "  5. Close PR: gh pr close $PR_NUMBER --repo $PUBLIC_REPO --comment 'Merged! Thanks!'"
```

Make it executable:
```bash
chmod +x scripts/import-public-pr.sh
```

Usage:
```bash
./scripts/import-public-pr.sh 42
```

---

## Best Practices

1. **Always Review First**: Review PRs thoroughly in the public repo before importing
2. **Test Thoroughly**: Test in both repos before merging
3. **Credit Contributors**: Always add `Co-authored-by` in commits
4. **Communicate Clearly**: Explain the process to contributors
5. **Keep PRs Small**: Encourage small, focused PRs for easier integration
6. **Document Decisions**: Comment on PRs explaining merge decisions

---

## Troubleshooting

### Path Conflicts

```bash
# If cherry-pick fails due to paths:
git cherry-pick --abort

# Use format-patch + git am instead:
git format-patch <commit-range>
git am --directory=packages/carousel-circular-3d *.patch
```

### Merge Conflicts

```bash
# Resolve conflicts manually
git status
# Edit conflicting files
git add .
git cherry-pick --continue

# Or abort and ask contributor to rebase
git cherry-pick --abort
```

### Commit Author Preservation

```bash
# Ensure original author is preserved
git am --committer-date-is-author-date

# Or manually set author:
git commit --amend --author="Original Author <email@example.com>"
```

---

## Summary

**Best Approach for Your Setup:**

1. ✅ **Contributors submit PRs to public repo** (they don't need access to private monorepo)
2. ✅ **You review PRs in public repo** (GitHub UI, CI checks)
3. ✅ **Use `git format-patch` + `git am`** to import to private repo
4. ✅ **Test and merge in private repo**
5. ✅ **Auto-sync pushes back to public repo**
6. ✅ **Close public PR with thanks and commit reference**

This gives you full control while keeping the contribution process simple for external developers!
