export function normalizeText(value: string | null | undefined): string {
  return String(value || "").toLowerCase().trim();
}

export function formatDateDisplay(value: string | null | undefined): string {
  const t = Date.parse(String(value || ""));
  if (!Number.isFinite(t)) return String(value || "-");
  return new Date(t).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function splitNotes(notesTextRaw: string): string[] {
  const notesText = String(notesTextRaw || "").replace(/\r\n/g, "\n");
  const notesTrimmed = notesText.trim();
  if (!notesTrimmed) return [""];

  const partsTop = notesText.split(/\n---\s*\n/g);
  const notes: string[] = [];
  for (const chunk of partsTop) {
    const subparts = chunk.split(/\n\s*\n+/g);
    for (const p of subparts) {
      const t = String(p || "").trim();
      if (t) notes.push(t);
    }
  }
  if (notes.length === 0) notes.push(notesTrimmed);
  return notes;
}
