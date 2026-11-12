import type { Fallstudie } from './typ';

const homelabApp: Fallstudie = {
  problem: {
    de: 'Ein Homelab im Dauerbetrieb will bedient werden, auch wenn ich nicht am Rechner sitze: einen klemmenden Dienst neu starten, kurz auf die Host-Metriken schauen, einen Log-Ausschnitt lesen, einen offenen Punkt sichten. Eine mobile Weboberfläche fühlt sich dafür fremd an, und ein roher Fernzugriff aufs Heimnetz ist weder sicher noch alltagstauglich. Gesucht war ein nativer Begleiter, der sich wie ein eigenes Produkt anfühlt, den Zugang bis auf Geräte-Ebene absichert und trotzdem in Sekunden zur Hand ist.',
    en: 'A homelab running around the clock wants to be operated even when I am not at the desk: restart a stuck service, glance at the host metrics, read a slice of a log, triage an open item. A mobile web surface feels foreign for that, and raw remote access into the home network is neither secure nor practical day to day. What I wanted was a native companion that feels like its own product, secures access down to the device level, and is still in hand within seconds.',
  },
  approach: [
    {
      de: 'Native Android-App mit Jetpack Compose und einem MVVM-Schnitt. Ein Hybrid-Wrapper hätte hier nicht gereicht: die App wird im Alltag benutzt und soll sich in Systemfunktionen wie Biometrie und Kamera einfügen.',
      en: 'A native Android app with Jetpack Compose and an MVVM cut. A hybrid wrapper would not have carried it: this app gets used daily and has to sit inside system functions like biometrics and the camera.',
    },
    {
      de: 'Ein Repository zwischen Oberfläche und Netz entscheidet pro Aufruf zwischen dem echten Gateway und einem statischen Demo-Datensatz, sodass die App auch ganz ohne Gateway vollständig erlebbar bleibt.',
      en: 'A repository between surface and network picks, per call, between the real gateway and a static demo dataset, so the app stays fully explorable even with no gateway at all.',
    },
    {
      de: 'Die Kopplung ist der Sicherheitskern: ein QR-Code trägt Gateway-Adresse und CA-Fingerprint, ein gerätegebundener EC-Schlüssel entsteht im Android-KeyStore und wird als CSR gegen JWT und Client-Zertifikat getauscht, der private Schlüssel verlässt das Gerät nie.',
      en: 'Pairing is the security core: a QR code carries the gateway address and CA fingerprint, a device-bound EC key is created in the Android KeyStore and exchanged as a CSR for a JWT and client certificate; the private key never leaves the device.',
    },
    {
      de: 'Laufende Aufrufe authentifizieren sich per Bearer-JWT und zusätzlich per mTLS, sobald das Gateway über TLS antwortet; Token und Zertifikate liegen AES-GCM-verschlüsselt im lokalen Store und sind vom Geräte-Backup ausgeschlossen.',
      en: 'Running calls authenticate with a bearer JWT and additionally with mTLS once the gateway answers over TLS; tokens and certificates sit AES-GCM-encrypted in the local store and are excluded from the device backup.',
    },
    {
      de: 'Der Zugang läuft ausschließlich übers eigene VPN, im Release-Build ist Klartext-HTTP verboten, und jede verändernde Aktion sitzt zusätzlich hinter einer lokalen Bestätigung per Biometrie oder Geräte-PIN.',
      en: 'Access runs solely over my own VPN, the release build forbids cleartext HTTP, and every mutating action additionally sits behind a local confirmation via biometrics or device PIN.',
    },
    {
      de: 'Autorisierung, Rate-Limits und Authentifizierung setzt das Gateway serverseitig durch. Was die App selbst prüft, ist eine zusätzliche Schicht und kein Ersatz dafür; ein manipulierter Client kommt daran nicht vorbei.',
      en: 'Built deliberately honest: the actual authorization, rate limits and authentication are enforced server-side by the gateway; the checks in the app are additional layers, not a replacement.',
    },
  ],
  architecture: {
    summary: {
      de: 'Die Compose-Oberfläche spricht nie direkt mit dem Gateway, sondern mit einem Repository, das je nach Modus live über das private Gateway oder gegen statische Demo-Daten arbeitet. Gekoppelt wird einmalig per QR: ein gerätegebundener EC-Schlüssel entsteht im Android-KeyStore, ein CSR wird vom Gateway zu JWT und Client-Zertifikat signiert, beides landet AES-GCM-verschlüsselt im lokalen Store. Danach läuft jeder Aufruf über Retrofit mit Bearer-JWT und mTLS, ausschließlich durchs eigene VPN, und jede verändernde Aktion sitzt hinter einer lokalen Bestätigung.',
      en: 'The Compose surface never talks to the gateway directly, only to a repository that, depending on mode, works live over the private gateway or against static demo data. Pairing happens once via QR: a device-bound EC key is created in the Android KeyStore, a CSR is signed by the gateway into a JWT and client certificate, and both land AES-GCM-encrypted in the local store. After that every call runs over Retrofit with a bearer JWT and mTLS, solely through my own VPN, and every mutating action sits behind a local confirmation.',
    },
    tiers: [
      {
        label: { de: 'Oberfläche', en: 'Surface' },
        nodes: [
          {
            id: 'compose',
            kind: 'edge',
            label: { de: 'Compose-UI', en: 'Compose UI' },
            note: { de: 'MVVM, ein Screen je Bereich', en: 'MVVM, one screen per area' },
          },
          {
            id: 'confirm',
            kind: 'edge',
            label: { de: 'Lokale Bestätigung', en: 'Local confirmation' },
            note: { de: 'Biometrie/PIN vor Mutation', en: 'biometrics/PIN before mutation' },
          },
        ],
      },
      {
        label: { de: 'Pairing & Schlüssel', en: 'Pairing & keys' },
        nodes: [
          {
            id: 'pairing',
            kind: 'core',
            label: { de: 'Pairing per QR', en: 'Pairing via QR' },
            note: { de: 'Fingerprint-Pinning', en: 'fingerprint pinning' },
          },
          {
            id: 'keystore',
            kind: 'core',
            label: { de: 'Android-KeyStore', en: 'Android KeyStore' },
            note: { de: 'EC-P256, non-exportable', en: 'EC-P256, non-exportable' },
          },
        ],
      },
      {
        label: { de: 'Datenschicht', en: 'Data layer' },
        nodes: [
          {
            id: 'repo',
            kind: 'core',
            label: { de: 'Repository', en: 'Repository' },
            note: { de: 'live oder Demo', en: 'live or demo' },
          },
          {
            id: 'store',
            kind: 'core',
            label: { de: 'Verschlüsselter Store', en: 'Encrypted store' },
            note: { de: 'Token/Cert per AES-GCM', en: 'token/cert via AES-GCM' },
          },
          {
            id: 'demo',
            kind: 'core',
            label: { de: 'Demo-Modus', en: 'Demo mode' },
            note: { de: 'statische Daten, kein Gateway', en: 'static data, no gateway' },
          },
        ],
      },
      {
        label: { de: 'Zugang & Gateway', en: 'Access & gateway' },
        nodes: [
          {
            id: 'transport',
            kind: 'consumer',
            label: { de: 'Retrofit + mTLS', en: 'Retrofit + mTLS' },
            note: { de: 'Bearer-JWT, TLS-Pflicht', en: 'bearer JWT, TLS required' },
          },
          {
            id: 'gateway',
            kind: 'data',
            label: { de: 'Privates Gateway', en: 'Private gateway' },
            note: { de: 'Metriken · Dienste · Inbox', en: 'metrics · services · inbox' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'compose',
        to: 'repo',
        label: { de: 'liest nie direkt', en: 'never reads directly' },
      },
      {
        from: 'compose',
        to: 'confirm',
        label: { de: 'vor jeder Mutation', en: 'before every mutation' },
      },
      {
        from: 'pairing',
        to: 'keystore',
        label: { de: 'erzeugt Geräteschlüssel', en: 'creates device key' },
      },
      {
        from: 'keystore',
        to: 'transport',
        label: { de: 'Client-Cert für mTLS', en: 'client cert for mTLS' },
      },
      {
        from: 'repo',
        to: 'demo',
        label: { de: 'ohne Gateway', en: 'without a gateway' },
      },
      {
        from: 'repo',
        to: 'transport',
        label: { de: 'online-Aufrufe', en: 'online calls' },
      },
      {
        from: 'transport',
        to: 'gateway',
        label: { de: 'durchs VPN, gekapselt', en: 'through the VPN, encapsulated' },
      },
    ],
  },
  result: [
    {
      de: 'Container starten, stoppen oder neu starten, Host-Metriken und Logs lesen, offene Punkte sichten, alles vom Handy und in Sekunden erreichbar.',
      en: 'Start, stop or restart a container, read host metrics and logs, triage open items, all from the phone and reachable within seconds.',
    },
    {
      de: 'Ein öffentlicher Demo-Modus zeigt die App vollständig ohne Gateway, ohne dass reale Netzdetails das Repository verlassen.',
      en: 'A public demo mode shows the app fully without a gateway, without real network details ever leaving the repository.',
    },
    {
      de: 'Der Zugang bleibt auf das eigene VPN beschränkt, der Geräteschlüssel ist non-exportable, und jede schreibende Aktion braucht eine lokale Bestätigung.',
      en: 'Access stays limited to my own VPN, the device key is non-exportable, and every write needs a local confirmation.',
    },
    {
      de: 'Eine neue Fähigkeit ist ein weiterer Screen plus ein Gateway-Endpunkt, kein Umbau am Sicherheits- oder Datenpfad.',
      en: 'A new capability is one more screen plus a gateway endpoint, not a rebuild of the security or data path.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum nativ', en: 'Native, not cross-platform' },
      body: {
        de: 'Für eine täglich genutzte Begleit-App ist Native-Compose schlanker und liegt enger an Android-Systemfunktionen wie Biometrie, Kamera und KeyStore.',
        en: 'For a daily companion app native Compose is leaner and closer to Android system functions like biometrics, the camera and the KeyStore. The choice follows the usage pattern, not the fashion.',
      },
    },
    {
      title: { de: 'Pairing per QR, kein Passwort', en: 'Pairing by QR, no password' },
      body: {
        de: 'Bei der Kopplung erzeugt das Gerät selbst einen non-exportablen Schlüssel und tauscht ihn gegen ein Zertifikat, ganz ohne Passwort im Formular. So gibt es kein Sekret, das abgetippt oder abgefangen werden könnte, und der Zugang ist an genau dieses Gerät gebunden.',
        en: 'During pairing the device creates a non-exportable key of its own and exchanges it for a certificate. So there is no secret to be typed or intercepted, and access is bound to this exact device.',
      },
    },
    {
      title: { de: 'Zugriff nur durchs eigene VPN', en: 'Access only through my own VPN' },
      body: {
        de: 'Kein Gateway ist öffentlich erreichbar. Die App kommt ausschließlich übers eigene VPN ins Heimnetz, im Release-Build ohne jedes Klartext-HTTP. Bequemlichkeit wird hier nicht gegen Angriffsfläche getauscht.',
        en: 'No gateway is publicly reachable. The app reaches the home network solely over my own VPN, with no cleartext HTTP at all in the release build. Convenience is not traded here for attack surface.',
      },
    },
    {
      title: { de: 'Sicherheit gehört auf den Server', en: 'Security belongs on the server' },
      body: {
        de: 'Die App prüft lokal, aber die Wahrheit über Autorisierung und Rate-Limits liegt im Gateway. Client-Prüfungen sind zusätzliche Schichten, damit ein manipuliertes Gerät nicht zur offenen Tür wird.',
        en: 'The app checks locally, but the truth about authorization and rate limits lives in the gateway. Client-side checks are additional layers, so a tampered device does not become an open door.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Plattform', en: 'Platform' },
      value: { de: 'Android nativ (minSdk 28)', en: 'Android native (minSdk 28)' },
    },
    {
      label: { de: 'Architektur', en: 'Architecture' },
      value: { de: 'Compose · MVVM · Hilt', en: 'Compose · MVVM · Hilt' },
    },
    {
      label: { de: 'Bereiche', en: 'Areas' },
      value: { de: 'Overview · Dienste · Inbox', en: 'overview · services · inbox' },
    },
    {
      label: { de: 'Zugang', en: 'Access' },
      value: { de: 'VPN + mTLS + lokale Bestätigung', en: 'VPN + mTLS + local confirmation' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Native Compose-App im MVVM-Schnitt, Overview mit Host-Metriken, Dienste-Liste mit Start/Stop/Neustart und Logs',
        en: 'Native Compose app in an MVVM cut, overview with host metrics, service list with start/stop/restart and logs',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Pairing per QR: gerätegebundener KeyStore-Schlüssel, CSR gegen JWT und Client-Zertifikat, Fingerprint-Pinning, verschlüsselter lokaler Store',
        en: 'Pairing via QR: device-bound KeyStore key, CSR exchanged for a JWT and client certificate, fingerprint pinning, encrypted local store',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Inbox-Triage, mTLS-Pflicht und Klartext-Sperre im Release, öffentlicher Demo-Modus, lokale Bestätigung vor jeder Mutation',
        en: 'Inbox triage, mTLS requirement and cleartext lockout in the release, public demo mode, local confirmation before every mutation',
      },
    },
  ],
};

export default homelabApp;
