export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">
        Em breve nesta versão React. Use{" "}
        <a
          href="/legacy/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline"
        >
          versão local (HTML)
        </a>{" "}
        ou aguarde a próxima sprint.
      </p>
    </div>
  );
}
