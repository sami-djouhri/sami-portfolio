import type { Fallstudie } from './typ';

const gartiko: Fallstudie = {
  problem: {
    de: 'Pflanzen-Pflege-Wissen lebte verstreut: in einem Community-Bot, in Notizen, in Köpfen. Wer eine Pflanze pflegt, braucht Bestand, Pflegephasen und Wissen an einer Stelle, und zwar als öffentlich erreichbares Produkt, nicht als internes Werkzeug. Gleichzeitig darf ein öffentliches Portal auf eigener Infrastruktur keine Verwaltungsfläche nach außen zeigen: der Betrieb muss exponierbar sein, ohne die Pflege-Oberfläche mit zu exponieren.',
    en: 'Plant-care knowledge lived scattered: in a community bot, in notes, in people’s heads. Anyone caring for a plant needs inventory, care phases and knowledge in one place, and as a publicly reachable product, not an internal tool. At the same time, a public portal on your own infrastructure must show no administration surface to the outside: operation has to be exposable without exposing the care interface along with it.',
  },
  approach: [
    {
      de: 'Web-Portal (PHP hinter Apache) und Community-Bot teilen sich denselben Unterbau: eine gemeinsame SQLite-Datenbank als Wissensbasis, sodass Inhalte einmal gepflegt werden und an beiden Oberflächen ankommen.',
      en: 'Web portal (PHP behind Apache) and community bot share one substrate: a shared SQLite database as the knowledge base, so content is maintained once and lands on both surfaces.',
    },
    {
      de: 'Ein Arten-Atlas als Pflege-Rückgrat: pro Pflanzenart liegen Pflege-Vorgaben (Höhenbereich, Wachstumskurve, Phasen) hinterlegt, aus denen ein Arten-Picker beim Anlegen sinnvolle Voreinstellungen zieht. Der Atlas ist von einer Handvoll auf dutzende Arten gewachsen.',
      en: 'A species atlas as the care backbone: per plant species, care defaults (height range, growth curve, phases) are stored, from which a species picker pulls sensible presets when adding a plant. The atlas has grown from a handful to dozens of species.',
    },
    {
      de: 'Derselbe Atlas speist die Community-Auskunft: Fragen werden artgenau aus den hinterlegten Daten beantwortet. Zu einer Art ohne eigenen Eintrag sagt der Bot, dass er dazu nichts hat.',
      en: 'The same atlas feeds the community answers: questions are answered species-accurately from the stored data, and for species without their own entry that is honestly flagged as such.',
    },
    {
      de: 'Der öffentliche Teil läuft hinter einem Tunnel-Edge auf eigener Infrastruktur. Am Heim-Anschluss ist kein Port offen, TLS und Schutzschicht sitzen am Rand. In der PHP-Runtime selbst sind gefährliche Funktionen wie exec und shell_exec hart abgeschaltet.',
      en: 'The public part runs behind a tunnel edge on my own infrastructure: no open ports at the home connection, TLS and a protective layer at the edge, and in the PHP runtime itself dangerous functions (exec, shell_exec and the like) are hard-disabled.',
    },
    {
      de: 'Der Admin-Pfad wird bereits am öffentlichen Rand hart abgewiesen und ist nur aus dem eigenen Netz erreichbar: die Trennung sitzt in der Route, nicht in einem Login-Formular.',
      en: 'The admin path is hard-rejected right at the public edge and only reachable from my own network; the separation sits in the route, not in a login form.',
    },
    {
      de: 'Bestände, Pflegephasen und Erinnerungen sind als eigenes Datenmodell geschnitten, damit das Portal generisch für Pflanzen aller Art trägt und nicht an einer Nische klebt.',
      en: 'Inventories, care phases and reminders are cut as their own data model, so the portal carries plants of all kinds generically and does not cling to a niche.',
    },
  ],
  architecture: {
    summary: {
      de: 'Besucher erreichen das Portal über einen Tunnel-Edge, der TLS terminiert und den Admin-Pfad abweist. Dahinter liegt die Web-Anwendung, die sich Datenbank und Wissensbasis mit dem Community-Bot teilt. Die Pflege-Oberfläche ist nur aus dem eigenen Netz erreichbar.',
      en: 'Visitors reach the portal via a tunnel edge that terminates TLS and rejects the admin path. Behind it sits the web application, which shares database and knowledge base with the community bot. The care interface is only reachable from my own network.',
    },
    tiers: [
      {
        label: { de: 'Öffentlich', en: 'Public' },
        nodes: [
          {
            id: 'visitor',
            kind: 'edge',
            label: { de: 'Besucher', en: 'Visitor' },
          },
          {
            id: 'edge',
            kind: 'edge',
            label: { de: 'Tunnel-Edge', en: 'Tunnel edge' },
            note: { de: 'TLS · Admin-Pfad geblockt', en: 'TLS · admin path blocked' },
          },
        ],
      },
      {
        label: { de: 'Anwendung', en: 'Application' },
        nodes: [
          {
            id: 'web',
            kind: 'core',
            label: { de: 'Web-Portal', en: 'Web portal' },
            note: { de: 'PHP · Apache', en: 'PHP · Apache' },
          },
          {
            id: 'bot',
            kind: 'core',
            label: { de: 'Community-Bot', en: 'Community bot' },
            note: { de: 'gleiche Wissensbasis', en: 'same knowledge base' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'db',
            kind: 'data',
            label: { de: 'Datenbank', en: 'Database' },
            note: { de: 'SQLite · Bestände + Phasen', en: 'SQLite · inventories + phases' },
          },
          {
            id: 'wissen',
            kind: 'data',
            label: { de: 'Wissensbasis', en: 'Knowledge base' },
            note: { de: 'kuratiert', en: 'curated' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'visitor',
        to: 'edge',
        label: { de: 'HTTPS', en: 'HTTPS' },
      },
      {
        from: 'edge',
        to: 'web',
        label: { de: 'nur öffentliche Routen', en: 'public routes only' },
      },
      {
        from: 'web',
        to: 'db',
      },
      {
        from: 'web',
        to: 'wissen',
        label: { de: 'liest kuratiert', en: 'reads curated' },
      },
      {
        from: 'bot',
        to: 'wissen',
        label: { de: 'gleiche Quelle', en: 'same source' },
      },
    ],
  },
  result: [
    {
      de: 'Das Portal ist öffentlich unter eigener Domain erreichbar und läuft vollständig auf eigener Infrastruktur.',
      en: 'The portal is publicly reachable under its own domain and runs entirely on my own infrastructure.',
    },
    {
      de: 'Web-Oberfläche und Community-Bot schöpfen aus derselben Wissensbasis, Inhalte werden nur einmal gepflegt.',
      en: 'Web interface and community bot draw from the same knowledge base; content is maintained once, not twice.',
    },
    {
      de: 'Der Arten-Atlas trägt inzwischen dutzende Pflanzenarten mit hinterlegten Pflege-Vorgaben; der Arten-Picker macht daraus beim Anlegen sinnvolle Voreinstellungen.',
      en: 'The species atlas now carries dozens of plant species with stored care defaults; the species picker turns them into sensible presets when adding a plant.',
    },
    {
      de: 'Der Admin-Bereich ist von außen nicht erreichbar: die Grenze sitzt am Edge, nicht im Anmeldeformular.',
      en: 'The admin area is unreachable from outside: the boundary sits at the edge, not in the login form.',
    },
  ],
  decisions: [
    {
      title: { de: 'Generisch geschnitten', en: 'Cut generically' },
      body: {
        de: 'Das Datenmodell ist für Pflanzen aller Art geschnitten, nicht für eine bestimmte Gattung. Hätte ich es enger gefasst, wäre die erste Erweiterung auf eine andere Pflanzenart ein Schema-Umbau geworden.',
        en: 'The data model is deliberately cut for plants of all kinds. A generic model carries any future direction; a niche model would have forced a rebuild at the first pivot.',
      },
    },
    {
      title: { de: 'Arten-Atlas als Pflege-Rückgrat', en: 'A species atlas as the care backbone' },
      body: {
        de: 'Pflege-Werte pro Pflanze frei eintippen zu lassen, hätte bei jedem Bestand von vorne angefangen. Also liegen sie pro Art im Atlas: Höhe, Wachstumskurve, Phasen. Der Arten-Picker zieht daraus Voreinstellungen, und dieselben Daten machen die Community-Auskunft artgenau. Eine Quelle, zwei Nutzungen.',
        en: 'Typing care values per plant freely would restart from zero with every inventory. So they sit per species in the atlas: height, growth curve, phases. The species picker pulls presets from it, and the same data makes the community answers species-accurate. One source, two uses.',
      },
    },
    {
      title: { de: 'Die Admin-Sperre sitzt am Rand', en: 'The admin lock sits at the edge' },
      body: {
        de: 'Der Verwaltungs-Pfad wird schon am öffentlichen Edge abgewiesen. Ein Login-Formular wäre eine Angriffsfläche gewesen; eine Route, die von außen nicht existiert, ist keine.',
        en: 'The administration path is rejected right at the public edge. A login form would have been an attack surface; a route that does not exist from outside is not.',
      },
    },
    {
      title: { de: 'Ein Unterbau für zwei Oberflächen', en: 'One substrate for two surfaces' },
      body: {
        de: 'Bot und Portal teilen sich Wissensbasis und Betrieb. Zwei getrennte Systeme hätten doppelte Pflege bedeutet und wären inhaltlich auseinandergelaufen.',
        en: 'Bot and portal share knowledge base and operation. Two separate systems would have meant double maintenance and content that drifts apart.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Erreichbarkeit', en: 'Reach' },
      value: {
        de: 'öffentlich · eigene Domain · eigene Infrastruktur',
        en: 'public · own domain · own infrastructure',
      },
    },
    {
      label: { de: 'Arten-Atlas', en: 'Species atlas' },
      value: { de: 'dutzende Arten mit Pflege-Vorgaben', en: 'dozens of species with care defaults' },
    },
    {
      label: { de: 'Wissensbasis', en: 'Knowledge base' },
      value: { de: 'eine Quelle · Portal + Bot', en: 'one source · portal + bot' },
    },
    {
      label: { de: 'Admin', en: 'Admin' },
      value: {
        de: 'am Edge geblockt · nur eigenes Netz',
        en: 'blocked at the edge · own network only',
      },
    },
  ],
  timeline: [
    {
      when: { de: 'H1 2026', en: 'H1 2026' },
      what: {
        de: 'Portal öffentlich unter eigener Domain, Edge-Härtung',
        en: 'Portal public under its own domain, edge hardening',
      },
    },
    {
      when: { de: 'Q2 2026', en: 'Q2 2026' },
      what: {
        de: 'Generisches Pflanzen-Datenmodell, Community-Anschluss',
        en: 'Generic plant data model, community connection',
      },
    },
    {
      when: { de: 'Q2 2026', en: 'Q2 2026' },
      what: {
        de: 'Arten-Atlas mit Pflege-Vorgaben, Arten-Picker, artgenaue Auskunft',
        en: 'Species atlas with care defaults, species picker, species-accurate answers',
      },
    },
    {
      when: { de: 'danach', en: 'later' },
      what: {
        de: 'weitere Pflege-Domänen und Arten auf demselben Unterbau',
        en: 'further care domains and species on the same substrate',
      },
    },
  ],
};

export default gartiko;
