import type { PrintThemeSection } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";

type PrintReportProps = {
  title: string;
  meta: string;
  sections: PrintThemeSection[];
};

export function PrintReport({ title, meta, sections }: PrintReportProps) {
  return (
    <div className="week-print-report hidden print:block">
      <div className="week-print-header">
        <h2 className="week-print-title">{title}</h2>
        <p className="week-print-meta">{meta}</p>
      </div>
      {sections.map((section) => (
        <section key={section.title} className="week-print-section">
          <h3 className={`week-print-section-title ${section.className}`}>{section.title}</h3>
          {section.themes.length === 0 ? (
            <p className="text-sm text-slate-600">Sem itens.</p>
          ) : (
            section.themes.map((theme) => {
              const weekNotes = section.weekNotesByThemeId?.get(theme.id) ?? [];
              return (
                <div key={theme.id} className="week-print-theme">
                  <h4 className="font-semibold text-slate-900">{theme.name}</h4>
                  {theme.jiraKey ? <p className="text-xs text-blue-700">{theme.jiraKey}</p> : null}
                  {theme.description ? <p className="text-sm text-slate-600">{theme.description}</p> : null}
                  {section.showNotes && weekNotes.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {weekNotes.map((note) => (
                        <li key={note.id} className="text-sm text-slate-700">
                          <span className="text-xs text-slate-500">{formatDateDisplay(note.updatedAt)}</span>
                          <p className="whitespace-pre-wrap">{note.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })
          )}
        </section>
      ))}
    </div>
  );
}
