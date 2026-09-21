export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` zu < escapen: CMS-pflegbarer Text (Projekt-/Leistungs-Titel) fließt in
  // JSON-LD; ein enthaltenes "</script>" würde sonst aus dem Script-Tag ausbrechen (XSS).
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
