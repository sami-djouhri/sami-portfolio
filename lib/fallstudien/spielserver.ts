import type { Fallstudie } from './typ';

// Erhoben am 2026-11-07, die erste Fallstudie dieser Arbeit (bis dahin die
// einzige der Werkliste ohne). Der Werkeintrag sagte bis zum selben Tag
// „sieben Server"; seit dem 13.10. traegt Terraria drei Instanzen.
//
// Messbefehle, damit die naechste Runde dieselbe Abgrenzung nimmt:
// - Server und Spiele: `/opt/game-arbiter/games.json` auf dem Spiel-Wirt,
//   9 Eintraege, 7 verschiedene Spiele (terraria, terraria-wildwuchs,
//   terraria-calamity zaehlen als ein Spiel).
// - Bedarf: Summe `ram_mb` ueber die Registry, 23.800 MB, Wirt 16 GB (`free -m`).
// - Schlafen: `idle_timeout_s` 1200 bei allen neun.
// - Updates per Befehl: Feld `update` in `games.json` (steam-anonym fuer drei
//   Spiele, Tarball fuer Factorio; DayZ von Hand, Terraria und Minecraft gar
//   nicht). Ergibt vier von sieben.
// - Weckwege: `ls /etc/systemd/system | grep -E 'greeter|game-gateway|wake'`.
// - Sperrlisten: `fail2ban-client status`, zwei Jails (sshd, recidive).
// Quellen im Haus: `docker/game-arbiter`, `docker/game-gateway`,
// `die Projektregeln`.
const spielserver: Fallstudie = {
  problem: {
    de: 'Sieben Spiele laufen auf neun öffentlichen Servern, für eine feste Gruppe von Mitspielern. Das ist der einzige Teil meiner Anlage, dessen Ausfall andere Leute merken. Alle teilen sich einen gemieteten Server mit 16 GB Arbeitsspeicher. Zusammen brauchen sie rund 24 GB. Ich wollte, dass jeder Mitspieler seinen Server selbst starten kann, ohne mich zu fragen.',
    en: 'Seven games run on nine public servers, for a fixed group of players. This is the only part of my setup whose downtime other people notice. All of them share one rented server with 16 GB of memory. Together they need around 24 GB. I wanted every player to be able to start their server on their own, without asking me.',
  },
  approach: [
    {
      de: 'Jeder Server läuft direkt auf dem Wirt als systemd-Dienst unter einem eigenen Dienstnutzer. Minecraft läuft als einziger in einem Container.',
      en: 'Each server runs directly on the host as a systemd service under its own service user. Minecraft is the only one that runs in a container.',
    },
    {
      de: 'Die Firewall öffnet nur die Spielports, eine Regel je Port mit Kommentar. Davor begrenzt eine Regel die Verbindungen je Quelladresse. Fehlgeschlagene SSH-Anmeldungen sperrt fail2ban, und wer wiederkommt, wird in einer zweiten Stufe länger gesperrt.',
      en: 'The firewall only opens the game ports, one commented rule per port. In front of it, a rule limits connections per source address. fail2ban bans failed SSH logins, and repeat offenders get a longer ban in a second stage.',
    },
    {
      de: 'Ein eigener Regler entscheidet über jeden Start nach dem gemessenen freien Speicher. Reicht er, läuft der Server einfach dazu. Bei Platzmangel beendet er zuerst die leeren Server.',
      en: 'A controller of my own decides every start against the measured free memory. If there is enough, the server simply joins the others. When memory is short, it stops the empty servers first.',
    },
    {
      de: 'Ein schlafender Server bleibt in der Serverliste sichtbar. Bei den Steam-Spielen beantwortet ein Platzhalter die Abfragen mit dem zuletzt gespeicherten Eintrag und dem Hinweis, dass der Server schläft. Terraria und Factorio haben keine solche Liste. Dort lauscht ein Weckposten am Spielport und startet den Server beim ersten Beitrittsversuch.',
      en: 'A sleeping server stays visible in the server list. For the Steam games, a stand-in answers the queries with the last saved entry and a note that the server is asleep. Terraria and Factorio have no such list. There a wake-up listener sits on the game port and starts the server on the first join attempt.',
    },
    {
      de: 'Nach zwanzig Minuten ohne Spieler geht ein Server wieder schlafen. Gezählt wird die echte Spielerzahl, je nach Spiel über die Serverabfrage, über RCON oder über die offenen Verbindungen.',
      en: 'After twenty minutes without players a server goes back to sleep. What counts is the real player count, depending on the game through the server query, through RCON or through open connections.',
    },
    {
      de: 'Ein Update läuft über einen Befehl je Spiel. Er bricht ab, wenn jemand spielt. Sonst sperrt er das Spiel gegen jedes Wecken, sichert die Welt und spielt das Update ein. Danach startet er den Server zur Probe, bis man wirklich beitreten kann, und stellt den Zustand von vorher wieder her.',
      en: 'An update runs through one command per game. It aborts if anyone is playing. Otherwise it locks the game against any wake-up, backs up the world and installs the update. Then it starts the server as a test until joining really works, and restores the state from before.',
    },
    {
      de: 'Jedes Spiel kann mehrere Welten tragen. Ein Skript je Spiel stellt die gewählte Welt ein. Schlägt es fehl, startet der Server nicht. Sonst bliebe die zuletzt aktive Welt eingestellt, und die Gruppe würde in der falschen weiterbauen.',
      en: 'Every game can hold several worlds. One script per game sets the chosen world. If it fails, the server does not start. Otherwise the last active world would stay set, and the group would keep building in the wrong one.',
    },
    {
      de: 'Jede Nacht entsteht ein Schnappschuss je Welt. Vorher prüft er je nach Spiel Mindestgröße und Dateikennung. Ist das neue Archiv um mehr als die Hälfte kleiner als das alte, wird es nicht übernommen. Danach geht alles verschlüsselt zu zwei Speichern an anderen Standorten, und einmal in der Woche wird eine Sicherung probeweise zurückgespielt.',
      en: 'Every night a snapshot is taken of each world. Before that it checks minimum size and file signature, depending on the game. If the new archive is more than half smaller than the old one, it is not taken over. After that everything goes encrypted to two storage locations elsewhere, and once a week a backup is restored as a test.',
    },
  ],
  architecture: {
    summary: {
      de: 'Spieler kommen über die Serverliste oder per Direktverbindung. Ein schlafender Server wird von einem Platzhalter oder Weckposten vertreten, der ihn beim Beitritt weckt. Der Regler entscheidet nach freiem Speicher, ob der Start geht. Die Welten werden jede Nacht geprüft, gesichert und an zwei andere Standorte kopiert.',
      en: 'Players arrive through the server list or by direct connection. A sleeping server is represented by a stand-in or wake-up listener that wakes it on join. The controller decides against free memory whether the start goes ahead. The worlds are checked, backed up and copied to two other locations every night.',
    },
    tiers: [
      {
        label: { de: 'Spieler', en: 'Players' },
        nodes: [
          { id: 'liste', label: { de: 'Serverliste', en: 'Server list' }, note: { de: 'Steam-Abfrage', en: 'Steam query' }, kind: 'edge' },
          { id: 'direkt', label: { de: 'Direktverbindung', en: 'Direct connection' }, note: { de: 'Terraria, Factorio', en: 'Terraria, Factorio' }, kind: 'edge' },
        ],
      },
      {
        label: { de: 'Eingang', en: 'Entry' },
        nodes: [
          { id: 'fw', label: { de: 'Firewall', en: 'Firewall' }, note: { de: 'Regel je Port, Ratenbegrenzung', en: 'rule per port, rate limit' }, kind: 'core' },
          { id: 'platzhalter', label: { de: 'Platzhalter', en: 'Stand-in' }, note: { de: 'hält den Listeneintrag', en: 'keeps the list entry' }, kind: 'core' },
          { id: 'weckposten', label: { de: 'Weckposten', en: 'Wake-up listener' }, note: { de: 'am Spielport', en: 'on the game port' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Steuerung', en: 'Control' },
        nodes: [
          { id: 'regler', label: { de: 'Regler', en: 'Controller' }, note: { de: 'Start nach freiem Speicher', en: 'start against free memory' }, kind: 'core' },
          { id: 'update', label: { de: 'Update-Befehl', en: 'Update command' }, note: { de: 'mit Wartungssperre', en: 'with maintenance lock' }, kind: 'core' },
        ],
      },
      {
        label: { de: 'Server und Sicherung', en: 'Servers and backup' },
        nodes: [
          { id: 'server', label: { de: 'Neun Server', en: 'Nine servers' }, note: { de: 'sieben Spiele', en: 'seven games' }, kind: 'consumer' },
          { id: 'welten', label: { de: 'Welten', en: 'Worlds' }, note: { de: 'mehrere je Spiel', en: 'several per game' }, kind: 'data' },
          { id: 'schnapp', label: { de: 'Nächtlicher Schnappschuss', en: 'Nightly snapshot' }, note: { de: 'mit Prüfungen', en: 'with checks' }, kind: 'data' },
          { id: 'offsite', label: { de: 'Zwei Standorte', en: 'Two locations' }, note: { de: 'restic, verschlüsselt', en: 'restic, encrypted' }, kind: 'data' },
        ],
      },
    ],
    flows: [
      { from: 'liste', to: 'platzhalter', label: { de: 'Abfrage', en: 'query' } },
      { from: 'direkt', to: 'weckposten', label: { de: 'Beitritt', en: 'join' } },
      { from: 'platzhalter', to: 'regler', label: { de: 'wecken', en: 'wake' } },
      { from: 'weckposten', to: 'regler', label: { de: 'wecken', en: 'wake' } },
      { from: 'regler', to: 'server', label: { de: 'Start oder Absage', en: 'start or refusal' } },
      { from: 'update', to: 'server' },
      { from: 'server', to: 'welten' },
      { from: 'welten', to: 'schnapp' },
      { from: 'schnapp', to: 'offsite' },
    ],
  },
  result: [
    {
      de: 'Neun Server für sieben Spiele laufen auf einem Wirt, der für alle gleichzeitig nicht reicht. Die Mitspieler wecken ihren Server selbst, über die Serverliste, einen Beitrittsversuch oder eine eigene Übersichtsseite.',
      en: 'Nine servers for seven games run on one host that is not big enough for all of them at once. Players wake their server themselves, through the server list, a join attempt or a dedicated overview page.',
    },
    {
      de: 'Für vier der sieben Spiele ist ein Update ein einzelner Befehl, der niemanden aus dem Spiel wirft.',
      en: 'For four of the seven games an update is a single command that does not kick anyone out of the game.',
    },
    {
      de: 'Eine tägliche Prüfung meldet jede Datei mit einem Weltnamen, die keine Sicherung erfasst. Sie läuft vor dem nächtlichen Schnappschuss, damit eine Lücke noch am selben Tag geschlossen werden kann.',
      en: 'A daily check reports every file carrying a world name that no backup covers. It runs before the nightly snapshot, so a gap can be closed the same day.',
    },
  ],
  decisions: [
    {
      title: { de: 'Wer spielt, wird nicht verdrängt', en: 'Whoever is playing does not get evicted' },
      body: {
        de: 'Anfangs gab es einen Schalter, mit dem ein Start einen besetzten Server beenden konnte. Er ist ersatzlos entfallen. Wird es zu eng, bekommt der Mitspieler eine Absage im Klartext, auch im Discord, und versucht es später noch einmal.',
        en: 'At first there was a switch that let a start shut down an occupied server. It was removed without replacement. When memory runs short, the player gets a plain refusal, also in Discord, and tries again later.',
      },
    },
    {
      title: { de: 'Ein Platzhalter für jeden schlafenden Server', en: 'A stand-in for every sleeping server' },
      body: {
        de: 'Ein gestoppter Server verschwindet aus der Steam-Serverliste. Für einen Mitspieler sieht das aus wie ein kaputter Server, und er hat keinen Grund, ihn zu wecken. Platzhalter und echter Server teilen sich denselben Port. systemd sorgt dafür, dass nie beide gleichzeitig laufen.',
        en: 'A stopped server disappears from the Steam server list. To a player that looks like a broken server, and there is no reason to wake it. Stand-in and real server share the same port. systemd makes sure they never run at the same time.',
      },
    },
    {
      title: { de: 'Factorio weckt erst beim dritten Paket', en: 'Factorio only wakes on the third packet' },
      body: {
        de: 'Die Verbindungsanfrage von Factorio ist nicht dokumentiert. Ein Filter auf geratene Bytes würde womöglich nie auslösen, ohne dass es jemand merkt. Der Weckposten zählt deshalb Pakete. Ab drei Paketen einer Quelle in zehn Sekunden startet er den Server. Ein Portscanner schickt eines und zieht weiter.',
        en: 'Factorio’s connection request is not documented. A filter on guessed bytes might never fire, without anyone noticing. So the wake-up listener counts packets. From three packets from one source within ten seconds it starts the server. A port scanner sends one and moves on.',
      },
    },
    {
      title: { de: 'Die Sicherung sucht auch, was sie nicht erfasst', en: 'The backup also looks for what it misses' },
      body: {
        de: 'Nach einem Update legte Valheim seine Welt in einem neuen Verzeichnis ab. Das alte Muster der Sicherung traf weiter eine sieben Wochen alte Datei, und jede Prüfung war erfüllt. Seitdem fragt eine tägliche Prüfung umgekehrt: welche Datei mit dem Weltnamen erfasst kein Muster?',
        en: 'After an update, Valheim stored its world in a new directory. The old backup pattern kept matching a seven-week-old file, and every check passed. Since then a daily check asks the other way round: which file with the world name does no pattern cover?',
      },
    },
    {
      title: { de: 'Charaktere liegen beim dritten Terraria-Server auf dem Server', en: 'On the third Terraria server, characters live on the server' },
      body: {
        de: 'Der dritte Terraria-Server nutzt andere Erweiterungen als die beiden ersten. Ohne serverseitige Charaktere verliert ein Charakter von dort beim Beitritt seine Gegenstände, dauerhaft und schon auf dem Rechner des Spielers. Ein Wächter am Server könnte das nur melden. Deshalb ist die Erweiterung für serverseitige Charaktere dort Pflicht.',
        en: 'The third Terraria server uses different mods from the first two. Without server-side characters, a character from there loses its items on joining, permanently and already on the player’s machine. A watchdog on the server could only report it. So the mod for server-side characters is mandatory there.',
      },
    },
    {
      title: { de: 'Das Sprachmodell weicht zuerst', en: 'The language model yields first' },
      body: {
        de: 'Auf demselben Wirt läuft ein lokales Sprachmodell für einen Discord-Bot. Wird der Speicher knapp, beendet der Kernel es vor jedem Spielserver.',
        en: 'A local language model for a Discord bot runs on the same host. When memory gets short, the kernel ends it before any game server.',
      },
    },
  ],
  metrics: [
    { label: { de: 'Umfang', en: 'Scope' }, value: { de: '9 Server · 7 Spiele', en: '9 servers · 7 games' } },
    { label: { de: 'Speicher', en: 'Memory' }, value: { de: '16 GB für rund 24 GB Bedarf', en: '16 GB for around 24 GB of demand' } },
    { label: { de: 'Schlafen', en: 'Sleep' }, value: { de: 'nach 20 Minuten ohne Spieler', en: 'after 20 minutes without players' } },
    { label: { de: 'Sicherung', en: 'Backup' }, value: { de: 'jede Nacht, an zwei Standorte', en: 'every night, to two locations' } },
  ],
  timeline: [
    { when: { de: 'Juli 2026', en: 'Jul 2026' }, what: { de: 'Erste Server im eigenen Netz, Regler für den Speicher', en: 'First servers on my own network, controller for memory' } },
    { when: { de: 'Aug. 2026', en: 'Aug 2026' }, what: { de: 'Umzug auf einen gemieteten Server, Platzhalter und Weckposten für alle Spiele', en: 'Move to a rented server, stand-ins and wake-up listeners for every game' } },
    { when: { de: 'Sep. 2026', en: 'Sep 2026' }, what: { de: 'Wartungssperre und Update-Befehl je Spiel', en: 'Maintenance lock and update command per game' } },
    { when: { de: 'Okt. 2026', en: 'Oct 2026' }, what: { de: 'Mehrere Welten je Spiel, tägliche Prüfung der Sicherung', en: 'Several worlds per game, daily backup check' } },
    { when: { de: 'Okt. 2026', en: 'Oct 2026' }, what: { de: 'Zweiter und dritter Terraria-Server', en: 'Second and third Terraria server' } },
  ],
  limits: [
    {
      de: 'Alle Server liegen auf einem Wirt. Fällt er aus, sind alle weg, bis er wieder läuft. Die Welten liegen dann gesichert an zwei anderen Standorten.',
      en: 'All servers sit on one host. If it fails, all of them are gone until it is back. The worlds are then backed up at two other locations.',
    },
    {
      de: 'Der erste Beitritt nach dem Schlaf dauert so lange, wie das Spiel zum Starten braucht.',
      en: 'The first join after sleep takes as long as the game needs to start.',
    },
    {
      de: 'DayZ wird von Hand aktualisiert, Terraria und Minecraft haben keinen Update-Weg.',
      en: 'DayZ is updated by hand, Terraria and Minecraft have no update path.',
    },
  ],
};

export default spielserver;
