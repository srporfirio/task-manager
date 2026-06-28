# Expo / mobile — agentes

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Builds Android (EAS / APK)

**Não execute `eas build` nem `npm run build:apk` sem o usuário confirmar explicitamente** que quer um novo APK.

Fluxo esperado:
1. Implementar e testar localmente (`npx tsc --noEmit`, `npm run mobile` se aplicável).
2. Informar o que mudou e **perguntar** se deve gerar build.
3. Só então rodar `scripts/build-apk.ps1` ou `eas build`.

O script `build-apk.ps1` pede confirmação no terminal antes de enviar para a nuvem.
