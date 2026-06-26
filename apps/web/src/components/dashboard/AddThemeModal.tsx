import { useEffect, useState } from "react";
import { THEME_STATUSES } from "../../lib/status-styles";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    status: string;
    jiraKey: string;
    description: string;
    notesText: string;
    addToWeekPlan: boolean;
    addMore: boolean;
  }) => Promise<void>;
}

const emptyForm = {
  name: "",
  status: "To do",
  jiraKey: "",
  description: "",
  notesText: "",
  addToWeekPlan: false,
  addMore: false,
};

export function AddThemeModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      if (form.addMore) {
        setForm({ ...emptyForm, addMore: true });
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar tema.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">Adicionar Tema</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">theme</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-slate-200 rounded-lg p-3 text-sm"
              placeholder="Ex.: KPI enhancements"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">theme_status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-slate-200 rounded-lg p-3 text-sm"
            >
              {THEME_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">jiraKey (opcional)</label>
            <input
              value={form.jiraKey}
              onChange={(e) => setForm({ ...form, jiraKey: e.target.value })}
              className="border border-slate-200 rounded-lg p-3 text-sm"
              placeholder="BEESOT-68606"
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">theme description (opcional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-slate-200 rounded-lg p-3 text-sm min-h-[72px]"
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">notes (pode ter várias)</label>
            <textarea
              value={form.notesText}
              onChange={(e) => setForm({ ...form, notesText: e.target.value })}
              className="border border-slate-200 rounded-lg p-3 text-sm min-h-[120px]"
              placeholder="Separe notas com linha em branco"
            />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.addToWeekPlan}
              onChange={(e) => setForm({ ...form, addToWeekPlan: e.target.checked })}
            />
            Adicionar automaticamente ao plano da semana
          </label>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.addMore}
              onChange={(e) => setForm({ ...form, addMore: e.target.checked })}
            />
            Adicionar mais temas
          </label>
          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
