#!/bin/bash

# Config
REPO_OWNER="marcuslinhares"
REPO_NAME="mercadinho-connect"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

# Verifica se tem gh CLI instalado (mais seguro)
if command -v gh &> /dev/null; then
  echo "🔍 Monitorando CI para branch: $BRANCH (via gh CLI)..."
  
  while true; do
    STATUS=$(gh run list --branch "$BRANCH" --limit 1 --json status --jq '.[0].status' 2>/dev/null)
    CONCLUSION=$(gh run list --branch "$BRANCH" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null)
    URL=$(gh run list --branch "$BRANCH" --limit 1 --json url --jq '.[0].url' 2>/dev/null)
    
    if [ -z "$STATUS" ]; then
      echo "⚠️  Nenhuma run encontrada ainda. Aguardando..."
      sleep 5
      continue
    fi
    
    if [ "$STATUS" == "completed" ]; then
      if [ "$CONCLUSION" == "success" ]; then
        echo "✅ CI PASSOU! Tudo verde."
        echo "🔗 $URL"
        exit 0
      else
        echo "❌ CI FALHOU! ($CONCLUSION)"
        echo "🔗 $URL"
        exit 1
      fi
    else
      echo "⏳ CI Rodando... ($STATUS)"
      sleep 10
    fi
  done
else
  # Fallback: usar curl com token de ambiente
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Erro: gh CLI não instalado e GITHUB_TOKEN não definido."
    echo "💡 Instale o gh CLI (https://cli.github.com/) ou exporte GITHUB_TOKEN"
    exit 1
  fi
  
  echo "🔍 Monitorando CI para branch: $BRANCH (via API)..."
  
  while true; do
    RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?per_page=1&branch=$BRANCH")
    
    STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['workflow_runs'][0]['status'])" 2>/dev/null)
    CONCLUSION=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['workflow_runs'][0]['conclusion'])" 2>/dev/null)
    URL=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['workflow_runs'][0]['html_url'])" 2>/dev/null)
    
    if [ -z "$STATUS" ]; then
      echo "⚠️  Nenhuma run encontrada ainda. Aguardando..."
      sleep 5
      continue
    fi
    
    if [ "$STATUS" == "completed" ]; then
      if [ "$CONCLUSION" == "success" ]; then
        echo "✅ CI PASSOU! Tudo verde."
        echo "🔗 $URL"
        exit 0
      else
        echo "❌ CI FALHOU! ($CONCLUSION)"
        echo "🔗 $URL"
        exit 1
      fi
    else
      echo "⏳ CI Rodando... ($STATUS)"
      sleep 10
    fi
  done
fi
