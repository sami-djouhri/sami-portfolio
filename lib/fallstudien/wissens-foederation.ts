import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-15 (vorher Uebergangsform). Beide alten
// Haelften waren ueberholt: die Nachsortierung stand als „erst nach Bedeutung,
// dann ein Modell“ (live ist Rang-Fusion plus Cross-Encoder, der Dense-Rerank
// ist aus), die gestufte Antwort seit 16.10. fehlte ganz, ebenso die Inseln mit
// einheitlicher Schnittstelle (10.11.) und die Quellen Pflanzenwissen und
// Lernplattform. Die Grenze „Antwortzeit haengt an der langsamsten Quelle“
// stimmt seit der gestuften Antwort nicht mehr.
//
// Messbefehle (Stand 2026-11-15, Quelle docker/knowledge-gateway):
// - Quellen: app/aggregator.py BACKENDS plus insel.aus_einstellung (Inseln).
//   Die Werk-Quelle fuer Filme bleibt bewusst ungenannt (Naehe zur Mediathek).
// - Fusion: aggregator._fusioniere, Reciprocal Rank Fusion, RRF_K 60.
// - Nachsortierung: docker-compose.yml RERANK_HTTP_ENABLED true (Cross-Encoder
//   auf eigener Hardware, Log zeigt laufende /rerank-Aufrufe), RERANK_ENABLED
//   false (Dense aus).
// - Stufen: config erste_treffer_frist 1.2, backend_timeout_seconds 2.0 (eine
//   Quelle 4.0); README /search/stream: treffer, ergaenzung, sortierung.
// - Teilantwort: aggregator, Trefferliste „geantwortet, aber unvollstaendig“;
//   Fehler je Quelle im Feld errors.
// - Schlaf: aggregator._schlaeft (503 des Weckers = Weckruf, kein Ausfall).
// - Abgleich: app/crosscheck.py, lokales Sprachmodell, Uebereinstimmung und
//   Widerspruch als JSON.
// - Tests: grep def test_ in tests: 109. Bewusst ohne Zahl auf der Seite.
// - Rueckbau: README, lager/marktwatch/briefkasten/kalender bis 2026-08-28.
//
// Keine Quellenzahl (Gate 1c2), keine internen Namen.
const wissensFoederation: Fallstudie = {
  problem: {
    de: 'Wissen liegt bei mir über viele Dienste verstreut: Dokumente in einem Archiv, Notizen in einem Vault, Nachschlagewerke und Bücher offline, Orte und Adressen in einem Kartenindex, dazu Pflanzenwissen, Lernstoff und meine eigenen Anleitungen. Jeder Dienst hat eine eigene Ablage, eine eigene Suche und eine eigene Anmeldung. Wer etwas wiederfinden will, muss vorher wissen, wo es liegt. Hier gibt es deshalb eine Stelle, an der man einmal fragt und eine Antwort über alle Quellen bekommt.',
    en: 'My knowledge is spread across many services: documents in an archive, notes in a vault, reference works and books offline, places and addresses in a map index, plus plant knowledge, learning material and my own guides. Each service has its own storage, its own search and its own login. To find something again, you have to know beforehand where it lives. So there is one place here where you ask once and get one answer across all sources.',
  },
  approach: [
    {
      de: 'Je Quelle ein Adapter gegen dieselbe Schnittstelle. Neuere Quellen bieten selbst einheitliche Routen an. Für ihren Anschluss reicht eine Zeile in der Konfiguration.',
      en: 'One adapter per source against the same interface. Newer sources offer uniform routes themselves. One line in the configuration is enough to connect them.',
    },
    {
      de: 'Die Abfrage geht an alle Quellen gleichzeitig, jede mit eigener Frist. Gesammelt wird erst zur Abfragezeit. Es gibt keinen eigenen Index und keinen Hintergrundlauf, der eine zweite Kopie der Daten pflegen müsste.',
      en: 'The query goes to all sources at the same time, each with its own time limit. Results are collected only at query time. There is no index of its own and no background job that would have to maintain a second copy of the data.',
    },
    {
      de: 'Die Treffer der Quellen werden über ihren Rang zu einer Liste zusammengeführt. Danach bewertet ein Modell auf eigener Hardware Frage und Treffer zusammen und ordnet die Liste neu.',
      en: 'The hits from the sources are merged into one list by their rank. After that, a model on my own hardware scores question and hit together and reorders the list.',
    },
    {
      de: 'Die Antwort kommt in Stufen. Nach gut einer Sekunde steht da, was schon da ist, dann folgen die langsamen Quellen, zuletzt die neue Reihenfolge. Die Quellen werden dabei nur einmal gefragt, spätere Stufen ordnen um und tauschen keine Treffer aus.',
      en: 'The answer arrives in stages. After a little over a second, what is already there is shown, then the slow sources follow, and finally the new order. The sources are asked only once, and later stages reorder without swapping hits.',
    },
    {
      de: 'Eine Quelle, die nur halb geantwortet hat, wird als unvollständig gekennzeichnet. Eine Quelle, die nicht geantwortet hat, steht mit Grund in der Antwort. Sonst sieht ein Ausfall aus wie ein Ergebnis mit wenigen Treffern.',
      en: 'A source that answered only partly is marked as incomplete. A source that did not answer is listed in the response with its reason. Otherwise an outage looks like a result with few hits.',
    },
    {
      de: 'Dienste, die bei Nichtgebrauch schlafen, antworten zuerst mit einer Warteseite und starten dabei. Die Suche erkennt das als Weckruf, wartet und fragt erneut.',
      en: 'Services that sleep when unused answer first with a waiting page and start up at the same time. The search recognises that as a wake-up call, waits and asks again.',
    },
    {
      de: 'Auf Wunsch geht dieselbe Frage an alle Quellen, und ein lokales Sprachmodell stellt Übereinstimmungen und Widersprüche zwischen ihnen heraus.',
      en: 'On request the same question goes to all sources, and a local language model points out where they agree and where they contradict each other.',
    },
  ],
  architecture: {
    summary: {
      de: 'Eine Frage geht über Adapter und einheitliche Anschlüsse an alle Quellen gleichzeitig. Die Treffer werden über ihren Rang zusammengeführt und von einem Modell auf eigener Hardware neu geordnet. Die Antwort kommt in Stufen zurück, schlafende Quellen werden geweckt und unvollständige gekennzeichnet.',
      en: 'A question goes through adapters and uniform connectors to all sources at the same time. The hits are merged by their rank and reordered by a model on my own hardware. The answer comes back in stages, sleeping sources are woken and incomplete ones are marked.',
    },
    tiers: [
      {
        label: { de: 'Zugang', en: 'Access' },
        nodes: [
          {
            id: 'api',
            label: { de: 'Eine Such-Schnittstelle', en: 'One search endpoint' },
            note: { de: 'Antwort in Stufen', en: 'answer in stages' },
            kind: 'edge',
          },
        ],
      },
      {
        label: { de: 'Verteilung', en: 'Distribution' },
        nodes: [
          {
            id: 'fan',
            label: { de: 'Alle Quellen gleichzeitig', en: 'All sources at once' },
            note: { de: 'Frist je Quelle', en: 'time limit per source' },
            kind: 'core',
          },
          {
            id: 'wake',
            label: { de: 'Weckruf erkannt', en: 'Wake-up recognised' },
            note: { de: 'Warteseite ist kein Fehler', en: 'waiting page is no error' },
            kind: 'core',
          },
          {
            id: 'teil',
            label: { de: 'Teilantwort erkannt', en: 'Partial answer recognised' },
            note: { de: 'halb ist nicht ganz', en: 'half is not whole' },
            kind: 'core',
          },
        ],
      },
      {
        label: { de: 'Quellen', en: 'Sources' },
        nodes: [
          {
            id: 'docs',
            label: { de: 'Dokumente · Notizen', en: 'Documents · notes' },
            kind: 'consumer',
          },
          {
            id: 'nachschlag',
            label: { de: 'Nachschlagewerke · Bücher', en: 'Reference works · books' },
            note: { de: 'offline', en: 'offline' },
            kind: 'consumer',
          },
          {
            id: 'eigen',
            label: { de: 'Anleitungen · Lernstoff · Pflanzen', en: 'Guides · learning · plants' },
            kind: 'consumer',
          },
          {
            id: 'orte',
            label: { de: 'Orte und Adressen', en: 'Places and addresses' },
            note: { de: 'offline', en: 'offline' },
            kind: 'consumer',
          },
          {
            id: 'inseln',
            label: { de: 'Inseln', en: 'Islands' },
            note: { de: 'eine Zeile je Quelle', en: 'one line per source' },
            kind: 'consumer',
          },
        ],
      },
      {
        label: { de: 'Ordnung', en: 'Ordering' },
        nodes: [
          {
            id: 'fusion',
            label: { de: 'Rang-Fusion', en: 'Rank fusion' },
            note: { de: 'eine Liste', en: 'one list' },
            kind: 'core',
          },
          {
            id: 'modell',
            label: { de: 'Frage und Treffer zusammen', en: 'Question and hit together' },
            note: { de: 'eigenes Modell', en: 'own model' },
            kind: 'core',
          },
          {
            id: 'abgleich',
            label: { de: 'Quellen gegeneinander', en: 'Sources against each other' },
            note: { de: 'auf Wunsch', en: 'on request' },
            kind: 'core',
          },
        ],
      },
    ],
    flows: [
      { from: 'api', to: 'fan', label: { de: 'eine Frage', en: 'one question' } },
      { from: 'fan', to: 'wake', label: { de: 'schläft eine Quelle?', en: 'is a source asleep?' } },
      { from: 'fan', to: 'docs' },
      { from: 'fan', to: 'nachschlag' },
      { from: 'fan', to: 'inseln' },
      { from: 'docs', to: 'fusion', label: { de: 'Treffer', en: 'hits' } },
      { from: 'fusion', to: 'modell', label: { de: 'eine Liste', en: 'one list' } },
      { from: 'modell', to: 'api', label: { de: 'neue Reihenfolge', en: 'new order' } },
    ],
  },
  result: [
    {
      de: 'Alle Quellen stehen hinter einer Schnittstelle. Wo eine Quelle es verlangt, fragt die Suche mit eigenem Token an. Die fragende Seite kennt nur diese eine Schnittstelle.',
      en: 'All sources sit behind one endpoint. Where a source requires it, the search asks with its own token. The asking side only knows this one endpoint.',
    },
    {
      de: 'Seit Oktober sieht man die ersten Treffer nach gut einer Sekunde. Vorher wartete jede Suche auf die Nachsortierung, im Mittel 15 Sekunden.',
      en: 'Since October the first hits show up after a little over a second. Before that, every search waited for the reordering, 15 seconds on average.',
    },
    {
      de: 'Ein großer Teil der Tests prüft die Ehrlichkeit der Antwort: dass eine halbe Antwort als halb erkennbar bleibt und eine schlafende Quelle nicht als Ausfall gilt.',
      en: 'A large part of the tests checks the honesty of the answer: that a partial answer stays recognisable as partial and a sleeping source does not count as an outage.',
    },
    {
      de: 'Seit November ist eine neue Quelle eine Zeile in der Konfiguration, wenn sie die gemeinsamen Routen anbietet.',
      en: 'Since November a new source is one line in the configuration, as long as it offers the shared routes.',
    },
  ],
  decisions: [
    {
      title: { de: 'Zur Abfragezeit sammeln, keinen eigenen Index führen', en: 'Collect at query time, keep no index of its own' },
      body: {
        de: 'Ein eigener Index wäre schneller. Er wäre aber eine zweite Kopie aller Daten, die altert und gepflegt werden muss. Die Daten bleiben deshalb in ihren Anwendungen, und die Suche fragt sie jedes Mal neu. Die gestufte Antwort gleicht die Wartezeit zum Teil aus.',
        en: 'An index of its own would be faster. But it would be a second copy of all data that ages and has to be maintained. So the data stays in its applications, and the search asks them anew every time. The staged answer makes up for part of the waiting time.',
      },
    },
    {
      title: { de: 'Ein Strom statt mehrerer Aufrufe', en: 'One stream instead of several calls' },
      body: {
        de: 'Für die Stufen hätte der Browser die Suche auch mehrmals aufrufen können. Dann würden alle Quellen mehrmals gefragt, und die zweite Antwort könnte andere Treffer enthalten. Beim Lesen verschwände dann etwas unter dem Finger. Deshalb wird einmal gesucht und mehrmals gesendet.',
        en: 'For the stages the browser could also have called the search several times. Then every source would be asked several times, and the second answer could contain different hits. While reading, something would disappear under your finger. So the search runs once and sends several times.',
      },
    },
    {
      title: { de: 'Eine halbe Antwort darf nicht wie eine ganze aussehen', en: 'A partial answer must not look like a whole one' },
      body: {
        de: 'Wenn eine Quelle abbricht, kommen trotzdem Treffer zurück, nur weniger. Ohne Kennzeichnung sieht das aus wie ein vollständiges Ergebnis mit wenigen Funden. Der Unterschied steht in der Antwort und wird getestet.',
        en: 'When a source breaks off, hits still come back, just fewer. Without a marker that looks like a complete result with few findings. The difference is part of the answer and is tested.',
      },
    },
    {
      title: { de: 'Betriebsdaten gehören nicht in die Wissenssuche', en: 'Operational data does not belong in the knowledge search' },
      body: {
        de: 'Inventar, Marktdaten, Termine und Post hingen eine Zeit lang mit drin. Sie beantworten eine Frage nach dem Zustand, keine Frage nach Wissen, und sie machten die Treffer schlechter. Ihre Adapter habe ich wieder ausgebaut. Wer Termine oder Post sucht, fragt die jeweilige Anwendung.',
        en: 'Inventory, market data, appointments and mail were part of it for a while. They answer a question about state, not a question about knowledge, and they made the hits worse. I removed their adapters again. Anyone looking for appointments or mail asks the application in question.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Erste Treffer', en: 'First hits' },
      value: { de: 'nach gut einer Sekunde', en: 'after a little over a second' },
    },
    {
      label: { de: 'Sammeln', en: 'Collection' },
      value: { de: 'zur Abfragezeit, kein eigener Index', en: 'at query time, no index of its own' },
    },
    {
      label: { de: 'Nachsortierung', en: 'Reordering' },
      value: { de: 'Modell auf eigener Hardware', en: 'model on my own hardware' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: { de: 'Erste Adapter, gemeinsames Trefferformat, Abfrage an alle Quellen gleichzeitig', en: 'First adapters, shared hit format, query to all sources at once' },
    },
    {
      when: { de: 'Aug. 2026', en: 'Aug 2026' },
      what: { de: 'Nachsortierung mit eigenem Modell, Betriebsdaten wieder ausgebaut', en: 'Reordering with own model, operational data removed again' },
    },
    {
      when: { de: 'Sep. 2026', en: 'Sep 2026' },
      what: { de: 'Weckruf und Teilantwort erkannt', en: 'Wake-up and partial answer recognised' },
    },
    {
      when: { de: 'Okt. 2026', en: 'Oct 2026' },
      what: { de: 'Antwort in Stufen', en: 'Answer in stages' },
    },
    {
      when: { de: 'Nov. 2026', en: 'Nov 2026' },
      what: { de: 'Orte und Adressen als Quelle, Inseln mit einheitlicher Schnittstelle', en: 'Places and addresses as a source, islands with a uniform interface' },
    },
  ],
  limits: [
    {
      de: 'Die neue Reihenfolge braucht je nach Frage 7 bis 20 Sekunden. Bis dahin steht die Liste in der Reihenfolge der Rang-Fusion.',
      en: 'Depending on the question, the new order takes 7 to 20 seconds. Until then the list stays in the order of the rank fusion.',
    },
    {
      de: 'Die Nachsortierung braucht ein Modell auf eigener Hardware. Fällt der Rechner aus, bleibt es bei der Rang-Fusion, und die Treffer werden spürbar schlechter.',
      en: 'The reordering needs a model on my own hardware. If that machine goes down, the rank fusion is all that remains, and the hits get noticeably worse.',
    },
    {
      de: 'Was in keiner angebundenen Quelle liegt, findet die Suche nicht. Sie durchsucht die Quellen und legt selbst nichts ab.',
      en: 'Whatever lies in no connected source, the search will not find. It searches the sources and stores nothing itself.',
    },
  ],
};

export default wissensFoederation;
