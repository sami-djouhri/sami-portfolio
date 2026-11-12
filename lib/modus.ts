/**
 * Der Betriebsmodus der Seite. Eine Zeile hier, dann Deploy.
 *
 * Entscheid vom 2026-10-25, entstanden als Nebensatz zur Frage, was
 * nach einer Zusage passiert: „Geht von Bewerbungsmodus in Schaufenstermodus.
 * Bei der Gelegenheit Modus für Wartungsarbeiten einführen."
 *
 * Die drei Modi:
 *
 * - **`bewerbung`** (heute): die Seite nennt die gesuchte Rolle, zeigt den
 *   Lebenslauf und fordert zum Schreiben auf.
 * - **`schaufenster`**: dieselbe Seite ohne jedes Bewerbungssignal. Weg sind
 *   die Rolle, die Bereitschaft, die Aufforderungen zum Schreiben, der
 *   Lebenslauf samt PDF und das maschinenlesbare `seeks` der strukturierten
 *   Daten. Das Werk bleibt vollständig, die Kontaktseite bleibt erreichbar.
 * - **`wartung`**: eine kurze Seite mit Status **503** statt der Seite. Der
 *   Owner kommt über den Schlüssel in der Adresse durch (siehe unten).
 *
 * Warum ein Schalter im Quelltext und kein Knopf von außen: ein Knopf
 * bräuchte eine Oberfläche, eine Berechtigung und einen Zustand auf dem
 * öffentlichen Wirt. Der Moduswechsel passiert ein paar Mal im Leben der Seite,
 * und ein Deploy dauert zwei Minuten. Dafür ist die Wahl im Git nachlesbar und
 * kann nicht von außen erreicht werden.
 *
 * Warum eine eigene Datei und nicht `lib/site.ts`: `proxy.ts` liest den
 * Modus und läuft in der Edge-Laufzeit. Eine Datei, die nur einen String
 * trägt, ist dort unbedenklich; `lib/site.ts` wächst erfahrungsgemäß um Dinge,
 * die es nicht ist.
 *
 * ⚠️ **Der Wartungsmodus löst den externen Watchdog aus.** Gatus auf netcup
 * prüft `djouhri.de` von draußen und meldet jede Antwort ab 400 als Ausfall;
 * 503 ist genau das, und zwar absichtlich (eine Suchmaschine soll den halben
 * Stand nicht aufnehmen). Wer länger als ein paar Minuten in Wartung geht,
 * rechnet mit dem Alarm oder hält den Endpunkt vorher an. Der Healthcheck des
 * Containers ist nicht betroffen, er fragt `/api/health`, und API-Pfade liegen
 * außerhalb des Proxy-Musters.
 */
export type Modus = 'bewerbung' | 'schaufenster' | 'wartung';

/**
 * ⚠️⚠️ Das `as Modus` ist Pflicht, und eine Typannotation (`MODUS: Modus = …`)
 * genügt NICHT. Gemessen am 2026-10-25: TypeScript zieht bei einer
 * `const`-Deklaration mit Initialisierer für die Vergleichsanalyse weiterhin
 * den Literaltyp heran, und die drei Zeilen darunter brechen dann mit
 * „This comparison appears to be unintentional because the types 'bewerbung'
 * and 'schaufenster' have no overlap" ab. Mit der Assertion ist der deklarierte
 * Typ die ganze Union, und alle drei Vergleiche sind gültig.
 *
 * Das ist der Grund, warum hier eine Assertion steht und nicht Nachlässigkeit:
 * wer sie durch die scheinbar saubere Annotation ersetzt, bricht den Build, und
 * zwar sofort und nicht erst beim Umschalten.
 *
 * ⚠️ **`scripts/smoke.sh` liest diese Zeile per `sed`**, um seine Erwartungen
 * abzuleiten (im Wartungsmodus prüft er auf 503 statt auf 200). Wer sie
 * umformuliert, zieht das Muster dort mit nach. Der Smoke bricht bei einem
 * unlesbaren Modus ab, statt eine Vorgabe zu raten, sagt es also deutlich.
 */
export const MODUS = 'bewerbung' as Modus;

/** Die Seite wirbt um eine Stelle. */
export const istBewerbung = MODUS === 'bewerbung';

/** Die Seite zeigt nur das Werk. */
export const istSchaufenster = MODUS === 'schaufenster';

/** Die Seite ist zu, mit Status 503. */
export const istWartung = MODUS === 'wartung';

/**
 * Der Name des Abfrage-Parameters, mit dem der Owner die Wartungsseite
 * durchschreitet: `https://djouhri.de/?durchlass=<schlüssel>`.
 *
 * Der Schlüssel selbst steht in der `.env` auf netcup (`WARTUNG_SCHLUESSEL`)
 * und NICHT hier: der Quelltext dieser Seite ist öffentlich, ein Schlüssel im
 * Repo wäre keiner. Ohne gesetzten Schlüssel gibt es keinen Durchlass, der
 * Wartungsmodus funktioniert trotzdem.
 *
 * Bewusst ein Schlüssel und keine Cloudflare-Freigabe auf die Heim-Adresse:
 * die wechselt mit der DSL-Verbindung, und eine Freigabe darauf sperrt den
 * Owner irgendwann selbst aus, ohne dass jemand den Zusammenhang sieht.
 */
export const DURCHLASS_PARAM = 'durchlass';

/** Cookie, das den Durchlass über die Folgeseiten hinweg hält. */
export const DURCHLASS_COOKIE = 'wartung_durchlass';
