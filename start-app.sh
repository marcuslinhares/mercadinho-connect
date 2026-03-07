#!/bin/bash
# Mercadinho Connect - App Starter
# Run in background: nohup ./start-app.sh &

cd /home/administrator/.openclaw/workspace/mercadinho-connect

export NEXT_PUBLIC_SUPABASE_URL="https://kuzxpdyoqxjirxmrdtmi.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1enhwZHlvcXhqaXJ4bXJkdG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzczNTEsImV4cCI6MjA4NzM1MzM1MX0.MEX8fotfm_BlWyc7YYuPo_uKqotXCzrCTWFfWRXVbNM"
export NODE_ENV="production"
export PORT=3000

npm start
