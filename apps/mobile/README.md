# Diário de Atividades — Mobile (Expo / React Native)

App Android do monorepo. Usa `@task-manager/shared` e o mesmo Supabase da web.

## Pré-requisitos

### Sempre necessário
- Node.js 20+
- Conta em [expo.dev](https://expo.dev) (pode ser login com Google)

### Autenticar (escolha uma)

**A — Navegador (conta Google)** no terminal:

```bash
cd apps/mobile
npx expo login --browser
```

**B — Token de acesso** (configura no projeto):

1. Abra https://expo.dev/settings/access-tokens
2. **Create token** → copie o valor (só aparece uma vez)
3. Em `apps/mobile/.env.local`:

```
EXPO_TOKEN=seu_token_aqui
```

O script `npm run mobile:apk:setup` lê esse arquivo automaticamente.

### Build local de APK (opcional)
- [Android Studio](https://developer.android.com/studio) (SDK 34+)
- **JDK 17** (via Android Studio ou Adoptium)
- Variáveis de ambiente:
  - `ANDROID_HOME` → pasta do SDK
  - `JAVA_HOME` → JDK 17

## Setup

```bash
# na raiz do monorepo
npm install

# variáveis do Supabase (copiar da web)
cp apps/mobile/.env.example apps/mobile/.env.local
```

## Desenvolvimento

```bash
npm run mobile          # Expo dev server
npm run mobile:android  # compila e instala no emulador/dispositivo (requer Android Studio)
```

## Gerar APK

> **Política:** builds na nuvem (EAS) só devem ser disparados **com sua confirmação** — o agente não gera APK automaticamente após mudanças de código. O script abaixo também pede confirmação no terminal.

### Opção A — Nuvem EAS (recomendado sem Android Studio)

```bash
cd apps/mobile
npx eas login
npx eas init          # vincula projeto Expo (uma vez)
npm run build:apk     # gera APK na nuvem; link para download
```

### Opção B — Local (requer Android Studio + JDK)

```bash
npm run mobile:prebuild
npm run mobile:apk:release
# APK em apps/mobile/android/app/build/outputs/apk/release/
```

### Opção C — EAS build local (requer Android Studio)

```bash
cd apps/mobile
npm run build:apk:local
```

## Funcionalidades

- Login com Google (Supabase OAuth)
- **Dashboard** — busca, filtros por status / week plan, cards estilo protótipo, FAB para novo tema
- **Theme Detail** — editar tema, adicionar/excluir notas
- **Themes** — filtro por período, kanban em acordeão (To do / In Progress / Done)
- **Week Planner** — plano da semana, adicionar/remover temas, exportar PDF
- **Week View** — resumo semanal, grupos por status, exportar PDF

### Redirect URL no Supabase (só login via navegador / web)

Se usar o fluxo antigo por browser, em **Authentication → URL Configuration → Redirect URLs**:

```
diarioatividades://auth/callback
```

O app Android atual usa **login nativo Google** (sem abrir `localhost:5173`).

### Login Google nativo (Android) — configurar uma vez

#### 1. Google Cloud Console

Mantenha o OAuth **Web application** (Client ID + Secret no Supabase).

Crie também um OAuth **Android**:

1. [Credentials](https://console.cloud.google.com/apis/credentials) → **Create Credentials → OAuth client ID**
2. Tipo: **Android**
3. Package name: `com.diario.atividades`
4. **SHA-1** do certificado do APK (EAS):

```bash
cd apps/mobile
npx eas credentials -p android
```

Copie o SHA-1 do keystore usado no build **preview** e cole no Google.

#### 2. Variável no app

Em `apps/mobile/.env.local` (e no EAS **preview** ao gerar APK):

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=SEU_CLIENT_ID_WEB.apps.googleusercontent.com
```

Use o **Client ID** do OAuth **Web application** (não o do Android).

#### 3. Supabase → Authentication → Providers → Google

- Client ID / Secret: os do OAuth **Web** (como hoje)
- **Authorized Client IDs**: inclua o mesmo Web Client ID (`....apps.googleusercontent.com`)
- Ative **Skip nonce check** (recomendado para login nativo mobile)

#### 4. Novo APK

Mudanças nativas exigem **novo build EAS** (confirme antes de gerar).

## Estrutura

```
apps/mobile/
├── App.tsx
├── src/
│   ├── navigation/      # tabs + stack
│   ├── screens/         # Dashboard, Themes, Planner, Week
│   ├── components/      # UI compartilhada
│   ├── contexts/        # Auth + Themes
│   └── lib/             # Supabase, API, PDF
├── eas.json
└── metro.config.js
```
