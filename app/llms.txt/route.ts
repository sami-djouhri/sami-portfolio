import { getZiel } from '@/lib/cv';
import { localePath } from '@/lib/i18n/config';
import { istBewerbung } from '@/lib/modus';
import { ABOUT, PROJECTS, getAbout, localizedProject } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

/**
 * `/llms.txt`: wer, was, welche Arbeiten, welcher Kontakt, in einer Datei fuer
 * Sprachmodelle und Agenten (Format nach llmstxt.org: Titel, Kurzfassung,
 * Abschnitte mit Verweislisten).
 *
 * Entscheid aus der Fragerunde vom 2026-10-25: Englisch bleibt, weil die
 * Seite kuenftig vor allem von KI-Agenten gelesen wird, und dazu gehoert eine
 * Datei, die ihnen die Seite in wenigen Zeilen erklaert. Suchmaschinen bleiben
 * wie bisher zugelassen.
 *
 * Erzeugt beim Bau aus denselben Quellen wie die Seiten, nicht von Hand
 * geschrieben. Eine handgeschriebene Liste der Arbeiten waere nach der naechsten
 * neuen Arbeit still veraltet, und genau so ist auf dieser Seite schon mehrmals
 * eine Angabe falsch geworden (zuletzt „sieben Server" bei neun).
 *
 * Der Modus gilt auch hier: die gesuchte Rolle steht nur im Bewerbungsmodus
 * darin, wie `seeks` im JSON-LD. Im Schaufenster faellt die Zeile weg.
 *
 * Englisch, weil Modelle es am sichersten lesen; die deutschen Seiten sind
 * daneben verlinkt.
 */
export const dynamic = 'force-static';

export function GET() {
  const about = getAbout('en');
  const z: string[] = [];
  z.push(`# ${ABOUT.name}`);
  z.push('');
  z.push(`> ${about.tagline} Portfolio of the systems I build and run myself, mostly on my own hardware. ${about.role}, ${about.location}.`);
  z.push('');
  if (istBewerbung) {
    z.push(`${getZiel('en').satz}.`);
    z.push('');
  }
  z.push('Every work below has a case study in English and German.');
  z.push('');
  z.push('## Works');
  z.push('');
  for (const p of PROJECTS) {
    const t = localizedProject(p, 'en');
    z.push(`- [${t.title}](${SITE_URL}${localePath('en', `/projekte/${p.id}`)}): ${t.tagline}`);
  }
  z.push('');
  z.push('## Pages');
  z.push('');
  z.push(`- [Home (English)](${SITE_URL}/en)`);
  z.push(`- [Startseite (Deutsch)](${SITE_URL}/de)`);
  z.push(`- [All works](${SITE_URL}${localePath('en', '/projekte')})`);
  z.push(`- [Toolbox](${SITE_URL}${localePath('en', '/toolbox')})`);
  z.push(`- [About](${SITE_URL}${localePath('en', '/uber-mich')})`);
  z.push(`- [Contact](${SITE_URL}${localePath('en', '/kontakt')})`);
  z.push('');
  z.push('## Contact');
  z.push('');
  z.push(`- Email: ${ABOUT.contact.email}`);
  z.push(`- PGP key: ${SITE_URL}/pgp-key.asc`);
  z.push('');
  return new Response(z.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
