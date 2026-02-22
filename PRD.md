# PRD: Mercadinho Connect (Zap Ofertas)

## 1. Declaração do Problema
Pequenos comerciantes (donos de mercadinho) perdem tempo significativo gerenciando manualmente o envio de ofertas para clientes no WhatsApp. O processo atual envolve tirar fotos, escrever descrições repetitivas e encaminhar mensagem por mensagem para clientes individuais e grupos, o que é tedioso, propenso a erros e desorganizado.

## 2. Público-Alvo
- **Primário:** Donos de mercadinhos, hortifrutis e padarias de bairro.
- **Secundário:** Funcionários responsáveis pelo atendimento/caixa que ajudam na divulgação.

## 3. Visão da Solução (Piloto Automático)
Uma aplicação web Mobile-First ("App de Bolso") que funciona como um **Hub de Ofertas Simplificado**. O dono tira a foto pelo celular, digita o preço e a descrição *uma única vez*, e o sistema gera um "Card de Oferta" profissional e permite o disparo para múltiplos contatos/grupos do WhatsApp com um clique (usando a API do WhatsApp ou link de compartilhamento inteligente).

## 4. User Stories (Histórias de Usuário)

### P0 - Crítico (MVP)
1.  **Cadastro de Produto Rápido:** "Como dono, quero tirar uma foto do produto e colocar preço/nome rapidamente, para não perder tempo criando artes no Canva."
2.  **Catálogo do Dia:** "Como dono, quero que essas ofertas gerem uma página web simples ('O que tem hoje'), para que eu possa mandar apenas UM link para o grupo em vez de 30 fotos seguidas (que lotam a memória do cliente)."
3.  **Botão 'Enviar para Zap':** "Como dono, quero clicar em um botão e já abrir meu WhatsApp com a mensagem pronta (Link + Texto chamativo) para encaminhar para minhas listas."

### P1 - Importante (V1.5)
4.  **Gestão de Clientes VIP:** "Como dono, quero marcar quais clientes preferem receber quais produtos (ex: 'avisa quando chegar picanha'), para não ser chato mandando tudo para todos."
5.  **Integração Automática (Bot):** "Como dono, quero conectar meu WhatsApp Web no sistema para que ele dispare as mensagens sozinho, sem eu precisar clicar em encaminhar."

## 5. Priorização (MoSCoW)

| Prioridade | Funcionalidade | Descrição |
| :--- | :--- | :--- |
| **MUST** | **Gerador de Vitrine Web** | Cria um link `mercadinho.app/ofertas-hoje` com os produtos cadastrados. Resolve o problema de "spam de fotos". |
| **MUST** | **Editor de Oferta** | Upload de foto + Input de Preço/Nome. |
| **SHOULD** | **Templates de Card** | Gerar uma imagem com preço "colado" na foto para parecer profissional. |
| **COULD** | **Disparo Automático** | Integração com Baileys/WhatsApp Web.js (Complexo para MVP, risco de banimento). |
| **WON'T** | **E-commerce Completo** | Carrinho de compras, pagamento online (foco é *divulgação*, não *venda* por enquanto). |

## 6. Sugestão Técnica (Pré-Aprovação)
- **Frontend:** Next.js (React) + Tailwind (para ser rápido e mobile-first).
- **Backend:** Supabase (Postgres + Auth + Storage de fotos) - Grátis e rápido.
- **WhatsApp:** Inicialmente usar a API oficial de links (`wa.me`) para evitar bloqueios. Automação (bot) fica para a fase 2.

---
**Status:** 🟡 Aguardando Aprovação do Stakeholder.
