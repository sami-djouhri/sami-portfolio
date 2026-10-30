import type { Fallstudie } from './typ';

const mediaVault: Fallstudie = {
  problem: {
    de: 'Eine Medien-Bibliothek liegt normalerweise entschlüsselt auf der Platte, und der Medien-Server läuft rund um die Uhr, damit man sie ansehen kann. Beides ist unnötig: Wer die Platte in die Hand bekommt, liest alles mit, und ein Dienst, der pro Woche zwei Stunden gebraucht wird, belegt trotzdem dauerhaft Arbeitsspeicher. Ich wollte, dass die Bibliothek verschlüsselt liegen bleibt und sich nur öffnet, wenn ich sie wirklich nutze.',
    en: 'A media library normally sits decrypted on disk, and the media server runs around the clock so you can watch it. Both are unnecessary: anyone who gets hold of the disk reads everything, and a service needed two hours a week still occupies memory permanently. I wanted the library to stay encrypted and open only when I actually use it.',
  },
  approach: [
    {
      de: 'Die Bibliothek liegt verschlüsselt auf der Platte und wird nur bei Bedarf eingehängt. Dauerhaft im Klartext liegt nichts.',
      en: 'The library sits encrypted on disk and is mounted only on demand. Nothing lies around permanently in the clear.',
    },
    {
      de: 'Eine schlanke Oberfläche nimmt die Entsperr-Phrase entgegen und reicht sie nur flüchtig an die Verschlüsselungs-Schicht weiter; sie wird nirgends gespeichert, weder auf der Platte noch in einer Sitzung.',
      en: 'A lean interface takes the unlock passphrase and passes it only transiently to the encryption layer; it is stored nowhere, neither on disk nor in a session.',
    },
    {
      de: 'Der Medien-Server folgt dem Zustand der Bibliothek: nach dem Einhängen fährt er hoch, beim Sperren geht er wieder herunter und die Bibliothek wird ausgehängt. Beides ist ein Vorgang, nicht zwei getrennte Handgriffe.',
      en: 'The media server follows the state of the library: it comes up once the library is mounted, and on lock it goes down again and the library is unmounted. One action, not two separate chores.',
    },
    {
      de: 'Vor dem Start des Servers wird geprüft, ob unter dem Einhänge-Punkt wirklich die entschlüsselte Bibliothek liegt, und nicht ein leeres Verzeichnis, weil das Einhängen still gescheitert ist.',
      en: 'Before the server starts, a check confirms that the decrypted library really is under the mount point, and not an empty directory left behind by a mount that failed silently.',
    },
    {
      de: 'Bewusst ohne Web-Framework gebaut, nur mit der Standard-Bibliothek der Sprache: für eine Oberfläche mit drei Knöpfen, die an einem Schlüssel sitzt, ist jede zusätzliche Abhängigkeit Angriffsfläche ohne Gegenwert.',
      en: 'Deliberately built without a web framework, on the language’s standard library alone: for a three-button interface sitting on top of a key, every extra dependency is attack surface without a return.',
    },
    {
      de: 'Der Zugang bleibt aufs eigene Netz begrenzt; nach außen ist nichts davon erreichbar.',
      en: 'Access stays confined to my own network; none of it is reachable from outside.',
    },
  ],
  architecture: {
    summary: {
      de: 'Die Bibliothek liegt verschlüsselt auf der Platte. Eine kleine Oberfläche im eigenen Netz nimmt die Entsperr-Phrase entgegen und gibt sie flüchtig an die Verschlüsselungs-Schicht weiter, die das Klartext-Verzeichnis nur im Arbeitsspeicher bereitstellt. Erst wenn eine Prüfmarke belegt, dass dort wirklich die Bibliothek liegt, fährt der Medien-Server hoch. Beim Sperren geht er herunter und das Verzeichnis wird wieder ausgehängt.',
      en: 'The library sits encrypted on disk. A small interface on my own network takes the unlock passphrase and hands it transiently to the encryption layer, which exposes the cleartext directory in memory only. Only once a marker proves the library really is there does the media server come up. On lock it goes down and the directory is unmounted again.',
    },
    tiers: [
      {
        label: { de: 'Eigenes Netz', en: 'Own network' },
        nodes: [
          {
            id: 'ui',
            kind: 'edge',
            label: { de: 'Entsperr-Oberfläche', en: 'Unlock interface' },
            note: {
              de: 'Phrase nur flüchtig, nie gespeichert',
              en: 'passphrase transient, never stored',
            },
          },
        ],
      },
      {
        label: { de: 'Verschlüsselung', en: 'Encryption' },
        nodes: [
          {
            id: 'fs',
            kind: 'core',
            label: { de: 'Verschlüsselungs-Schicht', en: 'Encryption layer' },
            note: { de: 'hängt on-demand ein', en: 'mounts on demand' },
          },
          {
            id: 'check',
            kind: 'core',
            label: { de: 'Prüfmarke', en: 'Marker check' },
            note: { de: 'liegt die Bibliothek wirklich da?', en: 'is the library really there?' },
          },
        ],
      },
      {
        label: { de: 'Dienst', en: 'Service' },
        nodes: [
          {
            id: 'server',
            kind: 'consumer',
            label: { de: 'Medien-Server', en: 'Media server' },
            note: { de: 'folgt dem Einhänge-Zustand', en: 'follows the mount state' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'cipher',
            kind: 'data',
            label: { de: 'Verschlüsselte Bibliothek', en: 'Encrypted library' },
            note: { de: 'Ruhezustand', en: 'at rest' },
          },
          {
            id: 'plain',
            kind: 'data',
            label: { de: 'Klartext-Sicht', en: 'Cleartext view' },
            note: { de: 'nur während der Nutzung', en: 'only while in use' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'ui',
        to: 'fs',
        label: { de: 'Phrase, flüchtig', en: 'passphrase, transient' },
      },
      {
        from: 'cipher',
        to: 'fs',
      },
      {
        from: 'fs',
        to: 'plain',
        label: { de: 'einhängen', en: 'mount' },
      },
      {
        from: 'plain',
        to: 'check',
      },
      {
        from: 'check',
        to: 'server',
        label: { de: 'erst dann starten', en: 'only then start' },
      },
      {
        from: 'ui',
        to: 'server',
        label: { de: 'sperren: herunterfahren', en: 'lock: shut down' },
      },
    ],
  },
  result: [
    {
      de: 'Die Bibliothek liegt im Normalzustand verschlüsselt; entschlüsselt ist sie nur, solange sie tatsächlich genutzt wird.',
      en: 'By default the library is encrypted; it is decrypted only for as long as it is actually in use.',
    },
    {
      de: 'Entsperren und Sperren sind je ein Vorgang: Bibliothek und Medien-Server gehen gemeinsam auf und gemeinsam zu.',
      en: 'Unlocking and locking are one action each: library and media server open together and close together.',
    },
    {
      de: 'Die Entsperr-Phrase wird nur durchgereicht und nirgends abgelegt, auch nicht in einer Sitzung.',
      en: 'The unlock passphrase is only passed through and stored nowhere, not even in a session.',
    },
    {
      de: 'Ein still gescheitertes Einhängen führt nicht mehr dazu, dass der Medien-Server auf ein leeres Verzeichnis startet und die Bibliothek als verschwunden meldet.',
      en: 'A silently failed mount no longer leaves the media server starting against an empty directory and reporting the library as gone.',
    },
    {
      de: 'Das Projekt steht als im Aufbau da: der Kern läuft, der Feinschliff fehlt noch.',
      en: 'The state stays honestly marked as in progress: the core works, the polish is still outstanding.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Verschlüsselt als Normalzustand, nicht als Zusatz',
        en: 'Encrypted as the default state, not as an add-on',
      },
      body: {
        de: 'Eine Bibliothek, die erst beim Herunterfahren verschlüsselt wird, liegt den ganzen Tag offen. Hier ist es andersherum: verschlüsselt ist der Normalzustand, entsperrt wird für die Dauer einer Sitzung.',
        en: 'A library that is only encrypted at shutdown lies open all day. Turned around, the resting state is encrypted and the cleartext view is the exception you deliberately create.',
      },
    },
    {
      title: { de: 'Der Dienst folgt den Daten', en: 'The service follows the data' },
      body: {
        de: 'Ein Medien-Server, der läuft, während die Bibliothek zu ist, meldet dem Nutzer eine leere oder kaputte Sammlung und schreibt womöglich seinen Katalog leer. Ihn an den Einhänge-Zustand zu koppeln macht aus zwei Zuständen einen.',
        en: 'A media server running while the library is closed reports an empty or broken collection to the user, and may write its catalogue blank. Tying it to the mount state turns two states into one.',
      },
    },
    {
      title: { de: 'Erst prüfen, dann starten', en: 'Check first, then start' },
      body: {
        de: 'Ein Einhängen kann still scheitern, und darunter liegt dann ein leeres Verzeichnis, das genauso aussieht wie ein leeres Verzeichnis. Eine Prüfmarke im entschlüsselten Baum unterscheidet die beiden Fälle, bevor der Server startet.',
        en: 'A mount can fail silently, and what sits underneath then is an empty directory that looks exactly like an empty directory. A marker inside the decrypted tree tells the two cases apart before the server starts.',
      },
    },
    {
      title: { de: 'Keine Abhängigkeit ohne Gegenwert', en: 'No dependency without a return' },
      body: {
        de: 'Für drei Knöpfe vor einem Schlüssel bringt ein Web-Framework nur Angriffsfläche und Update-Pflicht. Die Standard-Bibliothek reicht dafür.',
        en: 'For three buttons in front of a key, a web framework buys nothing but attack surface and patch duty. The standard library is enough, and what is not there does not need patching.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Ruhezustand', en: 'Resting state' },
      value: { de: 'verschlüsselt', en: 'encrypted' },
    },
    {
      label: { de: 'Entsperr-Phrase', en: 'Unlock passphrase' },
      value: { de: 'nur flüchtig, nie gespeichert', en: 'transient, never stored' },
    },
    {
      label: { de: 'Medien-Server', en: 'Media server' },
      value: { de: 'läuft nur bei entsperrter Bibliothek', en: 'runs only while unlocked' },
    },
    {
      label: { de: 'Fremd-Abhängigkeiten', en: 'Third-party dependencies' },
      value: { de: 'keine', en: 'none' },
    },
  ],
};

export default mediaVault;
