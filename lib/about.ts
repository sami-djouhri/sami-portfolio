import type { Locale } from './i18n/config';

/*
 * Das Profil (Name, Rolle, Ort, Kontakt), ohne die Arbeiten. Eigenes Modul seit dem
 * 2026-10-30: der Footer braucht es, und der Footer rendert auch in der 404-Seite,
 * einer Client-Komponente im Baum JEDER Seite. Solange `getAbout` in `lib/projects.ts`
 * stand, lud deshalb jede Seite sämtliche Projekttexte beider Sprachen mit.
 * `lib/projects.ts` exportiert beides weiter, die übrigen Verwender bleiben gleich.
 */

export const ABOUT = {
  name: 'Sami Djouhri',
  shortName: 'Sami',
  role: 'Infrastruktur · Systeme · Automation',
  // Bewusst der Arbeitsmarkt-Radius, nicht der Wohnort: der Nachname ist selten und
  // die Domain traegt ihn, eine Kleinstadt daneben ergaebe faktisch eine Adresse.
  // Fuer Recruiter-Filter reicht der Ballungsraum.
  location: 'Raum Düsseldorf',
  // Bis zum 2026-09-12 stand hier „Ich baue Systeme". Der Satz ist die
  // Kernaussage der Seite und traegt sie im Hero, im Footer und in der
  // Social-Card. „Betreiben" ist die praezisere Behauptung: es ist restlos
  // eigene Leistung, es ist genau das Wort der gesuchten Rolle, und es haelt
  // im Gespraech, wenn jemand nach einer einzelnen Code-Stelle fragt.
  tagline: 'Ich betreibe Systeme, die zusammenhängen und mir gehören.',
  // Antwort auf den `whoami`-Prompt im Hero. Bewusst OHNE Fachgebiets-Aufzaehlung:
  // die stand hier bis 2026-08-27 als vierter Satz („Linux, gehaertete Infrastruktur,
  // Betrieb und Automation“), drei Zentimeter unter der Rollenzeile des Heros, die
  // genau das schon sagt, und ein weiteres Mal im Footer. Was bleibt, ist das eine
  // Argument, das sonst nirgends steht.
  bio: 'Mir ist wichtig, dass ich verstehe, was bei mir läuft. Ein Fremdprodukt kann morgen seinen Preis verdreifachen oder die API abschalten, und dann steht man da. Also läuft hier möglichst wenig, das ich nicht selbst in der Hand habe, auch wenn die Lösungen dadurch kleiner ausfallen, und dokumentiert ist alles so, dass auch jemand anderes es übernehmen könnte.',
  contact: {
    email: 'sami@djouhri.de',
  },
};

const ABOUT_EN = {
  role: 'Infrastructure · Systems · Automation',
  location: 'Düsseldorf area, Germany',
  tagline: 'I run systems that fit together and are mine.',
  bio: 'It matters to me that I understand what runs on my own machines. A third-party product can triple its price or switch off its API tomorrow, and then you are stuck. So as little as possible runs here that I do not have in my own hands, even when that means the solutions come out smaller, and everything is documented so that somebody else could take it over.',
};

/** ABOUT-Profil in der gewählten Sprache (neutrale Felder wie name/location bleiben gleich). */
export function getAbout(locale: Locale): typeof ABOUT {
  return locale === 'en' ? { ...ABOUT, ...ABOUT_EN } : ABOUT;
}
