/**
 * Lab-Notes: kurze Betriebs-Notizen aus echten Vorfällen, jeweils
 * Problem → Vorgehen → Ergebnis → Erkenntnis, erzählt in erster Person.
 *
 * Bewusst Code und nicht CMS-Store (wie `lib/project-details.ts`): die Beiträge
 * sind lang, strukturiert und selten, ein Store-Feld dafür wäre eine Migration
 * plus Reseed-Risiko ohne Gegenwert. Der Admin bleibt für Projekte zuständig.
 *
 * Privacy-Regel wie überall: keine IPs, keine Hostnames, keine Container- oder
 * Gast-Namen. Rollen generisch benennen („ein Gast", „der Knoten", „der Server
 * am Netz-Rand"). Im Zweifel weglassen.
 *
 * ⚠️ NOCH NICHT VERÖFFENTLICHT (Stand 2026-08-12, neu erzählt, Owner-Review
 * ausstehend): Die Route `/notizen` ist bewusst unverlinkt, kein Eintrag in der
 * Navigation (`app/components/TopBar.tsx`), nicht in `app/sitemap.ts`, nicht im
 * Feed (`app/feed.xml/route.ts`), und beide Seiten setzen `robots: noindex`.
 * Freischalten = genau diese vier Stellen ergänzen, sonst nichts.
 */
import type { Locale } from './i18n/config';

export interface Note {
  /** ASCII-only, Umlaute in Route-Params brechen das SSG-Matching (siehe CLAUDE.md). */
  slug: string;
  /** ISO-Datum (YYYY-MM-DD), trägt Sortierung und `<time>`. */
  date: string;
  title: string;
  teaser: string;
  /** Kurze, generische Schlagworte, keine Produktnamen aus dem Innenleben. */
  tags: string[];
  problem: string;
  vorgehen: string[];
  ergebnis: string[];
  lesson: string;
}

const NOTES: Note[] = [
  {
    slug: 'ausgesperrt-aus-dem-eigenen-netz',
    date: '2026-07-21',
    title: 'Meine eigene Härtung hat mich ausgesperrt',
    teaser:
      'Der Arbeitslaptop fiel runter und war kaputt. Erst damit fiel auf, dass jeder Weg ins Homelab über genau dieses eine, ungesicherte Gerät führte.',
    tags: ['Härtung', 'Backup', 'Zugang'],
    problem:
      'Ich hatte das Homelab so gehärtet, dass es nur noch von meinem Arbeitslaptop aus erreichbar war. Ein zugelassenes Gerät, alle anderen draußen, das fühlte sich nach einem sauberen Abschluss an. Ein Backup hatte der Laptop nicht. Das hielt ich nicht für wichtig, meine Arbeit lag ja auf den Hosts, und die waren alle gesichert. Dann fiel der Laptop runter und war kaputt. Plötzlich war ich das, wogegen ich gehärtet hatte: ein Gerät ohne Zugriffsrechte. Und auf dem toten Gerät lagen die SSH-Schlüssel, die Pläne, die Anleitungen und die Dokumentation. Nur dort.',
    vorgehen: [
      'Der erste Schritt war Bestandsaufnahme im Kopf: welches Gerät darf überhaupt noch rein? Keins. Genau das war der Zweck der Härtung gewesen.',
      'Also mit Monitor und Tastatur direkt an den Host. Das ging nur, weil die USB-Sperre zu dem Zeitpunkt noch auf meiner Härtungs-Liste stand statt auf dem Gerät. Ein paar Wochen später wäre auch diese Tür zu gewesen.',
      'Von der Konsole aus habe ich keinen alten Schlüssel kopiert, sondern für das Handy ein eigenes, neues Schlüsselpaar erzeugt und dessen öffentlichen Teil auf den Hosts eingetragen. So bleibt der Notzugang einzeln widerrufbar, falls das Handy verloren geht.',
      'Danach wochenlang vom Handy gearbeitet, Terminal-App plus VPN. Unbequem, aber es geht erstaunlich viel.',
      'Beim Aufräumen fiel die nächste Schwachstelle auf: der VPN-Eingang lief über genau einen Host. Wäre der ausgefallen, hätte auch das Handy draußen gestanden. Ein zweiter, unabhängiger Eingang auf einem anderen Host schließt diesen Fall inzwischen.',
    ],
    ergebnis: [
      'Der neue Laptop wird gesichert wie ein Server, obwohl auf ihm angeblich nichts Wichtiges liegt.',
      'Pläne, Anleitungen und Dokumentation liegen versioniert im Verbund und werden mitgesichert, statt auf einem einzelnen Gerät zu wohnen.',
      'Es gibt einen definierten Notweg ins Netz, der weder von einem einzigen Gerät noch von einem einzigen Host abhängt.',
    ],
    lesson:
      '„Meine Arbeit liegt ja auf den Hosts" war die Fehleinschätzung, die mich den Zugang gekostet hat. Auf dem ungesicherten Gerät lag zwar keine Arbeit, aber der Schlüssel zu allem anderen. Seitdem ziehe ich den Backup-Umfang nicht an der Frage, wo die Daten liegen, sondern an der Frage, was ich am Tag nach einem Verlust in der Hand haben muss. Und jede Härtung bekommt vorher einen geplanten Notweg.',
  },
  {
    slug: 'multi-user-nachruesten',
    date: '2026-08-08',
    title: 'Ein zweites Konto? Die Suite sagte nein',
    teaser:
      'Meine Produktivitäts-Suite war für genau einen Menschen gebaut: mich. Ein zweites Konto sauber zu unterstützen wurde teurer als jedes Feature davor.',
    tags: ['Architektur', 'Auth', 'Datenmodell'],
    problem:
      'Die Suite ist über Monate um mich herum gewachsen: Mail, Kalender, Wertsachen, Projekt-Deck, und jede Sub-App spricht mit den anderen. Multi-User stand nie auf dem Plan, wozu auch, ich war der einzige Nutzer. Genau deshalb steckte die Annahme „es gibt nur einen" am Ende überall, in den Schnittstellen zwischen den Apps, in den Berechtigungen und im Datenmodell. Als ein zweites Konto dazukommen sollte, war das kein Feature. Es war ein Umbau.',
    vorgehen: [
      'Erst kartiert, wo die Ein-Nutzer-Annahme überall sitzt. Ernüchternd: praktisch jede Naht zwischen zwei Sub-Apps musste künftig mittragen, wer da eigentlich fragt.',
      'Die Identität wird jetzt an jeder dieser Nähte explizit durchgereicht. Jeder interne Aufruf trägt den Nutzer mit, statt stillschweigend von mir auszugehen.',
      'Dabei zeigte sich, wie leise so ein Umbau scheitern kann: eine der Übergabestellen sah fertig aus, verlor die Information aber unterwegs, ohne Fehler und ohne Warnung. Aufgefallen ist das erst durch einen Test, der die Ankunft beweist und nicht nur den Aufruf.',
      'Die härteste Stelle war das Datenmodell einer zentralen Komponente. Dort galt „ohne Besitzer = für alle sichtbar", was mit einem Nutzer egal ist. Mit einem zweiten wären private Einträge einfach mitlesbar gewesen. Diese Komponente bekommt deshalb einen eigenen, mandantenfähigen Nachbau, ein Projekt für sich.',
      'Neue Dienste starten seitdem mehrbenutzerfähig, auch wenn sie vorerst nur einer benutzt. Der Aufpreis am Anfang ist klein.',
    ],
    ergebnis: [
      'Die Nähte der Suite reichen die Identität durch, End-zu-Ende nachgewiesen statt nur eingebaut.',
      'Die Stellen, an denen ein zweites Konto fremde Daten gesehen hätte, sind identifiziert und geschlossen oder klar als Umbau eingeplant.',
      'Für alles Neue gilt seitdem eine einfache Regel: mehrbenutzerfähig ab dem ersten Tag.',
    ],
    lesson:
      'Multi-User allein zu nutzen fühlt sich überflüssig an, und genau das ist die Falle. Die Ein-Nutzer-Annahme schreibt sich unbemerkt in jede Schnittstelle und jedes Datenmodell hinein, und nachträglich muss man sie aus jeder einzelnen Stelle wieder herausoperieren. Am leichtesten leisten kann man sich Mehrbenutzerfähigkeit in dem Moment, in dem man sie noch nicht braucht.',
  },
];

const NOTES_EN: Note[] = [
  {
    slug: 'ausgesperrt-aus-dem-eigenen-netz',
    date: '2026-07-21',
    title: 'My own hardening locked me out',
    teaser:
      "The work laptop hit the floor and died. Only then did it turn out that every path into the homelab ran through that one unbacked-up device.",
    tags: ['Hardening', 'Backup', 'Access'],
    problem:
      "I had hardened the homelab to the point where it was reachable from my work laptop only. One permitted device, everything else locked out, and it felt like a clean finish. The laptop itself had no backup. I didn't consider that important, my work lived on the hosts, and those were all covered. Then the laptop fell and broke. Suddenly I was the thing I had hardened against: a device without access rights. And the SSH keys, the plans, the guides and the documentation lived on that dead machine. Nowhere else.",
    vorgehen: [
      'The first step was an inventory in my head: which device is still allowed in? None. That had been the whole point of the hardening.',
      "So it was monitor and keyboard, straight at the host. That only worked because the USB lockdown was still on my hardening list instead of on the machine. A few weeks later that door would've been shut too.",
      "From the console I didn't copy any old key. I generated a fresh key pair for the phone and put its public half on the hosts, so the emergency access stays individually revocable if the phone ever gets lost.",
      'After that I worked from the phone for weeks, a terminal app plus VPN. Uncomfortable, but you can get a surprising amount done.',
      "While cleaning up, the next weak spot surfaced: the VPN entrance ran through exactly one host. Had that one failed, the phone would've been locked out as well. A second, independent entrance on another host now covers that case.",
    ],
    ergebnis: [
      'The new laptop gets backed up like a server, even though supposedly nothing important lives on it.',
      'Plans, guides and documentation are versioned inside the cluster and get backed up with it, instead of living on a single device.',
      "There is a defined emergency path into the network that doesn't depend on a single device or a single host.",
    ],
    lesson:
      '"My work lives on the hosts" was the misjudgment that cost me my access. No work lived on the unbacked-up device, but the key to everything else did. Since then I draw the backup scope not around where the data sits, but around what I need in my hands the day after a loss. And every hardening step gets a planned way back in first.',
  },
  {
    slug: 'multi-user-nachruesten',
    date: '2026-08-08',
    title: 'A second account? The suite said no',
    teaser:
      'My productivity suite was built for exactly one person: me. Supporting a second account properly got more expensive than any feature before it.',
    tags: ['Architecture', 'Auth', 'Data model'],
    problem:
      "The suite grew around me over months: mail, calendar, assets, a project deck, and every sub-app talks to the others. Multi-user was never on the plan, why would it be, I was the only user. Which is exactly why the assumption \"there is only one\" ended up everywhere, in the seams between the apps, in the permissions and in the data model. When a second account was supposed to join, that wasn't a feature. It was a rebuild.",
    vorgehen: [
      'First I mapped where the single-user assumption actually sits. Sobering: practically every seam between two sub-apps now had to carry who is asking.',
      'Identity is now passed along explicitly at each of those seams. Every internal call carries the user instead of silently assuming me.',
      "Along the way it showed how quietly such a rebuild can fail: one of the hand-over points looked finished but lost the information en route, no error, no warning. It only surfaced through a test that proves arrival, not just the call.",
      'The hardest part was the data model of one central component. There, "no owner = visible to everyone", which is fine with one user. With a second one, private entries would simply have been readable. That component is getting its own tenant-aware rebuild, a project of its own.',
      "New services start out multi-user now, even if only one person uses them for a while. The upfront cost is small.",
    ],
    ergebnis: [
      'The seams of the suite pass identity through, proven end-to-end rather than just wired in.',
      'The places where a second account would have seen foreign data are identified and closed, or clearly scheduled as rebuilds.',
      'Everything new follows one simple rule since then: multi-user from day one.',
    ],
    lesson:
      "Using multi-user alone feels pointless, and that's exactly the trap. The single-user assumption writes itself into every interface and every data model unnoticed, and later you have to operate it back out of each single place. The moment you can afford multi-user most easily is the moment you don't need it yet.",
  },
];

const BY_SLUG = new Map(NOTES.map((n) => [n.slug, n]));
const BY_SLUG_EN = new Map(NOTES_EN.map((n) => [n.slug, n]));

/** Alle Notes der Sprache, neueste zuerst. */
export function getNotes(locale: Locale): Note[] {
  const list = locale === 'en' ? NOTES_EN : NOTES;
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getNote(slug: string, locale: Locale): Note | undefined {
  return (locale === 'en' ? BY_SLUG_EN : BY_SLUG).get(slug);
}

/** Slugs für generateStaticParams (sprachunabhängig identisch). */
export function getNoteSlugs(): string[] {
  return NOTES.map((n) => n.slug);
}
