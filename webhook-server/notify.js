#!/usr/bin/env node

import { execSync } from 'child_process';

// Notifica via message tool do OpenClaw
const message = process.argv[2];

if (!message) {
  console.error('Usage: notify.js "<message>"');
  process.exit(1);
}

try {
  // Envia mensagem para o chat do Marcus via OpenClaw
  execSync(
    `su - administrator -c 'openclaw message send --channel telegram --target 7727702465 "${message.replace(/"/g, '\\"')}"'`,
    { stdio: 'inherit' }
  );
  console.log('[notify] Mensagem enviada!');
} catch (error) {
  console.error('[notify] Erro:', error.message);
  process.exit(1);
}
