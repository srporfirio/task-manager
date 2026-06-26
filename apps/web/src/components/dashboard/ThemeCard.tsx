import { useState } from "react";
import { formatDateDisplay, type DashboardTheme } from "@task-manager/shared";
import { StatusBadge, StatusBar, WeekPlanTag } from "./StatusBadge";
import { THEME_STATUSES } from "../../lib/status-styles";

interface Props {
  theme: DashboardTheme;
  onSaveNote: (themeId: string, content: string, status: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onEdit: (theme: DashboardTheme) => void;
  onDelete: (themeId: string) => Promise<void>;
}

export function ThemeCard({ theme, onSaveNote, onDeleteNote, onEdit, onDelete }: Props) {
  const [noteText, setNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("To do");
  const [saving, setSaving] = useState(false);

  async function handleSaveNote() {
    const text = noteText.trim();
    if (!text) {
      alert("Escreva uma nota antes de clicar em Salvar.");
      return;
    }
    setSaving(true);
    try {
      await onSaveNote(theme.id, text, noteStatus);
      setNoteText("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <StatusBar status={theme.status} />
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 break-words">{theme.name}</h3>
            {theme.description ? (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{theme.description}</p>
            ) : null}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={theme.status} />
              {theme.inWeekPlan ? <WeekPlanTag /> : null}
              {theme.jiraKey ? (
                <span className="text-sm text-blue-700 font-medium">{theme.jiraKey}</span>
              ) : null}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2 shrink-0">
            <p className="text-xs text-slate-500">Última atualização</p>
            <p className="text-sm font-semibold text-slate-700">{formatDateDisplay(theme.lastUpdate)}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(theme)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-blue-700 hover:bg-slate-50"
              >
                Editar tema
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Excluir este tema e todas as suas notas?")) void onDelete(theme.id);
                }}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                Excluir tema
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {theme.notes.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma nota ainda.</p>
          ) : (
            theme.notes.map((note) => (
              <div key={note.id} className="flex gap-4 items-start relative pl-6 border-l-2 border-slate-200">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200" />
                <div className="flex-grow bg-slate-50 p-4 rounded-lg min-w-0">
                  <div className="flex justify-between items-center mb-2 gap-3 flex-wrap">
                    <StatusBadge status={note.status} />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{formatDateDisplay(note.updatedAt)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Excluir esta nota?")) void onDeleteNote(note.id);
                        }}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-slate-200">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Escreva uma nova nota..."
          />
          <div className="flex gap-3 items-center justify-between mt-3 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Status da nota</label>
              <select
                value={noteStatus}
                onChange={(e) => setNoteStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {THEME_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveNote()}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
