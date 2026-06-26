import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const legacyDir = resolve(root, "apps/web/public/legacy");

mkdirSync(legacyDir, { recursive: true });

for (const file of ["diario-task-dashboard-csv.html", "logo-diario.png"]) {
  copyFileSync(resolve(root, file), resolve(legacyDir, file === "diario-task-dashboard-csv.html" ? "index.html" : file));
}

console.log("Legacy HTML copied to apps/web/public/legacy/");
