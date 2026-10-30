import type { Fallstudie } from './typ';

const homeDigitalTwin: Fallstudie = {
  problem: {
    de: 'Home Assistant trägt eine starke Datenbasis, aber das mitgelieferte Frontend bleibt eine endlose Karten-Wand: Schalter, Sensoren und Verläufe stapeln sich in Listen, während das eigentliche Objekt, das Haus, nirgends vorkommt. Ein Haus denkt man räumlich: Wohnzimmer, Küche, Büro, Etagen. Die Bedienung sollte dieser Geografie folgen. Ich wollte das eigene Zuhause sehen können, in 2D zum schnellen Bedienen im Alltag und in 3D für den räumlichen Überblick über Räume und Etagen, beides auf demselben Live-Status. Das Rendern war dabei der einfachere Teil. Schwieriger ist die Trennung: Layout-Wissen (welcher Raum, welche Etage, wo steht das Gerät) gehört der Oberfläche, Geräte-Wahrheit (an, aus, Temperatur) gehört der Heimautomation. Wer beides vermischt, baut ein Frontend, das bei jedem neuen Gerät umgebaut werden muss.',
    en: 'Home Assistant holds a strong data base, but the frontend it ships is an endless wall of cards: switches, sensors and histories pile up in lists, while the actual object, the house, appears nowhere. A house is thought of in space: living room, kitchen, office, floors. Control should follow that geography. I wanted to actually see my home: in 2D for quick everyday control, in 3D for the spatial overview of rooms and floors, both on the same live status. Rendering turned out to be the easy part. The separation is harder: layout knowledge (which room, which floor, where a device sits) belongs to the surface; device truth (on, off, temperature) belongs to home automation. Mix the two and every new device forces a frontend rebuild.',
  },
  approach: [
    {
      de: 'Ein eigenständiges Web-Frontend mit zwei austauschbaren Raum-Modi auf einer gemeinsamen Datenschicht: 2D-Grundriss für die schnelle Alltags-Bedienung, 3D-Szene für Raum- und Etagenwechsel. Kein Modus ist eine Insel, beide zeigen denselben Live-Status.',
      en: 'A standalone web frontend with two interchangeable room modes on one shared data layer: a 2D floor plan for fast everyday control, a 3D scene for moving between rooms and floors. Neither is an island; both show the same live status.',
    },
    {
      de: 'Ein Backend als Auth-Kapsel: Der Zugriffs-Token zur Heimautomation bleibt serverseitig, der Browser sieht ihn nie. Das Backend fängt Snapshots in eigener Persistenz ab und liefert Klima- und Status-Verläufe pro Raum, vergleichbar über mehrere Räume.',
      en: 'A backend as an auth capsule: the access token to home automation stays server-side and the browser never sees it. The backend captures snapshots in its own store and serves climate and status histories per room, comparable across rooms.',
    },
    {
      de: 'Eine Live-Brücke per WebSocket macht Statuswechsel in dem Moment sichtbar, in dem sie passieren. Ein Smart Home soll sich auch smart anfühlen, und dazu gehört, dass Lichter sofort umspringen und nicht im Sekundentakt nachziehen.',
      en: 'A live bridge over WebSocket makes state changes show up the moment they happen. A smart home should feel smart, and that includes lights that flip instantly, not in second-long jumps.',
    },
    {
      de: 'Dynamisches Entity-Mapping zur Laufzeit: Neue Geräte tauchen von selbst auf und lassen sich per Drag-and-Drop in den Raum stellen. Das Layout ist Daten, kein Code, neue Räume und neue Geräte fügen sich an, ohne dass Bestehendes angefasst wird.',
      en: 'Dynamic entity mapping at runtime: new devices surface on their own and drop into a room via drag-and-drop. The layout is data, not code, so new rooms and devices attach without touching anything existing.',
    },
    {
      de: 'Bewusste Schichtgrenze: Layout-Wissen lebt im Twin, Geräte-Wahrheit bleibt in der Heimautomation. Der Twin erfindet keinen zweiten Geräte-Zustand, er stellt den vorhandenen räumlich dar.',
      en: 'A deliberate layer boundary: layout knowledge lives in the twin, device truth stays in home automation. The twin invents no second device state; it just renders the existing one in space.',
    },
  ],
  architecture: {
    summary: {
      de: 'Das Frontend zeigt Haus und Geräte in 2D und 3D auf derselben Datenschicht. Ein Twin-Backend hält den Zugriffs-Token serverseitig, persistiert Snapshots für Klima-Verläufe und trägt allein das Layout-Wissen über Räume und Etagen, während eine WebSocket-Brücke Statuswechsel aus der Heimautomation ohne Polling sofort sichtbar macht. Steuerbefehle laufen denselben Weg zurück, der Browser berührt nie direkt die Geräte-Quelle.',
      en: 'The frontend shows house and devices in 2D and 3D on one shared data layer. A twin backend holds the access token server-side, persists snapshots for climate histories, and alone carries the layout knowledge about rooms and floors, while a WebSocket bridge surfaces home-automation state changes at once, no polling. Control commands run the same way back; the browser never touches the device source directly.',
    },
    tiers: [
      {
        label: { de: 'Frontend', en: 'Frontend' },
        nodes: [
          {
            id: 'plan',
            kind: 'edge',
            label: { de: '2D-Grundriss', en: '2D floor plan' },
            note: { de: 'Alltags-Bedienung', en: 'everyday control' },
          },
          {
            id: 'scene',
            kind: 'edge',
            label: { de: '3D-Szene', en: '3D scene' },
            note: { de: 'räumlicher Überblick', en: 'spatial overview' },
          },
        ],
      },
      {
        label: { de: 'Twin-Backend', en: 'Twin backend' },
        nodes: [
          {
            id: 'authcap',
            kind: 'core',
            label: { de: 'Auth-Kapsel', en: 'Auth capsule' },
            note: { de: 'Token serverseitig', en: 'token server-side' },
          },
          {
            id: 'snap',
            kind: 'core',
            label: { de: 'Snapshot-Persistenz', en: 'Snapshot persistence' },
            note: { de: 'Klima-Verläufe', en: 'climate histories' },
          },
          {
            id: 'layout',
            kind: 'core',
            label: { de: 'Layout-Modell', en: 'Layout model' },
            note: { de: 'Räume, Etagen, Drag-and-Drop', en: 'rooms, floors, drag-and-drop' },
          },
        ],
      },
      {
        label: { de: 'Live-Brücke', en: 'Live bridge' },
        nodes: [
          {
            id: 'ws',
            kind: 'consumer',
            label: { de: 'WebSocket-Brücke', en: 'WebSocket bridge' },
            note: { de: 'kein Polling', en: 'no polling' },
          },
        ],
      },
      {
        label: { de: 'Geräte-Wahrheit', en: 'Device truth' },
        nodes: [
          {
            id: 'ha',
            kind: 'data',
            label: { de: 'Heimautomation', en: 'Home automation' },
            note: { de: 'Single Source der Geräte', en: 'single source of the devices' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'plan',
        to: 'authcap',
        label: { de: 'Steuerbefehl', en: 'control command' },
      },
      {
        from: 'authcap',
        to: 'ws',
      },
      {
        from: 'ws',
        to: 'ha',
        label: { de: 'Token gekapselt', en: 'token encapsulated' },
      },
      {
        from: 'ha',
        to: 'scene',
        label: { de: 'Live-Status', en: 'live status' },
      },
      {
        from: 'snap',
        to: 'plan',
        label: { de: 'Klima-Verlauf', en: 'climate history' },
      },
    ],
  },
  result: [
    {
      de: 'Räumliche Sicht aufs Haus in 2D und 3D, beide Modi auf demselben Live-Status.',
      en: 'A spatial view of the house in 2D and 3D, both on the same live status.',
    },
    {
      de: 'Klima-Verläufe pro Raum, vergleichbar über mehrere Räume, weil die Snapshots serverseitig liegen und das Frontend kein eigenes Caching erfinden muss.',
      en: 'Climate histories per room, comparable across rooms, because the snapshots live server-side and the frontend need not invent its own caching.',
    },
    {
      de: 'Direkte Geräte-Steuerung im Grundriss, ohne Wechsel in Subseiten: kein erst suchen, dann bedienen.',
      en: 'Direct device control right in the floor plan, no jumping into subpages: no search first, operate second.',
    },
    {
      de: 'Saubere Trennung zwischen Layout-Wissen im Twin und Geräte-Wahrheit in der Heimautomation, sodass neue Räume und neue Geräte sich anfügen, ohne dass Bestehendes umgebaut wird.',
      en: 'A clean split between layout knowledge in the twin and device truth in home automation, so new rooms and devices attach without rebuilding anything.',
    },
    {
      de: 'Der Zugriffs-Token verlässt nie den Server: das Frontend steuert über die Auth-Kapsel und trägt selbst keine Anmeldedaten.',
      en: 'The access token never leaves the server: the frontend controls through the auth capsule and carries no credentials itself.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Warum ein eigenes Frontend',
        en: 'An own frontend, not a custom card in the home-automation stack',
      },
      body: {
        de: 'Eingebettete Custom-Cards bleiben innerhalb der Schranken ihrer Plattform: begrenzte Layout-Engine, kein echtes 3D, eingeschränkte Interaktion. Ein eigenständiges Frontend gibt volle Kontrolle über Layout-Modell, Szenen-Rendering und Bedienlogik. Die Mehr-Investition zahlt sich in Spielraum aus, der später nicht nachverhandelt werden muss.',
        en: 'Embedded custom cards stay boxed in by their platform: a limited layout engine, no real 3D, constrained interaction. A standalone frontend hands over full control of the layout model, scene rendering and control logic. The extra investment buys headroom you do not have to renegotiate later.',
      },
    },
    {
      title: { de: '2D und 3D im selben System', en: '2D and 3D in one system, not either-or' },
      body: {
        de: '2D ist das Alltags-Werkzeug, schnell und nah an der Hand. 3D ist der Überblick und der Aha-Moment für Besucher. Beides ist sinnvoll, und weil beide Modi auf derselben Datenschicht sitzen, kostet die zweite Darstellung kein zweites Datenmodell, nur eine zweite Ansicht.',
        en: '2D is the everyday tool, fast and close at hand. 3D is the overview and the aha moment for visitors. Both are worth having, and because both sit on the same data layer, the second view costs no second data model, just a second view.',
      },
    },
    {
      title: {
        de: 'Das Backend als Auth-Kapsel',
        en: 'Backend as auth capsule, not a token in the browser',
      },
      body: {
        de: 'Der Zugriffs-Token zur Heimautomation gehört nicht in den Client. Serverseitig gekapselt sieht ihn der Browser nie, und dasselbe Backend persistiert nebenbei die Snapshots: Verläufe sind verfügbar, ohne dass das Frontend Zustandshaltung und Caching neu erfinden muss.',
        en: 'The access token to home automation has no place in the client. Encapsulated server-side, the browser never sees it, and the same backend persists the snapshots on the side, so histories are there without the frontend reinventing state-keeping and caching.',
      },
    },
    {
      title: { de: 'Warum WebSocket', en: 'WebSocket, not polling' },
      body: {
        de: 'Ein periodischer Abruf fühlt sich träge an und produziert Last für Stillstand. Über eine ereignisgetriebene Live-Brücke wechselt ein Licht im Grundriss in dem Moment, in dem es real schaltet. Genau diese Unmittelbarkeit ist der Unterschied zwischen Dashboard und Bedienfläche.',
        en: 'A periodic poll feels sluggish and burns load for standstill. Over an event-driven live bridge, a light in the floor plan changes the instant it really switches. That immediacy is exactly what separates a dashboard from a control surface.',
      },
    },
    {
      title: { de: 'Layout als Daten, nicht als Code', en: 'Layout as data, not code' },
      body: {
        de: 'Geräte-Platzierung und Raumzuschnitt sind Konfiguration zur Laufzeit, kein Quelltext. Neue Geräte erscheinen automatisch und werden per Drag-and-Drop verortet. Das hält die Grenze sauber: was sich oft ändert (Layout) ist editierbar, was stabil ist (Pipeline) bleibt Code.',
        en: 'Device placement and room layout are runtime configuration, not source. New devices appear automatically and get placed by drag-and-drop. The boundary stays clean: what changes often (layout) is editable, what is stable (pipeline) stays code.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Darstellung', en: 'Representation' },
      value: { de: '2D-Grundriss und 3D-Szene', en: '2D floor plan and 3D scene' },
    },
    {
      label: { de: 'Live-Brücke', en: 'Live bridge' },
      value: { de: 'WebSocket, ereignisgetrieben', en: 'WebSocket, event-driven' },
    },
    {
      label: { de: 'Layout', en: 'Layout' },
      value: {
        de: 'Drag-and-Drop, Auto-Import zur Laufzeit',
        en: 'drag-and-drop, auto-import at runtime',
      },
    },
    {
      label: { de: 'Verläufe', en: 'Histories' },
      value: {
        de: 'Klima pro Raum, serverseitig persistiert',
        en: 'climate per room, persisted server-side',
      },
    },
  ],
  timeline: [
    {
      when: { de: 'Q1 2026', en: 'Q1 2026' },
      what: {
        de: '2D-Grundriss, Backend als Auth-Kapsel, Live-Brücke über WebSocket',
        en: '2D floor plan, backend as auth capsule, live bridge over WebSocket',
      },
    },
    {
      when: { de: 'Q2 2026', en: 'Q2 2026' },
      what: {
        de: '3D-Szene auf derselben Datenschicht, Klima-Verläufe pro Raum',
        en: '3D scene on the same data layer, climate histories per room',
      },
    },
    {
      when: { de: 'H2 2026', en: 'H2 2026' },
      what: {
        de: 'Mehr Räume, Geräte-Auto-Import verfeinert, Layout-Editor ausgebaut',
        en: 'More rooms, device auto-import refined, layout editor expanded',
      },
    },
  ],
};

export default homeDigitalTwin;
