import type { Fallstudie } from './typ';

const rackforge: Fallstudie = {
  problem: {
    de: 'Für einen Shop, der 3D-gedruckte Teile verkauft, passt kein Standard-Shop-System sauber. Dieselbe Form gibt es in vielen Farben. Vieles wird erst auf Bestellung gedruckt. Der Bestand besteht aus Filament-Rollen und ein paar vorproduzierten Stücken statt aus fertigen Artikeln im Regal. Ein Baukasten-Shop zwingt dieses Modell in seine Artikel-Logik, und danach kämpft man gegen die Plattform. Also steht hier ein eigener Shop ohne Baukasten: eigenes Datenmodell, eigene Kasse, eigene Bestands-Regeln, die zu Fertigung auf Bestellung passen.',
    en: 'For a shop selling 3D-printed parts, no standard shop system fits cleanly: the same shape comes in many colors, much of it is only printed to order, and the inventory is not finished articles on a shelf but filament rolls and a few pre-produced pieces. A kit shop forces this model into its article logic, and from then on you are fighting the platform. So the whole shop is its own build without a kit: own data model, own checkout, own inventory rules that fit make-to-order.',
  },
  approach: [
    {
      de: 'Ein eigener Produktkatalog mit aus den Stammdaten generierten Detailseiten, sodass eine Produktänderung an einer Stelle gepflegt wird und sich der Rest daraus ergibt.',
      en: 'A dedicated product catalog with detail pages generated from the master data, so a product change is made in one place and the rest follows.',
    },
    {
      de: 'Ein farbbewusster Warenkorb: dieselbe Form in verschiedenen Farben ist ein eigener Posten, der Warenkorb-Schlüssel trägt Artikel und Farbe getrennt, damit nichts fälschlich zusammengefasst wird.',
      en: 'A color-aware cart: the same shape in different colors is its own line item; the cart key carries article and color separately, so nothing gets falsely merged.',
    },
    {
      de: 'Eine Bestands-Engine führt Filament-Rollen und fertig gedruckte Teile getrennt. Was nicht vorrätig ist, läuft als „auf Bestellung“ und nicht als ausverkauft. Ein erledigter Druck wird gegen den Bestand verbucht.',
      en: 'An inventory engine that keeps filament rolls and finished printed parts apart: not in stock means made to order, not sold out, and a completed print is booked against the inventory.',
    },
    {
      de: 'Ein eigener Upload-Pfad für hochgeladene Druckdateien mit eigenem Multipart-Parser, der erlaubte Formate und eine Größengrenze hart durchsetzt, ohne sich auf eine Fremd-Bibliothek zu verlassen.',
      en: 'An upload path of its own for uploaded print files, with an own multipart parser that hard-enforces allowed formats and a size limit without leaning on a third-party library.',
    },
    {
      de: 'Ein token-geschützter Admin, ein Honeypot gegen Bot-Bestellungen und ein Export ins gängige Shop-Format, damit der Eigenbau anschlussfähig bleibt.',
      en: 'A token-protected admin, a honeypot against bot orders and an export to the common shop format, so the custom build stays connectable.',
    },
  ],
  architecture: {
    summary: {
      de: 'Der Browser spricht mit einem eigenen Shop-Backend, das Katalog, farbbewussten Warenkorb und Kasse trägt; ein eigener Upload-Pfad prüft hochgeladene Dateien gegen Format- und Größengrenzen, eine Bestands-Engine führt Filament und Fertigteile getrennt und verbucht Drucke, und ein token-geschützter Admin sowie ein Export ins gängige Shop-Format liegen daneben.',
      en: 'The browser talks to a dedicated shop backend that carries catalog, color-aware cart and checkout; an upload path of its own checks uploaded files against format and size limits, an inventory engine keeps filament and finished parts separate and books prints, and a token-protected admin plus an export to the common shop format sit alongside.',
    },
    tiers: [
      {
        label: { de: 'Storefront', en: 'Storefront' },
        nodes: [
          {
            id: 'catalog',
            kind: 'edge',
            label: { de: 'Produktkatalog', en: 'Product catalog' },
            note: { de: 'generierte Detailseiten', en: 'generated detail pages' },
          },
          {
            id: 'cart',
            kind: 'edge',
            label: { de: 'Warenkorb', en: 'Cart' },
            note: { de: 'Schlüssel: Artikel + Farbe', en: 'key: article + color' },
          },
          {
            id: 'upload',
            kind: 'edge',
            label: { de: 'Datei-Upload', en: 'File upload' },
            note: { de: 'eigener Parser', en: 'own parser' },
          },
        ],
      },
      {
        label: { de: 'Shop-Backend', en: 'Shop backend' },
        nodes: [
          {
            id: 'checkout',
            kind: 'core',
            label: { de: 'Kasse', en: 'Checkout' },
            note: { de: 'eigenes Datenmodell', en: 'own data model' },
          },
          {
            id: 'validate',
            kind: 'core',
            label: { de: 'Upload-Prüfung', en: 'Upload check' },
            note: { de: 'Format · Größe', en: 'format · size' },
          },
          {
            id: 'admin',
            kind: 'core',
            label: { de: 'Admin', en: 'Admin' },
            note: { de: 'token-geschützt · Honeypot', en: 'token-protected · honeypot' },
          },
        ],
      },
      {
        label: { de: 'Bestand & Daten', en: 'Inventory & data' },
        nodes: [
          {
            id: 'filament',
            kind: 'data',
            label: { de: 'Filament-Bestand', en: 'Filament inventory' },
          },
          {
            id: 'finished',
            kind: 'data',
            label: { de: 'Fertigteil-Bestand', en: 'Finished-part inventory' },
            note: { de: 'auf Bestellung wenn leer', en: 'made to order when empty' },
          },
          {
            id: 'orders',
            kind: 'data',
            label: { de: 'Bestellungen', en: 'Orders' },
          },
        ],
      },
      {
        label: { de: 'Anschluss', en: 'Connection' },
        nodes: [
          {
            id: 'export',
            kind: 'consumer',
            label: { de: 'Shop-Format-Export', en: 'Shop-format export' },
          },
          {
            id: 'notify',
            kind: 'consumer',
            label: { de: 'Bestell-Benachrichtigung', en: 'Order notification' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'catalog',
        to: 'cart',
        label: { de: 'pro Farbe getrennt', en: 'separate per color' },
      },
      {
        from: 'cart',
        to: 'checkout',
      },
      {
        from: 'upload',
        to: 'validate',
        label: { de: 'Format · Größe', en: 'format · size' },
      },
      {
        from: 'checkout',
        to: 'orders',
      },
      {
        from: 'orders',
        to: 'finished',
        label: { de: 'Druck verbucht', en: 'print booked' },
      },
      {
        from: 'orders',
        to: 'notify',
      },
      {
        from: 'orders',
        to: 'export',
      },
    ],
  },
  result: [
    {
      de: 'Ein vollständiger Shop ohne Shop-Framework: Katalog, farbbewusster Warenkorb, Kasse und Bestands-Logik sind eigener Code, kein Plugin-Geflecht.',
      en: 'A complete shop without a shop framework: catalog, color-aware cart, checkout and inventory logic are all own code, not a plugin tangle.',
    },
    {
      de: 'Die Bestands-Engine bildet Fertigung auf Bestellung sauber ab: nicht vorrätig heißt bestellbar und nicht ausverkauft, ein erledigter Druck wird gegen den Bestand verbucht.',
      en: 'The inventory engine maps make-to-order cleanly: not in stock means orderable and not sold out, and a completed print is booked against the inventory.',
    },
    {
      de: 'Der eigene Upload-Pfad nimmt hochgeladene Druckdateien an und weist alles ab, was nicht ins erlaubte Format oder unter die Größengrenze passt.',
      en: 'The own upload path accepts uploaded print files and rejects anything outside the allowed format or over the size limit.',
    },
    {
      de: 'Der Shop steht im Pre-Launch, das Modell trägt: Token-Admin, Honeypot und ein Export ins gängige Shop-Format sind angelegt.',
      en: 'The shop is in pre-launch and the model holds: token admin, honeypot and an export to the common shop format are in place.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum kein Shop-Baukasten', en: 'Why no shop kit' },
      body: {
        de: 'Ein Standard-Shop hätte das Modell aus Farben, Fertigung auf Bestellung und Filament-Bestand in seine Artikel-Logik gepresst. Ein eigenes, schlankes Datenmodell bildet genau diesen Fall ab, ohne gegen die Plattform zu arbeiten.',
        en: 'A standard shop would have pressed the model of colors, make-to-order and filament inventory into its article logic. A dedicated, lean data model maps exactly this case without fighting the platform.',
      },
    },
    {
      title: { de: 'Farbe im Warenkorb-Schlüssel', en: 'Color in the cart key' },
      body: {
        de: 'Dieselbe Form in zwei Farben sind zwei Posten, keine Menge von zwei. Farbe und Artikel getrennt im Warenkorb-Schlüssel zu führen verhindert das stille Zusammenfassen, an dem ein generischer Shop scheitert.',
        en: 'The same shape in two colors is two line items, not a quantity of two. Keeping color and article separate in the cart key prevents the silent merging that a generic shop trips over.',
      },
    },
    {
      title: {
        de: 'Eigener Upload-Parser mit harten Grenzen',
        en: 'Own upload parser with hard limits',
      },
      body: {
        de: 'Hochgeladene Dateien sind eine Angriffsfläche. Ein eigener Multipart-Parser, der nur erlaubte Formate und eine feste Größengrenze durchlässt, hält die Kontrolle im eigenen Code.',
        en: 'Uploaded files are an attack surface. A multipart parser of its own that only passes allowed formats and a fixed size limit keeps control in my own code.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Shop-Framework', en: 'Shop framework' },
      value: { de: 'keines, Eigenbau', en: 'none, custom build' },
    },
    {
      label: { de: 'Bestand', en: 'Inventory' },
      value: { de: 'Filament und Fertigteile getrennt', en: 'filament and finished parts separate' },
    },
    {
      label: { de: 'Upload', en: 'Upload' },
      value: {
        de: 'eigener Parser, Format- und Größengrenze',
        en: 'own parser, format and size limit',
      },
    },
    {
      label: { de: 'Stand', en: 'Status' },
      value: { de: 'Pre-Launch, Modell trägt', en: 'pre-launch, model holds' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Eigenes Datenmodell, Katalog mit generierten Detailseiten, farbbewusster Warenkorb',
        en: 'Own data model, catalog with generated detail pages, color-aware cart',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Bestands-Engine für Filament und Fertigteile, eigener Datei-Upload, Token-Admin',
        en: 'Inventory engine for filament and finished parts, own file upload, token admin',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Produktbilder, Kassen-Politur, Übergang in den produktiven Betrieb',
        en: 'Product images, checkout polish, transition into productive operation',
      },
    },
  ],
};

export default rackforge;
