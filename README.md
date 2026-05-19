# 📦 Mercadinho Connect — Zap Ofertas

Plataforma de ofertas para mercados locais, conectando estabelecimentos e consumidores via WhatsApp.

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend/Banco:** Supabase (PostgreSQL + Auth + Realtime)
- **Mensageria:** Integração com WhatsApp
- **Testes:** E2E com Playwright
- **CI/CD:** GitHub Actions
- **Containerização:** Docker

## 📋 Sobre o Projeto
Mercadinho Connect é uma plataforma que permite que mercados e mercadinhos locais publiquem ofertas e promoções, alcançando clientes diretamente pelo WhatsApp. Inclui sistema de webhooks para recebimento e envio de mensagens dinâmicas.

## 🚀 Como Rodar

### Desenvolvimento
```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

### Com Docker
```bash
docker-compose up -d
```

## 📁 Estrutura
```
mercadinho-connect/
├── src/                    # Código fonte
├── supabase/migrations/    # Migrações do banco
├── e2e/                    # Testes end-to-end
├── webhook-server/         # Servidor de webhooks
├── public/                 # Assets estáticos
├── .github/workflows/      # CI/CD
├── Dockerfile
└── docker-compose.yml
```

## 📚 Documentação Adicional
- `PRD.md` — Product Requirements Document
- `IMPLEMENTATION_SUMMARY.md` — Resumo da implementação
- `DEVOPS_HANDOFF.md` — Guia de handoff DevOps
- `AUTOMATION.md` — Documentação de automação

## 🧪 Testes
```bash
# E2E
npm run test:e2e
```

## 📝 Licença
MIT
