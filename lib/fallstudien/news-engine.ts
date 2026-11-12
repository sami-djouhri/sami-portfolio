import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 7/5; decisions 4/3; timeline 4/3; Ebenenzahl; Ebene 0: feeds/edge/true,video/edge/true <> feeds/edge/true; Ebene 2: embed/core/true,cluster/core/true,score/core/true <> embed/core/true,cluster/core/true,scorer/core/true; Ebene 3: router/core/true,guard/core/true,log/data/false,fallback/core/false <> router/core/true,guard/core/true,log/core/false,fallback/core/true; Pfeile: feeds>enrich/false,video>enrich/true,enrich>filter/false,filter>embed/true,embed>cluster/false,cluster>score/false,score>router/true,guard>fallback/true <> feeds>enrich/false,enrich>filter/true,filter>embed/false,embed>cluster/true,cluster>scorer/true,scorer>router/true,router>cloud/true,router>fallback/true,guard>router/true,scorer>store/true
const newsEngine: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Wer mehrere Nachrichtenquellen ernst nimmt, ertrinkt in Dubletten. Dasselbe Ereignis erscheint zehnfach, in mehreren Sprachen, mit unterschiedlichem Dreh. Ein Aggregator, der Artikel zählt, belohnt den lautesten Einzelbeitrag statt des am breitesten belegten Sachverhalts. Die naheliegende Abhilfe, jeden Schritt von einem starken Sprachmodell erledigen zu lassen, ist im Dauerbetrieb unbezahlbar: die Kosten wachsen mit jedem zusätzlichen Artikel, und die Zahl der Artikel wächst von selbst.',
    approach: [
      'Jeder Beitrag wird zuerst lokal und ohne Modell angereichert: Sprache, genannte Personen und Orte, dazu ein Signal, das überregionale Bedeutung von lokalem Rauschen trennt. Das kostet nichts und entscheidet, ob überhaupt weitergerechnet wird.',
      'Eigene Vektoren bilden die Grundlage für eine fortlaufende Bündelung. Beiträge zur selben Sache finden auch über Sprachgrenzen hinweg zusammen, begrenzt durch Kategorie und Zeitfenster, damit nicht zwei Ereignisse verschmelzen, die nur ähnlich klingen.',
      'Die Bewertung läuft über austauschbare Profile. Ein Thema kann anders gewichtet werden als ein anderes, ohne dass der Kern angefasst wird, und ein Profil kommt ganz ohne Modell aus.',
      'Videos werden über ihre Transkripte zu Artikeltext und laufen danach durch dieselbe Kette wie geschriebene Beiträge.',
      'Ein eigener Kostenteil trennt billige Masse von teurer Spitze. Eine Weiche entscheidet je Schritt zwischen lokal und Cloud. Ein Wächter setzt harte Tages- und Monatsgrenzen, ein Aufrufbuch hält jeden externen Aufruf fest. Ist das starke Modell aus oder die Grenze erreicht, übernimmt ein fester Rückfallweg.',
      'Dieselbe Engine bedient mehrere Abnehmer mit verschiedenen Interessen. Ein Beitrag trägt mehrere Bewertungsachsen gleichzeitig, und jeder Abnehmer liest die Achse, die ihn angeht.',
      'Die Datenebene wurde neben den laufenden Bestand gelegt und gegen eine Kopie der Echtdaten geprüft, damit der Umbau den Betrieb nicht anfasst.',
    ],
    architecture: {
      summary: 'Beiträge laufen zuerst durch eine lokale Anreicherung und einen Relevanzfilter, bevor Geld ausgegeben wird. Eigene Vektoren bündeln sie fortlaufend zu Vorgängen, auch über Sprachgrenzen. Eine Bewertung mit austauschbaren Profilen verdichtet jeden Vorgang. Nur wenige Schritte gehen über eine Kostenweiche an ein Cloud-Modell, der Normalbetrieb läuft deterministisch.',
      tiers: [
        {
          label: 'Eingang',
          nodes: [
            {
              id: 'feeds',
              label: 'Quellen',
              note: 'viele Herkünfte',
              kind: 'edge',
            },
            {
              id: 'video',
              label: 'Videos',
              note: 'über Transkript',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Lokale Vorstufe',
          nodes: [
            {
              id: 'enrich',
              label: 'Anreicherung',
              note: 'Sprache · Namen · Ort',
              kind: 'core',
            },
            {
              id: 'filter',
              label: 'Relevanzfilter',
              note: 'überregional oder Rauschen',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Bündelung',
          nodes: [
            {
              id: 'embed',
              label: 'Eigene Vektoren',
              note: 'lokal, sprachübergreifend',
              kind: 'core',
            },
            {
              id: 'cluster',
              label: 'Fortlaufende Zuordnung',
              note: 'Kategorie- und Zeitgrenzen',
              kind: 'core',
            },
            {
              id: 'score',
              label: 'Bewertung',
              note: 'austauschbare Profile',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Kostenteil',
          nodes: [
            {
              id: 'router',
              label: 'Weiche',
              note: 'lokal oder Cloud',
              kind: 'core',
            },
            {
              id: 'guard',
              label: 'Wächter',
              note: 'Tag und Monat',
              kind: 'core',
            },
            {
              id: 'log',
              label: 'Aufrufbuch',
              kind: 'data',
            },
            {
              id: 'fallback',
              label: 'Deterministischer Rückfall',
              kind: 'core',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'feeds',
          to: 'enrich',
        },
        {
          from: 'video',
          to: 'enrich',
          label: 'Transkript als Text',
        },
        {
          from: 'enrich',
          to: 'filter',
        },
        {
          from: 'filter',
          to: 'embed',
          label: 'was überregional ist',
        },
        {
          from: 'embed',
          to: 'cluster',
        },
        {
          from: 'cluster',
          to: 'score',
        },
        {
          from: 'score',
          to: 'router',
          label: 'nur harte Fälle',
        },
        {
          from: 'guard',
          to: 'fallback',
          label: 'Grenze erreicht',
        },
      ],
    },
    // Am 2026-10-06 nachgemessen (vorher 13.300 / 101): gewachsen durch die
    // Verschmelzung der beiden News-Engines am 2026-09-26, der abgespaltene
    // Zweig ist wieder in diesem Dienst aufgegangen. Abgrenzung wie bei
    // `saganta` oben, gemessen 13.788 Zeilen und 110 Testfunktionen.
    result: [
      '110 Testfunktionen. Im Normalbetrieb entstehen keine externen Kosten, die Cloud liegt hinter einem Monatsdeckel.',
      'Mehrere Abnehmer mit verschiedenen Interessen hängen an derselben Engine. Ein Beitrag trägt mehrere Bewertungsachsen, eine je Interesse.',
      'Beiträge zur selben Sache finden über Sprachgrenzen hinweg zusammen, ohne dass dafür ein Modell je Beitrag gefragt wird.',
      'Videos laufen über ihre Transkripte durch dieselbe Kette wie Texte.',
    ],
    decisions: [
      {
        title: 'Erst filtern, dann rechnen',
        body: 'Die teure Stufe darf nicht am Anfang stehen. Sprache, Namen, Ort und eine Relevanzeinschätzung entstehen lokal und ohne Modell. An das Modell geht nur, was diese Stufe übersteht.',
      },
      {
        title: 'Eigene Vektoren statt Modellaufrufe je Beitrag',
        body: 'Die Zuordnung zu einem Vorgang ist der Schritt, der bei jedem Beitrag anfällt. Genau dort wäre ein Modellaufruf am teuersten. Eigene Vektoren auf eigener Hardware machen den Schritt beliebig oft bezahlbar, und sie tragen auch über Sprachgrenzen.',
      },
      {
        title: 'Eine Engine, mehrere Interessen',
        body: 'Ein zweiter Abnehmer mit anderem Schwerpunkt war zeitweise ein eigener Zweig derselben Software. Zwei Kopien laufen auseinander, und zwar in beide Richtungen: beide verlieren Verbesserungen, die die andere Seite bekommt. Jetzt trägt ein Beitrag mehrere Bewertungsachsen, und jeder Abnehmer liest die für ihn passende.',
      },
      {
        title: 'Der Rückfall ist deterministisch, nicht ausgeschaltet',
        body: 'Wenn das starke Modell aus ist oder die Monatsgrenze erreicht, übernimmt eine feste Regelstrecke. Das Ergebnis ist schlechter und es ist vorhanden. Ein Dienst, der bei erreichtem Budget nichts mehr liefert, ist im Betrieb wertlos.',
      },
    ],
    metrics: [
      {
        label: 'Tests',
        value: '110 Testfunktionen',
      },
      {
        label: 'Externe Kosten',
        value: 'im Normalbetrieb keine',
      },
      {
        label: 'Bündelung',
        value: 'eigene Vektoren, sprachübergreifend',
      },
      {
        label: 'Abnehmer',
        value: 'mehrere, auf einer Engine',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Lokale Anreicherung, Relevanzfilter, erste Quellen',
      },
      {
        when: '2026 H1',
        what: 'Eigene Vektoren, fortlaufende Bündelung zu Vorgängen',
      },
      {
        when: '2026 H2',
        what: 'Kostenteil mit Weiche, Wächter, Aufrufbuch und deterministischem Rückfall',
      },
      {
        when: '2026 H2',
        what: 'Videos über Transkripte, zweiter Abnehmer auf derselben Engine statt eigener Kopie',
      },
    ],
    limits: [
      'Die Bündelung arbeitet mit Ähnlichkeit. Zwei getrennte Ereignisse, die sich sehr ähnlich lesen, können zusammenfallen, und die Zeitfenster-Grenze mildert das nur.',
      'Die Relevanzeinschätzung ist auf meine Interessen kalibriert. Für ein anderes Themenfeld müsste sie neu eingestellt werden.',
      'Transkripte sind so gut wie ihre Spracherkennung. Bei schlechtem Ton steht Unsinn im Artikeltext, und die Kette merkt das nicht.',
    ],
  },
  enAlt: {
    problem: 'Take several news sources seriously and you drown in duplicates: the same event shows up tenfold, in several languages, with different spin. An aggregator that only counts articles rewards the loudest single post and not the most broadly corroborated fact. The obvious fix, letting a strong language model handle every step, is unaffordable for continuous operation and makes running costs impossible to predict. I wanted the opposite: an engine that understands stories, not articles, with a cloud bill that sits at zero in normal operation.',
    approach: [
      'Every item is first enriched locally and deterministically (language, entities, location, and a relevance signal that separates supra-regional significance from purely local noise), all before any money is spent.',
      'Own embeddings give incremental clustering its semantic basis: similar items land in the same story across language boundaries, with category and time-window bounds to guard against false merges.',
      'A multi-signal story scorer weights by source count, trend and source quality, so broad corroboration beats a single high score.',
      'An explicit cost layer separates cheap volume from expensive top-end: a router picks local or cloud per step, a budget guard enforces hard daily and monthly caps, a call log records every external call, and a deterministic fallback takes over the moment the strong model is off or capped.',
      'The data layer was laid down additively beside the existing one and tested against a live copy, so the rebuild to the story layer never touched the running operation.',
    ],
    architecture: {
      summary: 'Incoming items pass first through a local enrichment and filter stage, then via own embeddings into incremental clustering that bundles them into stories across language and source; a multi-signal scorer condenses each story, and only the few demanding steps take the cost layer of router, budget guard and call log out to a cloud model, while a deterministic fallback carries standard operation at no external cost.',
      tiers: [
        {
          label: 'Intake',
          nodes: [
            {
              id: 'feeds',
              label: 'Source feeds',
              note: 'many origins',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Local pre-stage',
          nodes: [
            {
              id: 'enrich',
              label: 'Enrichment',
              note: 'language · entities · location',
              kind: 'core',
            },
            {
              id: 'filter',
              label: 'Relevance filter',
              note: 'supra-regional vs. noise',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Story formation',
          nodes: [
            {
              id: 'embed',
              label: 'Own embeddings',
              note: 'local · cross-lingual',
              kind: 'core',
            },
            {
              id: 'cluster',
              label: 'Incremental clustering',
              note: 'story assignment',
              kind: 'core',
            },
            {
              id: 'scorer',
              label: 'Story scorer',
              note: 'multi-source beats single',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Cost layer',
          nodes: [
            {
              id: 'router',
              label: 'Model router',
              note: 'local or cloud',
              kind: 'core',
            },
            {
              id: 'guard',
              label: 'Budget guard',
              note: 'hard caps',
              kind: 'core',
            },
            {
              id: 'log',
              label: 'Call log',
              kind: 'core',
            },
            {
              id: 'fallback',
              label: 'Local fallback',
              note: 'deterministic',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Models & storage',
          nodes: [
            {
              id: 'cloud',
              label: 'Cloud editor-in-chief',
              note: 'top-end only',
              kind: 'data',
            },
            {
              id: 'store',
              label: 'Story store',
              note: 'provenance · cost per story',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'feeds',
          to: 'enrich',
        },
        {
          from: 'enrich',
          to: 'filter',
          label: 'before cloud cost',
        },
        {
          from: 'filter',
          to: 'embed',
        },
        {
          from: 'embed',
          to: 'cluster',
          label: 'semantic',
        },
        {
          from: 'cluster',
          to: 'scorer',
          label: 'per story',
        },
        {
          from: 'scorer',
          to: 'router',
          label: 'only demanding steps',
        },
        {
          from: 'router',
          to: 'cloud',
          label: 'under budget',
        },
        {
          from: 'router',
          to: 'fallback',
          label: 'standard · 0 cost',
        },
        {
          from: 'guard',
          to: 'router',
          label: 'cap reached',
        },
        {
          from: 'scorer',
          to: 'store',
          label: 'with provenance',
        },
      ],
    },
    result: [
      'The story layer is live as the first build-out stage: similar items from different sources come together in one story, while locally trivial material stays apart.',
      'Standard operation costs nothing externally, because the deterministic fallback carries the volume and the cloud model only switches in behind hard caps.',
      'Every story carries its provenance and its cost: you can trace which sources back it and whether it was condensed externally at all.',
      'The data layer was laid down additively beside the existing one; the running operation stayed untouched through the rebuild.',
    ],
    decisions: [
      {
        title: 'Local as default, cloud as exception',
        body: 'The expensive cloud is the last resort, not the default: behind router, budget guard and call log. Quality stays available where it counts, without the running bill scaling with the article count.',
      },
      {
        title: 'Relevance filter before any spend',
        body: 'A local stage first separates supra-regional significance from noise, then the engine decides how much effort to spend. No money goes to items that get sorted out anyway.',
      },
      {
        title: 'Stories, not articles, as the unit',
        body: 'The condensation weights by source count, trend and source quality, so a broadly corroborated fact stands ahead of a single high score. That is what separates an engine from an aggregator.',
      },
    ],
    metrics: [
      {
        label: 'External cost in standard operation',
        value: '0 €',
      },
      {
        label: 'Cloud calls',
        value: 'behind hard daily and monthly caps',
      },
      {
        label: 'Clustering',
        value: 'cross-lingual via own embeddings',
      },
      {
        label: 'Build-out stage',
        value: 'story layer live, more to follow',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Story layer live: local enrichment, clustering, multi-signal scorer, cost layer',
      },
      {
        when: '2026 H1',
        what: 'Additive data layer tested against a live copy, deterministic fallback as default',
      },
      {
        when: '2026 H2',
        what: 'Sharper story scoring, batch processing of condensations, connecting further consumers',
      },
    ],
    limits: [
      'Clustering works on similarity. Two separate events that read very much alike can collapse into one, and the time-window limit only softens that.',
      'The relevance scoring is calibrated to my own interests. For a different subject area it would have to be set up again.',
      'Transcripts are only as good as their speech recognition. With poor audio the article text carries nonsense, and the chain does not notice.',
    ],
  },
};

export default newsEngine;
