export default function SiteFooter({ elderMode }: { elderMode: boolean }) {
  return (
    <footer className="border-t border-line bg-paper px-6 py-10 text-center md:px-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <p className={`text-muted ${elderMode ? "text-lg font-semibold text-ink" : "text-sm"}`}>
          © 2026 KinClause Project · Created for LingHacks VII
        </p>
        <p className={`mx-auto leading-relaxed text-faint ${elderMode ? "text-base text-ink" : "text-xs"}`}>
          <strong className="text-muted">Important:</strong> KinClause is not a lawyer and does not provide legal advice. It is an educational tool that uses computational linguistics to highlight potential risks and suggest questions to ask before you sign.
        </p>
      </div>
    </footer>
  );
}
