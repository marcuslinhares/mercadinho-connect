# 🤖 Mercadinho Connect - Automated CI/PR Pipeline

## Visão Geral

Sistema automático de 3 agents que trabalham em conjunto:

```
GitHub Push
    ↓
[CI Runs]
    ├─ Falha? → ci-fixer spawned
    │          ↓
    │       Branch + Commita fix
    │          ↓
    │       Abre PR
    │          ↓
    │       [CI Roda Novamente]
    │          ├─ Falha? → ci-fixer adiciona commits à PR
    │          └─ Passa? → Notifica pr-merger
    │
    └─ Passa? → Notifica pr-merger
              ↓
           [pr-merger Analisa]
              ├─ Seguro? → Faz merge (squash)
              └─ Dúvida? → Avisa Marcus
```

## 🔧 ci-fixer Agent

**O quê**: Detecta e corrige erros de CI automaticamente

**Quando**: CI falha em qualquer branch

**Como**:
1. Recebe notificação da CI failure
2. Clona o repo
3. Analisa logs do erro
4. **Cria branch**: `ci-fix/run-{run_id}`
5. **Commita fix** nessa branch
6. **Abre PR** contra main
7. **Se PR falhar novamente**: adiciona commits à mesma PR

**Workflow**:
- `.github/workflows/ci.yml` dispara `/hooks/agent` no failure step
- `agentId: "ci-fixer"`
- Modelo: Claude Sonnet 4.6
- Feedback: Telegram

## 🔀 pr-merger Agent

**O quê**: Analisa e mergeia PRs com CI passing

**Quando**: PR tem CI verde e está pronta

**Checks de Segurança**:
- ✅ CI passou
- ✅ Branch matches pattern (`ci-fix/`, `fix/`)
- ✅ Diff é razoável (<500 linhas)
- ✅ Sem commits diretos na main

**Como**:
1. Recebe notificação de PR com CI passing
2. Revisa diff completo
3. Se tudo OK: faz merge (squash)
4. Se dúvida: avisa Marcus, deixa PR aberta
5. Notifica Marcus do resultado

**Workflow**:
- `.github/workflows/ci.yml` dispara `/hooks/agent` no success step (PR only)
- `agentId: "pr-merger"`
- Modelo: Claude Sonnet 4.6
- Feedback: Telegram
- **Nunca auto-merge sem revisar**

## 📋 Workflow Detalhado

### Cenário 1: CI Falha
```
1. Push → CI roda
2. Falha no step X
3. Workflow executa: "Wake Up Subagent on Failure"
4. Chama /hooks/agent com agentId=ci-fixer
5. ci-fixer:
   - Clona repo
   - Revisa logs
   - Identifica erro (lint, type, test, etc)
   - Cria branch ci-fix/run-{run_id}
   - Commita fix
   - Abre PR
6. PR CI roda
   - Se passa: pr-merger notificado
   - Se falha: ci-fixer adiciona commits à PR
```

### Cenário 2: PR com CI Passing
```
1. PR CI completa com sucesso
2. Workflow executa: "Notify PR Merger on Success"
3. Chama /hooks/agent com agentId=pr-merger
4. pr-merger:
   - Recebe info da PR
   - Revisa diff via gh pr diff
   - Valida safety checks
   - Se OK: faz merge (squash)
   - Se não: avisa Marcus
5. Notifica Marcus do resultado
```

## ⚡ Key Rules

### ❌ Nunca:
- ci-fixer committar na `main`
- pr-merger mergear sem revisar
- Mergear se CI falhar
- Mergear diffs muito grandes
- Auto-merge sem feedback a Marcus

### ✅ Sempre:
- Usar branches separadas
- Abrir PRs
- Revisar diffs
- Notificar Marcus
- Squash merge (mantém main limpa)

## 🚀 Testing

### Test CI Failure:
```bash
# Add intentional error
echo "badCode" > src/app/page.tsx
git commit -am "test: trigger ci failure"
git push origin main
# Watch: ci-fixer cria PR com fix
```

### Test PR Merge:
```bash
# Criar PR com fix
git checkout -b fix/test
echo "// fixed" > src/app/page.tsx
git commit -am "fix: test change"
git push origin fix/test
gh pr create --title "Test PR"
# CI roda, passa
# Watch: pr-merger analisa e mergeia
```

## 📊 Status Commands

```bash
# Ver agentes
openclaw agents list

# Ver sessões ativas
openclaw status

# Ver logs do gateway
openclaw logs --follow

# Ver PRs abertas
gh pr list

# Monitorar CI
gh run list --limit 5
```

## 🔗 Links

- **CI Workflow**: `.github/workflows/ci.yml`
- **ci-fixer Agent**: `/home/administrator/.openclaw/workspace-ci-fixer/`
- **pr-merger Agent**: `/home/administrator/.openclaw/workspace-pr-merger/`
- **OpenClaw Hooks**: `https://openclaw.marcuslinhares.com/hooks/agent`

## 👤 Agents

| Agent | Workspace | Role | Model |
|-------|-----------|------|-------|
| main | ~/.openclaw/workspace | Seu assistente pessoal | Default |
| ci-fixer | ~/.openclaw/workspace-ci-fixer | Auto-fix CI failures | Claude Sonnet 4.6 |
| pr-merger | ~/.openclaw/workspace-pr-merger | Safe PR merging | Claude Sonnet 4.6 |

---

**Próximas melhorias**:
- [ ] Auto-approve PRs de ci-fixer (com certos critérios)
- [ ] Slack/Discord notifications alternativas
- [ ] Dashboard visual de PR status
- [ ] Rollback automático se merge quebrar
