import { useEffect, useState } from "react";
import type { DashboardTheme } from "@task-manager/shared";

interface Props {
  theme: DashboardTheme | null;
  onClose: () => void;
  onSubmit: (themeId: string, payload: { name: string; jiraKey: string; description: string }) => Promise<void>;
}

export function EditThemeModal({ theme, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [jiraKey, setJiraKey] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (theme) {
      setName(theme.name);
      setJiraKey(theme.jiraKey);
      setDescription(theme.description);
      setError(null);
    }
  }, [theme]);

  if (!theme) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theme || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(theme.id, { name, jiraKey, description });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar tema.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">Editar Tema</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">theme</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">jiraKey</label>
            <input
              value={jiraKey}
              onChange={(e) => setJiraKey(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">theme description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[80px]"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
