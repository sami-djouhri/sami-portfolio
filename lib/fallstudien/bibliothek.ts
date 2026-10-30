import type { Fallstudie } from './typ';

// Musterkapitel des Neuentwurfs vom 2026-10-06. Diese Fallstudie liegt hinter dem
// Steckbrief und wird erst beim Aufklappen gelesen, darf also technisch sein. Was sie
// NICHT darf: Autorschaft behaupten oder eine exakte Zahl tragen, die niemand nachmisst.
// aus der englischen Datei:
// Neu am 2026-10-18. Diese Fallstudie hat es auf Englisch nie gegeben,
// und `getProjectDetail` faellt dann auf die deutsche zurueck. Gemessen am
// laufenden Dienst stand auf `/en/projects/bibliothek` deutscher Text unter
// englischen Ueberschriften („Limits" ueber „Erreichbar nur im eigenen
// Netz"). Das faellt nicht auf, weil die Seite vollstaendig aussieht: ein
// Rueckfall sieht genauso aus wie eine Uebersetzung, solange niemand liest.
const bibliothek: Fallstudie = {
  // Am 2026-10-30 aus `lib/projects.ts` hierher gezogen und dabei erstmals
  // uebersetzt. Bis dahin stand auf /en der deutsche Steckbrief.
  steckbrief: {
    beschreibung: {
      de: 'Die eigenen E-Books lesen, EPUB und PDF aus der Calibre-Sammlung. Im Browser, auf dem Telefon als App auf dem Startbildschirm, ohne Internet und ohne Anmeldung. Mehrere Leser im Haushalt haben getrennte Lesestände, Lesezeichen und Notizen.',
      en: 'Read your own e-books, EPUB and PDF from the Calibre collection. In the browser, and on the phone as an app on the home screen, without internet and without signing in. Several readers in the household have separate reading positions, bookmarks and notes.',
    },
    // Jede Zeile ist eine Route oder ein Schalter im Dienst, keine Absichtserklärung:
    // /api/vorlesen, /api/nachschlagen, /api/marken, /api/leseliste, /api/register,
    // /api/kopplung samt /api/geraete, /sw.js plus manifest.webmanifest, die vier
    // Papiere in leser.html. Belegt am 2026-10-06 gegen den Quelltext.
    funktionen: [
      {
        de: 'Vorlesen über eine Sprachausgabe, die auf eigener Hardware im Haus läuft. Der Text wird dafür in Stücke geschnitten, deren Länge an der gemessenen Geschwindigkeit der Sprachausgabe hängt.',
        en: 'Read-aloud through speech synthesis that runs on my own hardware at home. The text is cut into pieces whose length follows the measured speed of the speech synthesis.',
      },
      {
        de: 'Wörter im Text antippen und offline nachschlagen, aus einem Wiktionary-Abbild im eigenen Netz.',
        en: 'Tap a word in the text and look it up offline, from a Wiktionary copy in my own network.',
      },
      {
        de: 'Suche über Titel und Inhalt, dazu ein Register und eine Leseliste. Markierungen und Notizen hängen am Profil und stehen damit auf jedem Gerät bereit.',
        en: 'Search across titles and content, plus an index and a reading list. Highlights and notes belong to the profile and are therefore available on every device.',
      },
      {
        de: 'Vier Farbschemata für Tag, Abend, Nacht und schwarze Bildschirme. Ohne eigene Wahl entscheidet das Gerät, und der Wechsel merkt sich, welches Schema auf welcher Seite der Hell-Dunkel-Grenze zuletzt galt.',
        en: 'Four colour schemes for day, evening, night and black screens. Without a choice of your own the device decides, and switching remembers which scheme last applied on which side of the light-dark boundary.',
      },
      {
        de: 'Ein zweites Gerät kommt über einen Kopplungscode dazu, ohne Konto und Passwort. Der Lesestand wandert mit, ein farbiges Lesezeichen am Seitenrand zeigt ihn je Profil.',
        en: 'A second device joins through a pairing code, without an account or password. The reading position travels along, and a coloured bookmark at the page edge shows it per profile.',
      },
    ],
    // Größenordnung beim Bestand, weil den niemand für die Seite nachmisst (gemessen
    // am 2026-10-06: 1.278 Bände, 637 Autoren, 7,69 GiB, größter Band 454 MB).
    // Der Codeumfang steht ebenfalls als Größenordnung, gemessen 21.094 Zeilen und 368
    // Testfunktionen ohne foliate-js, das als Fremdbibliothek nicht mitzählt.
    umfang: {
      de: 'Fast 1300 Bücher von über 600 Autoren, knapp acht Gigabyte, überwiegend EPUB und ein kleinerer Teil PDF. Das größte einzelne Buch ist 454 MB groß und wird deshalb in Teilstücken übertragen, damit das Aufschlagen nicht auf die ganze Datei wartet. Der Leser selbst ist mit knapp 370 Testfunktionen abgesichert.',
      en: 'Almost 1,300 books by more than 600 authors, just under eight gigabytes, mostly EPUB and a smaller share of PDF. The largest single book is 454 MB and is therefore transferred in ranges, so that opening it does not wait for the whole file. The reader itself is covered by close to 370 test functions.',
    },
    entschieden: {
      de: 'Die Bücher kommen von einem eigenen, nur lesenden nginx über demselben Verzeichnis. Vorher lief das über calibre-web. Das läuft nur auf Abruf und schläft sonst, jedes Aufschlagen wartete also erst acht bis zwanzig Sekunden auf seinen Start, und im Code stand dafür eine Warteschleife. Den Pfad jedes Buches kennt die lokale Kopie des Katalogs ohnehin, zum Ausliefern einer Datei braucht es damit kein laufendes Programm dazwischen. Gemessen sind es jetzt 0,18 Sekunden, und gelesen wird auch bei gestopptem calibre-web. Die Warteschleife ist ersatzlos entfallen.',
      en: 'The books come from a read-only nginx of its own over the same directory. Before, this went through calibre-web. That only runs on demand and sleeps otherwise, so opening a book first waited eight to twenty seconds for it to start, and the code carried a wait loop for that. The local copy of the catalogue knows the path of every book anyway, so handing out a file needs no running program in between. It now measures 0.18 seconds, and reading works even with calibre-web stopped. The wait loop is gone without replacement.',
    },
    laeuft: {
      de: 'Seit September 2026 in Benutzung. Nachts um 04:20 holt sich das Regal den neuen Stand aus dem Calibre-Katalog. Dieser Lauf meldet sich seit dem Sommer bei der Überwachung, weil er vorher still scheitern konnte: der Dienst galt weiter als gesund, nur das Regal wuchs nicht mehr.',
      en: 'In use since September 2026. At 04:20 each night the shelf fetches the new state from the Calibre catalogue. Since the summer this run reports to monitoring, because before that it could fail silently: the service still counted as healthy, only the shelf stopped growing.',
    },
  },
  problem: {
    de: 'Die E-Book-Sammlung wird mit Calibre verwaltet, und calibre-web stellt sie auch im Browser bereit. Dessen eingebauter Leser ist allerdings eine epub.js-Demo von 2015: Buchsuche und Notizen stehen im Vorlagentext auskommentiert, und ein Lesestand ohne Anmeldung landet auf einem geteilten Gast-Konto, wird also von jedem weiteren Leser überschrieben. Dazu läuft calibre-web nur auf Abruf und schläft sonst, denn zum Einsortieren neuer Bücher muss es nicht durchgehend erreichbar sein. Jedes Aufschlagen eines Buches wartete damit erst auf seinen Start.',
    en: 'The e-book collection is managed with Calibre, and calibre-web also serves it in the browser. Its built-in reader, though, is an epub.js demo from 2015. Book search and notes sit commented out in the template, and reading position without a login lands on a shared guest account, so the next reader overwrites it. On top of that, calibre-web only runs on demand and sleeps otherwise, because filing new books does not need it to be reachable around the clock. Opening a book therefore waited for it to start first.',
  },
  approach: [
    {
      de: 'Ein eigener Leser vor der Calibre-Sammlung. Für die Darstellung der EPUB-Dateien sorgt foliate-js, der Rest ist eigener Dienst in Python: Regal, Register, Suche, Lesestände, Profile.',
      en: 'A reader of my own in front of the Calibre collection. foliate-js renders the EPUB files, the rest is my own service in Python: shelf, index, search, reading positions, profiles.',
    },
    {
      de: 'Die Bücher kommen von einem getrennten nginx über demselben Verzeichnis, ausschließlich lesend. Er läuft dauerhaft und belegt 7 MB, weil er nichts kann außer eine Datei herausgeben, auch in Teilstücken.',
      en: 'The books come from a separate nginx over the same directory, read-only. It runs permanently and takes 7 MB, because all it can do is hand out a file, in ranges as well.',
    },
    {
      de: 'Lesezeichen und Fortschritt liegen in getrennten Feldern. Das Lesezeichen wandert beim Blättern mit, der Fortschritt wird aus den tatsächlich gelesenen Abschnitten gerechnet und bleibt stehen.',
      en: 'Bookmark and progress live in separate fields. The bookmark travels along as you page through, while progress is computed from the sections actually read and stays where it was.',
    },
    {
      de: 'Mehrere Leser im Haushalt über Profile, erkannt an einem Merkmal im Browser. Keine Anmeldung, weil die Sammlung ohnehin nur im eigenen Netz erreichbar ist.',
      en: 'Several readers in the household through profiles, told apart by a trait in the browser. No login, because the collection is only reachable inside my own network anyway.',
    },
    {
      de: 'Vorlesen über eine Sprachausgabe auf eigener Hardware. Der Text wird dafür in Stücke geschnitten, deren Länge an der gemessenen Geschwindigkeit der Stimme hängt.',
      en: 'Read-aloud through speech synthesis on my own hardware. The text is cut into pieces whose length follows the measured speed of the voice.',
    },
  ],
  architecture: {
    summary: {
      de: 'Der Browser lädt den Leser und spricht nur mit dem eigenen Dienst. Der kennt das Regal aus einem nächtlich aufgefrischten Katalog, reicht Bücher von einem getrennten nur lesenden nginx durch und hält Lesestände je Profil in einer eigenen Ablage. Die Sprachausgabe liegt dahinter als eigener Dienst.',
      en: 'The browser loads the reader and talks to my own service only. That service knows the shelf from a nightly refreshed catalogue, passes books through from a separate read-only nginx, and keeps reading positions per profile in its own store. Speech synthesis sits behind it as a service of its own.',
    },
    tiers: [
      {
        label: { de: 'Browser', en: 'Browser' },
        nodes: [
          {
            id: 'leser',
            kind: 'edge',
            label: { de: 'Leser', en: 'Reader' },
            note: { de: 'Darstellung · Lesezeichen', en: 'rendering · bookmark' },
          },
          {
            id: 'sw',
            kind: 'edge',
            label: { de: 'Offline-Schicht', en: 'Offline layer' },
            note: { de: 'Service Worker', en: 'service worker' },
          },
        ],
      },
      {
        label: { de: 'Dienst', en: 'Service' },
        nodes: [
          {
            id: 'regal',
            kind: 'core',
            label: { de: 'Regal und Suche', en: 'Shelf and search' },
          },
          {
            id: 'stand',
            kind: 'core',
            label: { de: 'Lesestände', en: 'Reading positions' },
            note: { de: 'je Profil getrennt', en: 'separate per profile' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'katalog',
            kind: 'data',
            label: { de: 'Katalog', en: 'Catalogue' },
            note: { de: 'nächtlich aufgefrischt', en: 'refreshed nightly' },
          },
          {
            id: 'dateien',
            kind: 'data',
            label: { de: 'Bücher', en: 'Books' },
            note: { de: 'nur lesender Dateiserver', en: 'read-only file server' },
          },
          {
            id: 'stimme',
            kind: 'consumer',
            label: { de: 'Sprachausgabe', en: 'Speech synthesis' },
            note: { de: 'eigene Hardware', en: 'own hardware' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'leser',
        to: 'regal',
        label: { de: 'nur eigener Dienst', en: 'own service only' },
      },
      {
        from: 'sw',
        to: 'leser',
        label: { de: 'offline verfügbar', en: 'available offline' },
      },
      {
        from: 'regal',
        to: 'katalog',
        label: { de: 'Bestand', en: 'holdings' },
      },
      {
        from: 'regal',
        to: 'dateien',
        label: { de: 'Buch abrufen', en: 'fetch a book' },
      },
      {
        from: 'leser',
        to: 'stand',
        label: { de: 'Stelle und Fortschritt', en: 'position and progress' },
      },
      {
        from: 'regal',
        to: 'stimme',
        label: { de: 'Abschnitt vorlesen', en: 'read a section aloud' },
      },
    ],
  },
  result: [
    {
      de: 'Gelesen wird auch bei gestopptem calibre-web, nachgewiesen am abgeschalteten Container. Ein Buch liegt in 0,18 Sekunden vor, vorher dauerte es mit der Startzeit acht bis zwanzig Sekunden.',
      en: 'Reading works with calibre-web stopped, proven against the shut-down container. A book is there in 0.18 seconds, where it used to take eight to twenty seconds including the start-up.',
    },
    {
      de: 'Ein durchgeblättertes Buch gilt nicht mehr als ausgelesen. Lesezeichen und Fortschritt sind getrennt, und beide Oberflächen entscheiden das an derselben Stelle im Code.',
      en: 'A book paged through no longer counts as read. Bookmark and progress are separate, and both interfaces decide that at the same place in the code.',
    },
    {
      de: 'Auf dem Telefon liegt die Bibliothek als App auf dem Startbildschirm und öffnet sich ohne Browserleiste.',
      en: 'On the phone the library sits on the home screen as an app and opens without a browser bar.',
    },
    {
      de: 'Die Sammlung umfasst fast 1300 Bücher und knapp acht Gigabyte, überwiegend EPUB und ein kleinerer Teil PDF. Das größte Buch ist 454 MB groß und wird in Teilstücken ausgeliefert.',
      en: 'The collection holds almost 1,300 books and close to eight gigabytes, mostly EPUB with a smaller share of PDF. The largest book is 454 MB and is delivered in ranges.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Lesezeichen und Fortschritt sind zwei Dinge',
        en: 'Bookmark and progress are two things',
      },
      body: {
        de: 'Beides aus einem Wert abzuleiten ist bequem und falsch. Wer in einem Buch nach einer Stelle sucht und dabei nach vorne blättert, hat nichts gelesen, stünde aber bei einem gemeinsamen Wert plötzlich am Ende. Der Fortschritt wird deshalb aus den Abschnitten gerechnet, die tatsächlich gelesen wurden, und überlappende Abschnitte werden beim Schreiben zusammengefasst. Das Lesezeichen darf dagegen frei wandern.',
        en: 'Deriving both from one value is convenient and wrong. Someone searching a book for a passage and paging forward has read nothing, yet a shared value would suddenly put them at the end. Progress is therefore computed from the sections actually read, and overlapping sections are merged on write. The bookmark is free to travel.',
      },
    },
    {
      title: {
        de: 'Bücher über einen eigenen nginx statt über calibre-web',
        en: 'Books through an nginx of my own instead of calibre-web',
      },
      body: {
        de: 'Solange die Bücher von calibre-web kamen, hing das Lesen an einem Dienst, der nur auf Abruf läuft. Für seinen Start stand eine Warteschleife im Code, und war er aus, ging gar nichts. Den Pfad jedes Buches kennt die lokale Kopie des Katalogs bereits, zum Herausgeben einer Datei braucht es damit kein laufendes Programm dazwischen. Daneben liegt jetzt ein nur lesender nginx über demselben Verzeichnis. Die Warteschleife ist ersatzlos entfallen, und das Lesen hängt nicht länger daran, ob calibre-web gerade erreichbar ist.',
        en: 'While the books came from calibre-web, reading hung on a service that only runs on demand. The code held a wait loop for its start-up, and with it switched off nothing worked at all. The local copy of the catalogue already knows the path of every book, so handing out a file needs no running program in between. A read-only nginx now sits over the same directory. The wait loop is gone with nothing in its place, and reading no longer depends on whether calibre-web happens to be reachable.',
      },
    },
    {
      title: {
        de: 'Satzspiegel gemessen statt geschätzt',
        en: 'Type area measured instead of guessed',
      },
      body: {
        de: 'Gute Lesbarkeit hängt an einer Zeilenlänge um 66 Zeichen. Diese Zahl ist am laufenden Dienst nachgemessen worden: an einem deutschen Musterabsatz, über volle Zeilen, wobei die Teilzeilen am Absatzende ausgenommen sind. Dabei fiel auch der Verlust durch den Blocksatz auf, rund sieben Prozent der möglichen Zeichen. Die Einstellungen der Leseansicht rechnen seitdem damit.',
        en: 'Good readability hangs on a line length around 66 characters. That number was measured against the running service, on a German sample paragraph, across full lines, with the partial lines at the end of a paragraph excluded. The loss from justified setting showed up along the way, around seven percent of the possible characters. The reading view settings have taken that into account since.',
      },
    },
    {
      title: {
        de: 'Offline-Fähigkeit nur über den gesicherten Weg',
        en: 'Offline only over the secure path',
      },
      body: {
        de: 'Die Offline-Schicht im Browser wird nur in einem gesicherten Zusammenhang freigegeben. Eine Adresse im eigenen Netz ohne Zertifikat ist keiner, und dort passiert deshalb wortlos nichts: kein Fehler, keine App, nur eine Verknüpfung. Erreichbar ist der Dienst deshalb über einen eigenen Namen mit Zertifikat, und erst dieser Weg taugt für den Startbildschirm. Der direkte Weg bleibt daneben bestehen, weil er einen Ausfall des vorgeschalteten Proxys überlebt.',
        en: 'The offline layer in the browser is only released in a secure context. An address inside my own network without a certificate is not one, and nothing happens there, silently: no error, no app, just a shortcut. The service is therefore reachable under a name of its own with a certificate, and only that path is fit for the home screen. The direct path stays alongside it, because it survives an outage of the proxy in front.',
      },
    },
  ],
  // Reihenfolge ist hier Gestaltung, nicht Geschmack. Die Kennzahlen-Reihe hebt
  // einen führenden Zahlenwert gross heraus und setzt reine Prosa klein. Standen die
  // beiden gemessenen Werte in der Mitte, sprangen auf dem Bildschirmfoto Zelle zwei
  // und drei an und Zelle eins und vier nuschelten: das las sich wie ein Fehler statt
  // wie eine Entscheidung. Erst die Messwerte, dann die Festlegungen.
  // Ohne die Gigabyte: in einer Viertelspalte brach „knapp 8 GB" um und liess das
  // „GB" allein in der zweiten Zeile stehen. Die Groesse steht im Umfang darueber.
  metrics: [
    {
      label: { de: 'Buch abrufen', en: 'Fetch a book' },
      value: { de: '0,18 s statt 8 bis 20 s', en: '0.18 s instead of 8 to 20 s' },
    },
    {
      label: { de: 'Zeilenlänge', en: 'Line length' },
      value: { de: '66 Zeichen, nachgemessen', en: '66 characters, measured' },
    },
    {
      label: { de: 'Bestand', en: 'Holdings' },
      value: { de: 'fast 1300 Bücher', en: 'almost 1,300 books' },
    },
    {
      label: { de: 'Anmeldung', en: 'Login' },
      value: { de: 'keine, nur im eigenen Netz', en: 'none, own network only' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Eigener Leser vor der Calibre-Sammlung, Regal, Suche und Lesestände je Profil',
        en: 'Own reader in front of the Calibre collection, shelf, search and reading positions per profile',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Bücher über einen eigenen nur lesenden nginx, Warteschleife auf calibre-web entfallen',
        en: 'Books through a read-only nginx of my own, wait loop on calibre-web gone',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Lesezeichen und Fortschritt getrennt, Offline-Schicht und Startbildschirm-App über den gesicherten Weg',
        en: 'Bookmark and progress separated, offline layer and home-screen app over the secure path',
      },
    },
  ],
  limits: [
    {
      de: 'Erreichbar nur im eigenen Netz und ohne Anmeldung. Mehrere Leser werden über ein Merkmal im Browser unterschieden, nicht über Konten. Für einen Zugang von außen oder getrennte Rechte je Person wäre das die falsche Grundlage.',
      en: 'Reachable inside my own network only and without a login. Several readers are told apart by a trait in the browser, not through accounts. For access from outside or separate rights per person that would be the wrong foundation.',
    },
    {
      de: 'Das Regal kommt aus einer nächtlichen Auffrischung. Wird ein Buch am Tag umbenannt oder entfernt, kennt der Leser bis zum nächsten Lauf noch den alten Stand.',
      en: 'The shelf comes from a nightly refresh. Rename or remove a book during the day and the reader still knows the old state until the next run.',
    },
    {
      de: 'Die Sprachausgabe läuft auf kleiner Hardware und braucht für eine Minute Ton etwa zwei Minuten Rechenzeit. Sie ist damit für einen vorgelesenen Abschnitt gedacht. Ein ganzes Buch würde Stunden belegen.',
      en: 'Speech synthesis runs on small hardware and needs about two minutes of compute for one minute of audio. It is meant for a section read aloud. A whole book would occupy it for hours.',
    },
  ],
};

export default bibliothek;
