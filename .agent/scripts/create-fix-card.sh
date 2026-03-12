#!/bin/bash
# Script: Cria um card automático no INBOX_DEVS.md quando CI falha
# Acionado por: GitHub Actions CI workflow
# Usado por: Dev Frontend/Backend para rastrear PRs que precisam de fixes

set -e

# Variáveis do GitHub Actions
BRANCH="$1"
PR_NUMBER="$2"
RUN_ID="$3"
REPO="$4"

if [[ -z "$BRANCH" || -z "$PR_NUMBER" || -z "$RUN_ID" || -z "$REPO" ]]; then
  echo "❌ Usage: create-fix-card.sh <branch> <pr_number> <run_id> <repo>"
  exit 1
fi

# Determine team based on branch name (US-1.x = Frontend, US-2.x = Backend)
if echo "$BRANCH" | grep -q "US-1"; then
  TEAM="Frontend"
elif echo "$BRANCH" | grep -q "US-2"; then
  TEAM="Backend"
else
  TEAM="Dev"
fi

# Create card content
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
CARD_ID="[FIX-PR-${PR_NUMBER}]"
LOGS_URL="https://github.com/${REPO}/actions/runs/${RUN_ID}"

CARD="$CARD_ID **${TEAM} CI Fix Required**
- **PR**: #${PR_NUMBER}
- **Branch**: ${BRANCH}
- **Action**: Review CI logs → Fix code → git push (CI auto-retests)
- **Logs**: ${LOGS_URL}
- **Status**: OPEN
- **Created**: ${TIMESTAMP}

"

# Get the actual workspace path (we're in mercadinho-connect/.agent/scripts/)
WORKSPACE_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
INBOX_FILE="${WORKSPACE_ROOT}/INBOX_DEVS.md"

echo "📝 Creating card in: $INBOX_FILE"
echo "🔧 Card details:"
echo "$CARD"

# Ensure INBOX_DEVS.md exists with header
if [ ! -f "$INBOX_FILE" ]; then
  cat > "$INBOX_FILE" << 'EOF'
# 📋 INBOX_DEVS.md — Development Tasks

**Last Updated**: $(date -u '+%Y-%m-%d %H:%M UTC')

## Active Cards (OPEN)

EOF
  echo "✅ Created $INBOX_FILE with header"
fi

# Append card to INBOX_DEVS.md
{
  echo ""
  echo "### $CARD_ID"
  echo "- **Team**: ${TEAM}"
  echo "- **PR**: #${PR_NUMBER}"
  echo "- **Branch**: ${BRANCH}"
  echo "- **Action**: Review CI logs → Fix code → git push"
  echo "- **Logs**: ${LOGS_URL}"
  echo "- **Status**: OPEN"
  echo "- **Created**: ${TIMESTAMP}"
  echo ""
} >> "$INBOX_FILE"

echo ""
echo "✅ Card successfully added to INBOX_DEVS.md"
echo "📌 Dev team will pick this up from their INBOX monitor"
