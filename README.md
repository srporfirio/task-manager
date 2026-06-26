# Task Manager (Diário de Atividades)

Monorepo com a versão HTML legada (offline) e o app React com Supabase.

## Estrutura

```
├── diario-task-dashboard-csv.html   # versão local (IndexedDB)
├── apps/web/                        # React + Vite + Supabase Auth
├── packages/shared/                 # regras compartilhadas (status, semana)
└── supabase/migrations/             # schema Postgres
```

## Setup

1. Copie `apps/web/.env.example` para `apps/web/.env.local` e preencha `VITE_SUPABASE_ANON_KEY`.
2. No Supabase: Authentication → URL Configuration
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/auth/callback`
3. Ative Google OAuth em Authentication → Providers.

## Comandos

```bash
npm install
npm test          # testes do pacote shared
npm run dev       # http://localhost:5173
npm run build
```

## Fluxo atual (Sprint 2)

- Login com Google
- Onboarding com import opcional do IndexedDB
- Home com contagem de temas na nuvem
- Link para `/legacy/index.html` (cópia do HTML offline)

Próximo passo: Dashboard React com `HybridAdapter` e feature flags.
