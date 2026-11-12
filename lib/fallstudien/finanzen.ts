import type { Fallstudie } from './typ';

// Erhoben am 2026-11-07 am Quelltext, die Arbeit ist an diesem Tag neu in die
// Werkliste gekommen (Deck-Aufgabe „Werkliste: finanzen und spielserver dazu").
//
// Kein einziger Wert aus dem echten Buch. Die Projekt-Doku nennt Betraege
// aus dem Haushalt (Budgets, Rechnungen, Abweichungen in Euro), und genau die
// gehoeren nicht auf eine oeffentliche Seite. Die Beispiele hier sind
// allgemein (Miete am 31.). Wer nachbessert, nimmt keine Zahl aus
// `die Projektregeln` oder `README.md` herueber.
//
// Messbefehle im Projekt `docker/finanzen`:
// - Reiter: `grep -c 'role="tab"' app/static/index.html`, 11.
// - Tests: `grep -rhoE "^\s*(async )?def test_" tests | wc -l`, 703 (2026-11-08).
// - Schema-Stufen: `SCHEMA_STAND` in `app/migration.py`, 12.
// - Offener Ausbau des Depots: `NAECHSTE_SESSION.md`, Abschnitt „Phase L".
const finanzen: Fallstudie = {
  problem: {
    de: 'Ein fertiges Finanzprogramm stand bereit und wurde nie befüllt. Es rechnet in doppelter Buchführung und schaut zurück. Meine Frage war eine andere: Wie lange reicht mein Geld, wenn ich so weitermache? Daraus wurde ein eigener Dienst für Konten, Buchungen, Verträge, Budgets, Depot und eine Rechnung über Jahrzehnte. Er ist nur im eigenen Netz erreichbar und liegt hinter einer Anmeldung.',
    en: 'A ready-made finance program was set up and never filled. It does double-entry bookkeeping and looks backwards. My question was a different one: how long will my money last if I carry on like this? That turned into a service of my own for accounts, transactions, contracts, budgets, a portfolio and a calculation over decades. It is only reachable inside my own network and sits behind a login.',
  },
  approach: [
    {
      de: 'Jeder Betrag ist ein ganzzahliger Cent. SQLite kennt keinen Dezimaltyp, Kommazahlen weichen in einer Summe über Hunderte Buchungen um Cent ab. Euro gibt es erst an der Oberfläche.',
      en: 'Every amount is a whole number of cents. SQLite has no decimal type, and floating-point numbers drift by cents across a sum of hundreds of transactions. Euros only appear at the surface.',
    },
    {
      de: 'Ein Betrag ist immer positiv. Ob er abgeht oder hereinkommt, steht in der Art der Buchung und wird an genau einer Stelle in ein Vorzeichen übersetzt. Eine Umbuchung ist eine Zeile mit Gegenkonto, damit kein Übertrag aufs Sparkonto als Ausgabe zählt.',
      en: 'An amount is always positive. Whether it goes out or comes in is stored in the type of the transaction and turned into a sign in exactly one place. A transfer is one row with a counter-account, so no transfer to savings counts as spending.',
    },
    {
      de: 'Wiederkehrende Termine werden jedes Mal aus dem Startdatum berechnet. Eine Miete am 31. fällt im Februar auf den 28. und im März wieder auf den 31.',
      en: 'Recurring dates are calculated from the start date every time. Rent due on the 31st falls on the 28th in February and back on the 31st in March.',
    },
    {
      de: 'Die Prognose zeichnet eine Spanne aus drei Rechnungen, mit allen Posten, mit Einschränkung und nur mit Fixkosten. Daueraufträge steigen dabei jedes Jahr um einen eigenen Satz, sonst wäre jede Rechnung über mehrere Jahre zu günstig.',
      en: 'The forecast draws a range from three calculations, with all items, with cutbacks and with fixed costs only. Standing orders rise by their own rate every year, otherwise every calculation over several years would come out too cheap.',
    },
    {
      de: 'Die Rechnung über Jahrzehnte nennt jeden Wert zweimal, als ausgegebenes Geld und in Kaufkraft von heute.',
      en: 'The calculation over decades states every value twice, as money spent and in today’s purchasing power.',
    },
    {
      de: 'Ein Budget hat eine Obergrenze und kann eine Untergrenze haben. Je Budget ist festgelegt, ob ein Rest verfällt oder sich ansammelt. In die Prognose geht nur der Teil ein, den kein laufender Posten derselben Kategorie schon deckt.',
      en: 'A budget has a ceiling and can have a floor. For each budget it is set whether a remainder expires or accumulates. Only the part that no running item of the same category already covers goes into the forecast.',
    },
    {
      de: 'Beim Abgleich mit dem echten Kontostand fragt der Dienst je fälligem Termin nach, ob er schon abgebucht ist. Aus dem Buch allein lässt sich das nicht entscheiden. Ohne Antwort bucht er nichts.',
      en: 'When reconciling with the real account balance, the service asks for each due date whether it has already been debited. The ledger alone cannot decide that. Without an answer it books nothing.',
    },
    {
      de: 'Der Kauf eines Wertpapiers oder eines Sachwerts ist eine Umschichtung und keine Ausgabe, verliehenes Geld ebenso. Eine vorhandene Zeile aus dem Kontoauszug wird dabei umgedeutet, damit derselbe Betrag nicht zweimal im Buch steht.',
      en: 'Buying a security or a physical asset is a reallocation and not an expense, and so is money lent out. An existing line from the bank statement is reinterpreted for it, so the same amount does not appear in the ledger twice.',
    },
  ],
  architecture: {
    summary: {
      de: 'Die Oberfläche läuft im Browser und lässt sich auf dem Telefon als App ablegen. Davor sitzt eine Anmeldung, und der Dienst prüft, ob eine Anfrage wirklich über den eigenen Proxy kommt. Alle Beträge liegen als ganze Cent in einer SQLite-Datei. Nach außen gehen Metriken ohne Beträge und Meldungen nur über interne Kanäle.',
      en: 'The interface runs in the browser and can be placed on the phone as an app. A login sits in front of it, and the service checks whether a request really comes through my own proxy. All amounts are stored as whole cents in one SQLite file. What goes out are metrics without amounts and notifications through internal channels only.',
    },
    tiers: [
      {
        label: { de: 'Oberfläche', en: 'Interface' },
        nodes: [
          { id: 'ui', label: { de: 'Elf Reiter', en: 'Eleven tabs' }, note: { de: 'Browser und Telefon', en: 'browser and phone' }, kind: 'edge' },
        ],
      },
      {
        label: { de: 'Zugang', en: 'Access' },
        nodes: [
          { id: 'anmeldung', label: { de: 'Anmeldung', en: 'Login' }, note: { de: 'Authelia', en: 'Authelia' }, kind: 'edge' },
          { id: 'proxy', label: { de: 'Proxy-Prüfung', en: 'Proxy check' }, note: { de: 'an der Gegenstelle', en: 'against the peer' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Dienst', en: 'Service' },
        nodes: [
          { id: 'buch', label: { de: 'Buch und Abgleich', en: 'Ledger and reconciliation' }, kind: 'core' },
          { id: 'prognose', label: { de: 'Prognose', en: 'Forecast' }, note: { de: 'Spanne aus drei Rechnungen', en: 'range from three calculations' }, kind: 'core' },
          { id: 'depot', label: { de: 'Depot', en: 'Portfolio' }, note: { de: 'Kurse am Abend', en: 'prices in the evening' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Daten und Meldungen', en: 'Data and alerts' },
        nodes: [
          { id: 'db', label: { de: 'SQLite', en: 'SQLite' }, note: { de: 'ganze Cent', en: 'whole cents' }, kind: 'data' },
          { id: 'metriken', label: { de: 'Metriken', en: 'Metrics' }, note: { de: 'ohne Beträge', en: 'no amounts' }, kind: 'consumer' },
          { id: 'meldungen', label: { de: 'Meldungen', en: 'Alerts' }, note: { de: 'nur im eigenen Netz', en: 'own network only' }, kind: 'consumer' },
        ],
      },
    ],
    flows: [
      { from: 'ui', to: 'anmeldung' },
      { from: 'anmeldung', to: 'proxy' },
      { from: 'proxy', to: 'buch' },
      { from: 'buch', to: 'db' },
      { from: 'prognose', to: 'db', label: { de: 'liest', en: 'reads' } },
      { from: 'depot', to: 'db' },
      { from: 'db', to: 'metriken', label: { de: 'Zähler', en: 'counters' } },
      { from: 'prognose', to: 'meldungen', label: { de: 'Warnung', en: 'warning' } },
    ],
  },
  result: [
    {
      de: 'Elf Reiter in einer Oberfläche, vom Stand heute bis zur Rechnung über Jahrzehnte. Dazu Verträge mit Kündigungsfrist, Kredite mit Tilgungsplan, Sparziele, eine Wunschliste und eine Einnahmen-Überschuss-Rechnung.',
      en: 'Eleven tabs in one interface, from today’s position to the calculation over decades. Alongside that, contracts with notice periods, loans with repayment plans, savings goals, a wish list and a simple income statement for a small business.',
    },
    {
      de: 'Rund 700 Testfunktionen. Ein Teil davon prüft Eigenschaften, die jede Rechnung erfüllen muss: die Zeilen ergeben die Summe, und das Ergebnis hängt nicht an der Reihenfolge. Drei Rechenfehler sind erst so aufgefallen, weil jede einzelne Zahl plausibel aussah.',
      en: 'Around 700 test functions. Some of them check properties every calculation has to meet: the rows add up to the total, and the result does not depend on the order. Three calculation errors only surfaced this way, because every single number looked plausible.',
    },
    {
      de: 'Mehrere Personen sind vorbereitet. Ein Konto sieht nur sein Besitzer, bis er es für den Haushalt freigibt.',
      en: 'Several people are already provided for. An account is only visible to its owner until they share it with the household.',
    },
  ],
  decisions: [
    {
      title: { de: 'Geld als ganzzahliger Cent', en: 'Money as whole cents' },
      body: {
        de: 'In einer Einnahmen-Überschuss-Rechnung ist ein Cent Abweichung eine falsche Zahl. Jedes Betragsfeld trägt die Einheit im Namen, damit an keiner Stelle Zweifel entsteht. Stückzahlen im Depot haben drei Nachkommastellen, weil ein Sparplan Bruchteile von Anteilen kauft.',
        en: 'In an income statement, a deviation of one cent is a wrong number. That is why every amount field carries the unit in its name, so no place in the code leaves room for doubt. Share counts in the portfolio carry three decimal places, because a savings plan buys fractions of shares.',
      },
    },
    {
      title: { de: 'Termine aus dem Startdatum', en: 'Dates from the start date' },
      body: {
        de: 'Die naheliegende Lösung rechnet vom letzten Termin weiter. Dann rutscht eine Miete vom 31. im Februar auf den 28. und bleibt für immer dort. Ein Test hält genau diesen Fall fest.',
        en: 'The obvious solution counts on from the previous date. Then rent due on the 31st slips to the 28th in February and stays there for good. A test pins down exactly this case.',
      },
    },
    {
      title: { de: 'Eine fehlende Zahl bleibt sichtbar', en: 'A missing number stays visible' },
      body: {
        de: 'Fehlt ein Kurs, ist der Gewinn des Depots unbekannt, und die Papiere ohne Kurs stehen namentlich daneben. Ein gescheiterter Abruf schreibt nie den Kurs null. Dieselbe Regel gilt an rund 30 Stellen im Dienst.',
        en: 'If a price is missing, the portfolio gain is unknown, and the securities without a price are listed by name next to it. A failed fetch never writes a price of zero. The same rule applies at around 30 places in the service.',
      },
    },
    {
      title: { de: 'Kein Zugang zur Bank', en: 'No connection to the bank' },
      body: {
        de: 'Bankzugangsdaten sollten nicht im Haus liegen. Buchungen kommen deshalb über Daueraufträge, als CSV-Datei oder von Hand. Der Import erkennt eine doppelte Zeile und sperrt, wenn ein Sammelbetrag dieselben Euro beschreibt wie schon vorhandene Einzelbuchungen.',
        en: 'Bank credentials were not supposed to live in the house. Transactions therefore come in through standing orders, as a CSV file or by hand. The import detects a duplicate row and blocks when a lump sum describes the same euros as individual transactions already in the ledger.',
      },
    },
    {
      title: { de: 'Metriken ohne Beträge', en: 'Metrics without amounts' },
      body: {
        de: 'Eine Summe in einer Metrik läge danach in Prometheus, in Grafana und in jeder Sicherung davon. Die Metriken tragen deshalb nur Zähler, Alter und Ja oder Nein. Ein Test sucht im Metriktext nach Beträgen. Meldungen mit Beträgen gehen nur über Kanäle im eigenen Netz.',
        en: 'A sum in a metric would end up in Prometheus, in Grafana and in every backup of them. So the metrics only carry counters, ages and yes or no. A test searches the metric text for amounts. Alerts with amounts only travel through channels inside my own network.',
      },
    },
    {
      title: { de: 'Die Proxy-Prüfung vergleicht die Gegenstelle', en: 'The proxy check compares the peer' },
      body: {
        de: 'Der Dienst bringt keine eigene Anmeldung mit und verlässt sich auf die davor. Er prüft deshalb, ob die Verbindung wirklich vom eigenen Proxy kommt, und zwar an der Adresse der Gegenstelle. Ein mitgeschickter Kopf ließe sich fälschen. Der erlaubte Bereich ist ein einzelnes Netz.',
        en: 'The service has no login of its own and relies on the one in front of it. So it checks whether the connection really comes from my own proxy, using the address of the peer. A header sent along could be forged. The allowed range is a single network.',
      },
    },
  ],
  metrics: [
    { label: { de: 'Oberfläche', en: 'Interface' }, value: { de: '11 Reiter', en: '11 tabs' } },
    { label: { de: 'Tests', en: 'Tests' }, value: { de: 'rund 700 Testfunktionen', en: 'around 700 test functions' } },
    { label: { de: 'Beträge', en: 'Amounts' }, value: { de: 'ganze Cent', en: 'whole cents' } },
    { label: { de: 'Zugang', en: 'Access' }, value: { de: 'nur im eigenen Netz, mit Anmeldung', en: 'own network only, with login' } },
  ],
  timeline: [
    { when: { de: 'Sep. 2026', en: 'Sep 2026' }, what: { de: 'Konten, Buchungen, Prognose, Depot, Trennung nach Personen', en: 'Accounts, transactions, forecast, portfolio, separation by person' } },
    { when: { de: 'Okt. 2026', en: 'Oct 2026' }, what: { de: 'Verträge, Budgets mit Übertrag, Rechnung über Jahrzehnte', en: 'Contracts, budgets with carry-over, calculation over decades' } },
    { when: { de: 'Okt. 2026', en: 'Oct 2026' }, what: { de: 'Abgleich mit dem Kontostand, Prüfung auf doppelt gezählte Quellen, Lohnabrechnungen', en: 'Reconciliation with the account balance, check for double-counted sources, payslips' } },
    { when: { de: 'Nov. 2026', en: 'Nov 2026' }, what: { de: 'Verliehenes Geld und Käufe als Umschichtung, Oberfläche im Bild der eigenen Suite', en: 'Lent money and purchases as reallocations, interface in the style of my own suite' } },
  ],
  limits: [
    {
      de: 'Neue Umsätze kommen nur per CSV-Datei oder von Hand ins Buch.',
      en: 'New transactions only reach the ledger as a CSV file or by hand.',
    },
    {
      de: 'Das Depot kennt noch keine Ausschüttungen und keine Fremdwährung.',
      en: 'The portfolio does not yet handle distributions or foreign currencies.',
    },
    {
      de: 'Die Gruppierung nach Monaten nutzt eine Funktion, die es nur in SQLite gibt. Ein Wechsel auf Postgres braucht dort eine Anpassung.',
      en: 'Grouping by month uses a function that only exists in SQLite. Moving to Postgres needs a change there.',
    },
  ],
};

export default finanzen;
