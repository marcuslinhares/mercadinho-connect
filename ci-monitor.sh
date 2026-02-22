#!/bin/bash

# CI Alert Monitor - Fica observando /tmp/ci-alerts.jsonl
# Quando nova linha aparece, envia mensagem pro agente via message tool

ALERT_FILE="/tmp/ci-alerts.jsonl"
TELEGRAM_CHAT="7727702465"

# Cria arquivo se não existir
touch "$ALERT_FILE"

echo "🔔 Monitorando alertas de CI em $ALERT_FILE..."

# tail -f: monitora arquivo em tempo real
tail -f "$ALERT_FILE" | while read -r line; do
  echo "[$(date)] Novo alerta detectado!"
  
  # Parse JSON (usando python pra facilitar)
  WORKFLOW=$(echo "$line" | python3 -c "import sys, json; print(json.load(sys.stdin).get('workflow', 'N/A'))")
  BRANCH=$(echo "$line" | python3 -c "import sys, json; print(json.load(sys.stdin).get('branch', 'N/A'))")
  URL=$(echo "$line" | python3 -c "import sys, json; print(json.load(sys.stdin).get('url', 'N/A'))")
  CONCLUSION=$(echo "$line" | python3 -c "import sys, json; print(json.load(sys.stdin).get('conclusion', 'N/A'))")
  
  # Monta mensagem
  MESSAGE="🚨 *CI FALHOU!*

📦 Workflow: ${WORKFLOW}
🌿 Branch: ${BRANCH}
❌ Status: ${CONCLUSION}

🔗 [Ver Logs](${URL})

Iniciando análise e correções..."

  # Envia via OpenClaw
  openclaw message send --channel telegram --target "$TELEGRAM_CHAT" --message "$MESSAGE"
  
  echo "[$(date)] Notificação enviada!"
done
