import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 6/4; decisions 4/3; metrics 4/3; timeline 4/3; Ebene 0: foto/edge/false,datei/edge/false <> upload/edge/true; Ebene 1: crop/core/true,ocr/core/true,extract/core/true <> vision/core/true,ocr/core/true,llm/core/true; Ebene 2: db/data/true,ft/core/false,vec/core/true <> store/data/true; Ebene 3: auth/core/true,intern/consumer/true,ui/consumer/false <> bus/consumer/true,search/consumer/true; Pfeile: foto>crop/true,crop>ocr/true,ocr>extract/true,extract>db/false,db>ft/false,db>vec/false,auth>intern/true,intern>db/false <> upload>vision/true,vision>ocr/true,ocr>llm/true,llm>store/false,store>bus/true,store>search/true
const postfach: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Briefe stapeln sich, und man findet sie nicht wieder. Die naheliegende Lösung ist ein Dokumentensystem beim Anbieter, aber dann liegen Verträge, Rechnungen und Behördenpost bei jemand anderem. Ein zugekauftes System habe ich zuerst genommen und wieder verlassen. Es war schwer zu bedienen. Dokumente kamen nur als Datei hinein, und ein mit dem Telefon abfotografierter Brief ergab ein schiefes Bild, mit dem die Texterkennung wenig anfangen konnte.',
    approach: [
      'Ein Foto wird im Dienst selbst zu einem brauchbaren Dokument: Kanten erkennen, zuschneiden, geradeziehen, als PDF ablegen. Das läuft in der Anwendung und nicht über ein weiteres Werkzeug daneben.',
      'Aus dem Bild entsteht Text über klassische Zeichenerkennung. Erst danach, und nur bei Bedarf, zieht ein Sprachmodell die Felder heraus, die zählen: Absender, Datum, Betrag, Frist.',
      'Gesucht wird auf zwei Wegen gleichzeitig. Wörtlich für das, was man genau weiß, und nach Bedeutung über Vektoren in derselben Datenbank, für das, was man nur ungefähr erinnert.',
      'Jedes Dokument gehört einem Mandanten. Die Zugehörigkeit kommt über einen Kopfdaten-Eintrag, dessen Echtheit vor jedem Zugriff geprüft wird.',
      'Eine interne Schnittstelle gibt anderen eigenen Diensten Zugriff, ohne dass sie die Ablage kennen. Die Wissenssuche und der Mail-Teil der Suite hängen darüber dran.',
      'Für den Wechsel vom zugekauften System gibt es ein eigenes Übernahme-Werkzeug, das Bestand und Verschlagwortung mitnimmt.',
    ],
    architecture: {
      summary: 'Ein Foto oder eine Datei kommt herein, wird begradigt und als PDF abgelegt. Daraus entsteht Text über Zeichenerkennung, und nur bei Bedarf zieht ein Modell die Felder heraus. Gesucht wird wörtlich und nach Bedeutung in derselben Datenbank. Jeder Zugriff ist an einen geprüften Mandanten gebunden, andere eigene Dienste lesen über eine interne Schnittstelle.',
      tiers: [
        {
          label: 'Eingang',
          nodes: [
            {
              id: 'foto',
              label: 'Foto vom Telefon',
              kind: 'edge',
            },
            {
              id: 'datei',
              label: 'Datei',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Aufbereitung',
          nodes: [
            {
              id: 'crop',
              label: 'Begradigen',
              note: 'Kanten, Zuschnitt, PDF',
              kind: 'core',
            },
            {
              id: 'ocr',
              label: 'Zeichenerkennung',
              note: 'klassisch, kostenlos',
              kind: 'core',
            },
            {
              id: 'extract',
              label: 'Felder herausziehen',
              note: 'Modell, nur bei Bedarf',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Ablage & Suche',
          nodes: [
            {
              id: 'db',
              label: 'Dokumente',
              note: 'mit Mandant',
              kind: 'data',
            },
            {
              id: 'ft',
              label: 'Wörtliche Suche',
              kind: 'core',
            },
            {
              id: 'vec',
              label: 'Suche nach Bedeutung',
              note: 'Vektoren in derselben Datenbank',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Zugriff',
          nodes: [
            {
              id: 'auth',
              label: 'Mandant geprüft',
              note: 'Echtheit, nicht Vertrauen',
              kind: 'core',
            },
            {
              id: 'intern',
              label: 'Interne Schnittstelle',
              note: 'für eigene Dienste',
              kind: 'consumer',
            },
            {
              id: 'ui',
              label: 'Oberfläche',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'foto',
          to: 'crop',
          label: 'schief herein',
        },
        {
          from: 'crop',
          to: 'ocr',
          label: 'gerade als PDF',
        },
        {
          from: 'ocr',
          to: 'extract',
          label: 'nur wenn nötig',
        },
        {
          from: 'extract',
          to: 'db',
        },
        {
          from: 'db',
          to: 'ft',
        },
        {
          from: 'db',
          to: 'vec',
        },
        {
          from: 'auth',
          to: 'intern',
          label: 'geprüfter Mandant',
        },
        {
          from: 'intern',
          to: 'db',
        },
      ],
    },
    result: [
      'Briefe wandern vom Telefon in die Ablage, ohne Zwischenschritt über ein Scanprogramm. Das Begradigen passiert im Dienst.',
      'Gesucht wird wörtlich und nach Bedeutung, beides aus derselben Datenbank, ohne zweiten Suchdienst daneben.',
      'Die Wissenssuche und der Mail-Teil der Suite lesen über eine interne Schnittstelle mit, ohne die Ablage zu kennen.',
      'Der Bestand aus dem zugekauften System ist übernommen, samt Verschlagwortung.',
    ],
    decisions: [
      {
        title: 'Das Begradigen gehört in den Dienst',
        body: 'Ein schiefes Handyfoto ist für die Zeichenerkennung fast wertlos. Ein zweites Werkzeug davorzuschalten hätte bedeutet, dass jeder Brief zwei Stationen durchläuft und man die zweite vergisst. Kantenerkennung und Zuschnitt laufen deshalb in der Anwendung.',
      },
      {
        title: 'Erst Zeichenerkennung, dann Modell',
        body: 'Die klassische Erkennung liefert den Text und kostet nichts. Das Modell wird nur für das gebraucht, was danach kommt, nämlich Absender, Datum, Betrag und Frist aus einem Fließtext zu ziehen. Die Kosten wachsen damit nicht mit der Zahl der Dokumente.',
      },
      {
        title: 'Beide Suchwege in derselben Datenbank',
        body: 'Wörtliche Suche findet, was man genau weiß. Suche nach Bedeutung findet, was man ungefähr erinnert. Beide laufen über dieselbe Ablage, damit kein zweiter Suchdienst mit einem zweiten Datenbestand entsteht, der altern kann.',
      },
      {
        title: 'Die Mandantenzugehörigkeit wird geprüft, nicht geglaubt',
        body: 'Sie kommt als Eintrag in den Kopfdaten des Aufrufs. Ein Kopfdaten-Eintrag lässt sich setzen, deshalb wird seine Echtheit geprüft, bevor irgendetwas herausgegeben wird.',
      },
    ],
    metrics: [
      {
        label: 'Ablage',
        value: 'vollständig auf eigener Hardware',
      },
      {
        label: 'Erfassung',
        value: 'Foto wird im Dienst begradigt',
      },
      {
        label: 'Suche',
        value: 'wörtlich und nach Bedeutung, eine Datenbank',
      },
      {
        label: 'Zugriff',
        value: 'Mandant geprüft, nicht geglaubt',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Eigene Ablage, Übernahme aus dem zugekauften System',
      },
      {
        when: '2026 H1',
        what: 'Zeichenerkennung und Felder über ein Modell, nur bei Bedarf',
      },
      {
        when: '2026 H2',
        what: 'Begradigen im Dienst, Erfassung direkt vom Telefon',
      },
      {
        when: '2026 H2',
        what: 'Suche nach Bedeutung, interne Schnittstelle für eigene Dienste',
      },
    ],
    limits: [
      'Die Felderkennung ist auf die Post kalibriert, die hier ankommt. Ein ungewohntes Formular ergibt brauchbaren Text und unbrauchbare Felder.',
      'Das Begradigen arbeitet mit Kanten. Ein Brief auf hellem Untergrund ohne klaren Rand wird nicht sauber zugeschnitten.',
      'Es gibt keine Revisionssicherheit im rechtlichen Sinn. Das ist eine private Ablage, kein Archivsystem für Aufbewahrungspflichten.',
    ],
  },
  enAlt: {
    problem: 'Digitizing paper mail is an everyday pain, especially for small and mid-sized businesses: letters pile up, nothing is searchable, and the obvious fix pushes you into a cloud DMS or a third-party mailbox that you hand your trust and your data to at once. A photographed letter is skewed, badly lit and full of background, a long way from a clean record. I wanted the whole path covered, from throwaway phone photo to a filed, searchable entry inside my own network, without a single document ever leaving the house.',
    approach: [
      'Image preparation as its own upstream step: before any text is read, a classic computer-vision stage turns the skewed photo into a straightened, legible scan. It runs as a standalone service and can be tuned in isolation.',
      'Classic computer vision for what it does deterministically and cheaply (find the document, fix the perspective, prep for OCR), and a language model only afterwards for what needs understanding: pulling title and sender from the full text.',
      'The fallback is robust. If image preparation is skipped or chokes on a bad photo, the original gets filed anyway, and the user never hits a dead end.',
      'Clean integration inward: every finished scan emits an event on my own event bus, and a token-secured internal search interface makes the archive discoverable to the cross-cutting knowledge layer, without consumers ever touching the raw backend.',
    ],
    architecture: {
      summary: 'A photo comes in through the interface. If it is an image, a dedicated preparation service finds and straightens the document and returns a clean scan. OCR reads the text, a language model extracts title and sender. The finished record is filed, emits an event on the event bus, and becomes available to the knowledge layer through a token-secured internal search interface. If preparation fails, the original is filed instead.',
      tiers: [
        {
          label: 'Intake',
          nodes: [
            {
              id: 'upload',
              label: 'Photo upload',
              note: 'browser',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Preparation & extraction',
          nodes: [
            {
              id: 'vision',
              label: 'Image preparation',
              note: 'own service, de-skewed scan',
              kind: 'core',
            },
            {
              id: 'ocr',
              label: 'OCR',
              note: 'full text from the scan',
              kind: 'core',
            },
            {
              id: 'llm',
              label: 'LLM extraction',
              note: 'title and sender',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Storage',
          nodes: [
            {
              id: 'store',
              label: 'Record storage',
              note: 'searchable',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Consumers',
          nodes: [
            {
              id: 'bus',
              label: 'Event bus',
              note: 'scan done',
              kind: 'consumer',
            },
            {
              id: 'search',
              label: 'Internal search interface',
              note: 'token-secured',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'upload',
          to: 'vision',
          label: 'only for images',
        },
        {
          from: 'vision',
          to: 'ocr',
          label: 'de-skewed scan',
        },
        {
          from: 'ocr',
          to: 'llm',
          label: 'full text',
        },
        {
          from: 'llm',
          to: 'store',
        },
        {
          from: 'store',
          to: 'bus',
          label: 'event',
        },
        {
          from: 'store',
          to: 'search',
          label: 'for knowledge layer',
        },
      ],
    },
    result: [
      'A letter shot at an angle becomes a filed entry with recognized title, sender and usable full text, no manual rework.',
      'Image preparation, OCR and storage run entirely inside my own network: no cloud DMS, no third-party mailbox.',
      'Through the token-secured internal interface, every finished scan is part of the cross-cutting knowledge layer, searchable alongside every other source.',
      'The path is fault-tolerant: if image preparation does not take, the original still lands in the system and nothing errors out.',
    ],
    decisions: [
      {
        title: 'Classic image preparation before the language model',
        body: 'Finding and straightening a document is something deterministic computer vision does more reliably and more cheaply than a model, and in a dedicated, separately tunable service. The language model only steps in where understanding is needed: title and sender from the full text. You pay for model capability only where it actually counts.',
      },
      {
        title: 'A fallback beats an error message',
        body: 'An image pipeline can fail on a bad photo. The upload is accepted anyway and the original gets filed. The user always gets a result: preparation is an improvement, not a gate.',
      },
      {
        title: 'Integration via event bus and internal search',
        body: 'As an island the mailbox would be half as useful. It emits an event for every scan and exposes a token-secured internal search. That folds the archive into the cross-cutting knowledge layer, with no other service ever needing to know the raw backend.',
      },
    ],
    metrics: [
      {
        label: 'Image preparation',
        value: 'own service, upstream',
      },
      {
        label: 'Data storage',
        value: 'entirely on my own hardware',
      },
      {
        label: 'Integration',
        value: 'event bus and internal search',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Image preparation as its own upstream service, then OCR and LLM extraction',
      },
      {
        when: '2026 H1',
        what: 'Event-bus notification per scan and a token-secured internal search for the knowledge layer',
      },
      {
        when: 'later',
        what: 'Preparation and extraction tuned photo by photo, robust fallback as the default',
      },
    ],
    limits: [
      'Field recognition is calibrated for the mail that arrives here. An unfamiliar form yields usable text and unusable fields.',
      'Straightening works from edges. A letter on a light background without a clear border does not get cropped cleanly.',
      'There is no audit-proof storage in the legal sense. This is a private filing system, not an archive for retention obligations.',
    ],
  },
};

export default postfach;
