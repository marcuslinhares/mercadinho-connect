# 📦 Mercadinho Connect — Zap Ofertas

> Plataforma de ofertas para mercados locais, conectando estabelecimentos e consumidores via WhatsApp com sistema de boost pago e catálogo inteligente.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-FFC107?logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Arquitetura](#-arquitetura)
- [Como Rodar](#-como-rodar)
- [API de Webhooks](#-api-de-webhooks)
- [Testes](#-testes)
- [CI/CD](#-cicd)

---

## 🎯 Sobre

O **Mercadinho Connect** permite que mercados e mercadinhos locais publiquem ofertas e promoções digitalmente, alcançando clientes diretamente pelo WhatsApp. O sistema conta com:

- **Catálogo de produtos** com busca e filtros por categoria
- **Sistema de boost pago** — estabelecimentos pagam para destacar ofertas (Stripe + Mercado Pago)
- **Integração WhatsApp** — notificações e compartilhamento de ofertas
- **Painel administrativo** — gestão de produtos, pedidos e métricas

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🏪 **Catálogo de Ofertas** | Produtos com busca, filtros e categorias |
| ⭐ **Sistema de Boost** | Destaque pago via Stripe e Mercado Pago |
| 💬 **Integração WhatsApp** | Compartilhamento e notificações automáticas |
| 👑 **Painel Admin** | Gestão de produtos, pedidos e métricas |
| 🔄 **Webhooks** | Comunicação em tempo real com serviços externos |
| 📊 **Métricas** | Visualização de desempenho das ofertas |

### Sistema de Boost

O sistema de boost permite que estabelecimentos paguem para destacar suas ofertas:

1. Estabelecimento escolhe uma oferta para impulsionar
2. Pagamento processado via **Stripe** (cartão internacional) ou **Mercado Pago** (Pix)
3. Oferta aparece em destaque por período determinado
4. Métricas de visualização disponíveis no dashboard

---

## 🛠️ Tech Stack

| Categoria | Tecnologias |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend/Banco** | Supabase (PostgreSQL + Auth + Realtime) |
| **Pagamentos** | Stripe (global) + Mercado Pago (Pix/Brasil) |
| **Mensageria** | WhatsApp API com webhooks |
| **Testes** | Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Container** | Docker + Docker Compose |

---

## 🏗️ Arquitetura

```
mercadinho-connect/
├── src/                    # Código fonte Next.js (App Router)
│   ├── app/                # Páginas e layouts
│   │   ├── api/            # API routes (webhooks, pagamentos)
│   │   ├── (auth)/         # Páginas autenticadas
│   │   └── (public)/       # Páginas públicas
│   ├── components/         # Componentes React
│   ├── lib/                # Utilitários e configurações
│   └── types/              # Typescript types
├── supabase/
│   └── migrations/         # Migrações do banco PostgreSQL
├── webhook-server/         # Servidor para webhooks externos
├── e2e/                    # Testes end-to-end Playwright
├── public/                 # Assets estáticos
├── .github/workflows/      # CI/CD pipelines
├── Dockerfile              # Multi-stage build
└── docker-compose.yml
```

---

## 🚀 Como Rodar

### Desenvolvimento

```bash
# Clone e instale
git clone https://github.com/marcuslinhares/mercadinho-connect.git
cd mercadinho-connect
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase + Stripe + Mercado Pago

# Inicie o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

### Docker (produção)

```bash
docker-compose up -d
```

### Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima Supabase |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret Stripe |
| `MERCADO_PAGO_ACCESS_TOKEN` | Access token Mercado Pago |
| `WHATSAPP_API_KEY` | Chave da API WhatsApp |

---

## 🔌 API de Webhooks

| Rota | Descrição |
|---|---|
| `POST /api/webhooks/stripe` | Eventos de pagamento Stripe |
| `POST /api/webhooks/mercadopago` | Notificações de pagamento Mercado Pago |
| `POST /api/webhooks/whatsapp` | Mensagens recebidas via WhatsApp |

---

## 🧪 Testes

```bash
# Testes E2E com Playwright
npm run test:e2e

# Com navegador visível
npx playwright test --headed
```

---

## 🔄 CI/CD

Pipeline GitHub Actions automatizado:

1. **Lint** — ESLint + Prettier
2. **Test** — Playwright E2E
3. **Build** — Next.js build
4. **Docker** — Multi-stage build e push
5. **Deploy** — Automático na VPS

---

## 📄 Licença

MIT © Marcus Linhares
