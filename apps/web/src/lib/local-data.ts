import type { LegacyPayload } from "@task-manager/shared";

const DB_NAME = "diario-atividades-db-v1";
const STORE_NAME = "diario";
const KEY_ALL = "all";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB indisponível neste navegador."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Falha ao abrir IndexedDB."));
  });
}

export async function exportLocalPayload(): Promise<LegacyPayload | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY_ALL);
    req.onsuccess = () => {
      const payload = req.result as { rows?: LegacyPayload["rows"]; weekPlan?: LegacyPayload["weekPlan"] } | undefined;
      if (!payload?.rows?.length) {
        resolve(null);
        return;
      }
      resolve({
        rows: payload.rows,
        weekPlan: payload.weekPlan ?? { weekKey: "", themes: [] },
      });
    };
    req.onerror = () => reject(req.error ?? new Error("Falha ao ler IndexedDB."));
  });
}

export async function hasLocalPayload(): Promise<boolean> {
  try {
    const payload = await exportLocalPayload();
    return Boolean(payload?.rows?.length);
  } catch {
    return false;
  }
}
