import type { Fallstudie } from './typ';

const aiVision: Fallstudie = {
  problem: {
    de: 'Edge-Hardware der ersten Generation ist eigensinnig: knapper Speicher, eine ältere Betriebssystem- und Toolchain-Schicht, eine GPU-Architektur, für die fast nichts von der Stange passt. Standard-Installationswege brechen an Stellen, die man erst beim Aufprall sieht. Trotzdem ist die verbaute GPU brauchbar, sobald die Plattform-Eigenheiten einmal verstanden und umschifft sind. Das Ziel war belastbare Bilderkennung lokal im eigenen Netz, ohne Cloud-Abhängigkeit, sodass andere Eigen-Services Bild-Tasks abrufen können, ohne dass Daten das Haus verlassen.',
    en: 'First-generation edge hardware is stubborn: tight memory, an older OS and toolchain layer, a GPU architecture almost nothing off the shelf fits. Standard install paths break at spots you only see on impact. And yet the built-in GPU is usable once you understand the platform quirks and steer around them. The goal was dependable image recognition locally in my own network, with no cloud dependency, so other own services can request image tasks without data leaving the house.',
  },
  approach: [
    {
      de: 'Plattform-Inventur zuerst: ermitteln, welche Bibliotheken die Hardware tatsächlich mitbringt und für welche Architektur überhaupt lauffähige Pakete existieren, bevor eine einzige Zeile Inferenz-Code entsteht.',
      en: 'Platform inventory first: figure out which libraries the hardware actually ships and which architecture even has runnable packages, before writing a single line of inference code.',
    },
    {
      de: 'Inferenz hinter eine schlanke HTTP-API legen, die nur lokal lauscht und in einen Compute-Router eingebunden ist: andere Eigen-Services rufen dieselbe Schnittstelle, ohne je die Hardware zu kennen.',
      en: 'Put inference behind a lean HTTP API that listens locally only and plugs into a compute router: other own services call the same interface without ever knowing the hardware.',
    },
    {
      de: 'Jeden Stolperstein der Plattform einmal lösen und festhalten. Das betrifft Speicher-Eigenheiten, zerbrechliche Abhängigkeits-Ketten und die Rechte an der GPU-Anbindung. Die Aufschriebe gehören zum Ergebnis dazu.',
      en: 'Solve each platform stumbling block exactly once, write it down and tick it off, from memory quirks through fragile dependency chains to the permission quirks of the GPU binding. The documentation is part of the result, not an afterthought.',
    },
    {
      de: 'Alles, was viel schreibt, von der internen Karte auf einen robusteren Datenträger verlagern. ML-Lasten schreiben genug, um billigen Flash-Speicher in überschaubarer Zeit zu verbrauchen.',
      en: 'Move write-heavy persistence off the internal card onto sturdier storage on purpose, because ML loads do not let simple-class flash last long.',
    },
    {
      de: 'Härtung als Vorgabe: minimale Capabilities, getrennte Datenpfade, kein direkter Außenzugang. Die Inferenz wird allein aus dem Heimnetz genutzt.',
      en: 'Hardening as the default: minimal capabilities, separate data paths, no direct outside access. The inference is a consumption target inside the home network, not an open door.',
    },
  ],
  architecture: {
    summary: {
      de: 'Andere Dienste rufen nicht das Modell direkt auf, sondern einen Compute-Router; der reicht an einen lokalen Inferenz-Server weiter, der das Modell auf der Edge-GPU ausführt und seine Gewichte von einem robusten Datenträger lädt. Die Hardware-Bindung sitzt damit an einer einzigen Stelle. Tausche ich die GPU, muss ich keinen Konsumenten anfassen.',
      en: 'Other own services do not call the model directly but a compute router; it hands off to a local inference server that runs the model on the edge GPU and loads its weights from sturdy storage. The whole hardware binding stays sealed at a single, swappable spot, and new recognition tasks arrive over the same interface without a consumer binding its code to the GPU.',
    },
    tiers: [
      {
        label: { de: 'Konsumenten', en: 'Consumers' },
        nodes: [
          {
            id: 'svc',
            kind: 'consumer',
            label: { de: 'Eigen-Services', en: 'Own services' },
            note: { de: 'Bild-Tasks', en: 'image tasks' },
          },
        ],
      },
      {
        label: { de: 'Zugriff', en: 'Access' },
        nodes: [
          {
            id: 'router',
            kind: 'core',
            label: { de: 'Compute-Router', en: 'Compute router' },
            note: { de: 'eine API', en: 'one API' },
          },
        ],
      },
      {
        label: { de: 'Inferenz', en: 'Inference' },
        nodes: [
          {
            id: 'api',
            kind: 'core',
            label: { de: 'Inferenz-Server', en: 'Inference server' },
            note: { de: 'nur lokal erreichbar', en: 'reachable locally only' },
          },
        ],
      },
      {
        label: { de: 'Hardware', en: 'Hardware' },
        nodes: [
          {
            id: 'gpu',
            kind: 'data',
            label: { de: 'Edge-GPU', en: 'Edge GPU' },
          },
          {
            id: 'store',
            kind: 'data',
            label: { de: 'Modell-Gewichte', en: 'Model weights' },
            note: { de: 'robuster Datenträger', en: 'sturdy storage' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'svc',
        to: 'router',
        label: { de: 'Bild-Task', en: 'image task' },
      },
      {
        from: 'router',
        to: 'api',
      },
      {
        from: 'api',
        to: 'gpu',
        label: { de: 'lokale Inferenz', en: 'local inference' },
      },
      {
        from: 'api',
        to: 'store',
        label: { de: 'lädt Gewichte', en: 'loads weights' },
      },
    ],
  },
  result: [
    {
      de: 'Erkennungsmodell auf eigener Edge-Hardware, eingebunden in den restlichen Eigen-Stack, Warm-Inferenz im Bruchteil einer Sekunde.',
      en: 'A recognition model on my own edge hardware, wired into the rest of my stack, with warm inference in a fraction of a second.',
    },
    {
      de: 'Cloud-Inferenz für diese Bild-Tasks vollständig entfallen: die Aufnahmen verlassen das Heimnetz nicht.',
      en: 'Cloud inference for these image tasks fully gone: the captures do not leave the home network.',
    },
    {
      de: 'Dokumentierter, reproduzierbarer Plattform-Pfad: künftige Modelle und neue Erkennungs-Tasks sitzen auf derselben Grundlage auf, und das Bring-up ist nur einmal fällig.',
      en: 'A documented, reproducible platform path: future models and new recognition tasks build on the same foundation, and the bring-up only has to happen once.',
    },
    {
      de: 'Nach einem Hardware-Umbau am Datenträger ließ sich der Dienst aus gesichertem Stand wieder anfahren, ohne das Modell neu zu beschaffen: der dokumentierte Pfad hat sich im Ernstfall bewährt.',
      en: 'After a hardware rework on the storage, the service came back up from a saved state without re-fetching the model; the documented path proved itself when it counted.',
    },
  ],
  decisions: [
    {
      title: {
        de: 'Mit der Plattform arbeiten, nicht gegen sie',
        en: 'Work with the platform, not against it',
      },
      body: {
        de: 'Ein Hardware-Upgrade ist für die erste Generation oft schlicht keine Option. Dagegen anzurennen bringt nichts, also entstand ein dokumentierter Pfad, der die Eigenheiten der Plattform akzeptiert und genau dadurch produktiv wird. Die Stolpersteine sind damit festgehaltenes Wissen und kein wiederkehrender Schmerz.',
        en: 'A hardware upgrade is often simply not an option on the first generation. Running at it gets you nowhere, so there is a documented path that accepts the platform\'s quirks and gets productive precisely through that. The stumbling blocks become recorded knowledge, not recurring pain.',
      },
    },
    {
      title: { de: 'Inferenz hinter einer API entkoppeln', en: 'Decouple inference behind an API' },
      body: {
        de: 'Direktzugriffe auf das Modell würden jeden Konsumenten an die konkrete Hardware koppeln. Eine lokale HTTP-Schnittstelle entkoppelt: neue Tasks und neue Modelle ziehen in dieselbe Architektur ein, ohne dass irgendein aufrufender Service umgeschrieben werden muss.',
        en: 'Direct access to the model would tie every consumer to the concrete hardware. A local HTTP interface decouples it: new tasks and new models move into the same architecture without rewriting any calling service.',
      },
    },
    {
      title: { de: 'Persistenz auf robusten Datenträger', en: 'Persistence on sturdy storage' },
      body: {
        de: 'Flash-Speicher der einfachen Klasse überlebt schreibintensive ML-Lasten nicht lange. Die Gewichte und Caches auf einen widerstandsfähigeren Datenträger zu legen, löst das mit minimalem Aufwand dauerhaft und macht aus schleichendem Datenverlust ein erledigtes Thema.',
        en: 'Simple-class flash does not survive write-heavy ML loads for long. Putting the weights and caches on more resilient storage fixes it for good with minimal effort and turns creeping data loss into a closed matter.',
      },
    },
    {
      title: { de: 'Bild-Tasks bleiben am Edge', en: 'Edge, not cloud, for image tasks' },
      body: {
        de: 'Lokale Inferenz hält die Aufnahmen im eigenen Netz und macht den Dienst unabhängig von Drittanbietern und deren Preis- und Verfügbarkeits-Politik. Der einmalige Bring-up-Aufwand kauft dauerhafte Datensouveränität.',
        en: 'Local inference keeps the captures in my own network and frees the service from third parties and their pricing and availability. The one-time bring-up buys lasting data sovereignty.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Inferenz-Ort', en: 'Inference location' },
      value: { de: 'eigene Edge-GPU', en: 'own edge GPU' },
    },
    {
      label: { de: 'Datenpfad', en: 'Data path' },
      value: { de: 'verlässt das Heimnetz nicht', en: 'stays in the home network' },
    },
    {
      label: { de: 'Erweiterbarkeit', en: 'Extensibility' },
      value: { de: 'modular über eine API', en: 'modular over one API' },
    },
    {
      label: { de: 'Plattform-Pfad', en: 'Platform path' },
      value: { de: 'dokumentiert, reproduzierbar', en: 'documented, reproducible' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Plattform-Bring-up, lokaler Inferenz-Server, Einbindung in den Compute-Router',
        en: 'Platform bring-up, local inference server, binding into the compute router',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Persistenz auf robusten Datenträger verlagert, Plattform-Stolpersteine dokumentiert und abgehakt',
        en: 'Persistence moved onto sturdy storage, platform stumbling blocks documented and ticked off',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Recovery nach Hardware-Umbau aus gesichertem Stand, Grundlage für weitere Erkennungs-Tasks gelegt',
        en: 'Recovery after hardware rework from a saved state, foundation laid for further recognition tasks',
      },
    },
  ],
  limits: [
    {
      de: 'Die Erkennung hängt an genau einem Rechner: fällt er aus, steht sie. Beim Umbau der Verkabelung war das eine Weile der Fall. Der Rest des Stacks merkt davon nichts, weil die Bild-Aufträge in der Warteschlange stehen bleiben statt zu scheitern, und genau dafür ist sie da.',
      en: 'Recognition depends on exactly one machine: if it goes down, recognition stops. During the re-cabling that was the case for a while. The rest of the stack does not notice, because image jobs stay queued instead of failing, which is exactly what the queue is for.',
    },
    {
      de: 'Die Hardware ist erste Generation: knapper Speicher, alte Toolchain. Das begrenzt die Modellgröße spürbar und macht jeden Versions-Sprung zu einem eigenen kleinen Projekt.',
      en: 'The hardware is first-generation: tight memory, an old toolchain. That noticeably caps model size and turns every version bump into a small project of its own.',
    },
  ],
};

export default aiVision;
