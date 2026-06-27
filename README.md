# Task Manager (Diário de Atividades)

Monorepo com o app React (Supabase) e a versão HTML offline arquivada.

## Estrutura

```
├── legacy/                          # versão local arquivada (IndexedDB, sem login)
├── apps/web/                        # React + Vite + Supabase Auth
├── apps/mobile/                     # React Native (Expo) + Android APK
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

## App online

- Login com Google
- Dashboard, Week Planner, Theme View e Week View
- Dados sincronizados no Supabase

## App mobile (Android)

```bash
npm run mobile          # Expo dev server
npm run mobile:apk      # APK via EAS (nuvem)
```

Ver `apps/mobile/README.md` para Android Studio, JDK e build local.

A versão offline antiga está em `legacy/` apenas para consulta histórica.
