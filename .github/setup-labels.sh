#!/bin/bash

# GitHub Labels Setup Script for carousel-circular-3d
# This script creates and manages labels for better issue organization

REPO="ddevkim/carousel-circular-3d"

echo "🏷️  Setting up GitHub labels for $REPO..."

# Function to create or update a label
create_label() {
  local name=$1
  local color=$2
  local description=$3

  gh label create "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null || \
  gh label edit "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null
}

# Type labels (what kind of issue/PR)
echo "📋 Creating type labels..."
create_label "bug" "d73a4a" "Something isn't working"
create_label "enhancement" "a2eeef" "New feature or request"
create_label "documentation" "0075ca" "Improvements or additions to documentation"
create_label "question" "d876e3" "Further information is requested"
create_label "performance" "f9d0c4" "Performance improvements"
create_label "refactor" "fbca04" "Code refactoring"

# Priority labels
echo "⚡ Creating priority labels..."
create_label "priority: critical" "b60205" "Critical priority - needs immediate attention"
create_label "priority: high" "d93f0b" "High priority"
create_label "priority: medium" "fbca04" "Medium priority"
create_label "priority: low" "0e8a16" "Low priority"

# Status labels
echo "🔄 Creating status labels..."
create_label "needs-triage" "ededed" "Needs initial review and categorization"
create_label "needs-reproduction" "fef2c0" "Needs a minimal reproduction to proceed"
create_label "needs-investigation" "f9d0c4" "Requires further investigation"
create_label "in-progress" "c5def5" "Currently being worked on"
create_label "awaiting-response" "fef2c0" "Waiting for response from author"
create_label "ready-for-review" "0e8a16" "Ready for maintainer review"

# Component labels (which part of the codebase)
echo "🔧 Creating component labels..."
create_label "component: carousel" "bfdadc" "Related to main carousel component"
create_label "component: lightbox" "bfdadc" "Related to lightbox functionality"
create_label "component: hooks" "bfdadc" "Related to React hooks"
create_label "component: types" "bfdadc" "Related to TypeScript types"

# Platform labels
echo "💻 Creating platform labels..."
create_label "browser: chrome" "e99695" "Specific to Chrome browser"
create_label "browser: firefox" "e99695" "Specific to Firefox browser"
create_label "browser: safari" "e99695" "Specific to Safari browser"
create_label "browser: edge" "e99695" "Specific to Edge browser"
create_label "device: mobile" "e99695" "Specific to mobile devices"
create_label "device: desktop" "e99695" "Specific to desktop devices"

# Special labels
echo "⭐ Creating special labels..."
create_label "good-first-issue" "7057ff" "Good for newcomers"
create_label "help-wanted" "008672" "Extra attention is needed"
create_label "breaking-change" "b60205" "Introduces breaking changes"
create_label "duplicate" "cfd3d7" "This issue or PR already exists"
create_label "wontfix" "ffffff" "This will not be worked on"
create_label "invalid" "e4e669" "This doesn't seem right"

# Version labels
echo "🔖 Creating version labels..."
create_label "v1.x" "0052cc" "Related to version 1.x"
create_label "v2.x" "0052cc" "Related to version 2.x"

# Size labels (for PRs)
echo "📏 Creating size labels..."
create_label "size: XS" "3cbf00" "Extra small PR (1-10 lines)"
create_label "size: S" "5d9801" "Small PR (11-50 lines)"
create_label "size: M" "7f6f01" "Medium PR (51-200 lines)"
create_label "size: L" "a14501" "Large PR (201-500 lines)"
create_label "size: XL" "c21b01" "Extra large PR (500+ lines)"

echo "✅ Labels setup complete!"
echo ""
echo "📝 To use these labels:"
echo "   - Apply 'needs-triage' to new issues automatically (via templates)"
echo "   - Use priority labels to organize work"
echo "   - Tag PRs with appropriate size and component labels"
echo "   - Mark good first issues for new contributors"
