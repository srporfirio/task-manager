import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { PrintThemeSection } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(title: string, period: string, summary: string, sections: PrintThemeSection[]): string {
  const nonEmpty = sections.filter((s) => s.themes.length > 0);
  const body =
    nonEmpty.length === 0
      ? "<p>Nada para exibir.</p>"
      : nonEmpty
          .map((section) => {
            const cards = section.themes
              .map((theme) => {
                const notes = section.weekNotesByThemeId?.get(theme.id) ?? theme.notes;
                const notesHtml =
                  section.showNotes && notes.length > 0
                    ? notes
                        .map(
                          (n) =>
                            `<div class="note"><div class="meta">${escapeHtml(formatDateDisplay(n.updatedAt))} · ${escapeHtml(n.status)}</div><p>${escapeHtml(n.content)}</p></div>`,
                        )
                        .join("")
                    : "";
                return `<article class="theme"><h3>${escapeHtml(theme.name)}</h3>${theme.jiraKey ? `<p class="jira">${escapeHtml(theme.jiraKey)}</p>` : ""}${theme.description ? `<p>${escapeHtml(theme.description)}</p>` : ""}${notesHtml}</article>`;
              })
              .join("");
            return `<section><h2>${escapeHtml(section.title)}</h2>${cards}</section>`;
          })
          .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:sans-serif;padding:24px;color:#181c1c}
    h1{color:#004d4e} h2{margin-top:24px;color:#006768;font-size:14px;text-transform:uppercase}
    .meta{color:#6d7979;margin-bottom:16px}
    .theme{border:1px solid #bcc9c9;border-radius:8px;padding:12px;margin:8px 0}
    .jira{color:#1e5db0;font-size:12px}
    .note{border-top:1px solid #e0e3e2;margin-top:8px;padding-top:8px}
    .note .meta{font-size:11px;color:#6d7979}
  </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(period)}</p>
    <p class="meta">${escapeHtml(summary)}</p>
    ${body}
  </body></html>`;
}

export async function exportPdfReport(
  title: string,
  period: string,
  summary: string,
  sections: PrintThemeSection[],
): Promise<void> {
  const html = buildHtml(title, period, summary, sections);
  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
}
