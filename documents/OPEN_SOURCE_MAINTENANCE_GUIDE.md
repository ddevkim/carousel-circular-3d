# Open Source Maintenance Guide

> Best practices for maintaining @ddevkim/carousel-circular-3d as a successful open source project

## Table of Contents

- [Overview](#overview)
- [Issue Management](#issue-management)
- [Pull Request Workflow](#pull-request-workflow)
- [Release Management](#release-management)
- [Community Engagement](#community-engagement)
- [Project Health Metrics](#project-health-metrics)
- [Best Practices](#best-practices)

## Overview

This guide provides best practices for maintaining carousel-circular-3d as a thriving open source project. It covers issue handling, PR reviews, releases, and community building.

### Project Structure

```
carousel-circular-3d/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── question.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── setup-labels.sh       # Label management script
├── CONTRIBUTING.md           # Contribution guidelines
├── CODE_OF_CONDUCT.md       # Community standards
└── README.md                # Main documentation
```

## Issue Management

### Triage Process

When a new issue is created:

1. **Initial Review** (Within 24-48 hours)
   - Add appropriate labels (type, priority, component)
   - Ask for clarification if needed
   - Remove `needs-triage` label once categorized

2. **Categorization**
   ```bash
   # Bug reports
   - Verify reproducibility
   - Add `needs-reproduction` if cannot reproduce
   - Add priority label based on severity
   - Link to related issues if duplicate

   # Feature requests
   - Assess value vs. complexity
   - Request community feedback
   - Add to roadmap if accepted
   - Explain reasoning if declined

   # Questions
   - Provide clear answers
   - Update documentation if frequently asked
   - Convert to documentation issue if needed
   ```

3. **Priority Assignment**
   - `priority: critical` - Security issues, data loss, total breakage
   - `priority: high` - Major functionality broken, performance regression
   - `priority: medium` - Minor bugs, quality of life improvements
   - `priority: low` - Nice to have, edge cases

### Issue Response Templates

#### Bug Needs Reproduction

```markdown
Thank you for reporting this issue! To help us investigate, could you please provide:

1. A minimal reproduction repository or CodeSandbox link
2. Exact steps to reproduce
3. Expected vs actual behavior
4. Screenshots or console errors

This will help us fix the issue faster. Thanks!
```

#### Feature Request - Accepted

```markdown
Great idea! This aligns well with the project goals.

I'll add this to the roadmap. If you'd like to contribute, please check our [Contributing Guide](CONTRIBUTING.md) and feel free to ask questions.

Estimated timeline: [version/timeframe]
```

#### Feature Request - Declined

```markdown
Thank you for the suggestion! After consideration, I've decided not to pursue this because:

- [Reason 1: e.g., out of scope, complexity vs. value]
- [Reason 2: e.g., alternative solutions available]

However, you can achieve similar results by [workaround/alternative].

Thanks for your interest in improving the library!
```

#### Question Answered

```markdown
Great question! [Answer]

Does this help? Feel free to ask if you need more clarification.

Also, I'll update the documentation to make this clearer for others.
```

### Issue Workflow

```
New Issue
   ↓
[needs-triage] → Initial review
   ↓
Categorized (bug/enhancement/question)
   ↓
Priority assigned
   ↓
[in-progress] → Work started
   ↓
[awaiting-response] → Need user input
   ↓
Resolved & Closed
```

## Pull Request Workflow

### Review Process

1. **Automated Checks**
   - CI must pass (lint, type-check, build)
   - All template sections filled
   - Conventional commits format

2. **Code Review Checklist**
   ```markdown
   - [ ] Code follows style guide
   - [ ] TypeScript types are correct
   - [ ] No breaking changes (or properly documented)
   - [ ] Performance impact assessed
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Changelog entry added
   - [ ] Works in playground
   ```

3. **Review Feedback**
   - Be kind and constructive
   - Explain the "why" behind suggestions
   - Praise good work
   - Use GitHub suggestions feature

### PR Response Templates

#### Requesting Changes

```markdown
Thanks for the PR! The approach looks good, but I have a few suggestions:

1. **[Issue]**: [Explanation]
   **Suggestion**: [How to fix]

2. **[Issue]**: [Explanation]
   **Suggestion**: [How to fix]

Let me know if anything is unclear!
```

#### Approving

```markdown
Excellent work! 🎉

The implementation is clean, well-tested, and follows our guidelines. I'll merge this once CI passes.

Thank you for your contribution!
```

#### Closing (Not Aligned)

```markdown
Thank you for taking the time to submit this PR!

Unfortunately, I'm going to close this because [reason]. However, I really appreciate your effort.

If you'd like to discuss alternative approaches, feel free to open an issue first next time.

Thanks again!
```

### Merge Strategy

- **Squash and merge** for most PRs (keeps history clean)
- **Merge commit** for major features (preserves detailed history)
- **Rebase** for small fixes from maintainers

## Release Management

### Versioning (Semantic Versioning)

```
MAJOR.MINOR.PATCH

- MAJOR: Breaking changes (v1.0.0 → v2.0.0)
- MINOR: New features (v1.0.0 → v1.1.0)
- PATCH: Bug fixes (v1.0.0 → v1.0.1)
```

### Release Process

1. **Prepare Release**
   ```bash
   # Add changeset
   pnpm changeset:add

   # Select change type (major/minor/patch)
   # Write summary of changes
   ```

2. **Version Bump**
   ```bash
   # Update version and CHANGELOG
   pnpm changeset:version

   # Review CHANGELOG.md
   # Commit version changes
   ```

3. **Publish**
   ```bash
   # Build and publish
   pnpm release

   # This runs: build → npm publish
   ```

4. **Create GitHub Release**
   ```bash
   # Tag is created automatically by changesets
   # Create GitHub release from tag
   gh release create v1.2.0 --generate-notes
   ```

### Release Checklist

```markdown
- [ ] All tests passing
- [ ] CHANGELOG updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if breaking)
- [ ] Demo/playground updated
- [ ] Documentation updated
- [ ] Version bumped correctly
- [ ] Git tag created
- [ ] npm published
- [ ] GitHub release created
- [ ] Announcement made (if major)
```

### Release Notes Template

```markdown
## 🎉 v1.2.0

### ✨ Features

- Add vertical carousel orientation support (#123)
- Improve keyboard navigation with Tab support (#124)

### 🐛 Bug Fixes

- Fix infinite loop in autoRotate (#125)
- Resolve memory leak in event listeners (#126)

### 📝 Documentation

- Add TypeScript examples to README
- Update API reference

### 🔧 Internal

- Migrate to tsup for faster builds
- Add automated visual regression tests

### 💥 Breaking Changes

None

### 📦 Installation

\`\`\`bash
npm install @ddevkim/carousel-circular-3d@1.2.0
\`\`\`

**Full Changelog**: https://github.com/ddevkim/carousel-circular-3d/compare/v1.1.0...v1.2.0
```

## Community Engagement

### Response Time Goals

- **Critical bugs**: Within 24 hours
- **Other issues**: Within 48 hours
- **Pull requests**: Initial review within 72 hours
- **Questions**: Within 48 hours

### Communication Style

- **Be welcoming**: Thank contributors for their time
- **Be patient**: Not everyone has your expertise
- **Be clear**: Explain technical decisions simply
- **Be respectful**: Follow Code of Conduct
- **Be consistent**: Treat all contributors equally

### Encouraging Contributions

1. **Mark good first issues**
   ```bash
   gh issue edit 123 --add-label "good-first-issue"
   ```

2. **Provide guidance**
   ```markdown
   This would be a good first contribution! Here's how to approach it:

   1. [Step 1]
   2. [Step 2]
   3. [Step 3]

   Feel free to ask questions in this issue!
   ```

3. **Recognize contributors**
   - Thank them in PR descriptions
   - Mention them in release notes
   - Update contributors list

### Dealing with Difficult Situations

#### Spam or Low-Quality Issues

```markdown
Thank you for the report. To help us assist you, please use our issue template and provide:

- Minimal reproduction
- Expected vs actual behavior
- Environment details

I'm closing this for now, but please reopen with more details.
```

#### Demanding or Rude Behavior

```markdown
I appreciate your passion, but please remember our [Code of Conduct](CODE_OF_CONDUCT.md).

I'm happy to help, but I need you to:
- Be respectful in communication
- Provide necessary information
- Understand this is maintained in free time

Let's work together constructively.
```

#### Persistent Invalid Requests

```markdown
As I explained earlier, [reason]. I understand your perspective, but this decision is final.

I'm going to lock this conversation to prevent further repetition. If you have new information, please open a new issue.

Thank you for understanding.
```

## Project Health Metrics

### Key Metrics to Track

1. **Response Time**
   - Average time to first response
   - Average time to close issues

2. **Issue Health**
   - Open vs. closed ratio
   - Age of oldest open issues
   - Issue closure rate

3. **PR Health**
   - Average time to merge
   - PR acceptance rate
   - Number of active contributors

4. **Community Growth**
   - GitHub stars
   - npm downloads
   - Active contributors
   - Issue/PR engagement

### Monthly Review

Review these metrics monthly:

```markdown
## Monthly Health Check (YYYY-MM)

### Issues
- Opened: X
- Closed: Y
- Average response time: Z hours
- Oldest open issue: #N (X days)

### Pull Requests
- Opened: X
- Merged: Y
- Average time to merge: Z days

### Community
- New stars: +X (total: Y)
- npm downloads: X/month
- Active contributors: X

### Action Items
- [ ] Close stale issues
- [ ] Review oldest PRs
- [ ] Update documentation
- [ ] Plan next release
```

## Best Practices

### 1. Be Consistent

- Use labels consistently
- Follow response templates
- Maintain release schedule
- Keep documentation updated

### 2. Communicate Clearly

- Set expectations (response time, release cycle)
- Document decisions
- Explain "no" with reasoning
- Keep issue conversations focused

### 3. Automate When Possible

```yaml
# Example: Stale issue bot
- name: Close stale issues
  uses: actions/stale@v8
  with:
    days-before-stale: 60
    days-before-close: 7
    stale-issue-message: 'This issue has been inactive for 60 days...'
```

### 4. Protect Your Time

- Set boundaries (e.g., "I review PRs on weekends")
- Don't feel obligated to accept everything
- Take breaks when needed
- Say no to scope creep

### 5. Document Everything

- Add comments to complex code
- Update CHANGELOG for every release
- Document breaking changes
- Keep examples up-to-date

### 6. Test Thoroughly

- Require tests for new features
- Test on multiple browsers/devices
- Check performance impact
- Verify backwards compatibility

### 7. Grow the Community

- Thank contributors publicly
- Highlight good work
- Encourage discussions
- Make contributing easy

### 8. Plan Ahead

- Maintain a roadmap
- Plan major versions carefully
- Deprecate features gradually
- Communicate changes early

## Tools and Resources

### GitHub CLI Commands

```bash
# List open issues
gh issue list --state open

# View issue
gh issue view 123

# Close issue
gh issue close 123 --comment "Fixed in v1.2.0"

# List PRs
gh pr list

# Review PR
gh pr review 45 --approve

# Merge PR
gh pr merge 45 --squash

# Create release
gh release create v1.2.0 --generate-notes
```

### Useful GitHub Actions

- **Stale**: Close inactive issues/PRs
- **Label Sync**: Synchronize labels across repos
- **Release Drafter**: Auto-generate release notes
- **Dependabot**: Automate dependency updates
- **CodeQL**: Security analysis

### Monitoring Tools

- **npm trends**: Track download stats
- **GitHub Insights**: View traffic and engagement
- **Bundlephobia**: Monitor package size
- **Snyk**: Security scanning

## Success Indicators

Your open source project is healthy when:

- ✅ Issues get responded to within 48 hours
- ✅ PRs get reviewed within a week
- ✅ Documentation is comprehensive and up-to-date
- ✅ Contributors feel welcome and supported
- ✅ Release process is smooth and regular
- ✅ Community is growing steadily
- ✅ Code quality is maintained
- ✅ You enjoy maintaining it!

## Remember

> "Open source is a marathon, not a sprint. Consistency and kindness matter more than speed."

- **Quality > Quantity**: Better to do a few things well
- **Community > Code**: Happy contributors = better code
- **Sustainability > Burnout**: Take care of yourself
- **Progress > Perfection**: Iterate and improve

---

**Made with ❤️ for the open source community**
