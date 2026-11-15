import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-13 (vorher Uebergangsform). Auch das
// Deutsche war ueberholt: es nannte ein Cloud-Modell fuer einzelne Schritte und
// 110 Testfunktionen, und es kannte weder die Themenachsen noch den Alarm noch
// den Vertragstest fuer die Abnehmer.
//
// Messbefehle (Stand 2026-11-13, Repo docker/nachrichten, Commit ac44e2a):
// - Cloud: Aufrufbuch der Live-Datenbank, alle Zeilen ohne model '(skipped)':
//   64, alle mit lokalem Gateway-Alias, keine mit einem Cloud-Modell.
//   Erste Zeile 2026-09-14. Dazu 28.808 uebersprungene Aufrufe.
// - Tests: "def test_" unter tests/ ergab 151 (Projektdoku des Dienstes: 196
//   gruene Faelle mit Parametrisierung).
// - Abnehmer: Tabelle „Konsumenten" in der Projektdoku von docker/nachrichten, sechs,
//   geschuetzt durch tests/test_vertrag_konsumenten.py.
// - Alarm: POLITIK_BRISANZ_MIN_QUELLEN = 2 in app/config.py, Vermerk je Story.
// - Buendelung: STORY_MERGE_THRESHOLD / _SOFT_THRESHOLD / _DUP_THRESHOLD und
//   STORY_WINDOW_HOURS (336) in app/config.py.
//
// Die Themen selbst bleiben draussen (ZIELBILD Grundsatz 5e, Trennung der
// Welten). Die Abnehmer stehen nur als Art, nie mit Namen.
const newsEngine: Fallstudie = {
  problem: {
    de: 'Wer mehrere Nachrichtenquellen ernst nimmt, ertrinkt in Dubletten. Dasselbe Ereignis erscheint zehnfach, in mehreren Sprachen, mit unterschiedlichem Dreh. Ein Aggregator, der Artikel zählt, belohnt den lautesten Einzelbeitrag statt des am breitesten belegten Sachverhalts. Die naheliegende Abhilfe, jeden Schritt einem großen Sprachmodell zu geben, kostet im Dauerbetrieb bei jedem Artikel Geld oder Rechenzeit, und die Zahl der Artikel wächst von selbst.',
    en: 'Take several news sources seriously and you drown in duplicates. The same event shows up ten times, in several languages, each with its own spin. An aggregator that counts articles rewards the loudest single piece rather than the most widely reported fact. The obvious fix, handing every step to a large language model, costs money or compute time on every article in continuous operation, and the number of articles grows by itself.',
  },
  approach: [
    {
      de: 'Jeder Beitrag wird zuerst lokal und ohne Modell angereichert: Sprache, genannte Personen und Orte, dazu Werte für die Themenfelder. Regeln und Wortlisten entscheiden, ob überhaupt weitergerechnet wird.',
      en: 'Every item is first enriched locally and without a model: language, people and places mentioned, plus scores for the topic areas. Rules and word lists decide whether any further work happens at all.',
    },
    {
      de: 'Eigene Vektoren auf eigener Hardware bündeln die Beiträge fortlaufend zu Vorgängen, auch über Sprachgrenzen hinweg. Bei mittlerer Ähnlichkeit braucht es zusätzlich eine gemeinsam genannte Person oder einen Ort, und ein Zeitfenster von zwei Wochen verhindert, dass zwei Ereignisse verschmelzen, die nur ähnlich klingen.',
      en: 'Own vectors on my own hardware group items into stories as they arrive, across language borders too. At medium similarity a shared person or place is required as well, and a two-week window keeps two events apart that merely sound alike.',
    },
    {
      de: 'Themen sind Achsen auf dem Beitrag und keine Kategorie. Eine Meldung kann für zwei Themenfelder zugleich zählen, und jeder Abnehmer liest die Achse, die ihn angeht.',
      en: 'Topics are axes on the item rather than a category. One report can count for two topic areas at once, and each consumer reads the axis that concerns it.',
    },
    {
      de: 'Videos werden über ihre Untertitel zu Artikeltext. Bekannte Verhörer werden vorher richtiggestellt, der Videotitel dient als Richtschnur für Eigennamen, und ein lokales Modell verdichtet die Sendung abschnittsweise.',
      en: 'Videos become article text through their subtitles. Known mishearings are corrected first, the video title serves as a reference for proper names, and a local model condenses the broadcast section by section.',
    },
    {
      de: 'Ein eigener Kostenteil steht vor jedem Modellaufruf. Eine Weiche wählt das Modell, ein Wächter setzt Tages- und Monatsgrenzen, ein Aufrufbuch hält jeden Aufruf fest. Wo Text entstehen muss, schreibt ein lokales Modell über das hauseigene Gateway, und die Zusammenfassung eines Vorgangs entsteht über eine feste Regelstrecke.',
      en: 'A dedicated cost layer sits in front of every model call. A router picks the model, a guard sets daily and monthly limits, a call log records every call. Where text has to be written, a local model does it through the in-house gateway, and a story summary comes from a fixed rule-based path.',
    },
    {
      de: 'Für ein Themenfeld gibt es einen Alarm aufs Handy. Er geht nur los, wenn mindestens zwei unabhängige Häuser über dieselbe Sache berichten, und je Vorgang höchstens einmal.',
      en: 'One topic area has an alert to the phone. It fires only when at least two independent outlets report the same thing, and at most once per story.',
    },
  ],
  architecture: {
    summary: {
      de: 'Beiträge laufen zuerst durch eine lokale Anreicherung und einen Relevanzfilter. Eigene Vektoren bündeln sie fortlaufend zu Vorgängen, auch über Sprachgrenzen. Die Bewertung verdichtet jeden Vorgang und trägt mehrere Themenachsen, aus denen die Abnehmer lesen. Ein Alarm braucht zwei unabhängige Häuser. Jeder Modellaufruf geht durch Weiche und Wächter, und ohne Modell übernimmt die Regelstrecke.',
      en: 'Items first pass through local enrichment and a relevance filter. Own vectors keep grouping them into stories, across language borders too. Scoring condenses each story and carries several topic axes that the consumers read from. An alert needs two independent outlets. Every model call goes through router and guard, and without a model the rule-based path takes over.',
    },
    tiers: [
      {
        label: { de: 'Eingang', en: 'Intake' },
        nodes: [
          {
            id: 'feeds',
            kind: 'edge',
            label: { de: 'Quellen', en: 'Sources' },
            note: { de: 'viele Herkünfte', en: 'many outlets' },
          },
          {
            id: 'video',
            kind: 'edge',
            label: { de: 'Videos', en: 'Videos' },
            note: { de: 'über Untertitel', en: 'via subtitles' },
          },
        ],
      },
      {
        label: { de: 'Lokale Vorstufe', en: 'Local pre-stage' },
        nodes: [
          {
            id: 'enrich',
            kind: 'core',
            label: { de: 'Anreicherung', en: 'Enrichment' },
            note: { de: 'Sprache · Namen · Ort · Themen', en: 'language · names · place · topics' },
          },
          {
            id: 'filter',
            kind: 'core',
            label: { de: 'Relevanzfilter', en: 'Relevance filter' },
            note: { de: 'Regeln, kein Modell', en: 'rules, no model' },
          },
        ],
      },
      {
        label: { de: 'Bündelung', en: 'Clustering' },
        nodes: [
          {
            id: 'embed',
            kind: 'core',
            label: { de: 'Eigene Vektoren', en: 'Own vectors' },
            note: { de: 'lokal, sprachübergreifend', en: 'local, cross-language' },
          },
          {
            id: 'cluster',
            kind: 'core',
            label: { de: 'Fortlaufende Zuordnung', en: 'Running assignment' },
            note: { de: 'zweites Signal, zwei Wochen', en: 'second signal, two weeks' },
          },
          {
            id: 'score',
            kind: 'core',
            label: { de: 'Bewertung', en: 'Scoring' },
            note: { de: 'eine Achse je Thema', en: 'one axis per topic' },
          },
        ],
      },
      {
        label: { de: 'Ausgabe', en: 'Output' },
        nodes: [
          {
            id: 'abnehmer',
            kind: 'consumer',
            label: { de: 'Sechs Abnehmer', en: 'Six consumers' },
            note: { de: 'durch Vertragstest geschützt', en: 'guarded by a contract test' },
          },
          {
            id: 'alarm',
            kind: 'consumer',
            label: { de: 'Alarm', en: 'Alert' },
            note: { de: 'zwei unabhängige Häuser', en: 'two independent outlets' },
          },
        ],
      },
      {
        label: { de: 'Kostenteil', en: 'Cost layer' },
        nodes: [
          {
            id: 'router',
            kind: 'core',
            label: { de: 'Weiche', en: 'Router' },
            note: { de: 'lokal zuerst', en: 'local first' },
          },
          {
            id: 'guard',
            kind: 'core',
            label: { de: 'Wächter', en: 'Guard' },
            note: { de: 'Tag und Monat', en: 'day and month' },
          },
          {
            id: 'log',
            kind: 'data',
            label: { de: 'Aufrufbuch', en: 'Call log' },
          },
          {
            id: 'fallback',
            kind: 'core',
            label: { de: 'Regelstrecke', en: 'Rule-based path' },
          },
        ],
      },
    ],
    flows: [
      { from: 'feeds', to: 'enrich' },
      {
        from: 'video',
        to: 'enrich',
        label: { de: 'abschnittsweise verdichtet', en: 'condensed by section' },
      },
      { from: 'enrich', to: 'filter' },
      {
        from: 'filter',
        to: 'embed',
        label: { de: 'was relevant ist', en: 'what is relevant' },
      },
      { from: 'embed', to: 'cluster' },
      { from: 'cluster', to: 'score' },
      {
        from: 'score',
        to: 'abnehmer',
        label: { de: 'Achse je Abnehmer', en: 'axis per consumer' },
      },
      {
        from: 'score',
        to: 'alarm',
        label: { de: 'einmal je Vorgang', en: 'once per story' },
      },
      {
        from: 'score',
        to: 'router',
        label: { de: 'nur wo Text entsteht', en: 'only where text is written' },
      },
      {
        from: 'guard',
        to: 'fallback',
        label: { de: 'Grenze erreicht', en: 'limit reached' },
      },
    ],
  },
  result: [
    {
      de: 'Seit Mitte September steht im Aufrufbuch kein einziger Aufruf eines Cloud-Modells. Alle Modellaufrufe liefen über lokale Modelle im Haus.',
      en: 'Since mid-September the call log shows not a single call to a cloud model. Every model call ran on local models in the house.',
    },
    {
      de: 'Sechs Abnehmer mit verschiedenen Interessen hängen an derselben Engine. Ein Vertragstest ruft jeden Endpunkt so auf, wie der jeweilige Abnehmer es tut, und schlägt fehl, sobald ein Feld fehlt, das einer von ihnen liest.',
      en: 'Six consumers with different interests hang off the same engine. A contract test calls every endpoint the way each consumer does and fails as soon as a field is missing that one of them reads.',
    },
    {
      de: 'Beiträge zur selben Sache finden über Sprachgrenzen hinweg zusammen, ohne dass dafür je Beitrag ein Modell gefragt wird.',
      en: 'Items about the same matter come together across language borders without asking a model per item.',
    },
    {
      de: 'Videos laufen über ihre Untertitel durch dieselbe Kette wie Texte. Vorher kamen sie nur mit ihrem Titel herein und bündelten sich mit nichts.',
      en: 'Videos run through the same chain as text via their subtitles. Before, they came in with their title only and grouped with nothing.',
    },
    {
      de: '151 Testfunktionen.',
      en: '151 test functions.',
    },
  ],
  decisions: [
    {
      title: { de: 'Erst filtern, dann rechnen', en: 'Filter first, compute second' },
      body: {
        de: 'Die teure Stufe darf nicht am Anfang stehen. Sprache, Namen, Ort und die Themenwerte entstehen lokal und ohne Modell. An ein Modell geht nur, was diese Stufe übersteht und wofür Text geschrieben werden muss.',
        en: 'The expensive stage must not come first. Language, names, place and the topic scores are produced locally and without a model. A model only gets what survives that stage and needs text written for it.',
      },
    },
    {
      title: { de: 'Eigene Vektoren statt Modellaufrufe je Beitrag', en: 'Own vectors instead of a model call per item' },
      body: {
        de: 'Die Zuordnung zu einem Vorgang fällt bei jedem Beitrag an. Genau dort wäre ein Modellaufruf am teuersten. Eigene Vektoren auf eigener Hardware machen den Schritt beliebig oft bezahlbar, und sie tragen auch über Sprachgrenzen.',
        en: 'Assigning an item to a story happens for every single item. That is exactly where a model call would cost the most. Own vectors on my own hardware make the step affordable as often as needed, and they work across language borders too.',
      },
    },
    {
      title: { de: 'Eine Engine, Themen als Achsen', en: 'One engine, topics as axes' },
      body: {
        de: 'Ein zweiter Abnehmer mit anderem Schwerpunkt lief eine Zeit lang auf einer Kopie derselben Software. Die beiden Kopien liefen in beide Richtungen auseinander, und jede verlor Verbesserungen der anderen. Beim Zusammenführen wurde das Thema zur Achse auf dem Beitrag. Mit einer Kategorie hätte sich eine Meldung für ein Thema entscheiden müssen und wäre für die andere Seite falsch gewesen.',
        en: 'A second consumer with a different focus ran for a while on a copy of the same software. The two copies drifted apart in both directions, and each lost improvements the other gained. When they were merged, the topic became an axis on the item. With a category a report would have had to pick one topic and would have been wrong for the other side.',
      },
    },
    {
      title: { de: 'Ein Alarm braucht zwei Häuser', en: 'An alert needs two outlets' },
      body: {
        de: 'Eine Meldung, die nur ein Haus bringt, ist im Zweifel eine Zuspitzung. Ein Melder, der oft falsch liegt, wird genauso überlesen wie einer, der schweigt. Deshalb braucht der Alarm zwei unabhängige Häuser, und der Vermerk je Vorgang wird auch gesetzt, wenn die Zustellung scheitert, damit eine Störung nicht zur stündlichen Wiederholung wird.',
        en: 'A report carried by a single outlet is, when in doubt, an exaggeration. An alert that is often wrong gets ignored just like one that stays silent. So the alert needs two independent outlets, and the per-story marker is set even when delivery fails, so that an outage does not turn into an hourly repeat.',
      },
    },
    {
      title: { de: 'Die Regelstrecke liefert immer', en: 'The rule-based path always delivers' },
      body: {
        de: 'Ist kein Modell erreichbar oder eine Grenze erreicht, übernimmt eine feste Regelstrecke. Ihr Ergebnis ist schlichter, und es ist da. Ein Dienst, der bei erreichtem Budget nichts mehr liefert, ist im Betrieb wertlos.',
        en: 'If no model is reachable or a limit is reached, a fixed rule-based path takes over. Its result is plainer, and it is there. A service that stops delivering once the budget is used up is worthless in operation.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Cloud-Aufrufe', en: 'Cloud calls' },
      value: { de: 'keine seit Mitte September', en: 'none since mid-September' },
    },
    {
      label: { de: 'Abnehmer', en: 'Consumers' },
      value: { de: 'sechs, auf einer Engine', en: 'six, on one engine' },
    },
    {
      label: { de: 'Bündelung', en: 'Clustering' },
      value: { de: 'eigene Vektoren, sprachübergreifend', en: 'own vectors, cross-language' },
    },
    {
      label: { de: 'Tests', en: 'Tests' },
      value: { de: '151 Testfunktionen', en: '151 test functions' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Lokale Anreicherung, Relevanzfilter, eigene Vektoren und fortlaufende Bündelung',
        en: 'Local enrichment, relevance filter, own vectors and running clustering',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Kostenteil mit Weiche, Wächter und Aufrufbuch; Texte schreibt seither ein lokales Modell',
        en: 'Cost layer with router, guard and call log; since then a local model writes the texts',
      },
    },
    {
      when: { de: 'September 2026', en: 'September 2026' },
      what: {
        de: 'Videos über Untertitel, die Kopie wieder zusammengeführt, Themen als Achsen, Alarm erst bei zwei Häusern',
        en: 'Videos via subtitles, the copy merged back, topics as axes, alert only with two outlets',
      },
    },
    {
      when: { de: 'November 2026', en: 'November 2026' },
      what: {
        de: 'Vertragstest für die sechs Abnehmer',
        en: 'Contract test for the six consumers',
      },
    },
  ],
  limits: [
    {
      de: 'Die Bündelung arbeitet mit Ähnlichkeit. Zwei getrennte Ereignisse, die sich sehr ähnlich lesen, können zusammenfallen. Das zweite Signal und das Zeitfenster machen das seltener, verhindern es aber nicht.',
      en: 'Clustering works on similarity. Two separate events that read very much alike can merge. The second signal and the time window make that rarer but do not prevent it.',
    },
    {
      de: 'Die Themenwerte kommen aus Regeln und Wortlisten, die auf meine Themen eingestellt sind. Für ein anderes Themenfeld müssten sie neu geschrieben werden.',
      en: 'The topic scores come from rules and word lists tuned to my topics. For a different topic area they would have to be rewritten.',
    },
    {
      de: 'Untertitel sind maschinell gehört und bei Eigennamen unzuverlässig. Die Liste der Verhörer und der Videotitel fangen bekannte Fälle ab, einen neuen Verhörer gibt das Modell treu wieder.',
      en: 'Subtitles are machine-transcribed and unreliable with proper names. The list of mishearings and the video title catch known cases; the model faithfully repeats a new mishearing.',
    },
    {
      de: 'Eine Änderung an der Engine trifft alle sechs Abnehmer zugleich. Das ist der Preis dafür, dass es nur eine Engine gibt, und der Grund für den Vertragstest.',
      en: 'A change to the engine hits all six consumers at once. That is the price of having only one engine, and the reason for the contract test.',
    },
  ],
};

export default newsEngine;
