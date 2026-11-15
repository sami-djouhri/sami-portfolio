import type { Fallstudie } from './typ';

// Neu erhoben und gepaart am 2026-11-14 (vorher Uebergangsform). Auch das
// Deutsche war ueberholt: es sagte, die Suche finde weder Ortsteile noch
// Sehenswuerdigkeiten (seit 16.10. gibt es die Gattungssuche ueber 2,2 Mio.
// Eintraege), und es kannte weder Nahverkehr, 3D-Haeuser, die App noch den
// Rohdaten-Takt und den taeglichen Waechter.
//
// Messbefehle (Stand 2026-11-14, Arbeitskopie karten auf dem Karten-Wirt):
// - Speicher: Adressteil unter 500 MB, gemessen beim ersten Bau am 2026-08-16
//  ; der POI-Teil kam
//   spaeter dazu und ist darin nicht gemessen.
// - Index: Bau-Log ~/knowledge-vault/adressen/bau-2026-10-16.log, Schlusszeile:
//   16.392 Orte, 1.031.036 Strassen, 2.226.721 POI, 19.274.091 Hausnummern;
//   20.578.184 Adressen insgesamt (6,3 Prozent ohne Ort oder Strasse).
// - Nachschlagewerk: `ls ~/knowledge-vault/kiwix | grep -c '\.zim$'` = 97.
// - Nahverkehr: die Projektregeln des Repos, Abschnitt OePNV (17.424 Stationen,
//   5,5 Mio. Abfahrten, Umkreis 50 km, OTP 2.10.0 auf eigenem Gast).
// - App: Abschnitt „Der Ausschnitt der Karten-App" (Grundkarte 7,2 GB bis z15).
// - Waechter: karten-daten.prom und karten-rohdaten.prom im Textfile-Verzeichnis
//   der Steuerzentrale, alle *_messung_ok = 1, acht Teilmessungen im Skript
//   wache/karten-wache.sh; Rohdaten-Timer 5. des Quartalsmonats.
//
// Bewusst nicht drin: die Bewegungshistorie hinter der Anmeldung und jeder
// Ortsname (Wohnort-Regel). Der Beleg in lib/projects.ts zeigt eine fremde
// Innenstadt.
const offlineWissen: Fallstudie = {
  problem: {
    de: 'Karte, Nachschlagewerk und Routenplanung hängen normalerweise an einer Leitung nach draußen. Fällt die aus, fällt alles drei aus, und nebenbei weiß ein Anbieter, wonach hier gesucht wird und wohin jemand unterwegs ist. Ich wollte das im Haus haben, auf Hardware, die dafür eigentlich zu klein ist. Der schwierige Teil war die Adresssuche: die verbreitete Standardlösung will eine Datenbank von rund 100 GB und mehr als 16 GB Arbeitsspeicher.',
    en: 'Map, reference library and route planning normally hang off a line to the outside. When it fails, all three fail, and on the side a provider learns what is being looked up here and where someone is headed. I wanted all of it at home, on hardware that is arguably too small for it. The hard part was address search: the common off-the-shelf option wants a database of around 100 GB and more than 16 GB of memory.',
  },
  approach: [
    {
      de: 'Das Nachschlagewerk hält Wikipedia, Fachbücher, Kursmaterial und Anleitungen als komprimierte Archive vor. Ein schlanker Server liefert sie direkt aus und startet erst beim ersten Aufruf.',
      en: 'The reference library keeps Wikipedia, technical books, course material and how-to guides as compressed archives. A lean server hands them out directly and only starts on the first request.',
    },
    {
      de: 'Die Karte ist eine Vektorkarte aus offenen Daten und wird im Browser gezeichnet. Der Server liefert nur Dateien. Alle Bibliotheken, Schriften und Symbole liegen im Haus, zur Laufzeit wird nichts von außen geladen.',
      en: 'The map is a vector map built from open data and is drawn in the browser. The server only hands out files. All libraries, fonts and symbols live at home, and nothing is fetched from outside at runtime.',
    },
    {
      de: 'Aus denselben Rohdaten entsteht ein eigener Suchindex: Orte, Straßen, Adressen mit Hausnummer und gut zwei Millionen Einträge mit Gattung, etwa Apotheken, Haltestellen oder Werkstätten. Der Bau läuft in Stufen und ist wiederaufnehmbar. Zusammenführen und Entdoppeln erledigt die Datenbank auf der Platte, damit keine großen Tabellen im Arbeitsspeicher liegen.',
      en: 'The same raw data feeds a search index of its own: places, streets, addresses with house numbers and a good two million entries with a category, such as pharmacies, stops or workshops. The build runs in stages and can be resumed. Merging and deduplication happen in the database on disk, so no large tables sit in memory.',
    },
    {
      de: 'Über der Karte liegen eigene Ebenen: Luftbilder aus dem Landesbestand, ein wolkenfreies Satellitenmosaik, Gelände aus Höhendaten und Häuser aus amtlichen Gebäudemodellen, in 3D mit Luftbild auf den Dächern. Das Portal prüft beim Laden, welche Ebenen vorhanden sind, und blendet fehlende aus.',
      en: 'Own layers sit on top of the map: aerial imagery from the state archive, a cloud-free satellite mosaic, terrain from elevation data and houses from official building models, in 3D with aerial imagery on the roofs. On load the portal checks which layers exist and hides the missing ones.',
    },
    {
      de: 'Routen rechnet ein eigener Dienst auf einem Gast im Virtualisierungs-Cluster, mit Höhenprofil, Steigungsfarbe auf der Linie und gesprochenen Abbiegehinweisen aus der hauseigenen Sprachausgabe.',
      en: 'Routes are computed by a dedicated service on a guest in the virtualization cluster, with an elevation profile, gradient colour on the line and spoken turn instructions from the in-house speech output.',
    },
    {
      de: 'Für den Nahverkehr gibt es eine Abfahrtstafel und eine Verbindungssuche, beide aus dem offenen Fahrplan für Deutschland, zugeschnitten auf einen Umkreis von 50 km. Die Verbindungen rechnet ein Routenplaner für Bus und Bahn auf einem weiteren Gast.',
      en: 'For public transport there is a departure board and a journey planner, both built from the open timetable for Germany, cut to a 50 km radius. The journeys are computed by a bus and rail planner on another guest.',
    },
    {
      de: 'Eine App fürs Telefon nimmt die Grundkarte für ganz Deutschland mit und die Zusatzebenen für die Umgebung. Im Heimnetz fragt sie Suche, Routen und Fahrplan live beim Portal.',
      en: 'A phone app carries the base map for all of Germany plus the extra layers for the local area. On the home network it asks the portal for search, routes and timetable live.',
    },
    {
      de: 'Die Kartendaten werden einmal im Quartal erneuert, in vier Stufen von einem Download aus: Rohdaten holen, Suchindex bauen, an den Bau-Host verteilen, Routenkacheln bauen. Der Fahrplan wird täglich geprüft und nur bei einem neuen Stand neu gebaut.',
      en: 'The map data is renewed once a quarter, in four stages from one download: fetch raw data, build the search index, hand it to the build host, build the routing tiles. The timetable is checked daily and rebuilt only when a new edition appears.',
    },
  ],
  architecture: {
    summary: {
      de: 'Aus offenen Rohdaten entstehen in getrennten Bauläufen die Ebenen, der Suchindex, die Routenkacheln und der Fahrplan. Das Portal liefert die Karte als Dateien aus und leitet Suche, Routen und Fahrplan an je einen eigenen Dienst weiter. Browser und App sprechen nur mit dem Portal. Ein täglicher Wächter prüft, ob Daten und Dienste noch zusammenpassen.',
      en: 'Separate build runs turn open raw data into the layers, the search index, the routing tiles and the timetable. The portal serves the map as files and forwards search, routes and timetable to one dedicated service each. Browser and app only talk to the portal. A daily watchdog checks that data and services still fit together.',
    },
    tiers: [
      {
        label: { de: 'Rohdaten', en: 'Raw data' },
        nodes: [
          { id: 'osm', label: { de: 'Offene Kartendaten', en: 'Open map data' }, note: { de: 'vierteljährlich', en: 'quarterly' }, kind: 'edge' },
          { id: 'land', label: { de: 'Landesdaten', en: 'State data' }, note: { de: 'Luftbild · Höhe · Gebäude', en: 'aerial · elevation · buildings' }, kind: 'edge' },
          { id: 'gtfs', label: { de: 'Offener Fahrplan', en: 'Open timetable' }, note: { de: 'täglich geprüft', en: 'checked daily' }, kind: 'edge' },
        ],
      },
      {
        label: { de: 'Bauläufe', en: 'Build runs' },
        nodes: [
          { id: 'index', label: { de: 'Suchindex', en: 'Search index' }, note: { de: 'stufenweise, wiederaufnehmbar', en: 'staged, resumable' }, kind: 'core' },
          { id: 'ebenen', label: { de: 'Kartenebenen', en: 'Map layers' }, note: { de: 'mit Gegenprobe', en: 'with counter-check' }, kind: 'core' },
          { id: 'kacheln', label: { de: 'Routenkacheln', en: 'Routing tiles' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Dienste', en: 'Services' },
        nodes: [
          { id: 'portal', label: { de: 'Karten-Portal', en: 'Map portal' }, note: { de: 'prüft, was da ist', en: 'checks what exists' }, kind: 'consumer' },
          { id: 'suche', label: { de: 'Suche', en: 'Search' }, note: { de: 'liest nur', en: 'read-only' }, kind: 'core' },
          { id: 'route', label: { de: 'Routen', en: 'Routing' }, note: { de: 'eigener Gast', en: 'own guest' }, kind: 'core' },
          { id: 'fahrplan', label: { de: 'Fahrplan', en: 'Timetable' }, note: { de: 'Tafel · Verbindungen', en: 'board · journeys' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Zugriff', en: 'Access' },
        nodes: [
          { id: 'geraete', label: { de: 'Browser und App', en: 'Browser and app' }, kind: 'edge' },
          { id: 'wache', label: { de: 'Wächter', en: 'Watchdog' }, note: { de: 'täglich, acht Messungen', en: 'daily, eight checks' }, kind: 'core' },
        ],
      },
    ],
    flows: [
      { from: 'osm', to: 'index' },
      { from: 'osm', to: 'kacheln' },
      { from: 'land', to: 'ebenen' },
      { from: 'gtfs', to: 'fahrplan' },
      { from: 'index', to: 'suche' },
      { from: 'kacheln', to: 'route' },
      { from: 'ebenen', to: 'portal' },
      { from: 'suche', to: 'portal' },
      { from: 'route', to: 'portal' },
      { from: 'fahrplan', to: 'portal' },
      { from: 'geraete', to: 'portal', label: { de: 'eine Adresse', en: 'one address' } },
      { from: 'wache', to: 'portal', label: { de: 'prüft', en: 'checks' } },
    ],
  },
  result: [
    {
      de: 'Über 19 Millionen Adressen mit Hausnummer und gut zwei Millionen Einträge mit Gattung in einem Index von knapp 2 GB. Der Adressteil wurde mit unter 500 MB Arbeitsspeicher gebaut.',
      en: 'More than 19 million addresses with house numbers and a good two million entries with a category in an index of just under 2 GB. The address part was built with under 500 MB of memory.',
    },
    {
      de: 'Karte, Suche, Routen, Fahrplan und Nachschlagewerk funktionieren ohne Leitung nach draußen. Niemand außerhalb sieht, wonach gesucht wird.',
      en: 'Map, search, routes, timetable and reference library work without a line to the outside. Nobody outside sees what is being searched for.',
    },
    {
      de: 'Das Nachschlagewerk umfasst knapp hundert Archive und belegt kaum Speicher, solange niemand es aufruft.',
      en: 'The reference library holds close to a hundred archives and takes hardly any memory while nobody calls it up.',
    },
    {
      de: 'Ein abgelaufener Fahrplan zeigt keine Abfahrten mehr und sagt, dass er abgelaufen ist. Fünf Tage vorher meldet sich ein Alarm.',
      en: 'An expired timetable shows no more departures and says that it has expired. An alert fires five days ahead.',
    },
  ],
  decisions: [
    {
      title: { de: 'Eigener Suchindex statt der Standardlösung', en: 'A search index of its own instead of the standard option' },
      body: {
        de: 'Die verbreitete Lösung für Adresssuche braucht rund 100 GB Datenbank und über 16 GB Arbeitsspeicher. Der Rechner hat ein paar Gigabyte frei. Der eigene Index ist auf wenige Fragen zugeschnitten: welcher Ort, welche Straße, welche Hausnummer, welche Gattung. Dafür passt er in zwei Dateien, die sich kopieren lassen.',
        en: 'The common solution for address search needs around 100 GB of database and more than 16 GB of memory. The machine has a few gigabytes free. The own index is cut to a few questions: which town, which street, which house number, which category. In return it fits into two files that can be copied.',
      },
    },
    {
      title: { de: 'Wer eine Gattung tippt, kennt den Namen nicht', en: 'Whoever types a category does not know the name' },
      body: {
        de: 'Die Suche las anfangs nur Namen. Wer „Apotheke“ und einen Ort eingab, bekam die eine von acht Apotheken, deren Name mit dem Wort beginnt. Eine Tankstelle heißt fast nie „Tankstelle“, eine Arztpraxis meist nach dem Arzt. Seitdem kennt der Index zu jedem Eintrag die Gattung, und ein eigener Prüfer meldet jede Gattung, die im Index keinen Treffer mehr hat.',
        en: 'At first the search only read names. Typing “pharmacy” and a town returned the one pharmacy out of eight whose name starts with that word. A petrol station is hardly ever named “petrol station”, a doctor’s practice usually after the doctor. Since then the index knows the category of every entry, and a dedicated checker reports any category that no longer has a hit in the index.',
      },
    },
    {
      title: { de: 'Näher ist nicht immer schneller', en: 'Closer is not always quicker' },
      body: {
        de: 'Treffer einer Gattungssuche lassen sich auf Knopfdruck nach Fahrzeit sortieren, von einem Startpunkt, den man auf der Karte ausdrücklich wählt. Gemessen lagen zwei Apotheken gleich weit entfernt, die eine zwei Minuten, die andere vier. Ein Ziel ohne Weg bleibt in der Liste und wird benannt, damit die Trefferzahl stimmt.',
        en: 'The hits of a category search can be sorted by travel time at the push of a button, from a starting point chosen explicitly on the map. Measured, two pharmacies were equally far away, one two minutes, the other four. A destination without a route stays in the list and is labelled, so that the hit count stays right.',
      },
    },
    {
      title: { de: 'Plattenrisiko schlägt Speicherrisiko', en: 'Disk risk outweighs memory risk' },
      body: {
        de: 'Für den Routendienst kamen zwei Knoten in Frage. Der naheliegende hatte mehr freien Arbeitsspeicher, aber seine Platte war zu vier Fünfteln voll und trägt die Daten mehrerer anderer Gäste. Eine Spitze beim Bau hätte sie an den Rand gebracht. Der zweite ist beim Speicher knapper und hat viel Platz. Er bekam die Aufgabe, weil eine volle Platte fremde Dienste mitnimmt, während Speicherdruck nur einen unkritischen Dienst langsamer macht.',
        en: 'Two nodes were candidates for the routing service. The obvious one had more free memory, but its disk was four fifths full and carries the data of several other guests. A spike during the build would have pushed it to the edge. The second is tighter on memory and has plenty of room. It got the job, because a full disk takes unrelated services down with it, while memory pressure only slows a non-critical service.',
      },
    },
    {
      title: { de: 'Eine Zoomstufe weniger vom fremden Server', en: 'One zoom level less from someone else’s server' },
      body: {
        de: 'Die Satellitenansicht kommt von einem Dritten, der sie kostenlos betreibt. Die naheliegende Zoomstufe hätte rund 450.000 Abrufe bedeutet, eine Stufe darunter sind es 114.000. Die Quelle löst mit zehn Metern auf, und die niedrigere Stufe liegt schon bei zwölf Metern je Pixel. Die vierfache Last hätte keine neuen Details gebracht. Dazu kommen Ratenbegrenzung, eine ehrliche Kennung, Rückzug bei Ablehnung und die Quellenangabe auf der Karte.',
        en: 'The satellite view comes from a third party that runs it for free. The obvious zoom level would have meant around 450,000 requests, one level down it is 114,000. The source resolves at ten metres, and the lower level already sits at twelve metres per pixel. Four times the load would have brought no new detail. On top come rate limiting, an honest user agent, backing off when refused and attribution on the map.',
      },
    },
    {
      title: { de: 'Das eigene Ergebnis gegenprüfen', en: 'Check your own output' },
      body: {
        de: 'Ein Fehler beim Umrechnen von Höhendaten fällt nicht auf, solange die Kacheln laden. Er fällt auf, wenn jemand ein Höhenprofil ansieht und die Zahlen nicht stimmen. Deshalb prüft ein eigenes Werkzeug den fertigen Kachelsatz stichprobenweise gegen die Rohdaten. Ein zweites zählt, welche Kartenobjekte wirklich in den Kacheln stehen, und hält das gegen die Darstellungsregeln.',
        en: 'An error while converting elevation data goes unnoticed as long as the tiles load. It shows up when someone looks at an elevation profile and the numbers are wrong. So a dedicated tool samples the finished tile set against the raw data. A second one counts which map objects actually sit in the tiles and holds that against the styling rules.',
      },
    },
    {
      title: { de: 'Gemessen wird, was der Dienst geladen hat', en: 'Measure what the service has loaded' },
      body: {
        de: 'Der Routenplaner für Bus und Bahn liest seinen Fahrplan beim Start. Eine frische Datei auf der Platte sagt deshalb nichts darüber, wie lange er noch rechnen kann. Der Wächter fragt den laufenden Dienst nach dem Gültigkeitszeitraum. Eine weitere Probe stellt dieselbe Anfrage wie die App, auf demselben Weg, und prüft, ob Busse herauskommen.',
        en: 'The bus and rail planner reads its timetable at startup. A fresh file on disk therefore says nothing about how long it can keep computing. The watchdog asks the running service for its validity period. A further probe sends the same request as the app, along the same path, and checks that buses come back.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Adressen', en: 'Addresses' },
      value: { de: '19,3 Mio. mit Hausnummer', en: '19.3 million with house number' },
    },
    {
      label: { de: 'Einträge mit Gattung', en: 'Entries with a category' },
      value: { de: '2,2 Mio.', en: '2.2 million' },
    },
    {
      label: { de: 'Speicher beim Bau', en: 'Memory during build' },
      value: { de: 'unter 500 MB statt 16 GB', en: 'under 500 MB instead of 16 GB' },
    },
    {
      label: { de: 'Wächter', en: 'Watchdog' },
      value: { de: 'täglich, acht Teilmessungen', en: 'daily, eight checks' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Vektorkarte offline, Nachschlagewerk im Haus',
        en: 'Vector map offline, reference library at home',
      },
    },
    {
      when: { de: 'August 2026', en: 'August 2026' },
      what: {
        de: 'Eigener Adressindex mit Hausnummern, Routendienst auf eigenem Gast, Luftbild, Satellit, Gelände und Gebäude als Ebenen',
        en: 'Own address index with house numbers, routing service on its own guest, aerial, satellite, terrain and buildings as layers',
      },
    },
    {
      when: { de: 'Oktober 2026', en: 'October 2026' },
      what: {
        de: 'Suche nach Gattung, Rohdaten vierteljährlich, täglicher Wächter, Steigungsfarbe und Sortierung nach Fahrzeit',
        en: 'Search by category, raw data quarterly, daily watchdog, gradient colour and sorting by travel time',
      },
    },
    {
      when: { de: 'Ende Oktober 2026', en: 'Late October 2026' },
      what: {
        de: 'Häuser in 3D mit Dächern, Abfahrtstafel und Verbindungssuche, App mit Grundkarte für ganz Deutschland',
        en: 'Houses in 3D with roofs, departure board and journey planner, app with a base map for all of Germany',
      },
    },
  ],
  limits: [
    {
      de: 'Karte und Routen decken Deutschland ab, das Umland nur grob. Scharfe Luftbilder und Gebäudemodelle gibt es nur für die eigene Umgebung, weil die Daten dort frei verfügbar sind.',
      en: 'Map and routing cover Germany, the surroundings only coarsely. Sharp aerial imagery and building models exist only for the local area, because the data is freely available there.',
    },
    {
      de: 'Rund sechs Prozent der Adressen fehlen im Index, weil die Rohdaten für sie keinen Ort oder keine Straße nennen.',
      en: 'About six percent of addresses are missing from the index, because the raw data names no town or no street for them.',
    },
    {
      de: 'Die Daten sind ein Stand und kein Abonnement. Was sich draußen ändert, kommt erst mit dem nächsten Baulauf an. Die Routenplanung rechnet ohne Verkehr, Baustellen und Sperrungen.',
      en: 'The data is a snapshot, not a subscription. Changes outside only arrive with the next build run. The route planner knows nothing about traffic, roadworks or closures.',
    },
    {
      de: 'Der Fahrplan ist planmäßig und gilt rund einen Monat. Verspätungen und Ausfälle zeigt sie nicht. Ohne Leitung nach draußen ist die Tafel nach spätestens vier Wochen leer.',
      en: 'The timetable is scheduled only and lasts about a month. It does not show delays or cancellations. Without a line to the outside the board is empty after four weeks at most.',
    },
    {
      de: 'Die Grundkarte der App ist 7,2 GB groß. Die schärfsten Ebenen bleiben deshalb im Haus und kommen nur im Heimnetz aufs Telefon.',
      en: 'The app’s base map is 7.2 GB. The sharpest layers therefore stay at home and only reach the phone on the home network.',
    },
  ],
};

export default offlineWissen;
