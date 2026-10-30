import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 7/6; decisions 5/4; Ebenenzahl; Ebene 0: api/edge/true <> consumer/consumer/true; Ebene 1: fan/core/true,wake/core/true,schutz/core/true <> search/core/true,fanout/core/true,merge/core/true; Ebene 2: docs/consumer/false,vault/consumer/false,kiwix/consumer/true,books/consumer/false,runbooks/consumer/false <> adapters/core/true,auth/core/true; Ebene 3: dense/core/true,cross/core/true,crosscheck/core/true <> docs/data/false,ops/data/false,corr/data/false; Pfeile: api>fan/true,fan>wake/true,fan>docs/false,fan>vault/false,fan>kiwix/false,docs>dense/true,dense>cross/true,cross>api/true <> consumer>search/true,search>fanout/false,fanout>adapters/true,adapters>auth/true,auth>docs/true,adapters>merge/false,merge>consumer/true,search>bus/true
const wissensFoederation: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Wissen liegt bei mir über viele Dienste verstreut: Dokumente in einem Archiv, Notizen in einem Vault, Nachschlagewerke offline, Bücher im Regal, dazu meine eigenen Betriebsanleitungen. Jeder Dienst hat eine eigene Ablage, eine eigene Suche und eine eigene Anmeldung. Wer etwas wiederfinden will, muss vorher wissen, wo es liegt. Gesucht war eine Stelle, an der man einmal fragt und eine Antwort über alles bekommt, ohne dass die fragende Seite erfährt, welcher Dienst geliefert hat.',
    approach: [
      'Je Quelle ein eigener Adapter gegen dieselbe Schnittstelle. Eine neue Quelle braucht damit einen neuen Adapter, der Kern bleibt unberührt.',
      'Die Abfrage fächert auf alle Quellen gleichzeitig auf. Gesammelt wird erst zur Abfragezeit, es gibt keinen eigenen Index und keinen Hintergrundlauf, der eine zweite Kopie der Daten pflegen müsste.',
      'Die Treffer werden zweistufig nachsortiert. Zuerst über die Nähe der Bedeutung, dann noch einmal genauer durch ein Modell, das Frage und Treffer zusammen bewertet. Beides läuft auf eigener Hardware.',
      'Eine Quelle, die nur halb geantwortet hat, wird als unvollständig gekennzeichnet und nicht wie eine vollständige behandelt. Sonst sieht ein Ausfall aus wie ein Ergebnis.',
      'Dienste, die bedarfsgesteuert schlafen, werden geweckt und bekommen Zeit zu antworten. Ohne das fiele eine ganze Quelle still aus der Suche.',
      'Quellen können gegeneinander geprüft werden: dieselbe Frage an mehrere, und wo sie sich widersprechen, ist das sichtbar statt gemittelt.',
      'Vier Quellen habe ich wieder ausgebaut. Inventar, Marktdaten, Termine und Post sind Anwendungsdaten und gehören in ihre Anwendung, nicht in einen Wissensindex.',
    ],
    architecture: {
      summary: 'Eine Abfrage fächert über Adapter auf alle Quellen gleichzeitig auf. Die Treffer laufen in ein gemeinsames Format, werden zweistufig nachsortiert und als eine Antwort zurückgegeben. Schlafende Quellen werden geweckt, unvollständige Antworten als solche gekennzeichnet. Aggregiert wird zur Abfragezeit, es gibt keinen zweiten Datenbestand.',
      tiers: [
        {
          label: 'Zugang',
          nodes: [
            {
              id: 'api',
              label: 'Eine Such-Schnittstelle',
              note: 'Token je Aufrufer',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Verteilung',
          nodes: [
            {
              id: 'fan',
              label: 'Auffächerung',
              note: 'alle Quellen gleichzeitig',
              kind: 'core',
            },
            {
              id: 'wake',
              label: 'Weckgeduld',
              note: 'schlafende Quelle wird geweckt',
              kind: 'core',
            },
            {
              id: 'schutz',
              label: 'Teilantwort erkannt',
              note: 'halb ist nicht ganz',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Quellen',
          nodes: [
            {
              id: 'docs',
              label: 'Dokumentenarchiv',
              kind: 'consumer',
            },
            {
              id: 'vault',
              label: 'Notizen-Vault',
              kind: 'consumer',
            },
            {
              id: 'kiwix',
              label: 'Nachschlagewerke',
              note: 'offline',
              kind: 'consumer',
            },
            {
              id: 'books',
              label: 'Bücherregal',
              kind: 'consumer',
            },
            {
              id: 'runbooks',
              label: 'Eigene Anleitungen',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Nachsortierung',
          nodes: [
            {
              id: 'dense',
              label: 'Nach Bedeutung',
              note: 'eigenes Modell',
              kind: 'core',
            },
            {
              id: 'cross',
              label: 'Frage und Treffer zusammen',
              note: 'zweite Stufe',
              kind: 'core',
            },
            {
              id: 'crosscheck',
              label: 'Quellen gegeneinander',
              note: 'Widerspruch bleibt sichtbar',
              kind: 'core',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'api',
          to: 'fan',
          label: 'eine Frage',
        },
        {
          from: 'fan',
          to: 'wake',
          label: 'schlaeft eine Quelle?',
        },
        {
          from: 'fan',
          to: 'docs',
        },
        {
          from: 'fan',
          to: 'vault',
        },
        {
          from: 'fan',
          to: 'kiwix',
        },
        {
          from: 'docs',
          to: 'dense',
          label: 'Treffer',
        },
        {
          from: 'dense',
          to: 'cross',
          label: 'vorsortiert',
        },
        {
          from: 'cross',
          to: 'api',
          label: 'eine Antwort',
        },
      ],
    },
    result: [
      'Sieben Quellen hinter einer Schnittstelle, jeder Zugriff dahinter einzeln abgesichert. Die fragende Seite spricht nur diese eine Schnittstelle an.',
      '74 Testfunktionen. Ein auffälliger Teil davon prüft nicht die Suche, sondern die Ehrlichkeit der Antwort: dass eine halbe Antwort als halb erkennbar bleibt und ein Nachschlagewerk eine Sachfrage nicht zudeckt.',
      'Eine neue Quelle ist ein Adapter gegen die bestehende Schnittstelle. Der Kern bleibt unverändert.',
      'Der Rückbau von elf auf sieben Quellen war eine bewusste Grenzziehung zwischen Wissen und Betriebszustand, kein Rückschritt.',
    ],
    decisions: [
      {
        title: 'Zur Abfragezeit sammeln, keinen eigenen Index führen',
        body: 'Ein eigener Index wäre schneller und wäre eine zweite Kopie aller Daten, die altert und gepflegt werden muss. Die Daten bleiben deshalb in ihren Anwendungen, und die Suche fragt sie jedes Mal neu. Das kostet Antwortzeit und spart eine ganze Klasse von Problemen.',
      },
      {
        title: 'Eine halbe Antwort darf nicht wie eine ganze aussehen',
        body: 'Wenn eine Quelle abbricht, kommen trotzdem Treffer zurück, nur eben weniger. Ohne Kennzeichnung sieht das aus wie ein vollständiges Ergebnis mit wenigen Funden. Der Unterschied steht jetzt in der Antwort und wird getestet.',
      },
      {
        title: 'Schlafende Quellen werden geweckt, nicht übersprungen',
        body: 'Mehrere Quellen laufen bedarfsgesteuert und sind im Ruhezustand nicht erreichbar. Ohne Rücksicht darauf fehlt eine ganze Quelle in der Suche, und zwar unauffällig. Die Abfrage weckt sie und wartet eine begrenzte Zeit.',
      },
      {
        title: 'Betriebsdaten gehören nicht in einen Wissensindex',
        body: 'Inventar, Marktdaten, Termine und Post hingen eine Zeitlang mit drin. Sie beantworten keine Wissensfrage, sie beantworten eine Zustandsfrage, und sie machten die Treffer schlechter. Vier Adapter sind deshalb wieder rausgeflogen.',
      },
      {
        title: 'Nachsortieren statt mehr Treffer liefern',
        body: 'Mehr Treffer helfen nicht, wenn die richtigen auf Platz zwanzig stehen. Deshalb zwei Stufen: eine grobe nach Bedeutungsnähe und eine genaue, die Frage und Treffer zusammen bewertet. Beide laufen auf eigener Hardware, es geht nichts nach draußen.',
      },
    ],
    metrics: [
      {
        label: 'Angebundene Quellen',
        value: '7, heterogen',
      },
      {
        label: 'Tests',
        value: '74 Testfunktionen',
      },
      {
        label: 'Aggregation',
        value: 'zur Abfragezeit, kein eigener Index',
      },
      {
        label: 'Nachsortierung',
        value: 'zwei Stufen, beide auf eigener Hardware',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Erste Adapter, gemeinsames Trefferformat, Auffächerung',
      },
      {
        when: '2026 H1',
        what: 'Nachsortierung nach Bedeutung, zweite Stufe mit eigenem Modell',
      },
      {
        when: '2026 H2',
        what: 'Weckgeduld für bedarfsgesteuerte Quellen, Teilantworten erkennbar',
      },
      {
        when: '2026 H2',
        what: 'Rückbau von elf auf sieben Quellen, Trennung von Wissen und Betriebszustand',
      },
    ],
    limits: [
      'Die Antwortzeit hängt an der langsamsten Quelle. Wer eine schnelle Suche erwartet, bekommt sie hier nicht, weil bewusst kein Index vorgehalten wird.',
      'Die Nachsortierung braucht ein Modell auf eigener Hardware. Fällt der Rechner aus, fällt die Suche auf die einfache Sortierung zurück und wird spürbar schlechter.',
      'Was in keiner angebundenen Quelle liegt, findet die Suche nicht. Sie durchsucht die angebundenen Quellen und legt selbst nichts ab.',
    ],
  },
  enAlt: {
    problem: 'Knowledge in my own stack is scattered across many services: documents in an archive, notes in a vault, inventory in the warehouse, market data in the deal engine, letters in the mailbox, appointments in the calendar. Each has its own persistence, its own search logic, its own auth. Finding anything means knowing which system holds it and logging into each one separately. I wanted to ask a single question and get one unified answer across all sources, without the asking side ever learning which service delivered it.',
    approach: [
      'One adapter per source, all against the same narrow interface. Wiring in a new source is a new adapter, not a rebuild of the core.',
      'Aggregation on purpose at query time, not via an own crawler. No second index, no scheduler keeping a separate truth in sync; each source stays solely responsible for its own data.',
      'Token auth per backend. Each adapter reaches its source over a secured internal search interface, and the asking side never sees any of the raw ones.',
      'Every query lands as an event on the own event bus, so other services can follow and evaluate how the knowledge layer is used.',
      'The unified hits can optionally be re-ranked by an embedding model (dense reranking), off by default for latency and switchable per request where answer quality matters more than speed.',
      'Deliberate honesty about the limits: only the adapters that are really wired in get listed. When doc drift once claimed extra sources, I checked them and took them back out.',
    ],
    architecture: {
      summary: 'A consumer asks one question against a single search endpoint. The federation layer fans it out over one adapter per source, each adapter reaching its source token-authenticated through that source\'s internal search interface, and the result comes back unified. Aggregation happens at query time with no index of its own, and every search is written as an event onto the bus, all without the consumer ever knowing the sources behind it.',
      tiers: [
        {
          label: 'Consumers',
          nodes: [
            {
              id: 'consumer',
              label: 'Own services',
              note: 'one backend',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Federation layer',
          nodes: [
            {
              id: 'search',
              label: 'Search endpoint',
              note: 'one question',
              kind: 'core',
            },
            {
              id: 'fanout',
              label: 'Fan-out',
              note: 'at query time',
              kind: 'core',
            },
            {
              id: 'merge',
              label: 'Unification',
              note: 'one result',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Adapters',
          nodes: [
            {
              id: 'adapters',
              label: 'Adapter per source',
              note: 'shared interface',
              kind: 'core',
            },
            {
              id: 'auth',
              label: 'Token auth',
              note: 'per backend',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Sources',
          nodes: [
            {
              id: 'docs',
              label: 'Documents · notes',
              kind: 'data',
            },
            {
              id: 'ops',
              label: 'Inventory · market data',
              kind: 'data',
            },
            {
              id: 'corr',
              label: 'Letters · calendar',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Observation',
          nodes: [
            {
              id: 'bus',
              label: 'Event bus',
              note: 'search as event',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'consumer',
          to: 'search',
          label: 'one question',
        },
        {
          from: 'search',
          to: 'fanout',
        },
        {
          from: 'fanout',
          to: 'adapters',
          label: 'onto all sources',
        },
        {
          from: 'adapters',
          to: 'auth',
          label: 'token-authenticated',
        },
        {
          from: 'auth',
          to: 'docs',
          label: 'internal search interface',
        },
        {
          from: 'adapters',
          to: 'merge',
        },
        {
          from: 'merge',
          to: 'consumer',
          label: 'one result',
        },
        {
          from: 'search',
          to: 'bus',
          label: 'search as event',
        },
      ],
    },
    result: [
      'Seven real sources are searchable through a single search API, every backend access token-secured.',
      'Other own services treat the knowledge layer as one backend without knowing the sources behind it; the frontend stays separated from the raw systems.',
      'Wiring in a new source is a new adapter against an existing interface, not a change to the core.',
      'Every search runs as an event over the own bus, so the knowledge layer is observable itself.',
    ],
    decisions: [
      {
        title: 'Why there is no index of my own',
        body: 'An own crawler with its own index would have created a second truth that needs constant re-syncing and lies between updates. Instead the federation queries the sources directly at query time: each source owns its data, and the layer keeps no copy.',
      },
      {
        title: 'Adapter pattern with auth per backend',
        body: 'Each source gets an adapter against the same interface, and each adapter carries its own token-authenticated connection. That keeps the sources cleanly encapsulated, lets new ones dock without touching the core, and gives every backend its own bounded trust boundary. There is no shared master key.',
      },
      {
        title: 'Documented limits, not a dressed-up scope',
        body: 'Only what is really wired in gets listed. When doc drift once claimed more sources than existed, I checked it and corrected it. An honest source list is worth more to me than an impressive one that does not hold.',
      },
      {
        title: 'Knowledge is not operational state',
        body: 'Four of the original eleven sources went back out: inventory, market data, appointments and postal mail. They were trivial to wire in, and that was exactly the trap. A knowledge search answers "what do I know about this", an application answers "what is the current state". Mixing the two yields hits that look stale while the application has long moved on, and you start synchronising freshness. Fewer sources, but one clear owner per question.',
      },
    ],
    metrics: [
      {
        label: 'Wired-in sources',
        value: '7, heterogeneous',
      },
      {
        label: 'Aggregation',
        value: 'at query time, no own index',
      },
      {
        label: 'Auth',
        value: 'token-based per backend',
      },
      {
        label: 'Event integration',
        value: 'search as an event on the bus',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Federation core, first adapters, token auth per backend',
      },
      {
        when: '2026 H1',
        what: 'First sources wired in, unified result, on-query aggregation',
      },
      {
        when: '2026 H2',
        what: 'Binding to the event bus, grown to eleven sources',
      },
      {
        when: '2026 H2',
        what: 'Four sources taken back out: a line between knowledge and operational state',
      },
    ],
    limits: [
      'Response time depends on the slowest source. Anyone expecting a fast search will not get one here, because no index is kept on purpose.',
      'Re-ranking needs a model on my own hardware. If that machine goes down, the search falls back to the simple ordering and gets noticeably worse.',
      'Whatever lies in no connected source will not be found. The search queries the connected sources and stores nothing itself.',
    ],
  },
};

export default wissensFoederation;
