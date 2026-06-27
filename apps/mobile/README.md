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

## Estrutura prevista

```
apps/mobile/
├── App.tsx              # entrada (provisória)
├── src/                 # telas e componentes RN (próxima fase)
├── eas.json             # perfis de build (preview = APK)
└── metro.config.js      # monorepo + shared
```
