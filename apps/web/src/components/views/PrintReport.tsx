import type { PrintThemeSection } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";

type PrintReportProps = {
  title: string;
  period: string;
  summary: string;
  sections: PrintThemeSection[];
  globalEmptyMessage?: string;
  showPlannedTag?: boolean;
};

function PrintThemeCard({
  theme,
  weekNotes,
  showNotes,
  showPlannedTag,
}: {
  theme: PrintThemeSection["themes"][number];
  weekNotes: PrintThemeSection["themes"][number]["notes"];
  showNotes: boolean;
  showPlannedTag: boolean;
}) {
  const jira = theme.jiraKey?.trim() ? theme.jiraKey.trim() : "Sem Jira Key";

  return (
    <article className="week-print-theme">
      <div className="week-print-theme-header">
        <div>
          <h3 className="week-print-theme-name">{theme.name}</h3>
          {showPlannedTag && theme.inWeekPlan ? (
            <p className="week-print-theme-description week-print-planned-tag">Plano da semana</p>
          ) : null}
          {theme.description ? (
            <p className="week-print-theme-description">{theme.description}</p>
          ) : null}
        </div>
        <span className="week-print-jira">{jira}</span>
      </div>
      {showNotes ? (
        <div className="week-print-notes">
          {weekNotes.length === 0 ? (
            <p className="week-print-empty">Sem notas registradas nesta semana.</p>
          ) : (
            weekNotes.map((note) => (
              <div key={note.id} className="week-print-note">
                <div className="week-print-note-meta">{formatDateDisplay(note.updatedAt)}</div>
                <p className="week-print-note-text">{note.content}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </article>
  );
}

export function PrintReport({
  title,
  period,
  summary,
  sections,
  globalEmptyMessage,
  showPlannedTag = false,
}: PrintReportProps) {
  const totalThemes = sections.reduce((count, section) => count + section.themes.length, 0);
  const nonEmptySections = sections.filter((section) => section.themes.length > 0);
  const isEmpty = totalThemes === 0;

  return (
    <div className="week-print-report" aria-hidden="true">
      <div className="week-print-header">
        <h1 className="week-print-title">{title}</h1>
        <p className="week-print-meta">{period}</p>
        <p className="week-print-meta">{summary}</p>
      </div>
      {isEmpty ? (
        <p className="week-print-empty">{globalEmptyMessage ?? "Nada para exibir nesta visão."}</p>
      ) : (
        nonEmptySections.map((section) => (
          <section key={section.title} className="week-print-section">
            <h2 className={`week-print-section-title ${section.className}`}>{section.title}</h2>
            {section.themes.map((theme) => {
              const weekNotes = section.weekNotesByThemeId?.get(theme.id) ?? [];
              return (
                <PrintThemeCard
                  key={theme.id}
                  theme={theme}
                  weekNotes={weekNotes}
                  showNotes={section.showNotes}
                  showPlannedTag={showPlannedTag}
                />
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}
