import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: timeline 5/4; limits 3/2
// aus der englischen Datei:
// Am 2026-10-18 vollstaendig nachgezogen. Diese Fallstudie war kein
// Uebersetzungsproblem, sondern ein alter STAND: sie beschrieb noch das
// quantitative System (lognormal-t, 5-Prozent-Quantil, Kelly), das auf der
// deutschen Seite am 2026-09-30 ersetzt wurde. Auf `/en` las sich die Arbeit
// damit als Statistik-Projekt und auf `/de` als Hardware-Bewertung, bei
// gleichem Titel und gleichem Bild.
//
// Zwei Regeln sind hier zusammengefallen: „Englisch ist gleichwertig, jede
// Textaenderung sofort in beiden Sprachen" (15.10.) und „kein Begriff auf
// der Seite, den der Owner nicht selbst erklaeren kann" (30.09.). Der
// Stilpruefer meldete die zweite Haelfte als zehn Treffer der Klasse
// „Fachwort Statistik"; die erste Haelfte faellt dort nicht auf, weil ein
// alter Stand genauso aussieht wie ein gepflegter.
const marktwatch: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Der Bot durchsucht Kleinanzeigen und eBay nach Hardware, die unter ihrem Wert angeboten wird. Der naheliegende Ansatz, nach günstigen Komplettgeräten zu suchen, trägt nicht weit: dort ist der Markt effizient. Die Marge liegt bei Geräten, die defekt, unterbestückt oder nackt angeboten werden, weil der Verkäufer den Aufwand scheut. Ein Mini-PC mit 8 GB und ohne SSD ist deshalb kein Fehlalarm, sondern der eigentliche Fall. Das macht die Bewertung schwer: der Bot muss einschätzen, was ein Gerät nach Reparatur oder Aufrüstung wert ist, und was der Weg dorthin kostet.',
    approach: [
      'Aus dem Angebotstitel werden die Ausstattungsmerkmale gelesen, also Arbeitsspeicher, Datenträger, Prozessor und ob es ein Barebone ist. Darauf setzt die gesamte Bewertung auf.',
      'Für unterbestückte Geräte rechnet ein eigener Teil die Aufrüstung durch: Teilekosten gegen den Verkaufswert der Vollausstattung, abzüglich Plattform- und Zahlungsgebühren. Die Teilepreise sind konservative Gebrauchtpreise und bewusst zu hoch angesetzt, lieber eine Chance verpassen als einen Verlustkauf als Schnäppchen melden.',
      'Für defekte Geräte schätzt ein weiterer Teil aus dem erkannten Fehlerbild die Reparaturkosten, die Erfolgsaussicht und den Wert nach der Reparatur. Vierzehn Fehlerbilder sind hinterlegt, kalibriert auf Mini-PCs und Einplatinenrechner. Ein defektes Display ist dort kein Thema, und ein Gerät, das nicht bootet, ist meistens Kleinkram an Speicher oder Knopfzelle.',
      'Bewertet wird gegen echte Verkäufe der letzten 30 Tage statt gegen Forderungen, ältere zählen weniger. Ausgegeben wird nicht nur der erwartete Gewinn, sondern auch, was im schlechten Fall übrig bleibt.',
      'Ein Angebot, das nicht zum gesuchten Gerät passt, wird nicht weggeworfen, sondern gegen die übrigen Suchaufträge und gegen den Ersatzteilbedarf geprüft.',
      'Der Bot misst seine eigene Trefferquote. Zu jedem Alarm wird festgehalten, ob daraus ein Kauf wurde, ob er ignoriert wurde oder ein Fehlalarm war. Daraus entsteht eine Quote je Meldungsstufe und je Quelle.',
      'Alles, was sich nicht zurücknehmen lässt, braucht zwei gesetzte Schalter. Ohne beide läuft der Bot beobachtend.',
    ],
    architecture: {
      summary: 'Crawler liefern in eine Erkennung, die aus dem Titel die Ausstattung liest. Darauf setzen drei Bewertungswege auf: Aufrüstung für unterbestückte Geräte, Reparatur für defekte, direkter Wiederverkauf für vollständige. Jeder Weg rechnet gegen echte Verkaufspreise und gibt den schlechten Fall mit aus. Was keinem Suchauftrag entspricht, wird gegen die übrigen und gegen den Ersatzteilbedarf geprüft. Die Rückmeldung zu jedem Alarm fließt in eine Trefferquote je Stufe und Quelle zurück.',
      tiers: [
        {
          label: 'Quellen',
          nodes: [
            {
              id: 'crawl',
              label: 'Crawler',
              note: 'eine Schnittstelle',
              kind: 'edge',
            },
            {
              id: 'breaker',
              label: 'Circuit-Breaker',
              note: 'je Quelle',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Erkennung',
          nodes: [
            {
              id: 'specs',
              label: 'Ausstattung aus dem Titel',
              note: 'RAM · SSD · CPU · Barebone',
              kind: 'core',
            },
            {
              id: 'defect',
              label: 'Fehlerbild',
              note: '14 Profile',
              kind: 'core',
            },
            {
              id: 'rules',
              label: 'Regelfilter',
              note: 'bekannte Fallen',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Bewertung',
          nodes: [
            {
              id: 'upgrade',
              label: 'Aufrüstung',
              note: 'Teilekosten + Gebühren',
              kind: 'core',
            },
            {
              id: 'refurb',
              label: 'Reparatur',
              note: 'Kosten · Chance · Wert danach',
              kind: 'core',
            },
            {
              id: 'stats',
              label: 'Echte Verkaufspreise',
              note: '30 Tage, frische zählen mehr',
              kind: 'core',
            },
            {
              id: 'downside',
              label: 'Sperre',
              note: 'schlechter Fall muss tragen',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Ausgabe & Rückkopplung',
          nodes: [
            {
              id: 'alert',
              label: 'Sofort-Alarm',
              note: 'gedrosselt',
              kind: 'consumer',
            },
            {
              id: 'digest',
              label: 'Tagesübersicht',
              kind: 'consumer',
            },
            {
              id: 'cross',
              label: 'Zweitverwertung',
              note: 'anderer Suchauftrag oder Ersatzteil',
              kind: 'core',
            },
            {
              id: 'perf',
              label: 'Trefferquote',
              note: 'aus Rückmeldung je Stufe',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'crawl',
          to: 'specs',
          label: 'Rohtreffer',
        },
        {
          from: 'specs',
          to: 'upgrade',
          label: 'unterbestückt',
        },
        {
          from: 'defect',
          to: 'refurb',
          label: 'defekt',
        },
        {
          from: 'rules',
          to: 'stats',
          label: 'vollständig',
        },
        {
          from: 'upgrade',
          to: 'downside',
        },
        {
          from: 'refurb',
          to: 'downside',
        },
        {
          from: 'stats',
          to: 'downside',
          label: 'schlechter Fall',
        },
        {
          from: 'downside',
          to: 'alert',
          label: 'nur „kaufen“',
        },
        {
          from: 'downside',
          to: 'digest',
        },
        {
          from: 'rules',
          to: 'cross',
          label: 'passt nicht',
        },
        {
          from: 'alert',
          to: 'perf',
          label: 'gekauft oder nicht',
        },
      ],
    },
    result: [
      'Läuft seit 2025 durchgehend, inzwischen mit mehreren Nutzern und eigenem Budget je Nutzer.',
      'Drei Bewertungswege statt einem. Unterbestückte und defekte Geräte werden durchgerechnet. Bei ihnen ist die Marge am größten.',
      'Die Trefferquote wird gemessen. Jede Meldung bekommt eine Rückmeldung, daraus entsteht eine Quote je Stufe und Quelle.',
      'Der Betrieb kostet nichts je bewertetem Angebot, die Bewertung ist gerechnet und nicht eingekauft.',
      '869 Testfunktionen decken die Bewertung ab. Sie lässt sich ohne laufende Crawler durchrechnen.',
    ],
    decisions: [
      {
        title: 'Unterbestückte Geräte sind der Fall, nicht die Ausnahme',
        body: 'Ein Gerät mit 8 GB und ohne Datenträger sieht aus wie ein schlechtes Angebot und ist das Gegenteil. Wer es bestückt, verkauft die Vollausstattung weiter. Deshalb gibt es einen eigenen Rechenweg dafür, mit Teilepreisen, Plattformgebühr und Zahlungsgebühr. Die Teilepreise sind absichtlich zu hoch angesetzt.',
      },
      {
        title: 'Defekte bewerten statt aussortieren',
        body: 'Zu vierzehn Fehlerbildern ist hinterlegt, was die Reparatur kostet, wie wahrscheinlich sie gelingt und was das Gerät danach wert ist. Die Profile sind auf Mini-PCs und Einplatinenrechner kalibriert. Für Laptops gelten sie nicht. Bei diesen Geräten spielt ein defektes Display keine Rolle, und eines, das nicht startet, hat meistens ein kleines Problem.',
      },
      {
        title: 'Am schlechten Fall rechnen, nicht am Schnitt',
        body: 'Aus einem einzelnen fairen Preis lässt sich das Risiko nicht ablesen. Gebraucht wird, was übrig bleibt, wenn es schlecht läuft, und wieviel man dann höchstens setzen sollte. Angebote, die nur im Durchschnitt gut aussehen, fallen damit raus.',
      },
      {
        title: 'Der Bot misst seine eigene Trefferquote',
        body: 'Zu jedem Alarm wird festgehalten, was daraus wurde. Daraus entsteht eine Quote je Meldungsstufe und Quelle. Ohne diese Rückkopplung ist jede Schwelle geraten, und man merkt erst nach Monaten, dass eine Quelle nur Rauschen liefert.',
      },
      {
        title: 'Ein Gate für beide Meldewege',
        body: 'Sofort-Alarm und Tagesübersicht hatten getrennte Filter. Fehlte für eine Kategorie die Vergleichsbasis, rutschten Fehlalarme über den einen Weg trotzdem durch. Beide teilen sich jetzt dasselbe Gate.',
      },
      {
        title: 'Unumkehrbares hinter zwei Schaltern',
        body: 'Die Watchlist aufräumen oder etwas nach außen schreiben braucht zwei gesetzte Schalter. Alles andere läuft als Probelauf. Dafür reicht eine Festlegung in der Dokumentation nicht.',
      },
    ],
    metrics: [
      {
        label: 'Bewertungswege',
        value: 'Aufrüstung · Reparatur · Direktverkauf',
      },
      {
        label: 'Fehlerbilder hinterlegt',
        value: '14, auf Mini-PCs kalibriert',
      },
      {
        label: 'Tests',
        value: '869 Testfunktionen',
      },
      {
        label: 'Unumkehrbares',
        value: 'zwei Schalter, sonst nur beobachten',
      },
    ],
    timeline: [
      {
        when: '2025',
        what: 'Erste Quelle, Crawler, erste Bewertung',
      },
      {
        when: '2026 H1',
        what: 'Bewertung gegen echte Verkaufspreise, schlechter Fall dazu, Sicherheitsschalter',
      },
      {
        when: '2026 H1',
        what: 'Gemeinsames Gate nach einer Welle von Fehlalarmen',
      },
      {
        when: '2026 H1',
        what: 'Aufrüst- und Reparaturrechnung, Zweitverwertung nicht passender Funde',
      },
      {
        when: '2026 H2',
        what: 'Mehr Quellen, Tagesübersicht, Trefferquote aus Rückmeldungen, mehrere Nutzer',
      },
    ],
    limits: [
      'Die Teilepreise und Reparaturprofile sind von Hand gepflegt und auf eine Geräteklasse kalibriert. Für Laptops oder Serverhardware müssten sie neu erhoben werden.',
      'Die Trefferquote hängt daran, dass ich jeden Alarm zurückmelde. Bleibt die Rückmeldung aus, altert die Messung still.',
      'Der Bot kauft nicht selbst. Die Entscheidung und der Kauf bleiben von Hand, und das ist eine bewusste Grenze, keine fehlende Ausbaustufe.',
    ],
  },
  enAlt: {
    problem: 'The bot searches classifieds and eBay for hardware offered below its value. The obvious approach, looking for cheap complete machines, does not get far, because that market is efficient. The margin sits with machines offered faulty, under-specced or bare, because the seller does not want the work. A mini PC with 8 GB and no SSD is therefore not a false alarm but the actual case. That makes scoring hard. The bot has to judge what a machine is worth after repair or an upgrade, and what getting there costs.',
    approach: [
      'The specs are read out of the listing title, meaning memory, drive, processor and whether it is a barebone. All scoring builds on that.',
      'For under-specced machines a dedicated part works through the upgrade. Parts cost against the resale value of the full configuration, minus platform and payment fees. The part prices are conservative second-hand prices and deliberately set too high. Missing an opportunity is better than reporting a loss-making buy as a bargain.',
      'For faulty machines another part estimates repair cost, chance of success and the value afterwards from the recognised fault pattern. Fourteen fault patterns are on file, calibrated for mini PCs and single-board computers. A broken display is no issue there, and a machine that does not boot usually needs something small on memory or the coin cell.',
      'Scoring runs against real sales of the last 30 days rather than against asking prices, and older sales count for less. The output carries the expected profit and what is left in the bad case.',
      'A listing that does not match the wanted machine is not discarded. It is checked against the other search jobs and against the spare parts I need.',
      'The bot measures its own hit rate. For every alert it records whether it led to a purchase, was ignored or was a false alarm. That yields a rate per alert level and per source.',
      'Anything that cannot be undone needs two flags set. Without both, the bot only observes.',
    ],
    architecture: {
      summary: 'Crawlers feed a recognition stage that reads the specs out of the title. Three scoring paths build on it: upgrading for under-specced machines, repair for faulty ones, direct resale for complete ones. Every path works against real sales prices and reports the bad case alongside. Whatever matches no search job is checked against the others and against spare parts needed. The feedback on every alert flows back into a hit rate per level and source.',
      tiers: [
        {
          label: 'Sources',
          nodes: [
            {
              id: 'crawl',
              label: 'Crawlers',
              note: 'one interface',
              kind: 'edge',
            },
            {
              id: 'breaker',
              label: 'Circuit breaker',
              note: 'per source',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Recognition',
          nodes: [
            {
              id: 'specs',
              label: 'Specs from the title',
              note: 'RAM · SSD · CPU · barebone',
              kind: 'core',
            },
            {
              id: 'defect',
              label: 'Fault pattern',
              note: '14 profiles',
              kind: 'core',
            },
            {
              id: 'rules',
              label: 'Rule filter',
              note: 'known traps',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Scoring',
          nodes: [
            {
              id: 'upgrade',
              label: 'Upgrade',
              note: 'parts cost + fees',
              kind: 'core',
            },
            {
              id: 'refurb',
              label: 'Repair',
              note: 'cost · chance · value after',
              kind: 'core',
            },
            {
              id: 'stats',
              label: 'Real sales prices',
              note: '30 days, recent counts more',
              kind: 'core',
            },
            {
              id: 'downside',
              label: 'Gate',
              note: 'the bad case has to hold',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Output & feedback',
          nodes: [
            {
              id: 'alert',
              label: 'Instant alert',
              note: 'throttled',
              kind: 'consumer',
            },
            {
              id: 'digest',
              label: 'Daily digest',
              kind: 'consumer',
            },
            {
              id: 'cross',
              label: 'Second use',
              note: 'other search job or spare part',
              kind: 'core',
            },
            {
              id: 'perf',
              label: 'Hit rate',
              note: 'from feedback per level',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'crawl',
          to: 'specs',
          label: 'raw hits',
        },
        {
          from: 'specs',
          to: 'upgrade',
          label: 'under-specced',
        },
        {
          from: 'defect',
          to: 'refurb',
          label: 'faulty',
        },
        {
          from: 'rules',
          to: 'stats',
          label: 'complete',
        },
        {
          from: 'upgrade',
          to: 'downside',
        },
        {
          from: 'refurb',
          to: 'downside',
        },
        {
          from: 'stats',
          to: 'downside',
          label: 'bad case',
        },
        {
          from: 'downside',
          to: 'alert',
          label: '"buy" only',
        },
        {
          from: 'downside',
          to: 'digest',
        },
        {
          from: 'rules',
          to: 'cross',
          label: 'does not match',
        },
        {
          from: 'alert',
          to: 'perf',
          label: 'bought or not',
        },
      ],
    },
    result: [
      'Running continuously since 2025, by now with several users and a budget per user.',
      'Three scoring paths instead of one. Under-specced and faulty machines are worked through. Their margin is the largest.',
      'The hit rate is measured. Every alert gets feedback, which yields a rate per level and source.',
      'Operation costs nothing per scored listing. The scoring is computed here and not bought in.',
      '869 test functions cover the scoring. It can be run through without live crawlers.',
    ],
    decisions: [
      {
        title: 'Under-specced machines are the case, not the exception',
        body: 'A machine with 8 GB and no drive looks like a bad offer and is the opposite. Fit it out and you resell the full configuration. There is a dedicated calculation for that, with part prices, platform fee and payment fee. The part prices are set too high on purpose.',
      },
      {
        title: 'Score faults instead of sorting them out',
        body: 'For fourteen fault patterns the file holds what the repair costs, how likely it succeeds and what the machine is worth afterwards. The profiles are calibrated for mini PCs and single-board computers. They do not apply to laptops. On these machines a broken display does not matter, and one that will not start usually has a small problem.',
      },
      {
        title: 'Compute the bad case, not the average',
        body: 'A single fair price says nothing about the risk. What is needed is what is left when things go badly, and how much one should put in at most. Offers that only look good on average drop out that way.',
      },
      {
        title: 'The bot measures its own hit rate',
        body: 'For every alert it records what came of it. That yields a rate per alert level and source. Without this feedback every threshold is a guess, and it takes months to notice that a source only delivers noise.',
      },
      {
        title: 'One gate for both alert paths',
        body: 'The instant alert and the daily digest had separate filters. When a category lost its reference data, false alarms still slipped through on one of the paths. Both now share the same gate.',
      },
      {
        title: 'The irreversible behind two flags',
        body: 'Clearing the watchlist or writing anything to the outside needs two flags set. Everything else runs as a dry run. A rule in the documentation is not enough for that.',
      },
    ],
    metrics: [
      {
        label: 'Scoring',
        value: 'three paths · bad case reported alongside',
      },
      {
        label: 'Fault patterns',
        value: '14 profiles · cost, chance, value after',
      },
      {
        label: 'The irreversible',
        value: 'two-flag gate · observation by default',
      },
      {
        label: 'Access',
        value: 'invite-only · per-user budget',
      },
    ],
    timeline: [
      {
        when: '2025',
        what: 'Crawler base, first source, weighted scoring',
      },
      {
        when: '2026 H1',
        what: 'Upgrade and repair calculation, scoring against real sales prices',
      },
      {
        when: '2026 H1',
        what: 'Shared gate after an alarm burst, rule patterns against the known traps',
      },
      {
        when: '2026 H2',
        what: 'More sources, daily digest, invite multiuser with a per-user budget',
      },
    ],
    limits: [
      'The part prices and repair profiles are maintained by hand and calibrated for one class of machine. For laptops or server hardware they would have to be collected again.',
      'The hit rate depends on me reporting back on every alert. If the feedback stops, the measurement ages quietly.',
    ],
  },
};

export default marktwatch;
