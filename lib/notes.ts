/**
 * Lab-Notes: kurze Betriebs-Notizen aus echten Sessions, jeweils
 * Problem → Vorgehen → Ergebnis → Erkenntnis.
 *
 * Bewusst Code und nicht CMS-Store (wie `lib/project-details.ts`): die Beiträge
 * sind lang, strukturiert und selten — ein Store-Feld dafür wäre eine Migration
 * plus Reseed-Risiko ohne Gegenwert. Der Admin bleibt für Projekte zuständig.
 *
 * Privacy-Regel wie überall: keine IPs, keine Hostnames, keine Container- oder
 * Gast-Namen. Rollen generisch benennen („ein Gast", „der Knoten", „der Server
 * am Netz-Rand"). Im Zweifel weglassen.
 *
 * ⚠️ NOCH NICHT VERÖFFENTLICHT (Stand 2026-08-10, Owner-Review ausstehend):
 * Die Route `/notizen` ist bewusst unverlinkt — kein Eintrag in der Navigation
 * (`app/components/TopBar.tsx`), nicht in `app/sitemap.ts`, nicht im Feed
 * (`app/feed.xml/route.ts`), und beide Seiten setzen `robots: noindex`.
 * Freischalten = genau diese vier Stellen ergänzen, sonst nichts.
 */
import type { Locale } from './i18n/config';

export interface Note {
  /** ASCII-only — Umlaute in Route-Params brechen das SSG-Matching (siehe CLAUDE.md). */
  slug: string;
  /** ISO-Datum (YYYY-MM-DD), trägt Sortierung und `<time>`. */
  date: string;
  title: string;
  teaser: string;
  /** Kurze, generische Schlagworte — keine Produktnamen aus dem Innenleben. */
  tags: string[];
  problem: string;
  vorgehen: string[];
  ergebnis: string[];
  lesson: string;
}

const NOTES: Note[] = [
  {
    slug: 'zwei-schwergewichte-ein-gast',
    date: '2026-07-24',
    title: 'Zwei Schwergewichte in einem Gast, und beide hungern',
    teaser:
      'Sprach-Synthese und Sprachmodell teilten sich einen Gast. Bei 98,5 Prozent Speicherbelegung blockierten sie sich gegenseitig, und keiner der beiden war schuld.',
    tags: ['Virtualisierung', 'Arbeitsspeicher', 'Diagnose'],
    problem:
      'Zwei rechenintensive Dienste liefen im selben Gast: eine Sprach-Synthese und ein Sprachmodell. Beide funktionierten einzeln einwandfrei. Gemeinsam blieben Anfragen minutenlang liegen oder liefen ins Zeitlimit, ohne dass ein Dienst abstürzte oder eine Fehlermeldung schrieb. Der Speicher des Gasts stand dauerhaft bei 98,5 Prozent. Naheliegend, aber falsch, wäre gewesen, einen der beiden für langsam zu erklären und an seinen Parametern zu drehen.',
    vorgehen: [
      'Erst messen, dann urteilen: die Belegung nicht im Gesamtwert ansehen, sondern je Prozess über die Zeit, um zu sehen, wer wächst und wer nur verdrängt wird.',
      'Das Bild war eindeutig gegenseitig. Sobald einer der beiden Speicher anforderte, wurden die Seiten des anderen ausgelagert; dessen nächste Anfrage holte sie zurück und verdrängte den ersten. Kein Leck, sondern zwei Nachbarn, die sich abwechselnd aus dem Speicher schoben.',
      'Damit war klar, dass keine Parameter-Änderung hilft: das Problem lag nicht in einem der Dienste, sondern in der Entscheidung, sie zusammenzulegen.',
      'Die Sprach-Synthese in einen eigenen Gast verlagert, das Modell-Verzeichnis als Datenträger mitgenommen statt neu herunterzuladen, und den Zugang auf genau den einen Aufrufer beschränkt, der sie braucht.',
      'Im neuen Gast funktionierte die übliche Port-Weiterleitung des Container-Systems nicht. Statt sie zu reparieren, läuft der Dienst dort direkt im Netz des Gasts, was in dieser Konstellation der robustere Weg ist.',
    ],
    ergebnis: [
      'Die Speicherbelegung des ursprünglichen Gasts fiel von 98,5 Prozent auf rund 30, es sind wieder etwa acht Gigabyte frei.',
      'Beide Dienste antworten seitdem in ihrer erwarteten Zeit, ohne dass an einem von beiden eine Einstellung geändert wurde.',
      'Der Aufrufer musste nur eine Adresse austauschen; die Schnittstelle blieb dieselbe.',
    ],
    lesson:
      'Wenn zwei Dienste nur gemeinsam langsam sind und einzeln schnell, ist die Ursache selten in einem von beiden zu finden. Die eigentliche Entscheidung war nicht „welcher Dienst ist zu langsam", sondern „dürfen die beiden überhaupt nebeneinander wohnen".',
  },
  {
    slug: 'ssh-war-nicht-das-problem',
    date: '2026-08-07',
    title: 'Der Zugang war tot, aber der Zugangsdienst war es nicht',
    teaser:
      'Der Server nahm Verbindungen an und schwieg dann. Die Ursache lag drei Schichten tiefer, als die Symptome vermuten ließen.',
    tags: ['Störungssuche', 'Speicher', 'Betrieb'],
    problem:
      'Der Zugang zum zentralen Host war weg. Die Verbindung wurde angenommen, blieb dann aber stumm: kein Login, keine Fehlermeldung, kein Abbruch. Der Host antwortete auf Netz-Ebene normal, und laufende Dienste erledigten weiter Anfragen. Das Naheliegende wäre gewesen, den Zugangsdienst neu zu starten oder seine Konfiguration zu prüfen.',
    vorgehen: [
      'Zuerst geprüft, ob das Problem beim Zugangsdienst liegt oder darunter: ein Port-Scan zeigte den Port offen und die Verbindung als aufgebaut, es kam nur nie eine Begrüßung zurück. Das schließt eine Regel im Netz und einen abgestürzten Dienst aus, denn beides sähe anders aus.',
      'Zweiter Hinweis: nicht nur der Zugang war betroffen. Alles, was neu etwas von der Platte lesen wollte, blieb hängen; was bereits im Speicher lief, lief weiter. Ein Muster, das auf die Speicher-Ebene zeigt, nicht auf einen einzelnen Dienst.',
      'Über einen zweiten Weg an die Protokolle gekommen und dort nach Meldungen unterhalb des Dateisystems gesucht, statt in den Dienst-Protokollen zu bleiben.',
      'Dort standen Transportfehler des Speichermediums auf Bus-Ebene. Der Zugangsdienst hing schlicht daran, dass er beim Login Dateien lesen muss und diese Lesezugriffe nie zurückkamen.',
      'Nach dem Zurücksetzen fing sich das System selbst wieder; anschließend wurde protokolliert, was zu sehen war, damit die Wiederkehr erkennbar ist statt erneut als Zugangsproblem zu erscheinen.',
    ],
    ergebnis: [
      'Die Ursache war eindeutig benannt statt weggeklickt: kein Zugangs-, sondern ein Speicher-Transportproblem.',
      'Am Zugangsdienst wurde nichts geändert, weil an ihm nichts zu ändern war.',
      'Das Fehlerbild ist dokumentiert, damit derselbe Fall beim nächsten Mal in Minuten statt in Stunden eingeordnet ist.',
    ],
    lesson:
      'Ein Dienst, der die Verbindung annimmt und dann schweigt, hängt fast immer an etwas anderem. Wenn gleichzeitig alles langsam wird, was neu von der Platte liest, lohnt es sich, die Suche unterhalb des Dateisystems zu beginnen, statt Zeit im Dienst zu verlieren, der nur das Symptom zeigt.',
  },
  {
    slug: 'backup-vollstaendigkeit',
    date: '2026-08-04',
    title: 'Ein Backup, das man nicht zurückspielen kann, ist keins',
    teaser:
      'Alle Sicherungen liefen grün. Trotzdem fehlten zwei Dinge, die man erst im Ernstfall vermisst hätte: die Zustands-Daten aus den Gästen und das Werkzeug für die Wiederherstellung selbst.',
    tags: ['Backup', 'Wiederherstellung', 'Verifikation'],
    problem:
      'Auf allen Hosts liefen verschlüsselte Sicherungen an einen entfernten Ort, jeder Lauf meldete Erfolg. Genau das ist die gefährliche Lage: „läuft grün" sagt nur, dass die konfigurierten Pfade gesichert wurden, nicht ob die konfigurierten Pfade die richtigen sind. Es fehlte eine unabhängige Antwort auf die Frage, ob im Ernstfall wirklich alles wieder da wäre.',
    vorgehen: [
      'Statt den Erfolgsmeldungen zu glauben, eine tägliche Vollständigkeits-Prüfung gebaut, die für jeden Host getrennt beantwortet, ob eine aktuelle Sicherung existiert und ob sie die erwarteten Pfade enthält.',
      'Erste Lücke: die Zustands-Daten der bedarfsgesteuerten Dienste liegen in den Dateisystemen der Gäste, die auf einem Datenträger-Verbund liegen. Die dateibasierte Sicherung des Hosts sieht dort schlicht nichts. Gelöst über einen Schritt vor jeder Sicherung, der genau diese Verzeichnisse herausholt, danach greift die normale Kette.',
      'Zweite Lücke, und die unangenehmere: die Skripte, die im Ernstfall die Wiederherstellung fahren, lagen selbst außerhalb des gesicherten Bereichs. Nach einer vollständigen Wiederherstellung wäre das Werkzeug weg gewesen, mit dem man wiederherstellt. In den Sicherungs-Umfang aufgenommen und im Auszug nachgewiesen.',
      'Dritte Lücke: das verschlüsselte Bündel mit den Zugangsdaten fehlte für einen Teil der Hosts. Ohne die Zugangsdaten nützt die beste Sicherung nichts, weil man an sie nicht herankommt.',
      'Zum Schluss geprüft, dass ein Fehlschlag auch wirklich meldet: ein fehlgeschlagener Lauf läuft über die bestehende Dienst-Überwachung in den Melde-Kanal, ohne dass dafür eine eigene Sonderbehandlung nötig ist.',
    ],
    ergebnis: [
      'Die Vollständigkeits-Prüfung meldet für alle Hosts sauber, inklusive des Bündels mit den Zugangsdaten, und der einzige abgemeldete Host ist als bekannt offline gekennzeichnet statt stillschweigend zu fehlen.',
      'Die Zustands-Daten aus den Gästen liegen verschlüsselt am entfernten Ort, obwohl die reguläre Dateisicherung sie nie erfasst hätte.',
      'Ein regelmäßiger Wiederherstellungs-Test holt Stichproben zurück und vergleicht sie byteweise mit dem Original, statt nur die Existenz eines Auszugs zu bestätigen.',
    ],
    lesson:
      'Der Wert einer Sicherung entscheidet sich nicht am grünen Lauf, sondern an der Frage, was beim Zurückspielen fehlt. Zwei Klassen werden dabei fast immer übersehen: Daten, die in einer Ebene entstehen, in die die Sicherung nicht hineinsieht, und die Werkzeuge, die man für die Wiederherstellung selbst braucht.',
  },
  {
    slug: 'sichtbar-ohne-adresse',
    date: '2026-08-07',
    title: 'Öffentlich auffindbar sein, ohne die eigene Adresse zu verraten',
    teaser:
      'Ein Dienst sollte in einem öffentlichen Verzeichnis auftauchen. Genau dabei meldet er die Adresse an, von der aus er hinausgeht, und das war die vom Hausanschluss.',
    tags: ['Netzwerk', 'VPN', 'Privatsphäre'],
    problem:
      'Ein Dienst im Heim-Verbund sollte von außen erreichbar sein. Der eingehende Weg war gelöst: kein Port am Heimrouter, stattdessen ein VPN-Tunnel zu einem eigenen Server am Netz-Rand, der den Verkehr weiterleitet. Nach außen war damit nur die Adresse dieses Servers sichtbar. Dann kam die Anforderung, dass der Dienst in einem öffentlichen Verzeichnis auffindbar sein soll, und das brach die Konstruktion: um sich einzutragen, ruft der Dienst das Verzeichnis von sich aus an, und ausgehend nahm er weiterhin den direkten Weg. Das Verzeichnis trug also die Adresse des Hausanschlusses ein.',
    vorgehen: [
      'Zuerst nachgemessen statt vermutet: aus dem Gast heraus die eigene öffentliche Adresse abgefragt. Sie war die des Hausanschlusses, obwohl der eingehende Verkehr längst über den Rand lief. Eingehend und ausgehend sind eben zwei verschiedene Wege.',
      'Zweitens geprüft, ob sich der Eintrag vermeiden lässt: ohne die öffentliche Anmeldung antwortet der Dienst auch nicht mehr auf die Abfrage, mit der man die tatsächliche Nutzerzahl ermittelt. Diese Abfrage ist die Grundlage der automatischen Abschaltung, also war Verzichten keine Option.',
      'Also den gesamten ausgehenden Verkehr des Gasts durch den Tunnel geführt, statt nur die Rückrichtung der eingehenden Verbindungen. Damit sieht das Verzeichnis die Adresse des Servers am Rand.',
      'Damit dabei nicht der Zugriff aus dem eigenen Netz mit umgeleitet wird, bleibt der lokale Bereich über eine eigene Routing-Regel auf dem direkten Weg. Sonst hätte jeder Zugriff von zuhause den Umweg über den öffentlichen Server genommen.',
      'Zum Schluss die Gegenprobe: die öffentliche Adresse des Gasts erneut abgefragt und im Verzeichnis nachgesehen, welche Adresse dort steht.',
    ],
    ergebnis: [
      'Der Dienst ist im öffentlichen Verzeichnis auffindbar, eingetragen mit der Adresse des Servers am Netz-Rand.',
      'Die Adresse des Hausanschlusses taucht weder eingehend noch ausgehend auf, und am Heimrouter ist weiterhin kein Port geöffnet.',
      'Die Abfrage der tatsächlichen Nutzerzahl funktioniert weiter, also bleibt die automatische Abschaltung bei Leerlauf möglich.',
    ],
    lesson:
      'Eine verborgene Adresse ist keine Eigenschaft des eingehenden Wegs allein. Sobald ein Dienst selbst nach außen spricht, verrät er sich über den ausgehenden Weg, und der ist standardmäßig ein anderer. Wer nur die Rückrichtung absichert, hat die halbe Strecke abgedeckt.',
  },
];

const NOTES_EN: Note[] = [
  {
    slug: 'zwei-schwergewichte-ein-gast',
    date: '2026-07-24',
    title: 'Two heavyweights in one guest, and both are starving',
    teaser:
      'Speech synthesis and a language model shared a guest. At 98.5 percent memory use they blocked each other, and neither of them was at fault.',
    tags: ['Virtualization', 'Memory', 'Diagnosis'],
    problem:
      'Two compute-heavy services ran inside the same guest: a speech synthesis engine and a language model. Each worked flawlessly on its own. Together, requests sat for minutes or ran into their timeout, without either service crashing or writing an error. The guest’s memory sat permanently at 98.5 percent. The obvious but wrong move would have been to declare one of them slow and start tuning its parameters.',
    vorgehen: [
      'Measure before judging: look at usage per process over time rather than at the total, to see who grows and who is merely being displaced.',
      'The picture was plainly mutual. As soon as one of them asked for memory, the other’s pages were swapped out; its next request pulled them back and displaced the first. Not a leak, but two neighbours taking turns pushing each other out of memory.',
      'That settled it: no parameter change would help. The problem was not inside either service, it was in the decision to house them together.',
      'Moved the speech synthesis into its own guest, carried the model directory over as a volume instead of downloading it again, and restricted access to the single caller that needs it.',
      'In the new guest the container system’s usual port forwarding did not work. Rather than repair it, the service now runs directly on the guest’s own network, which is the more robust route in this setup.',
    ],
    ergebnis: [
      'Memory use on the original guest fell from 98.5 percent to roughly 30, leaving about eight gigabytes free again.',
      'Both services have responded within their expected time ever since, without a single setting changed on either of them.',
      'The caller only had to swap one address; the interface stayed the same.',
    ],
    lesson:
      'When two services are slow only together and fast apart, the cause is rarely inside either one. The real decision was not “which service is too slow” but “should these two live next to each other at all”.',
  },
  {
    slug: 'ssh-war-nicht-das-problem',
    date: '2026-08-07',
    title: 'Access was dead, but the access service was not',
    teaser:
      'The server accepted connections and then went silent. The cause sat three layers below what the symptoms suggested.',
    tags: ['Troubleshooting', 'Storage', 'Operations'],
    problem:
      'Access to the central host was gone. Connections were accepted and then stayed mute: no login, no error, no disconnect. The host answered normally at the network level, and running services kept serving requests. The obvious move would have been to restart the access service or go through its configuration.',
    vorgehen: [
      'First established whether the problem was in the access service or beneath it: a port scan showed the port open and the connection established, only no greeting ever came back. That rules out both a network rule and a crashed service, because either would look different.',
      'Second clue: it was not only access. Anything that needed to read fresh data from disk hung; anything already in memory kept running. That pattern points at the storage layer, not at one service.',
      'Reached the logs by a second route and searched there for messages below the filesystem, instead of staying inside the service logs.',
      'They showed transport errors of the storage device at bus level. The access service was simply waiting on file reads it needs at login, and those reads never returned.',
      'After a reset the system recovered on its own; what had been visible was then written down, so a recurrence is recognizable instead of showing up as an access problem again.',
    ],
    ergebnis: [
      'The cause was named rather than clicked away: not an access problem, a storage transport problem.',
      'Nothing was changed on the access service, because there was nothing on it to change.',
      'The failure signature is documented, so the same case takes minutes to classify next time instead of hours.',
    ],
    lesson:
      'A service that accepts a connection and then goes silent is almost always waiting on something else. When everything that reads fresh data from disk slows down at the same time, it pays to start below the filesystem rather than burn time in the service that merely shows the symptom.',
  },
  {
    slug: 'backup-vollstaendigkeit',
    date: '2026-08-04',
    title: 'A backup you cannot restore from is not a backup',
    teaser:
      'Every backup ran green. Two things were still missing that you would only miss for real in an emergency: the state data inside the guests, and the recovery tooling itself.',
    tags: ['Backup', 'Recovery', 'Verification'],
    problem:
      'Encrypted backups to a remote location ran on every host, and every run reported success. That is exactly the dangerous position: “runs green” only says the configured paths were backed up, not whether the configured paths are the right ones. What was missing was an independent answer to whether everything would actually be there in an emergency.',
    vorgehen: [
      'Instead of trusting the success messages, built a daily completeness check that answers per host whether a current backup exists and whether it contains the expected paths.',
      'First gap: the state data of the on-demand services lives inside the guests’ filesystems, which sit on a volume manager. The host’s file-level backup simply sees nothing there. Solved with a step ahead of each backup that extracts exactly those directories, after which the normal chain takes over.',
      'Second gap, and the more uncomfortable one: the scripts that would drive recovery in an emergency sat outside the backed-up scope themselves. After a full restore, the tool you restore with would have been gone. Added to the backup scope and verified inside a snapshot.',
      'Third gap: the encrypted bundle holding the credentials was missing for some of the hosts. Without the credentials the best backup is useless, because you cannot get at it.',
      'Finally verified that a failure actually reports: a failed run travels through the existing service monitoring into the notification channel, without needing any special handling of its own.',
    ],
    ergebnis: [
      'The completeness check reports cleanly for every host, including the credentials bundle, and the one host that is off is flagged as known-offline rather than silently absent.',
      'The state data from the guests sits encrypted at the remote location, even though the regular file backup would never have captured it.',
      'A recurring restore test pulls samples back and compares them byte for byte against the original, instead of merely confirming that a snapshot exists.',
    ],
    lesson:
      'The value of a backup is not decided by a green run but by what is missing when you restore. Two classes get overlooked almost every time: data created in a layer the backup cannot see into, and the tooling you need for the recovery itself.',
  },
  {
    slug: 'sichtbar-ohne-adresse',
    date: '2026-08-07',
    title: 'Being publicly listed without giving away your own address',
    teaser:
      'A service was supposed to appear in a public directory. Doing so registers the address it goes out from, and that was the home connection’s.',
    tags: ['Networking', 'VPN', 'Privacy'],
    problem:
      'A service inside the home setup had to be reachable from outside. The inbound path was solved: no port on the home router, but a VPN tunnel to my own edge server which forwards the traffic. From outside, only that server’s address was visible. Then came the requirement that the service be discoverable in a public directory, and that broke the construction: to register, the service calls the directory itself, and outbound it still took the direct route. So the directory recorded the home connection’s address.',
    vorgehen: [
      'Measured first instead of assuming: queried the guest’s own public address from inside it. It was the home connection’s, even though inbound traffic had long been going through the edge. Inbound and outbound are simply two different paths.',
      'Second, checked whether the registration could be skipped: without the public listing the service also stops answering the query used to determine the real user count. That query is the basis for automatic shutdown, so dropping it was not an option.',
      'So all outbound traffic from the guest now goes through the tunnel, not just the return path of inbound connections. The directory therefore sees the edge server’s address.',
      'To avoid dragging local access along, the local range stays on the direct path through a routing rule of its own. Otherwise every access from home would have detoured via the public server.',
      'Finally the counter-check: queried the guest’s public address again, and looked up which address the directory holds.',
    ],
    ergebnis: [
      'The service is discoverable in the public directory, listed with the edge server’s address.',
      'The home connection’s address appears neither inbound nor outbound, and there is still no port open on the home router.',
      'The query for the real user count keeps working, so automatic shutdown on idle stays possible.',
    ],
    lesson:
      'A hidden address is not a property of the inbound path alone. As soon as a service speaks outward itself, it gives itself away over the outbound path, and by default that is a different one. Securing only the return direction covers half the distance.',
  },
];

function sorted(list: Note[]): Note[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

/** Alle Beiträge, neueste zuerst. */
export function getNotes(locale: Locale): Note[] {
  return sorted(locale === 'en' ? NOTES_EN : NOTES);
}

/** Ein Beitrag; EN fällt auf DE zurück, falls die Übersetzung fehlt. */
export function getNote(slug: string, locale: Locale): Note | undefined {
  const de = NOTES.find((n) => n.slug === slug);
  if (locale !== 'en') return de;
  return NOTES_EN.find((n) => n.slug === slug) ?? de;
}

/** Slugs für generateStaticParams — sprachneutral, DE ist die vollständige Liste. */
export function getNoteSlugs(): string[] {
  return NOTES.map((n) => n.slug);
}
