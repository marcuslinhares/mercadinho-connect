import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import crypto from 'crypto';

const app = express();
const PORT = 3001;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'change-me-in-production';
const TELEGRAM_CHAT_ID = '7727702465';

// Middleware para verificar assinatura do GitHub
function verifyGitHubSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).send('No signature');
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }

  next();
}

app.use(bodyParser.json());

// Endpoint do webhook
app.post('/webhook/github', verifyGitHubSignature, (req, res) => {
  const event = req.headers['x-github-event'];

  // Só nos interessa workflow_run (CI completou)
  if (event !== 'workflow_run') {
    return res.status(200).send('Event ignored');
  }

  const { action, workflow_run } = req.body;

  // action = "completed" é o que queremos
  if (action !== 'completed') {
    return res.status(200).send('Not completed yet');
  }

  const { conclusion, html_url, head_branch, name } = workflow_run;

  console.log(`[Webhook] CI ${conclusion} na branch ${head_branch}`);

  // Se falhou, notifica via Telegram
  if (conclusion !== 'success') {
    const message = `🚨 *CI FALHOU!*\n\n` +
      `📦 Workflow: ${name}\n` +
      `🌿 Branch: ${head_branch}\n` +
      `❌ Status: ${conclusion}\n\n` +
      `🔗 [Ver Logs](${html_url})`;

    // Envia mensagem via OpenClaw CLI
    exec(
      `openclaw message send --channel telegram --target ${TELEGRAM_CHAT_ID} "${message.replace(/"/g, '\\"')}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`[Webhook] Erro ao enviar mensagem: ${error.message}`);
        } else {
          console.log(`[Webhook] Notificação enviada!`);
        }
      }
    );
  } else {
    console.log(`[Webhook] CI passou, nenhuma notificação necessária.`);
  }

  res.status(200).send('OK');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ci-webhook-server' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🎣 Webhook server rodando em http://127.0.0.1:${PORT}`);
});
