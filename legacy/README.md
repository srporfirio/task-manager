# Versão local (arquivada)

Esta pasta guarda a **versão offline** do Diário de Atividades, que rodava no navegador com **IndexedDB** (sem login).

O app em produção é o React em `apps/web/`, com dados no **Supabase**.

## Como abrir (somente histórico / consulta)

1. Copie `logo-diario.png` para esta pasta (mesmo diretório do HTML), se ainda não existir.
2. Abra `diario-task-dashboard-csv.html` diretamente no navegador (duplo clique ou *Open with Live Server*).

Os dados ficam no IndexedDB do navegador onde o HTML foi usado; não há sincronização com a nuvem.

## `archive/`

Cópias dos módulos que importavam IndexedDB para o app React (`local-data.ts`, `import-legacy.ts`). Removidos do build online em favor do Supabase.
