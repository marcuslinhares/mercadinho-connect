import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import crypto from 'crypto';

const app = express();
const PORT = 3001;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'mcc_webhook_secret_2026';
const OPENCLAW_PATH = '/home/administrator/.npm-global/bin/openclaw';
const MARS_SESSION_ID = '3d9cfafa-1300-4e4c-930e-3596874e2617';

// Captura raw body antes do bodyParser
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware para verificar assinatura do GitHub
function verifyGitHubSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    console.log('[Webhook] ⚠️ Requisição sem assinatura');
    return res.status(401).send('No signature');
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

  if (signature !== digest) {
    console.log('[Webhook] ❌ Assinatura inválida');
    console.log('[Webhook] Esperado:', digest);
    console.log('[Webhook] Recebido:', signature);
    return res.status(401).send('Invalid signature');
  }

  next();
}

// Endpoint do webhook
app.post('/webhook/github', (req, res) => {  // Temporariamente sem verificação de assinatura
  const event = req.headers['x-github-event'];

  // Só nos interessa workflow_run (CI completou)
  if (event !== 'workflow_run') {
    console.log(`[Webhook] Evento ${event} ignorado`);
    return res.status(200).send('Event ignored');
  }

  const { action, workflow_run } = req.body;

  // action = "completed" é o que queremos
  if (action !== 'completed') {
    console.log(`[Webhook] Action ${action} ignorado (aguardando 'completed')`);
    return res.status(200).send('Not completed yet');
  }

  const { conclusion, html_url, head_branch, name, head_sha } = workflow_run;
  const commitShort = head_sha?.substring(0, 7) || 'unknown';

  console.log(`[Webhook] 🔔 CI ${conclusion} na branch ${head_branch} (workflow: ${name})`);

  // Se falhou, acorda Mars via openclaw agent
  if (conclusion !== 'success') {
    console.log('[Webhook] 🚨 CI FALHOU! Acordando Mars...');

    const alertMessage = `[CI-ALERT] CI falhou!

📦 Workflow: ${name}
🌿 Branch: ${head_branch}
📝 Commit: ${commitShort}
❌ Status: ${conclusion}
🔗 Logs: ${html_url}

Por favor, spawne um subagent para analisar os logs, identificar as falhas (Type Coverage, SEO, UX, etc), corrigir o código e fazer push.`;

    const command = `${OPENCLAW_PATH} agent --session-id ${MARS_SESSION_ID} --message "${alertMessage.replace(/"/g, '\\"')}"`;
    
    console.log('[Webhook] Executando:', command.substring(0, 100) + '...');

    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Webhook] ❌ Erro ao acordar Mars: ${error.message}`);
        if (stderr) console.error('[Webhook] stderr:', stderr);
      } else {
        console.log(`[Webhook] ✅ Mars acordado com sucesso!`);
        if (stdout) console.log('[Webhook] stdout:', stdout.substring(0, 200));
      }
    });

    res.status(200).send('Alert sent to Mars');
  } else {
    console.log(`[Webhook] ✅ CI passou, nada a fazer.`);
    res.status(200).send('CI passed, no action needed');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ci-webhook-server',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🎣 Webhook server rodando em http://127.0.0.1:${PORT}`);
  console.log(`🤖 Sessão Mars: ${MARS_SESSION_ID}`);
  console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
});
