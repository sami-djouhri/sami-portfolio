import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-07 (vorher Uebergangsform). Bei dieser
// Arbeit war das Englisch seit dem 2026-10-18 schon nachgezogen: Vorgehen,
// Ergebnis, Entscheidungen und das Architekturbild passten Eintrag fuer Eintrag
// (Knoten-IDs und Pfeile in beiden Haelften gleich, beim Umschreiben geprueft).
// Neu geschrieben sind nur die Stellen, die nicht passten: die Kennzahlen (die
// englische Reihe nannte andere Werte), die Zeitleiste (5 gegen 4 Eintraege,
// andere Reihenfolge) und die dritte Grenze, die auf Englisch fehlte.
//
// Messbefehle im Repo docker/marktwatch (Stand 2026-11-07, Commit 4047c72):
// - Tests: alle .py ohne node_modules/.venv, Muster "def test_", ergab 879
//   (am 2026-10-17: 869).
// - Fehlerbilder: Eintraege in DEFECT_PROFILES, api/reselling/refurb_assessor.py, 14.
// - Kein automatisches Kaufen oder Bieten: Projektregel in die Projektregeln.
// - Zwei Schalter: WATCHLIST_CLEANUP und --apply (ebenda).
//
// Vorgeschichte der englischen Haelfte: bis zum 2026-10-18 beschrieb sie noch das
// quantitative System (lognormal-t, 5-Prozent-Quantil, Kelly), das auf der
// deutschen Seite am 2026-09-30 ersetzt wurde. Fachwoerter aus Statistik und
// Finanzmathematik bleiben draussen (Textstil-Regel 6 in die Projektregeln).
const marktwatch: Fallstudie = {
  problem: { de: 'Der Bot durchsucht Kleinanzeigen und eBay nach Hardware, die unter ihrem Wert angeboten wird. Der naheliegende Ansatz, nach günstigen Komplettgeräten zu suchen, trägt nicht weit: dort ist der Markt effizient. Die Marge liegt bei Geräten, die defekt, unterbestückt oder nackt angeboten werden, weil der Verkäufer den Aufwand scheut. Ein Mini-PC mit 8 GB und ohne SSD ist deshalb kein Fehlalarm, sondern der eigentliche Fall. Das macht die Bewertung schwer: der Bot muss einschätzen, was ein Gerät nach Reparatur oder Aufrüstung wert ist, und was der Weg dorthin kostet.', en: 'The bot searches classifieds and eBay for hardware offered below its value. The obvious approach, looking for cheap complete machines, does not get far, because that market is efficient. The margin sits with machines offered faulty, under-specced or bare, because the seller does not want the work. A mini PC with 8 GB and no SSD is therefore not a false alarm but the actual case. That makes scoring hard. The bot has to judge what a machine is worth after repair or an upgrade, and what getting there costs.' },
  approach: [
    { de: 'Aus dem Angebotstitel werden die Ausstattungsmerkmale gelesen, also Arbeitsspeicher, Datenträger, Prozessor und ob es ein Barebone ist. Darauf setzt die gesamte Bewertung auf.', en: 'The specs are read out of the listing title, meaning memory, drive, processor and whether it is a barebone. All scoring builds on that.' },
    { de: 'Für unterbestückte Geräte rechnet ein eigener Teil die Aufrüstung durch: Teilekosten gegen den Verkaufswert der Vollausstattung, abzüglich Plattform- und Zahlungsgebühren. Die Teilepreise sind konservative Gebrauchtpreise und bewusst zu hoch angesetzt, lieber eine Chance verpassen als einen Verlustkauf als Schnäppchen melden.', en: 'For under-specced machines a dedicated part works through the upgrade. Parts cost against the resale value of the full configuration, minus platform and payment fees. The part prices are conservative second-hand prices and deliberately set too high. Missing an opportunity is better than reporting a loss-making buy as a bargain.' },
    { de: 'Für defekte Geräte schätzt ein weiterer Teil aus dem erkannten Fehlerbild die Reparaturkosten, die Erfolgsaussicht und den Wert nach der Reparatur. Vierzehn Fehlerbilder sind hinterlegt, kalibriert auf Mini-PCs und Einplatinenrechner. Ein defektes Display ist dort kein Thema, und ein Gerät, das nicht bootet, ist meistens Kleinkram an Speicher oder Knopfzelle.', en: 'For faulty machines another part estimates repair cost, chance of success and the value afterwards from the recognised fault pattern. Fourteen fault patterns are on file, calibrated for mini PCs and single-board computers. A broken display is no issue there, and a machine that does not boot usually needs something small on memory or the coin cell.' },
    { de: 'Bewertet wird gegen echte Verkäufe der letzten 30 Tage statt gegen Forderungen, ältere zählen weniger. Ausgegeben wird nicht nur der erwartete Gewinn, sondern auch, was im schlechten Fall übrig bleibt.', en: 'Scoring runs against real sales of the last 30 days rather than against asking prices, and older sales count for less. The output carries the expected profit and what is left in the bad case.' },
    { de: 'Ein Angebot, das nicht zum gesuchten Gerät passt, wird nicht weggeworfen, sondern gegen die übrigen Suchaufträge und gegen den Ersatzteilbedarf geprüft.', en: 'A listing that does not match the wanted machine is not discarded. It is checked against the other search jobs and against the spare parts I need.' },
    { de: 'Der Bot misst seine eigene Trefferquote. Zu jedem Alarm wird festgehalten, ob daraus ein Kauf wurde, ob er ignoriert wurde oder ein Fehlalarm war. Daraus entsteht eine Quote je Meldungsstufe und je Quelle.', en: 'The bot measures its own hit rate. For every alert it records whether it led to a purchase, was ignored or was a false alarm. That yields a rate per alert level and per source.' },
    { de: 'Alles, was sich nicht zurücknehmen lässt, braucht zwei gesetzte Schalter. Ohne beide läuft der Bot beobachtend.', en: 'Anything that cannot be undone needs two flags set. Without both, the bot only observes.' },
  ],
  architecture: {
    summary: { de: 'Crawler liefern in eine Erkennung, die aus dem Titel die Ausstattung liest. Darauf setzen drei Bewertungswege auf: Aufrüstung für unterbestückte Geräte, Reparatur für defekte, direkter Wiederverkauf für vollständige. Jeder Weg rechnet gegen echte Verkaufspreise und gibt den schlechten Fall mit aus. Was keinem Suchauftrag entspricht, wird gegen die übrigen und gegen den Ersatzteilbedarf geprüft. Die Rückmeldung zu jedem Alarm fließt in eine Trefferquote je Stufe und Quelle zurück.', en: 'Crawlers feed a recognition stage that reads the specs out of the title. Three scoring paths build on it: upgrading for under-specced machines, repair for faulty ones, direct resale for complete ones. Every path works against real sales prices and reports the bad case alongside. Whatever matches no search job is checked against the others and against spare parts needed. The feedback on every alert flows back into a hit rate per level and source.' },
    tiers: [
      {
        label: { de: 'Quellen', en: 'Sources' },
        nodes: [
          { id: 'crawl', label: { de: 'Crawler', en: 'Crawlers' }, note: { de: 'eine Schnittstelle', en: 'one interface' }, kind: 'edge' },
          { id: 'breaker', label: { de: 'Circuit-Breaker', en: 'Circuit breaker' }, note: { de: 'je Quelle', en: 'per source' }, kind: 'edge' },
        ],
      },
      {
        label: { de: 'Erkennung', en: 'Recognition' },
        nodes: [
          { id: 'specs', label: { de: 'Ausstattung aus dem Titel', en: 'Specs from the title' }, note: { de: 'RAM · SSD · CPU · Barebone', en: 'RAM · SSD · CPU · barebone' }, kind: 'core' },
          { id: 'defect', label: { de: 'Fehlerbild', en: 'Fault pattern' }, note: { de: '14 Profile', en: '14 profiles' }, kind: 'core' },
          { id: 'rules', label: { de: 'Regelfilter', en: 'Rule filter' }, note: { de: 'bekannte Fallen', en: 'known traps' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Bewertung', en: 'Scoring' },
        nodes: [
          { id: 'upgrade', label: { de: 'Aufrüstung', en: 'Upgrade' }, note: { de: 'Teilekosten + Gebühren', en: 'parts cost + fees' }, kind: 'core' },
          { id: 'refurb', label: { de: 'Reparatur', en: 'Repair' }, note: { de: 'Kosten · Chance · Wert danach', en: 'cost · chance · value after' }, kind: 'core' },
          { id: 'stats', label: { de: 'Echte Verkaufspreise', en: 'Real sales prices' }, note: { de: '30 Tage, frische zählen mehr', en: '30 days, recent counts more' }, kind: 'core' },
          { id: 'downside', label: { de: 'Sperre', en: 'Gate' }, note: { de: 'schlechter Fall muss tragen', en: 'the bad case has to hold' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Ausgabe & Rückkopplung', en: 'Output & feedback' },
        nodes: [
          { id: 'alert', label: { de: 'Sofort-Alarm', en: 'Instant alert' }, note: { de: 'gedrosselt', en: 'throttled' }, kind: 'consumer' },
          { id: 'digest', label: { de: 'Tagesübersicht', en: 'Daily digest' }, kind: 'consumer' },
          { id: 'cross', label: { de: 'Zweitverwertung', en: 'Second use' }, note: { de: 'anderer Suchauftrag oder Ersatzteil', en: 'other search job or spare part' }, kind: 'core' },
          { id: 'perf', label: { de: 'Trefferquote', en: 'Hit rate' }, note: { de: 'aus Rückmeldung je Stufe', en: 'from feedback per level' }, kind: 'data' },
        ],
      },
    ],
    flows: [
      { from: 'crawl', to: 'specs', label: { de: 'Rohtreffer', en: 'raw hits' } },
      { from: 'specs', to: 'upgrade', label: { de: 'unterbestückt', en: 'under-specced' } },
      { from: 'defect', to: 'refurb', label: { de: 'defekt', en: 'faulty' } },
      { from: 'rules', to: 'stats', label: { de: 'vollständig', en: 'complete' } },
      { from: 'upgrade', to: 'downside' },
      { from: 'refurb', to: 'downside' },
      { from: 'stats', to: 'downside', label: { de: 'schlechter Fall', en: 'bad case' } },
      { from: 'downside', to: 'alert', label: { de: 'nur „kaufen“', en: '"buy" only' } },
      { from: 'downside', to: 'digest' },
      { from: 'rules', to: 'cross', label: { de: 'passt nicht', en: 'does not match' } },
      { from: 'alert', to: 'perf', label: { de: 'gekauft oder nicht', en: 'bought or not' } },
    ],
  },
  result: [
    { de: 'Läuft seit 2025 durchgehend, inzwischen mit mehreren Nutzern und eigenem Budget je Nutzer.', en: 'Running continuously since 2025, by now with several users and a budget per user.' },
    { de: 'Drei Bewertungswege statt einem. Unterbestückte und defekte Geräte werden durchgerechnet. Bei ihnen ist die Marge am größten.', en: 'Three scoring paths instead of one. Under-specced and faulty machines are worked through. Their margin is the largest.' },
    { de: 'Die Trefferquote wird gemessen. Jede Meldung bekommt eine Rückmeldung, daraus entsteht eine Quote je Stufe und Quelle.', en: 'The hit rate is measured. Every alert gets feedback, which yields a rate per level and source.' },
    { de: 'Der Betrieb kostet nichts je bewertetem Angebot, die Bewertung ist gerechnet und nicht eingekauft.', en: 'Operation costs nothing per scored listing. The scoring is computed here and not bought in.' },
    { de: '879 Testfunktionen decken die Bewertung ab. Sie lässt sich ohne laufende Crawler durchrechnen.', en: '879 test functions cover the scoring. It can be run through without live crawlers.' },
  ],
  decisions: [
    {
      title: { de: 'Unterbestückte Geräte sind der Fall, nicht die Ausnahme', en: 'Under-specced machines are the case, not the exception' },
      body: { de: 'Ein Gerät mit 8 GB und ohne Datenträger sieht aus wie ein schlechtes Angebot und ist das Gegenteil. Wer es bestückt, verkauft die Vollausstattung weiter. Deshalb gibt es einen eigenen Rechenweg dafür, mit Teilepreisen, Plattformgebühr und Zahlungsgebühr. Die Teilepreise sind absichtlich zu hoch angesetzt.', en: 'A machine with 8 GB and no drive looks like a bad offer and is the opposite. Fit it out and you resell the full configuration. There is a dedicated calculation for that, with part prices, platform fee and payment fee. The part prices are set too high on purpose.' },
    },
    {
      title: { de: 'Defekte bewerten statt aussortieren', en: 'Score faults instead of sorting them out' },
      body: { de: 'Zu vierzehn Fehlerbildern ist hinterlegt, was die Reparatur kostet, wie wahrscheinlich sie gelingt und was das Gerät danach wert ist. Die Profile sind auf Mini-PCs und Einplatinenrechner kalibriert. Für Laptops gelten sie nicht. Bei diesen Geräten spielt ein defektes Display keine Rolle, und eines, das nicht startet, hat meistens ein kleines Problem.', en: 'For fourteen fault patterns the file holds what the repair costs, how likely it succeeds and what the machine is worth afterwards. The profiles are calibrated for mini PCs and single-board computers. They do not apply to laptops. On these machines a broken display does not matter, and one that will not start usually has a small problem.' },
    },
    {
      title: { de: 'Am schlechten Fall rechnen, nicht am Schnitt', en: 'Compute the bad case, not the average' },
      body: { de: 'Aus einem einzelnen fairen Preis lässt sich das Risiko nicht ablesen. Gebraucht wird, was übrig bleibt, wenn es schlecht läuft, und wieviel man dann höchstens setzen sollte. Angebote, die nur im Durchschnitt gut aussehen, fallen damit raus.', en: 'A single fair price says nothing about the risk. What is needed is what is left when things go badly, and how much one should put in at most. Offers that only look good on average drop out that way.' },
    },
    {
      title: { de: 'Der Bot misst seine eigene Trefferquote', en: 'The bot measures its own hit rate' },
      body: { de: 'Zu jedem Alarm wird festgehalten, was daraus wurde. Daraus entsteht eine Quote je Meldungsstufe und Quelle. Ohne diese Rückkopplung ist jede Schwelle geraten, und man merkt erst nach Monaten, dass eine Quelle nur Rauschen liefert.', en: 'For every alert it records what came of it. That yields a rate per alert level and source. Without this feedback every threshold is a guess, and it takes months to notice that a source only delivers noise.' },
    },
    {
      title: { de: 'Ein Gate für beide Meldewege', en: 'One gate for both alert paths' },
      body: { de: 'Sofort-Alarm und Tagesübersicht hatten getrennte Filter. Fehlte für eine Kategorie die Vergleichsbasis, rutschten Fehlalarme über den einen Weg trotzdem durch. Beide teilen sich jetzt dasselbe Gate.', en: 'The instant alert and the daily digest had separate filters. When a category lost its reference data, false alarms still slipped through on one of the paths. Both now share the same gate.' },
    },
    {
      title: { de: 'Unumkehrbares hinter zwei Schaltern', en: 'The irreversible behind two flags' },
      body: { de: 'Die Watchlist aufräumen oder etwas nach außen schreiben braucht zwei gesetzte Schalter. Alles andere läuft als Probelauf. Dafür reicht eine Festlegung in der Dokumentation nicht.', en: 'Clearing the watchlist or writing anything to the outside needs two flags set. Everything else runs as a dry run. A rule in the documentation is not enough for that.' },
    },
  ],
  metrics: [
    { label: { de: 'Bewertungswege', en: 'Scoring paths' }, value: { de: 'Aufrüstung · Reparatur · Direktverkauf', en: 'upgrade · repair · direct resale' } },
    { label: { de: 'Fehlerbilder hinterlegt', en: 'Fault patterns on file' }, value: { de: '14, auf Mini-PCs kalibriert', en: '14, calibrated on mini PCs' } },
    { label: { de: 'Tests', en: 'Tests' }, value: { de: '879 Testfunktionen', en: '879 test functions' } },
    { label: { de: 'Unumkehrbares', en: 'Irreversible actions' }, value: { de: 'zwei Schalter, sonst nur beobachten', en: 'two flags, otherwise observe only' } },
  ],
  timeline: [
    { when: { de: '2025', en: '2025' }, what: { de: 'Erste Quelle, Crawler, erste Bewertung', en: 'First source, crawlers, first scoring' } },
    { when: { de: '2026 H1', en: 'H1 2026' }, what: { de: 'Bewertung gegen echte Verkaufspreise, schlechter Fall dazu, Sicherheitsschalter', en: 'Scoring against real sales prices, bad case alongside, safety flags' } },
    { when: { de: '2026 H1', en: 'H1 2026' }, what: { de: 'Gemeinsames Gate nach einer Welle von Fehlalarmen', en: 'Shared gate after a wave of false alarms' } },
    { when: { de: '2026 H1', en: 'H1 2026' }, what: { de: 'Aufrüst- und Reparaturrechnung, Zweitverwertung nicht passender Funde', en: 'Upgrade and repair calculation, second use for listings that do not match' } },
    { when: { de: '2026 H2', en: 'H2 2026' }, what: { de: 'Mehr Quellen, Tagesübersicht, Trefferquote aus Rückmeldungen, mehrere Nutzer', en: 'More sources, daily digest, hit rate from feedback, several users' } },
  ],
  limits: [
    { de: 'Die Teilepreise und Reparaturprofile sind von Hand gepflegt und auf eine Geräteklasse kalibriert. Für Laptops oder Serverhardware müssten sie neu erhoben werden.', en: 'The part prices and repair profiles are maintained by hand and calibrated for one class of machine. For laptops or server hardware they would have to be collected again.' },
    { de: 'Die Trefferquote hängt daran, dass ich jeden Alarm zurückmelde. Bleibt die Rückmeldung aus, altert die Messung still.', en: 'The hit rate depends on me reporting back on every alert. If the feedback stops, the measurement ages quietly.' },
    { de: 'Der Bot kauft nicht selbst. Die Entscheidung und der Kauf bleiben von Hand, und das ist eine bewusste Grenze, keine fehlende Ausbaustufe.', en: 'The bot does not buy on its own. The decision and the purchase stay manual. That is a deliberate limit and not a missing stage.' },
  ],
};

export default marktwatch;
