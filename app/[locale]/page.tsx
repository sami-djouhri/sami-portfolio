import type { Metadata } from 'next';
import Link from 'next/link';

import {
  getAbout,
  localizedProject,
  localizedStackItem,
  localizedYear,
  PROJECTS,
  type Project,
} from '@/lib/projects';
import { getZiel } from '@/lib/cv';
import { getProof } from '@/lib/proof';
import { getOhneGroesse, getWerkgroesse } from '@/lib/werkgroessen';
import { getWerkauszug } from '@/lib/werkauszug';
import { istBewerbung } from '@/lib/modus';
import { previewIds } from '@/lib/previews';
import { PROOF_PUBLIC_LINKS } from '@/lib/site';
import {
  asLocale,
  localeAlternates,
  localeOpenGraph,
  localePath,
  type Locale,
} from '@/lib/i18n/config';
import { Anlagenfeld } from '../components/Anlagenfeld';
import { DomainMark } from '../components/DomainMark';
import { Eigenmessung } from '../components/Eigenmessung';
import { Leitstand } from '../components/Leitstand';
import { EndpunkteZeile, LivePanel } from '../components/LivePanel';
import { Footer } from '../components/Footer';
import { TopBar } from '../components/TopBar';

/**
 * Die Startseite. Uebernommen am 2026-10-21 aus `/[locale]/entwurf`, nachdem der
 * Owner sie am Telefon gesehen und freigegeben hat (das war die Bedingung, die
 * seit dem 17.10. offen stand). Die vorherige Fassung mit Kopfbereich, Boot-
 * Sequenz und einem Dreier aus hervorgehobenen Arbeiten liegt im Git und ist
 * ueber `git log app/\[locale\]/page.tsx` zu finden.
 *
 * ## Was diese Seite anders macht als die vorherige, und warum
 *
 * Sieben Vorbild-Durchgaenge endeten sieben Mal mit „nicht gut genug". Beim
 * achten Anlauf hat der Owner den Massstab genannt: **„aufwendig und
 * beeindruckend"**, und an `tania.dev` fehle ihm alles vier: zu statisch, zu
 * wenig Eigenes, zu duenn, zu klein gedacht. Ich hatte sechs Durchgaenge lang
 * ruhige, reduzierte Seiten vorgelegt, weil die Entscheidungstabelle „nuechtern"
 * sagt. Das gilt fuer den TEXT, nicht fuer die Darstellung.
 *
 * Vier Festlegungen tragen diese Seite:
 *
 * 1. **Kein Kopfbereich.** Der erste Blick ist die Werkliste (Owner-Wahl am
 *    Bild). Was vorher oben stand (Name gross, Tagline, zwei Knoepfe), ist genau
 *    der Aufbau, der auf jeder zweiten Portfolioseite steht.
 * 2. **Die Menge traegt die Flaeche.** Der Owner hat als seine zwei
 *    unverwechselbaren Noten den Terminal-Prompt und **die Menge selbst**
 *    gewaehlt. Eine Menge zeigt man nicht, indem man sie zaehlt, sondern indem
 *    man sie hinstellt: alle Arbeiten auf einmal, dicht, als Feld.
 * 3. **Haarlinien statt Karten.** Das Raster entsteht aus dem 1px-Abstand ueber
 *    einem Rahmenfarbton, nicht aus 25 Kaesten mit Schatten. Befund aus
 *    Durchgang 6 (Polestar) und 4 (Herzog & de Meuron).
 * 4. **Ein Effekt, 25 Mal.** Jede Zelle rastet beim Eintritt in den Blick ein:
 *    ein Messkopf laeuft durch die Oberkante, der Kennwert wird scharf. Das ist
 *    die Signatur, und daneben steht nichts. Scroll-getrieben in CSS, ohne
 *    JavaScript und ohne neue Abhaengigkeit.
 */

/**
 * Die drei Metadaten-Felder stammen aus der VORHERIGEN Startseite und sind
 * beim Uebernehmen bewusst mitgewandert. Der Entwurf trug an ihrer Stelle nur
 * `title: 'Entwurf'` und `robots: noindex`, beides richtig fuer eine Seite, die
 * niemand finden soll.
 *
 * ⚠️ Haette ich nur das `noindex` entfernt, waere die Startseite auf die
 * generische Beschreibung aus dem Layout zurueckgefallen (gemessen am laufenden
 * Dienst: „Infrastruktur, Systeme und Automatisierung aus dem Raum
 * Duesseldorf"), und `og:title` haette beim Teilen „Entwurf · Sami Djouhri"
 * gelautet. Dazu haette das OG-Bild gefehlt, denn das haengt an
 * `localeOpenGraph` und nicht am Layout. Drei stille Verluste an der
 * wertvollsten Seite, keiner davon sichtbar, solange niemand den Kopf des
 * Dokuments liest.
 *
 * `title` steht hier absichtlich NICHT: ohne eigenen Titel greift der
 * `default` aus dem Layout, und nur so bleibt der Seitentitel der Marke
 * („Sami Djouhri, Infrastruktur & selbst betriebene Systeme") statt die
 * Vorlage `%s · Sami Djouhri` zu durchlaufen.
 */
const HOME_DESC: Record<Locale, { description: string; og: string }> = {
  de: {
    description:
      'Sami Djouhri baut und betreibt eigene Systeme: ein gehärtetes Homelab auf eigener Hardware, dazu eigene Suiten und lokale AI, wo sie trägt.',
    og: 'Selbst betriebene Dienste, gehärtet und dokumentiert. Infrastruktur, Betrieb und Automation, selbst aufgebaut.',
  },
  en: {
    description:
      'Sami Djouhri builds and runs self-hosted systems: a hardened homelab on owned hardware, plus self-built suites and local AI where it earns its place.',
    og: 'Self-run services, visible hardening and documented care. Infrastructure, operations and automation, set up myself.',
  },
};

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await props.params).locale);
  return {
    description: HOME_DESC[locale].description,
    openGraph: localeOpenGraph(locale, '', HOME_DESC[locale].og, getAbout(locale).name),
    alternates: localeAlternates(locale, ''),
  };
}

/**
 * Die Schriftstufe der Zahl, abgeleitet aus ihrer Laenge.
 *
 * Das ist kein Feinschliff, sondern der Grund, warum das Feld nicht
 * monoton wird. Seit dem Umbau vom 2026-10-17 traegt JEDE Zelle ihre Zahl an
 * derselben Stelle, naemlich unter dem Namen. Haette jede dieselbe Groesse,
 * stuende unter dem Feld eine Wand aus gleich grossen Ziffern. Die Stufe
 * kommt aus den Daten selbst: `9` darf gross stehen, `19,3 Mio.` kann es
 * nicht, ohne umzubrechen.
 *
 * ⚠️ Gemessen ist die Grenze an der laengsten Zahl im Bestand (`19,3 Mio.`,
 * 9 Zeichen) und an der kuerzesten (`2`). Wer eine laengere eintraegt, prueft
 * die Zelle am Handy nach: 390 ist die Hauptbreite.
 */
function ziffernStufe(zahl: string): 'gross' | 'mittel' | 'klein' {
  const n = zahl.length;
  if (n <= 2) return 'gross';
  if (n <= 5) return 'mittel';
  return 'klein';
}

/**
 * Der Takt des Eroeffnungsmoments: wann die Zelle Nummer `i` sich setzt.
 *
 * Entscheid vom 2026-10-17: „Der Auftritt darf wachsen, danach
 * Ruhe." Vorher setzten sich alle 25 Zellen gleichzeitig, der Moment war nach
 * 1,5 s vorbei und bestand aus einem einzigen Bild. Jetzt faehrt erst die
 * Anlage hoch, dann setzen sich die Zellen reihenweise darueber, zuletzt
 * ruecken die Zahlen ein. Nach gut 2,4 s steht alles und es bewegt sich
 * nichts Neues mehr.
 *
 * ⚠️ Animiert wird ausschliesslich der HINTERGRUND der Zelle, nie ihr Text.
 * Der Text ist vom ersten Bild an vollstaendig lesbar, und die Zahl ruckt nur
 * ueber `transform` ein, nie ueber die Deckkraft. Das ist die LCP-Regel
 * dieser Seite: was auf eine Deckkraft-Animation wartet, zaehlt dem Browser
 * nicht als gemalt (verifizierter Defekt).
 */
const AUFTRITT_START = 0.45;
const AUFTRITT_SCHRITT = 0.035;
function auftrittTakt(i: number): number {
  return AUFTRITT_START + i * AUFTRITT_SCHRITT;
}

/** Wie viele Zellen der letzten Reihe bei `spalten` Spalten frei bleiben. */
function rest(anzahl: number, spalten: number): number {
  return (spalten - (anzahl % spalten)) % spalten;
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await props.params).locale);
  const roh = PROJECTS;

  // Die Grundordnung bedeutet etwas. Bis hierher stand die Reihenfolge der
  // Datenquelle, also eine zufaellige: ein Katalog, dessen Ordnung niemand
  // erklaeren kann, ist eine Haufenware. Gruppiert wird nach Bereich, weil das
  // die einzige Achse ist, die ALLE Arbeiten vollstaendig tragen.
  //
  // ⚠️⚠️ Betriebsdauer waere die bessere Achse und passt zur gesuchten Rolle.
  // Am 2026-10-17 nachgemessen, mit einem klaren Ergebnis: sie ist aus den
  // vorhandenen Daten NICHT zu gewinnen, und zwar aus zwei unabhaengigen
  // Gruenden.
  //   1. `year` hat Jahresaufloesung, und 21 von 25 Arbeiten sagen „seit
  //      2026". Eine Ordnung, in der fast alles gleich ist, ordnet nichts.
  //   2. Der naheliegende Ersatz, der erste Commit je Repository, misst nicht
  //      den Beginn der Arbeit, sondern den Tag, an dem die Versionsverwaltung
  //      aufgesetzt wurde: 24 der hier beteiligten Repositories tragen
  //      denselben ersten Commit, ein einziges liegt davor. Eine Achse aus
  //      diesen Daten haette einen gemeinsamen Klotz aus etwa zehn Arbeiten an
  //      einem Ende und saehe trotzdem aus wie eine Messung.
  // Damit bleibt die Ordnung nach Bereich, und der Punkt ist entschieden
  // statt offen. Wer die Achse doch will, braucht eine neue Quelle: den
  // Startmonat je Arbeit, und den weiss nur der Eigentuemer.
  const BEREICHE = ['Suite', 'Infra', 'AI', 'Web', 'Bots'];
  const alle = [...roh].sort((a, b) => {
    const ra = BEREICHE.indexOf(a.domain);
    const rb = BEREICHE.indexOf(b.domain);
    if (ra !== rb) return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
    return 0; // innerhalb eines Bereichs die Quellreihenfolge, die ist kuratiert
  });
  const proof = getProof();
  // Das Datum, nicht das Alter (seit 2026-10-30): die Seite ist statisch, ein
  // „vor 3 h" bliebe beim Bau stehen und hiesse fuer immer „vor wenigen Minuten".
  const deployed = proof.deployed ? proof.deployed.iso.slice(0, 10) : null;
  const vorschauen = new Set(previewIds(alle));
  const ziel = getZiel(locale);
  const en = locale === 'en';

  return (
    <div className="relative">
      {/* Der Grund zuerst, damit er hinter allem liegt. Seit dem 2026-10-30 ein
          Muster ohne Mengenaussage, siehe den Kopf von Anlagenfeld.tsx. */}
      <Anlagenfeld />

      <div className="anlagen-inhalt">
        <TopBar active="/" locale={locale} />

        <main id="main" className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-14">
        {/* Statusband. Steht VOR dem Feld, weil es die Groesse nennt, in der man
            das Feld danach liest. Es ist keine Ueberschrift: die Arbeiten
            sprechen fuer sich, das Band sagt nur, wie viele es sind und dass
            gerade alles laeuft. */}
        {/* Der Kopf: Name und ein Satz zur Sache, sichtbar (Entscheid
            2026-10-30, ersetzt den Entscheid „kein Kopfbereich"). Bis dahin
            stand hier eine nur fuer Vorleseprogramme lesbare Ueberschrift; wer
            die Seite einfach oeffnete, las den Namen erst klein im Prompt oder
            in der Fusszeile, und der Code nannte das selbst einen Kompromiss.
            Das Werkfeld bleibt der erste Block danach.
            ⚠️ Keine Einblend-Animation: die Ueberschrift ist der LCP-Kandidat
            dieser Seite (siehe LCP-Disziplin in die Projektregeln). */}
        <header className="mb-8 md:mb-10">
          <h1 className="font-display text-display-page text-text">Sami Djouhri</h1>
          <p className="mt-3 max-w-xl text-lg leading-snug text-muted md:text-xl">
            {en
              ? 'Infrastructure I build and run myself.'
              : 'Infrastruktur, die ich selbst baue und betreibe.'}
          </p>
        </header>

        <div className="statusband text-muted-dim">
          <span className="text-text/90">
            {alle.length} {en ? 'works' : 'Arbeiten'}
          </span>
          {/* Nur anzeigen, wenn die Messung tatsaechlich stattgefunden hat
              (`reachable`). Eine gruene Zeile aus einem Ausfall der Messkette
              heraus waere genau die Sorte Behauptung, die diese Seite nicht
              macht; dann steht hier lieber nichts. Und genannt wird, was
              gemessen wurde (x von y), nicht ein zusammenfassendes „alles". */}
          <EndpunkteZeile en={en} />
          {/* Die einzige Zahl auf dieser Seite, die im Browser des Lesers
              entsteht statt hier zu stehen. Wer ihr nicht traut, oeffnet die
              Netzwerkansicht und sieht denselben Aufruf. */}
          <Eigenmessung beschriftung={en ? 'this page answers in' : 'diese Seite antwortet in'} />
          {/* Die Ordnung wird genannt, nicht vorausgesetzt. Ein Katalog, dessen
              Reihenfolge der Leser raten muss, wirkt ungeordnet, auch wenn er
              es nicht ist. */}
          <span className="statusband-ordnung">
            {en ? 'grouped by area' : 'nach Bereich geordnet'}
          </span>
        </div>

        {/* Hier stand bis zum 2026-10-25 die gesuchte Rolle als eigene,
            hervorgehobene Zeile mit grünem Signalpunkt (`zielzeile`). Sie ist
            weg, und das ist ein Entscheid aus der Fragerunde: **das
            Schaufenster führt, die Bereitschaft steht als Nebensatz.** Die
            Angabe selbst ist nicht verschwunden, sie steht jetzt im
            Schlussabschnitt unten, dort wo jemand handelt.

            Zwei Wege nennen sie weiter sofort, und beide waren schon da: das
            maschinenlesbare `seeks` im Kopf des Dokuments (`layout.tsx`, das
            lesen Recruiter-Werkzeuge zuerst) und die Kontaktseite, die sie als
            erste Zeile trägt.

            ⚠️ Der Preis ist benannt: wer die Startseite nur überfliegt, liest
            die Bereitschaft erst am Fuß. Das ist die Folge von „Schaufenster
            führt" und war am 2026-10-21 noch anders entschieden. */}

        {/* Die Konsole steuert das Feld darunter. Damit ist die Werkliste
            nicht mehr eine feste Liste, sondern die Ausgabe eines Befehls, den
            man aendern kann: `filter Infra`, `ordne jahr`, `messen`.
            Auf `/toolbox` steht seit Monaten eine benutzbare Shell mit echten
            Daten, und sie ist das Eigenste, was diese Seite hat. Sie lag auf
            einer Unterseite, die niemand oeffnet. */}
        <Leitstand
          locale={locale}
          feldId="werkfeld"
          arbeiten={alle.map((p) => ({
            id: p.id,
            title: localizedProject(p, locale).title,
            domain: p.domain,
            jahr: p.year,
          }))}
        />

        {/* Das Werkfeld. Alle Arbeiten, keine Auswahl, keine Vorsortierung nach
            Wichtigkeit: eine kuratierte Dreierreihe waere wieder eine Liste.
            Die Reihenfolge ist die der Datenquelle und damit stabil; wer sie
            aendert, aendert sie dort und nicht hier. Die Konsole oben aendert
            nur die ANSICHT, ueber zwei Attribute an diesem Element. */}
        <section
          id="werkfeld"
          aria-label={en ? 'Works' : 'Arbeiten'}
          className="werkfeld mt-4 md:mt-5"
        >
          {alle.map((p, i) => (
            <Werkzelle
              key={p.id}
              projekt={p}
              locale={locale}
              hatVorschau={vorschauen.has(p.id)}
              takt={auftrittTakt(i)}
            />
          ))}

          {/* Die Fuellzelle. Das Feld traegt seinen Hintergrund in Linienfarbe,
              daraus entstehen die Haarlinien; eine angebrochene letzte Reihe
              zeigte deshalb eine hellgraue Flaeche statt leerer Zellen (bei 25
              Arbeiten in jeder Spaltenzahl, gesehen am 2026-10-30). Sie belegt
              den Rest der Reihe je Spaltenzahl und faellt weg, wo nichts fehlt.
              ⚠️ Die Spaltenzahlen muessen denen in `.werkfeld` entsprechen. */}
          <div
            className="werkrest"
            aria-hidden
            data-r2={rest(alle.length, 2)}
            data-r3={rest(alle.length, 3)}
            data-r4={rest(alle.length, 4)}
            style={{ animationDelay: `${auftrittTakt(alle.length)}s` }}
          />

          {/* Das Panel `live --watch` steht am Fuss des Feldes und ist
              selbst eine Zelle, keine Kiste darueber.

              Es fehlte im Entwurf vollstaendig, und von allem, was er
              gegenueber der laufenden Startseite verlor, war es der groesste
              Posten: der Zeitstempel der Messung, der Nachpruef-Befehl, die
              extern gemessene Verfuegbarkeit, „seit 2024", das Alter des
              letzten Deploys und der Weg zur oeffentlichen Status-Seite. Im
              Entwurf war davon eine graue Zeile uebrig. Die Zahlen waren aber
              nie das Argument, ihre Herkunft war es.

              Warum am FUSS und nicht oben: der erste Blick bleibt die
              Werkliste (Entscheid). Das Feld endet jetzt mit dem Beleg
              statt mit einer leeren Rasterzelle.

              Es ist dieselbe Komponente, die die vorherige Startseite in
              ihrer rechten Hero-Spalte trug, nicht eine zweite Fassung davon.
              Ein Nachbau waere binnen einer Sitzung auseinandergelaufen. */}
          <LivePanel
            locale={locale}
            deployedLabel={deployed}
            liveUrls={PROOF_PUBLIC_LINKS}
            huelle="feldpanel"
            huelleStil={{}}
          />
        </section>

        {/* Der Abschluss des Feldes. Ein Satz zur Sache, danach im
            Bewerbungsmodus die Bereitschaft als Nebensatz.

            Im Schaufenstermodus (`lib/modus.ts`) fallen der Nebensatz UND
            der Knopf weg. Was bleibt, ist die Feststellung, wem die Anlage
            gehört. Der Weg zur Kontaktseite bleibt im Menü oben; eine
            Aufforderung zum Schreiben gehört in ein Schaufenster nicht hinein.

            Die Rolle kommt aus `getZiel` (`lib/cv.ts`), derselben Quelle wie
            das `seeks` im Dokumentkopf und die Zeile auf der Kontaktseite. Drei
            Stellen, ein Satz, kein Drift. */}
        <section className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="max-w-xl text-base leading-relaxed text-muted">
            {en
              ? 'Everything above runs on hardware I own, set up and keep running.'
              : 'Alles hier oben läuft auf eigener Hardware, selbst aufgebaut und selbst betrieben.'}
            {istBewerbung ? (
              <>
                {' '}
                {en ? 'I am looking for ' : 'Ich suche '}
                <span className="text-text/90">{ziel.position}</span>
                {en ? ', in the Düsseldorf area or remote.' : ', im Raum Düsseldorf oder remote.'}
              </>
            ) : null}
          </p>
          {istBewerbung ? (
            <Link
              href={localePath(locale, '/kontakt')}
              className="shrink-0 whitespace-nowrap rounded-md bg-accent px-5 py-3 font-mono text-sm uppercase tracking-widest text-bg transition-colors hover:bg-accent-bright"
            >
              {en ? 'Get in touch' : 'Kontakt'}
            </Link>
          ) : null}
        </section>
        </main>

        <Footer locale={locale} />
      </div>
    </div>
  );
}

function Werkzelle({
  projekt,
  locale,
  hatVorschau,
  takt,
}: {
  projekt: Project;
  locale: Locale;
  hatVorschau: boolean;
  /** Sekunde, in der sich diese Zelle im Eroeffnungsmoment setzt. */
  takt: number;
}) {
  const en = locale === 'en';
  const tx = localizedProject(projekt, locale);
  // Die Groesse kommt aus `lib/werkgroessen.ts`, nicht mehr aus dem ersten
  // Kennwert der Fallstudie. Die alte Regel („nimm den ersten Wert mit
  // fuehrender Ziffer") war eine Textauswertung auf freier Prosa, und gemessen
  // hatte sie drei Fehler gleichzeitig: 12 von 25 Zellen blieben ohne Zahl,
  // drei fuehrten mit Zeilen Code, und ausgeschriebene Zahlen („sieben") sah
  // sie nicht. Begruendung und Messweg je Zahl stehen im Modul.
  const groesse = getWerkgroesse(projekt.id, locale);
  // Die eine Arbeit ohne Zahl bekommt an deren Stelle den Grund. Vorher
  // blieben dort 90 px leer am Telefon und 125 px am Breitbild, und eine leere
  // Flaeche sagt nichts, auch nicht „hier fehlt nichts". Jetzt ist die Zelle
  // die staerkste des Feldes: eine Arbeit, die bewusst nichts ueber sich
  // verraet, auf einer Seite, die sonst alles misst.
  const grund = getOhneGroesse(projekt.id, locale);
  // Der Satz zur Sache steht in `lib/werkauszug.ts` und wird NICHT aus der
  // Fallstudie abgeleitet. Gemessen waere das dreimal schiefgegangen: die
  // ersten Saetze schwanken zwischen 53 und 283 Zeichen und dabei je Sprache
  // verschieden, eine Arbeit hat keine englische Fallstudie (ihr Satz waere
  // auf /en still deutsch gewesen), und eine hat gar keine.
  const auszug = getWerkauszug(projekt.id, locale);
  const bild = hatVorschau ? `/previews/${projekt.id}.webp` : (projekt.beleg?.bild ?? null);

  return (
    <Link
      href={localePath(locale, `/projekte/${projekt.id}`)}
      className="werkzelle group focus-visible:z-10"
      style={{ animationDelay: `${takt}s` }}
      /* Fester Lesename, und er ist seit dem 2026-10-18 noetig. Die Zelle
         ist EIN Verweis und enthaelt jetzt zusaetzlich den Tiefen-Block, den
         die Konsole aufklappt. Ohne diese Zeile waere der Name des Verweises
         im geoeffneten Zustand die ganze Beschreibung samt Rolle und
         Werkzeugen, also ein Absatz als Linktext. Mit `aria-label` steht fest,
         was der Verweis heisst; der Text darin bleibt im Lesemodus
         zugaenglich.
         ⚠️ Die Zahl gehoert in den Namen. Ohne sie verliert ein
         Vorleseprogramm genau die Angabe, die die Zelle ausmacht. */
      aria-label={
        groesse ? `${tx.title}, ${groesse.zahl} ${groesse.einheit}` : tx.title
      }
      // Die drei Merkmale, nach denen die Konsole filtert und ordnet. Sie stehen
      // am Element statt in einem Zustand, damit ein Befehl das Feld nicht neu
      // baut: 25 Zellen samt Bildern neu zu rendern waere fuer einen Filter
      // unverhaeltnismaessig.
      data-arbeit={projekt.id}
      data-domain={projekt.domain}
      data-jahr={projekt.year}
    >
      {/* Jede Zelle ist seit dem 2026-10-17 gleich aufgebaut: Material,
          Name, Zahl. Entscheid, und er behebt einen gemessenen Fehler.
          Vorher las sich eine Zelle MIT Bild als Bild/Name/Zahl und eine OHNE
          Bild als Zahl/Name. In einer Reihe standen beide nebeneinander, die
          Zahl sass also mal ueber, mal unter dem Namen, und am Bild klebte sie
          am Titel der Zelle darueber.

          Oben steht deshalb immer Material, und Material ist eines von zwei
          Dingen: ein Bildschirmfoto der oeffentlichen Adresse, oder der Satz,
          der sagt, worum es geht. Die Zahl steht in JEDER Zelle unten.

          ⚠️ Hier stand bis zum Umbau die Domaenen-Zeichnung als dritte Stufe.
          Sie ist raus: die Infrastruktur-Motive (vier versetzte Rechtecke mit
          abnehmender Deckkraft) sahen am Handy aus wie ein Lade-Skelett, also
          wie ein Bild, das nicht geladen hat. Ein Platzhalter-Eindruck ist
          schlimmer als eine Textflaeche. */}
      <div className={bild ? 'werkbild' : 'werkbild werkflaeche'}>
        {bild ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bild}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <p className="werksatz">{auszug ?? tx.tagline}</p>
        )}
      </div>

      {/* Die vier Klassennamen `werkbild`, `zellkopf`, `werkname`,
          `kennwert` sind seit dem 2026-10-18 die Zeilen eines `subgrid`. Sie
          werden im Stilblatt einzeln einer Rasterzeile zugewiesen, damit in
          einer Reihe alle Namen und alle Zahlen auf derselben Linie liegen.
          Wer hier ein Element dazwischenschiebt, gibt ihm eine Zeile, sonst
          landet es per Auto-Platzierung in einer fremden. */}
      <div className="zellkopf flex items-start justify-between gap-2">
        <DomainMark domain={projekt.domain} size="sm" />
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-dim md:text-[0.65rem] md:tracking-widest">
          {localizedYear(projekt.year, locale)}
        </span>
      </div>

      {/* Der Name in Mono und in Schaugroesse. Das ist die Umkehrung dessen, was
          die vorherige Startseite machte (Mono klein als Marke, Serife gross
          fuer den Namen): Befund „Mono gross, nicht klein" aus Durchgang 5. */}
      <h2 className="werkname font-mono text-[0.9rem] font-medium uppercase leading-tight tracking-normal text-text transition-colors group-hover:text-accent md:text-base md:tracking-wider">
        {tx.title}
      </h2>

      {/* Die vierte Zeile: entweder die Zahl oder der Grund, warum es keine
          gibt. Sie ist nie leer, und das ist eine Bedingung der
          Reihen-Ausrichtung: eine fehlende vierte Zeile haette die Zelle auf
          drei Zeilen verkuerzt und die Reihe darunter verschoben. */}
      {groesse ? (
        <p className="kennwert">
          <span
            className="kennwert-zahl"
            data-stufe={ziffernStufe(groesse.zahl)}
            // Nur `transform`, nie Deckkraft: die Zahl ist der groesste Text
            // der Zelle und damit ein moeglicher LCP-Kandidat. Was auf eine
            // Deckkraft-Animation wartet, zaehlt dem Browser nicht als gemalt.
            style={{ animationDelay: `${takt + 0.3}s` }}
          >
            {groesse.zahl}
          </span>
          <span className="kennwert-einheit">{groesse.einheit}</span>
        </p>
      ) : (
        <p className="kennwert kennwert-grund">{grund}</p>
      )}

      {/* Die Tiefe, die die Konsole aufklappt (`zeig <kennung>`). Sie steht
          im HTML und ist geschlossen `display: none`, also auch nicht im
          Lesebaum. Drei Festlegungen dahinter:

          1. **Ohne JavaScript bleibt die Seite vollstaendig.** Das Feld ist
             eine Liste von Verweisen auf die Fallstudien, und das bleibt es.
             Dieser Block ist eine zweite Sicht auf dasselbe, kein Ersatz: ohne
             Konsole erscheint er nie, und der Verweis fuehrt wie bisher auf die
             ganze Fallstudie.
          2. **Kein Verweis darin.** Die Zelle IST ein Verweis, ein zweiter
             darin waere ungueltiges HTML. Deshalb steht hier nur Text, und der
             Weg zur Fallstudie bleibt die Zelle selbst.
          3. **Nur zweisprachige Quellen.** `steckbrief` waere der reichere
             Stoff und ist bewusst nicht benutzt: er hat keine englische
             Fassung (Entscheid 06.10.), ein `/en`-Leser haette hier
             deutschen Text bekommen. Genau die Falle, die beim Beleg ein
             Vierteljahr unbemerkt lief. */}
      <div className="werkdetail">
        {bild && auszug ? <p className="werkdetail-satz">{auszug}</p> : null}
        <p className="werkdetail-text">{tx.description}</p>
        <p className="werkdetail-rolle">
          <span className="werkdetail-marke">{en ? 'My part' : 'Mein Anteil'}</span>
          {tx.role}
        </p>
        <p className="werkdetail-stack">{projekt.stack.map((s) => localizedStackItem(s, locale)).join('  ·  ')}</p>
        <p className="werkdetail-weiter">
          {en ? 'Open for the full case study' : 'Öffnen für die ganze Fallstudie'}
        </p>
      </div>
    </Link>
  );
}
