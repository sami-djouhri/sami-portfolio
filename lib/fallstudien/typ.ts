import type { ArchKind, ProjectDetail } from '../projects';

/**
 * Die Fallstudien: je Arbeit eine Datei, beide Sprachen nebeneinander.
 *
 * Warum das Format so aussieht (Umbau 2026-10-30, Entscheid aus der
 * Fragerunde desselben Tages). Bis dahin lag Deutsch in `lib/project-details.ts`
 * und Englisch in zwei weiteren Dateien. Ende September wurden sieben Fallstudien
 * auf Deutsch neu geschrieben, und die englischen Dateien wurden dabei nicht
 * angefasst. Danach beschrieben neun englische Seiten eine andere Arbeit als die
 * deutschen, bei gleichem Titel und gleichem Bild. Gefunden hat das erst ein
 * Werkzeug, das die Eintraege paarweise gegenueberstellt
 * (`scripts/messen/abschnitte.js`). Ein Laengenvergleich findet es nicht, die
 * Seiten waren gleich lang.
 *
 * Deshalb ist jeder EINTRAG ein Paar, nicht jeder Abschnitt: wer einen Absatz
 * anlegt, sieht die leere zweite Haelfte direkt darunter, und eine ungleiche Zahl
 * von Eintraegen kann es nicht mehr geben, weil der Typ sie nicht zulaesst.
 *
 * Das Architekturbild gibt es nur einmal. Ebenen, Knoten und Pfeile sind
 * sprachlos, nur Beschriftung und Notiz tragen ein Paar. Vorher hatte jede
 * Sprache ihr eigenes Bild, und bei `postfach` hatte das deutsche 11 Knoten und
 * das englische 7.
 *
 * Privacy-Regel unveraendert: keine IPs, Container-Namen, internen Hostnames.
 */
export interface Paar {
  de: string;
  en: string;
}

export interface ArchKnotenPaar {
  id: string;
  kind?: ArchKind;
  label: Paar;
  note?: Paar;
}

export interface ArchitekturPaar {
  summary: Paar;
  tiers: { label: Paar; nodes: ArchKnotenPaar[] }[];
  /** Beschriftete Kanten zwischen Knoten, per `id`. Gate 1h prueft, dass beide Enden existieren. */
  flows?: { from: string; to: string; label?: Paar }[];
}

/**
 * Der Steckbrief: vier feste Felder, eine Bildschirmseite, in zehn Sekunden erfassbar.
 *
 * Warum es das gibt (Befund 2026-10-06): die Fallstudien lasen sich „wie
 * Blogartikel". Gemessen waren es im Schnitt 5.163 Zeichen sichtbarer Text je Projekt,
 * also rund drei A4-Seiten, bei 23 Projekten. Ein Personaler liest ein bis drei Minuten
 * auf einer Bewerberseite. Die Tiefe bleibt erhalten, sie wandert nur eine Ebene nach
 * unten und wird aufgeklappt, statt vorne im Weg zu stehen.
 *
 * Die Felder sind absichtlich diese. Jedes beantwortet eine Frage, die ein Leser
 * ohne Technikhintergrund wirklich hat, und keines fragt nach Autorschaft:
 *   beschreibung Was es IST, in zwei bis drei Sätzen, ohne Fachwort. Rendert als
 *               Vorspann ohne Beschriftung. Hiess bis 2026-10-06 `wozu` und trug
 *               dieses Wort auch als sichtbares Label. Befund.
 *   funktionen  Was es konkret kann. Belegt aus dem Quelltext, nicht geschätzt.
 *   umfang      Wie groß ist es? GRÖSSENORDNUNG, nie eine exakte Zahl: eine Zahl,
 *               die niemand nachmisst, wird irgendwann falsch, ohne dass es auffällt.
 *   entschieden Die eine Entscheidung, die das Projekt erklärt, mit ihrem Grund.
 *   laeuft      Betriebsaussage: seit wann, in welchem Zustand.
 *
 * Seit dem Umbau vom 2026-10-30 zweisprachig. Vorher hatte er keine englische
 * Fassung (Begruendung: „Englisch entfaellt", Entscheid vom 06.10.), und dieser
 * Entscheid war am 15.10. zurueckgenommen. Die Detailseite hat den deutschen
 * Steckbrief deshalb zwei Wochen lang auch auf /en gezeigt.
 */
export interface SteckbriefPaar {
  beschreibung: Paar;
  funktionen: Paar[];
  umfang: Paar;
  entschieden: Paar;
  laeuft: Paar;
}

/** Ein Steckbrief, aufgeloest in eine Sprache. */
export interface Steckbrief {
  beschreibung: string;
  funktionen: string[];
  umfang: string;
  entschieden: string;
  laeuft: string;
}

/** Die gepaarte Form. Jede neue oder neu erhobene Fallstudie steht so. */
export interface Fallstudie {
  steckbrief?: SteckbriefPaar;
  /**
   * Modul-Liste fuer Suiten, die mehrere Apps unter einem Dach buendeln. Rein
   * generische App-Namen. Rendert als Chip-Leiste oben auf der Detailseite.
   */
  modules?: Paar[];
  problem: Paar;
  approach: Paar[];
  architecture?: ArchitekturPaar;
  result: Paar[];
  decisions: { title: Paar; body: Paar }[];
  /** `value` ist ein Paar, weil Zahlen je Sprache anders geschrieben werden (1.278 / 1,278). */
  metrics?: { label: Paar; value: Paar }[];
  timeline?: { when: Paar; what: Paar }[];
  /** Ehrliche Grenzen des Systems, als Eigenbetrieb gerahmt. Nur, wo es etwas zu sagen gibt. */
  limits?: Paar[];
}

/**
 * UEBERGANGSFORM fuer die neun Arbeiten, deren englische Fassung beim Umbau
 * nicht zur deutschen passte. Entscheid 2026-10-30: das alte Englisch bleibt
 * unveraendert stehen, bis die Arbeit neu erhoben ist (eine je Sitzung). Paarweise
 * zuordnen liess es sich nicht ehrlich, es beschreibt einen aelteren Stand.
 *
 * Wer eine dieser Arbeiten neu erhebt, schreibt ihre Datei in die gepaarte Form
 * um. Welche es noch sind: `grep -l "form: 'uebergang'" lib/fallstudien/`.
 */
export interface FallstudieAlt {
  form: 'uebergang';
  steckbrief?: SteckbriefPaar;
  de: ProjectDetail;
  enAlt: ProjectDetail;
}

export type FallstudieDatei = Fallstudie | FallstudieAlt;

export function istUebergang(f: FallstudieDatei): f is FallstudieAlt {
  return 'form' in f && f.form === 'uebergang';
}
