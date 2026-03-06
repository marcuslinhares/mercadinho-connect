#!/bin/bash
# Mercadinho Connect Manager

case "$1" in
  start)
    echo "🚀 Iniciando Mercadinho Connect..."
    nohup /home/administrator/.openclaw/workspace/mercadinho-connect/start-app.sh > /tmp/app.log 2>&1 &
    sleep 3
    if lsof -i :3000 > /dev/null; then
      echo "✅ App rodando na porta 3000"
    else
      echo "❌ Falha ao iniciar app"
      tail -20 /tmp/app.log
    fi
    ;;
  stop)
    echo "🛑 Parando Mercadinho Connect..."
    killall node 2>/dev/null && echo "✅ Parado"
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    if lsof -i :3000 > /dev/null; then
      echo "✅ App rodando (porta 3000)"
      ps aux | grep "node .next" | grep -v grep
    else
      echo "❌ App não está rodando"
    fi
    ;;
  logs)
    tail -f /tmp/app.log
    ;;
  *)
    echo "Uso: mercadinho-connect {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
