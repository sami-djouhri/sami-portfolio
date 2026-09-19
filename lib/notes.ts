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
 * ★ Diese Rubrik trägt seit 2026-09-16 die Betriebs-Achse allein. Vorher stand
 * daneben eine eigene Seite `/betrieb`, die in sieben Feldern beschrieb, wie
 * überwacht, gesichert und aktualisiert wird. Sie ist auf Owner-Entscheid
 * entfallen, und zwar aus einem inhaltlichen Grund, der hier festgehalten
 * gehört: die Felder beschrieben Praxis, die jeder genauso aufschreiben könnte
 * („jeder Dienst meldet seinen Zustand, eine zentrale Messung sammelt ihn ein").
 * Ein Leser kann an so einem Satz nicht erkennen, ob er gelebt oder abgeschrieben
 * ist. Ein datierter Vorfall mit Irrweg und Ausgang kann das. Wer hier eine
 * Methoden-Seite nachrüsten will, baut die Behauptungen zurück, die gerade
 * bewusst entfernt wurden.
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
    slug: 'tausend-warnungen-vierundsechzig-ursachen',
    date: '2026-09-13',
    title: 'Tausend Warnungen, vierundsechzig Ursachen',
    teaser:
      'Der Schwachstellen-Bericht zählte fast sechshundert kritische Funde. Dahinter steckten vierundsechzig echte Ursachen, und der größte Block war kein Versäumnis.',
    tags: ['Patch-Stand', 'Container', 'Messen'],
    problem:
      'Ich hatte den Schwachstellen-Scan von einem Wirt auf alle ausgeweitet und bekam prompt die Quittung: fast sechshundert behebbare kritische Funde über die ganze Flotte. Eine Liste in dieser Größe ist erst einmal handlungsunfähig. Man kann sie nicht abarbeiten, man kann sie nicht ignorieren, und der erste Reflex, oben anzufangen und sich durchzuarbeiten, ist bei dieser Menge genau der falsche.',
    vorgehen: [
      'Statt zu sortieren habe ich gruppiert: nicht wie viele Funde gibt es, sondern wie viele verschiedene Schwachstellen stecken dahinter. Es waren vierundsechzig. Dieselben Handvoll Probleme, vielfach gezählt, weil sie in vielen Abbildern steckten.',
      'Der größte Block überraschte mich: gut zweihundert Funde lagen in Abbildern, die außer drei Bibliotheks-Treffern nichts Eigenes enthielten. Also einfach neu bauen, dachte ich.',
      'Das half nicht. Der Neubau holte dieselben Funde wieder herein, weil das offizielle Basis-Abbild sie selbst mitbringt: sein Paketstand ist so alt wie der Tag, an dem es gebaut wurde, und das kann Wochen her sein. Wer darauf aufsetzt, erbt diesen Stand, egal wie frisch der eigene Bau ist.',
      'Die Lösung war eine Zeile im Bau-Rezept, die den Paketstand beim Bauen aktualisiert. Eingebaut in achtundsechzig Rezepte, danach vierundsiebzig Dienste einzeln neu gebaut und jeder einzeln gegengemessen.',
      'Zwischendurch habe ich ein gemeinsames Basis-Abbild für alle Dienste gebaut und wieder zurückgenommen: für eine Sammlung, die andere selbst betreiben können sollen, ist ein Abbild, das nur bei mir existiert, eine Sackgasse.',
    ],
    ergebnis: [
      'Auf den beiden großen Wirten fielen die kritischen Funde um dreiundneunzig beziehungsweise hundertsiebzehn, der öffentlich erreichbare Auftritt steht bei null.',
      'Der Scan läuft nicht mehr auf einem Wirt, sondern auf allen, und trennt in der Auswertung, was ich beheben kann, von dem, was am Anbieter des Abbilds hängt.',
      'Der Rest ist benannt statt aufgehäuft: die verbliebenen Fälle haben je einen Grund und einen nächsten Schritt.',
    ],
    lesson:
      'Eine Fundliste ist keine Aufgabenliste. Solange ich nicht weiß, wie viele verschiedene Ursachen dahinterstecken, arbeite ich an Symptomen und messe meinen Fortschritt an einer Zahl, die von der Menge der Abbilder abhängt statt von meiner Arbeit. Und die zweite Lehre steckt in der falschen Annahme: ein fremdes Basis-Abbild ist nicht frisch, weil ich es heute ziehe. Es ist so alt wie sein Bautag.',
  },
  {
    slug: 'speicher-voll-und-keiner-sagte-es',
    date: '2026-09-12',
    title: 'Der Sicherungsspeicher war voll, und niemand sagte es',
    teaser:
      'Die Ablage außer Haus war zu hundert Prozent belegt, elf Megabyte frei. Der Prüfer, der die Sicherungen überwacht, meldete zwei Minuten vorher, dass alles in Ordnung ist.',
    tags: ['Backup', 'Überwachung', 'Kapazität'],
    problem:
      'Die Sicherung eines Knotens scheiterte morgens mit der Meldung, dass kein Platz mehr da sei. Die Ablage außerhalb des Hauses, die sich alle Wirte teilen, war voll: elf Megabyte frei auf einem Terabyte. Die übrigen Sicherungen an dem Tag liefen nur deshalb noch durch, weil sie zeitlich vorher dran waren. Das Beunruhigende war nicht der volle Speicher, sondern die Stille: der Prüfer, der genau dafür existiert, hatte zwei Minuten vor dem Fehlschlag gemeldet, dass alles in Ordnung ist.',
    vorgehen: [
      'Erst verstanden, warum er nichts gemerkt hat, statt ihn zu beschuldigen. Er misst die Frische der Sicherungen, also wie alt die jüngste Kopie je Wirt ist. Platz misst er nicht. Beides ist plausibel, und genau deshalb fällt die Lücke niemandem auf.',
      'Damit war auch klar, wann es aufgefallen wäre: erst wenn die Frist für die jüngste Kopie reißt, also nach rund zwei Wochen. Zwei Wochen ohne jede Kopie außer Haus.',
      'Einen Kapazitätswächter gebaut, der die Belegung misst und bei einer Schwelle meldet, bevor etwas scheitert. Bewusst nicht als eine weitere Prüfung im selben Prüfer, sondern als eigene Messung.',
      'Er fragt über drei unabhängige Wege an. Fällt einer aus, misst der nächste, und erreicht keiner die Ablage, meldet er die eigene Blindheit statt zu schweigen.',
      'Die Kette danach einmal scharf durchgespielt, von der Messung über die Regel bis zur Benachrichtigung auf dem Telefon. Eine gebaute Kette ist keine geprüfte Kette.',
      'Beim Aufräumen kam die nächste Überraschung: meine Schätzung, wie viel Platz das Löschen alter Stände zurückbringt, lag um das Fünfunddreißigfache daneben. Gemessen statt geschätzt hat am Ende die Entscheidung gedreht, nämlich zu mehr Platz statt zu kürzerer Aufbewahrung.',
    ],
    ergebnis: [
      'Ein voller Sicherungsspeicher meldet sich jetzt selbst, mit Vorlauf statt beim Fehlschlag.',
      'Die Messung kennt ihren eigenen Ausfall und schweigt nicht, wenn sie nichts sehen kann.',
      'Die Entscheidung über Aufbewahrung gegen Speichergröße fiel auf Basis gemessener Zuwächse, nicht auf Basis meiner Schätzung.',
    ],
    lesson:
      'Ein Prüfer misst genau das, was er misst, und nichts daneben. „Alles grün" hieß hier nur, dass die Kopien frisch waren, nicht dass die nächste auch noch hineinpasst. Seitdem frage ich bei jeder Überwachung zuerst, welche Aussage sie eigentlich belegt, und welche benachbarte Aussage sie mitzutragen scheint, ohne sie je geprüft zu haben.',
  },
  {
    slug: 'alarme-die-nie-feuern-konnten',
    date: '2026-09-12',
    title: 'Drei Alarme, die gar nicht auslösen konnten',
    teaser:
      'Alles war grün, also habe ich eine Ebene höher gemessen: nicht den Zustand der Systeme, sondern die Güte der Überwachung selbst.',
    tags: ['Überwachung', 'Alarmierung', 'Qualität'],
    problem:
      'Alle Dienste liefen, alle Messpunkte antworteten, kein Alarm stand an. Das ist genau der Zustand, in dem man aufhört zu suchen. Mich hat eine andere Zahl beschäftigt: von den Alarmregeln hatte die Hälfte in einem Monat kein einziges Mal angeschlagen. Das kann bedeuten, dass es nichts zu melden gab. Es kann auch bedeuten, dass sie es gar nicht könnten. Diese beiden Fälle sahen von außen identisch aus, und keine Anzeige unterschied sie.',
    vorgehen: [
      'Statt den Systemzustand noch einmal zu prüfen, habe ich die Regeln selbst geprüft: trifft der Ausdruck, auf den eine Regel schaut, überhaupt eine vorhandene Messreihe?',
      'Drei Regeln taten das nicht. Sie bezogen sich auf etwas, das es unter diesem Namen nicht mehr gab. Sie standen auf grün, weil sie ins Leere schauten, und hätten im Ernstfall geschwiegen.',
      'Daraus ein kleines Werkzeug gemacht, das die Prüfung regelmäßig wiederholt. Ausnahmen sind erlaubt, brauchen aber eine Begründung und verfallen von selbst, sobald die Regel wieder greift.',
      'Der erste Lauf meldete fünfundzwanzig Treffer. Fast alle davon waren mein eigener Fehler beim Formulieren der Abfrage, nicht echte Befunde. Das gehört zur Geschichte: ein neuer Wächter ist am Anfang eher Lärm als Signal, und wer den Lärm nicht abstellt, stellt bald den Wächter ab.',
      'Beim Aufräumen fiel ein zweites Muster auf: offene Punkte wurden genau einmal gemeldet, im Moment ihres Entstehens, und waren danach nirgends mehr sichtbar. Wer die eine Meldung verpasst, erfährt nie davon. Seitdem schreibt der Wächter zusätzlich den Zustand fort, nicht nur das Ereignis.',
    ],
    ergebnis: [
      'Alle Regeln bestehen die Prüfung, ob sie überhaupt auslösen können, und die Prüfung wiederholt sich von selbst.',
      'Die Zahl der Regeln ist dabei gewachsen, weil die neuen Wächter selbst überwacht werden wollen.',
      'Offene Punkte sind jetzt eine Zahl, die man auf null bringen kann, statt einer Meldung, die vorbeigezogen ist.',
      'Den besten Beleg lieferte der Wächter selbst: er meldete binnen Minuten meinen eigenen, noch nicht scharf geschalteten Zeitgeber.',
    ],
    lesson:
      'Eine Überwachung, die nie auslöst, ist zweideutig, und die angenehme Deutung ist die wahrscheinlich falsche. Seitdem behandle ich jede Regel wie Code, der einen Test braucht: nicht nur, ob sie beim echten Fehler anschlägt, sondern ob sie überhaupt etwas sieht. Und weil ein Wächter, der niemanden erreicht, dasselbe ist wie keiner, gehört der Weg bis zur Benachrichtigung zum Test dazu.',
  },
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
    slug: 'tausend-warnungen-vierundsechzig-ursachen',
    date: '2026-09-13',
    title: 'A thousand warnings, sixty-four causes',
    teaser:
      'The vulnerability report counted almost six hundred critical findings. Behind them sat sixty-four actual causes, and the largest block was not an omission.',
    tags: ['Patching', 'Containers', 'Measuring'],
    problem:
      'I had widened the vulnerability scan from one host to all of them and got the bill straight away: almost six hundred fixable critical findings across the fleet. A list that size is paralysing. You cannot work through it, you cannot ignore it, and the first reflex, starting at the top and grinding down, is exactly the wrong move at that volume.',
    vorgehen: [
      'Instead of sorting I grouped: not how many findings there are, but how many distinct vulnerabilities sit behind them. Sixty-four. The same handful of problems, counted many times over because they sat in many images.',
      'The largest block surprised me: a good two hundred findings sat in images that carried nothing of their own beyond three library hits. So just rebuild them, I thought.',
      'That did not help. The rebuild pulled the same findings straight back in, because the official base image carries them itself: its package state is as old as the day it was built, and that can be weeks ago. Anyone building on top inherits that state, no matter how fresh their own build is.',
      'The fix was one line in the build recipe that refreshes the package state at build time. Added to sixty-eight recipes, then seventy-four services rebuilt one by one and each one measured again afterwards.',
      'Along the way I built a shared base image for all services and took it back out: for a collection other people are meant to be able to run themselves, an image that exists only on my machine is a dead end.',
    ],
    ergebnis: [
      'On the two large hosts the critical findings dropped by ninety-three and a hundred and seventeen respectively; the publicly reachable site sits at zero.',
      'The scan no longer runs on one host but on all of them, and its report separates what I can fix from what depends on the image vendor.',
      'What remains is named rather than piled up: each remaining case has a reason and a next step.',
    ],
    lesson:
      'A findings list is not a task list. Until I know how many distinct causes sit behind it, I am treating symptoms and measuring progress against a number that depends on how many images I happen to run rather than on my work. The second lesson hides in the wrong assumption: a third-party base image is not fresh because I pulled it today. It is as old as the day it was built.',
  },
  {
    slug: 'speicher-voll-und-keiner-sagte-es',
    date: '2026-09-12',
    title: 'The backup storage was full, and nobody said a word',
    teaser:
      'The off-site storage was at a hundred percent, eleven megabytes free. The checker that watches the backups had reported everything fine two minutes earlier.',
    tags: ['Backup', 'Monitoring', 'Capacity'],
    problem:
      'One node\'s backup failed in the morning with a no-space-left message. The off-site storage all hosts share was full: eleven megabytes free out of a terabyte. The other backups that day only went through because their slot came earlier. The unsettling part was not the full disk, it was the silence: the checker that exists for exactly this had reported all clear two minutes before the failure.',
    vorgehen: [
      'First I worked out why it missed this, instead of blaming it. It measures freshness, meaning how old the most recent copy per host is. It does not measure space. Both are reasonable, and that is precisely why nobody notices the gap.',
      'That also told me when it would have surfaced: only once the freshness deadline breaks, so after roughly two weeks. Two weeks without any copy outside the house.',
      'Built a capacity watcher that measures utilisation and reports at a threshold, before anything fails. Deliberately not as one more check inside the existing checker, but as its own measurement.',
      'It asks over three independent paths. If one drops out the next one measures, and if none can reach the storage it reports its own blindness instead of staying quiet.',
      'Then I exercised the whole chain live, from the measurement through the rule to the notification on my phone. A chain that has been built is not a chain that has been proven.',
      'Cleaning up brought the next surprise: my estimate of how much space pruning old snapshots would return was off by a factor of thirty-five. Measuring instead of guessing flipped the decision in the end, towards more space rather than shorter retention.',
    ],
    ergebnis: [
      'A full backup target now announces itself, with lead time instead of at the point of failure.',
      'The measurement knows about its own outage and does not stay silent when it cannot see anything.',
      'The retention-versus-capacity decision was made on measured growth rather than on my estimate.',
    ],
    lesson:
      'A checker measures exactly what it measures and nothing adjacent. "All green" here only meant the copies were fresh, not that the next one would still fit. Since then my first question about any monitor is which claim it actually proves, and which neighbouring claim it appears to carry without ever having checked it.',
  },
  {
    slug: 'alarme-die-nie-feuern-konnten',
    date: '2026-09-12',
    title: 'Three alerts that could never have fired',
    teaser:
      'Everything was green, so I measured one level up: not the state of the systems, but the quality of the monitoring itself.',
    tags: ['Monitoring', 'Alerting', 'Quality'],
    problem:
      'Every service was running, every scrape target answered, no alert was pending. That is exactly the state in which you stop looking. A different number bothered me: half of the alert rules had not fired once in a month. That can mean there was nothing to report. It can also mean they are incapable of reporting. From the outside those two cases looked identical, and no dashboard told them apart.',
    vorgehen: [
      'Rather than checking system state again, I checked the rules themselves: does the expression a rule watches match any existing time series at all?',
      'Three did not. They referred to something that no longer existed under that name. They sat green because they were staring into the void, and in a real incident they would have stayed silent.',
      'I turned that into a small tool that repeats the check on a schedule. Exceptions are allowed but need a stated reason, and they expire by themselves once the rule works again.',
      'The first run reported twenty-five hits. Almost all of them were my own mistake in phrasing the query, not real findings. That belongs in the story: a new watcher is noise before it is signal, and whoever does not silence the noise soon silences the watcher.',
      'While cleaning up, a second pattern showed: open items were reported exactly once, at the moment they appeared, and were invisible afterwards. Miss that one message and you never learn about it. The watcher now also carries the state forward, not just the event.',
    ],
    ergebnis: [
      'Every rule passes the check for whether it can fire at all, and the check repeats itself.',
      'The number of rules grew in the process, because the new watchers want watching too.',
      'Open items are now a number you can drive to zero, instead of a message that has scrolled past.',
      'The best proof came from the watcher itself: within minutes it flagged my own timer, which I had not armed yet.',
    ],
    lesson:
      'Monitoring that never fires is ambiguous, and the comfortable reading is probably the wrong one. Since then I treat every rule like code that needs a test: not only whether it fires on a real fault, but whether it can see anything at all. And because a watcher that reaches nobody equals no watcher, the path all the way to the notification is part of that test.',
  },
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

/**
 * Was NICHT übertragbar ist.
 *
 * Stand bis 2026-09-16 am Ende von `/betrieb` und ist der einzige Teil jener
 * Seite, der eine eigene Aussage trug: die anderen Abschnitte beschrieben, was
 * gut läuft, dieser nennt, was fehlt. Deshalb ist er mitgewandert statt
 * mitgelöscht worden. Er steht bewusst unter den Einträgen und nicht klein in
 * der Fußzeile: wer einstellt, fragt ohnehin danach, und die Antwort ist
 * besser, wenn sie nicht erst herausgefragt werden muss.
 */
export const BETRIEB_GRENZEN: Record<Locale, string[]> = {
  de: [
    'Das ist Eigenbetrieb, kein Team-Betrieb. Rollentrennung, Vier-Augen-Prinzip und Freigaben durch jemand anderen kenne ich als Konzept, nicht aus der täglichen Übung. In einem Team wären sie das, was hier meine eigene Disziplin leistet.',
    'Die Last ist echt, aber überschaubar: ein Haushalt, keine hunderten gleichzeitigen Nutzer. Ausgelegt ist alles auf Wartbarkeit und Härtung, nicht auf Lastspitzen.',
    'Alles steht an einem Anschluss. Es gibt keinen zweiten Standort und kein automatisches Umschalten; fällt der Anschluss aus, greift ein dokumentierter Wiederanlauf, kein Ausweichrechenzentrum.',
    'Es gibt keine Vertragsfristen, gegen die ich messe. Was hier Frist heißt, habe ich mir selbst gesetzt.',
  ],
  en: [
    'This is self-operation, not team operation. Role separation, four-eyes approval and sign-off by someone else are concepts to me rather than daily practice. In a team they would do what my own discipline does here.',
    'The load is real but modest: one household, not hundreds of concurrent users. Everything is built for maintainability and hardening, not for peak traffic.',
    'It all sits on one connection. There is no second site and no automatic failover; if the line goes, a documented restart procedure applies, not a fallback data centre.',
    'There are no contractual targets I measure against. What I call a deadline here, I set myself.',
  ],
};

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
