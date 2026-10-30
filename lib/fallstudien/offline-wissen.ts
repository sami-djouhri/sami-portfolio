import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 7/6; limits 3/5; Ebenenzahl; Ebene 0: osm/edge/true,dop/edge/true,dgm/edge/false,lod2/edge/false <> browser/edge/true; Ebene 1: index/core/true,terrain/core/false,gebaeude/core/false,pruef/core/true <> karte/core/true,wissen/core/true; Ebene 2: portal/consumer/true,suche/core/true,route/core/true <> adressen/core/true,routing/core/true; Pfeile: osm>index/true,dgm>terrain/false,terrain>pruef/true,lod2>gebaeude/false,index>suche/false,suche>portal/false,route>portal/true <> browser>karte/false,browser>wissen/false,karte>adressen/true,karte>routing/true,karte>tiles/false,adressen>adrdb/false,routing>rtiles/false,wissen>zim/false
const offlineWissen: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'Karte, Nachschlagewerk und Routenplanung hängen normalerweise an einer Leitung nach draußen. Fällt die aus, fällt alles drei aus, und nebenbei weiß ein Anbieter, wonach hier gesucht wird. Ich wollte beides im Haus haben. Der schwierige Teil war die Adresssuche: die verbreitete Standardlösung dafür will eine Datenbank von rund 100 GB und mehr als 16 GB Arbeitsspeicher, und das gibt diese Hardware nicht her.',
    approach: [
      'Aus den offenen Kartendaten für Deutschland entsteht ein eigener Adressindex mit Hausnummern, in einer einzigen Datei. Der Bau läuft in Stufen, ist wiederaufnehmbar und kommt mit unter 500 MB Arbeitsspeicher aus.',
      'Die Karte selbst liegt als Vektorkacheln vor, dazu kommen eigene Ebenen: Luftbilder aus dem Landesbestand, ein wolkenfreies Satellitenmosaik, Höhendaten und Gebäudemodelle.',
      'Die Höhendaten werden aus einem Rohraster in Kacheln umgerechnet. Ein eigenes Werkzeug prüft den fertigen Kachelsatz anschliessend stichprobenweise gegen die Rohdaten, weil ein Rechenfehler sonst erst auffällt, wenn jemand ein Höhenprofil ansieht.',
      'Die Gebäude kommen aus amtlichen Gebäudemodellen. Daraus werden Grundriss und Höhe gelesen und als eigene Kachelebene abgelegt, die das Portal dreidimensional darstellen kann.',
      'Routen rechnet ein eigener Dienst auf einem Gast im Virtualisierungs-Cluster, ebenfalls offline. Die Kacheln dafür zu bauen dauert Stunden, danach liegen Antworten im Sekundenbereich.',
      'Das Portal prüft beim Laden, welche Ebenen überhaupt vorhanden sind, und blendet fehlende aus. Eine Ebene nachzuliefern heißt, eine Datei abzulegen.',
      'Ein weiteres Prüfwerkzeug zählt, welche Kartenobjekte wirklich in den Kacheln stehen, und hält das gegen die Darstellungsregeln. Ohne diese Prüfung bleiben Darstellungsregeln für Objekte stehen, die in den Kacheln gar nicht vorkommen, und vorhandene Objekte werden von keiner Regel gezeichnet.',
    ],
    architecture: {
      summary: 'Aus offenen Rohdaten entstehen in getrennten Bauläufen die Ebenen: Vektorkarte, Adressindex, Luftbild, Satellit, Höhe und Gebäude. Ausgeliefert werden sie als Dateien, die ein Portal zur Laufzeit auf Vorhandensein prüft. Die Adresssuche liest nur. Routen rechnet ein eigener Dienst, erreichbar allein über das Portal.',
      tiers: [
        {
          label: 'Rohdaten',
          nodes: [
            {
              id: 'osm',
              label: 'Offene Kartendaten',
              note: 'Deutschland',
              kind: 'edge',
            },
            {
              id: 'dop',
              label: 'Luftbilder',
              note: 'Landesbestand',
              kind: 'edge',
            },
            {
              id: 'dgm',
              label: 'Höhenraster',
              kind: 'edge',
            },
            {
              id: 'lod2',
              label: 'Gebäudemodelle',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Bauläufe',
          nodes: [
            {
              id: 'index',
              label: 'Adressindex',
              note: 'stufenweise, wiederaufnehmbar',
              kind: 'core',
            },
            {
              id: 'terrain',
              label: 'Höhenkacheln',
              kind: 'core',
            },
            {
              id: 'gebaeude',
              label: 'Grundriss und Höhe',
              kind: 'core',
            },
            {
              id: 'pruef',
              label: 'Gegenprobe',
              note: 'Kacheln gegen Rohdaten',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Auslieferung',
          nodes: [
            {
              id: 'portal',
              label: 'Karten-Portal',
              note: 'prüft, was da ist',
              kind: 'consumer',
            },
            {
              id: 'suche',
              label: 'Adresssuche',
              note: 'liest nur',
              kind: 'core',
            },
            {
              id: 'route',
              label: 'Routendienst',
              note: 'eigener Gast',
              kind: 'core',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'osm',
          to: 'index',
          label: 'Adressen mit Hausnummer',
        },
        {
          from: 'dgm',
          to: 'terrain',
        },
        {
          from: 'terrain',
          to: 'pruef',
          label: 'Stichprobe',
        },
        {
          from: 'lod2',
          to: 'gebaeude',
        },
        {
          from: 'index',
          to: 'suche',
        },
        {
          from: 'suche',
          to: 'portal',
        },
        {
          from: 'route',
          to: 'portal',
          label: 'nur über das Portal',
        },
      ],
    },
    result: [
      'Über 19 Millionen Adressen mit Hausnummern in einer einzigen Datei, gebaut mit unter 500 MB Arbeitsspeicher statt der 16 GB, die die Standardlösung verlangt.',
      'Karte, Adresssuche, Routen und Nachschlagewerke funktionieren ohne Leitung nach draußen. Niemand ausserhalb sieht, wonach gesucht wird.',
      'Sechs Ebenen über denselben Ausschnitt, von der Vektorkarte bis zum Gebäudemodell. Die Abdeckung ist strukturell gleich, weil alle Ebenen ihre Kachelliste aus derselben Auswahl ableiten.',
      'Die Kartenebenen entstehen aus eigenen Bauwerkzeugen. Zwei davon prüfen nicht die Daten, sondern das eigene Ergebnis: Höhenkacheln gegen das Rohraster und Kartenobjekte gegen die Darstellungsregeln.',
    ],
    decisions: [
      {
        title: 'Eigener Adressindex statt der Standardlösung',
        body: 'Die verbreitete Lösung für Adresssuche braucht rund 100 GB Datenbank und über 16 GB Arbeitsspeicher. Beides gibt diese Hardware nicht her. Der eigene Index kann weniger, nämlich genau Adressen mit Hausnummern, und passt dafür in eine Datei, die sich kopieren lässt.',
      },
      {
        title: 'Das eigene Ergebnis gegenprüfen',
        body: 'Ein Fehler beim Umrechnen von Höhendaten fällt nicht auf, solange die Kacheln geladen werden. Er fällt auf, wenn jemand ein Höhenprofil ansieht und die Zahlen nicht stimmen. Deshalb prüft ein eigenes Werkzeug den fertigen Kachelsatz stichprobenweise gegen die Rohdaten.',
      },
      {
        title: 'Die Abdeckung hat eine Quelle',
        body: 'Luftbild, Höhe und Gebäude könnten jeweils eigene Ausschnitte haben, und dann fehlt auf einer Ebene etwas, das auf der anderen da ist. Stattdessen leiten alle ihre Kachelliste aus derselben Auswahl ab. Deckungsgleiche Abdeckung ist damit kein Vorsatz, sondern eine Folge.',
      },
      {
        title: 'Das Portal prüft, was vorhanden ist',
        body: 'Eine fehlende Ebene soll keine Fehlermeldung ergeben, sondern einfach nicht erscheinen. Das Portal fragt beim Laden nach und blendet aus, was es nicht findet. Eine Ebene nachzuliefern heißt damit, eine Datei abzulegen.',
      },
    ],
    metrics: [
      {
        label: 'Adressen',
        value: '19,3 Mio. mit Hausnummer, eine Datei',
      },
      {
        label: 'Speicherbedarf beim Bau',
        value: 'unter 500 MB statt 16 GB',
      },
      {
        label: 'Ebenen',
        value: '6 über denselben Ausschnitt',
      },
      {
        label: 'Bauwerkzeuge',
        value: 'zwei prüfen das eigene Ergebnis nach',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Vektorkarte offline, Nachschlagewerke im Haus',
      },
      {
        when: '2026 H2',
        what: 'Eigener Adressindex mit Hausnummern, Routendienst auf eigenem Gast',
      },
      {
        when: '2026 H2',
        what: 'Luftbilder und Satellitenmosaik als eigene Ebenen',
      },
      {
        when: '2026 H2',
        what: 'Höhendaten mit Gegenprobe, Gebäudemodelle dreidimensional',
      },
    ],
    limits: [
      'Der Ausschnitt ist bewusst begrenzt. Scharfe Luftbilder und Gebäudemodelle gibt es für die eigene Umgebung, nicht für Deutschland.',
      'Die Daten sind ein Stand, kein Abonnement. Was sich draußen ändert, kommt erst mit dem nächsten Baulauf an, und der dauert bei den Höhendaten Stunden.',
      'Die Adresssuche findet Adressen. Sie ist kein vollwertiger Ortsdienst und kann weder nach Ortsteilen noch nach Sehenswürdigkeiten suchen.',
    ],
  },
  enAlt: {
    problem: 'Looking something up, reading a map and finding your way are exactly the things you need at the moment they stop working: a power cut in the neighbourhood, a broken line, a dead spot. All three normally hang off a provider that also gets to watch what is being searched for and where you are headed. I wanted those three capabilities to live at home for good, on hardware that is arguably too small for them, and without every answer travelling through someone else’s data centre first.',
    approach: [
      'The reference library keeps Wikipedia, technical books, course material and how-to guides as compressed archives that a lean server hands out directly. Memory use stays small because the archives are mapped rather than loaded, so the operating system keeps the hot parts around by itself.',
      'The map is a vector map built from open data and lives entirely on local disk. Aerial imagery and a satellite view sit on top as separate, switchable image layers.',
      'Those image layers go underneath the first label layer. Mounted on top, aerial imagery covers place and street names, and you end up with a pretty but nameless surface.',
      'Addresses come out of the same raw dataset as the map and go into an index of their own. The lookup service needs nothing beyond the language’s standard library, holds no port of its own and is reachable only through the portal.',
      'Route planning runs in a dedicated guest on the virtualization cluster and computes from prepared tiles. The portal forwards the requests, which keeps everything under one origin, and the service itself is firewalled down to two machines.',
      'Search continues in the existing search field, stepping from a street to the house numbers on that same street. A second input box for it was deliberately left out.',
    ],
    architecture: {
      summary: 'The browser reaches two portals over HTTPS: the map portal and the reference library. The map portal serves the frontend and forwards two kinds of request, address lookup in the same network segment and route planning in a dedicated guest on the virtualization cluster. Underneath sit the data stores: map tiles including aerial and satellite imagery, the address index as a single database file, the precomputed routing tiles and the knowledge archives. None of it leaves the house, and none of the services needs an outbound connection to do its job.',
      tiers: [
        {
          label: 'Access',
          nodes: [
            {
              id: 'browser',
              label: 'Browser',
              note: 'HTTPS, phone included',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Portals',
          nodes: [
            {
              id: 'karte',
              label: 'Map portal',
              note: 'frontend + forwarding',
              kind: 'core',
            },
            {
              id: 'wissen',
              label: 'Reference library',
              note: 'archives, books',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Services',
          nodes: [
            {
              id: 'adressen',
              label: 'Address lookup',
              note: 'no port of its own',
              kind: 'core',
            },
            {
              id: 'routing',
              label: 'Routing service',
              note: 'dedicated cluster guest',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Data stores',
          nodes: [
            {
              id: 'tiles',
              label: 'Map tiles',
              note: 'vector, aerial, satellite',
              kind: 'data',
            },
            {
              id: 'adrdb',
              label: 'Address index',
              note: 'a single database file',
              kind: 'data',
            },
            {
              id: 'rtiles',
              label: 'Routing tiles',
              note: 'precomputed',
              kind: 'data',
            },
            {
              id: 'zim',
              label: 'Knowledge archives',
              note: 'compressed, mapped',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'browser',
          to: 'karte',
        },
        {
          from: 'browser',
          to: 'wissen',
        },
        {
          from: 'karte',
          to: 'adressen',
          label: 'same origin',
        },
        {
          from: 'karte',
          to: 'routing',
          label: 'forwarded',
        },
        {
          from: 'karte',
          to: 'tiles',
        },
        {
          from: 'adressen',
          to: 'adrdb',
        },
        {
          from: 'routing',
          to: 'rtiles',
        },
        {
          from: 'wissen',
          to: 'zim',
        },
      ],
    },
    result: [
      'Map, address lookup and route planning all run with no connection to the outside world. That is not a theoretical claim: the path from the search field through street and house number to the turn list works end to end inside my own network.',
      'The address index holds more than 19 million addresses and answers a query in under half a second, out of a single database file of about a gigabyte.',
      'The reference library has grown to 108 archives while using less than half a gigabyte of memory, because the archives are mapped instead of loaded.',
      'The whole build is resumable in stages. An abort after hours costs the last stage, not the entire run.',
    ],
    decisions: [
      {
        title: 'An address index of its own instead of the standard option',
        body: 'The usual route to address search over open map data asks for roughly a hundred gigabytes of database and more than sixteen gigabytes of memory. The machine in question has a few gigabytes free. Rather than lower the goal there is an index of its own, cut to exactly one question: which street, which house number, which town. The result fits in about a gigabyte, and the build ran in under 500 megabytes of memory, in stages that can be repeated individually.',
      },
      {
        title: 'Disk risk outweighs memory risk',
        body: 'Two nodes were candidates for the routing service. The obvious one had more free memory, but its disk was four fifths full and carries the data of several other guests. A build spike would have pushed it to the edge. The second node is tighter on memory and has plenty of room. It got the job: a full disk takes unrelated services down with it, while memory pressure only makes a non-critical service slower.',
      },
      {
        title: 'HTTPS because the browser insists',
        body: 'Browsers only release the geolocation API in a secure context. The button for your own position had been there all along and could never work over a plain address bar with an IP in it. So the map got a name of its own and a certificate from the in-house certificate authority. The requirement came from the browser rather than from the security concept, and it still got solved properly instead of worked around.',
      },
      {
        title: 'Pull one zoom level less from someone else’s server',
        body: 'The satellite view comes from a third party running it for free. The obvious zoom level would have meant around 450,000 requests; one level down it is 114,000. The source resolves at ten metres and that lower level already sits at twelve metres per pixel, so four times the load would have produced no new detail at all, only intermediate values. Add rate limiting, an honest user agent, backing off when refused, and attribution on the map.',
      },
    ],
    metrics: [
      {
        label: 'Addresses indexed',
        value: '19.3 million',
      },
      {
        label: 'Memory during build',
        value: 'under 500 MB',
      },
      {
        label: 'Lookup latency',
        value: 'under half a second',
      },
      {
        label: 'Reference library',
        value: '108 archives',
      },
    ],
    timeline: [
      {
        when: '2026 H2',
        what: 'Reference library expanded, vector map with street names and place search',
      },
      {
        when: '2026 H2',
        what: 'Map served over HTTPS, a dedicated cluster guest takes over offline routing',
      },
      {
        when: '2026 H2',
        what: 'Aerial and satellite imagery as separate layers, address index live',
      },
      {
        when: 'next up',
        what: 'Wire address lookup straight into route planning',
      },
    ],
    limits: [
      'Coverage stops at the border. Map and routing compute for Germany, with the surrounding area included only coarsely. Navigating southern Europe with this would need a new tile set first.',
      'About six percent of addresses are missing from the index because the raw data has no town or no street for them. The postcode could stand in, and I left that untested rather than filing it as done.',
      'High-resolution aerial imagery exists for one federal state only, because that is where the data is freely available. Everything else falls back to the coarser satellite view.',
      'Building tiles takes hours and is kicked off by hand. A month-old data set is the normal case, and this is explicitly not live data.',
      'No traffic, no roadworks, no closures. The route is the shortest path per the map, and it makes no larger claim than that.',
    ],
  },
};

export default offlineWissen;
