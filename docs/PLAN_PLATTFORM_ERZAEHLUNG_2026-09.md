# Plan: von der Projektsammlung zur Plattform-Erzählung

Stand: 2026-09-14 · Status: **teils umgesetzt, teils bewusst verworfen. Kein Deploy.**

> ## Was aus diesem Plan geworden ist
>
> **Umgesetzt am 2026-09-14** (im Repo, noch nicht ausgerollt):
>
> - **Schritt 0 vollständig**, die drei widersprüchlichen Zahlen sind weg (Abschnitt 2).
> - **Eine andere Richtung für den Rest.** Beim Bauen wurde klar, dass Domänen-Band
>   und Systemkarte dasselbe tun wie der Rest der Seite: sie erklären **Bauleistung**,
>   nur besser verbunden. Gesucht ist aber eine Rolle im **Betrieb**. Deshalb wurde
>   stattdessen eine zweite Achse gebaut: ein veröffentlichtes Logbuch mit echten
>   Vorfällen, eine Startseiten-Sektion „Aus dem Betrieb" zwischen Beweis und
>   Projekten, und die Seite `/betrieb`, die sieben Betriebsfelder in der Sprache
>   einer Stellenausschreibung beantwortet, je mit Beleg und mit genannten Grenzen.
>
> **Zurückgestellt, nicht verworfen:** Domänen-Band (4.1) und Systemkarte (4.2).
> Sie bleiben sinnvoll, sind aber nicht mehr der erste Hebel. Wer sie später baut,
> findet hier die fertige Vorarbeit.
>
> **Hinfällig:** Abschnitt 4.4 (Featured-Trio) bleibt offen als Owner-Frage,
> Abschnitt 6 beschreibt die alte Schrittfolge.

## Warum dieser Plan existiert

Eine Tiefenanalyse des Gesamtsystems kam zu dem Schluss, dass die öffentliche
Darstellung kleiner wirkt als das, was tatsächlich gebaut und betrieben wird: die
Seite zeigt 25 einzelne Projekte und einige Kennzahlen, aber nicht, dass diese
Projekte **ein zusammenhängendes System** bilden. Dieser Plan prüft die Aussage
gegen die Seite selbst und leitet daraus eine Reihenfolge ab.

Zwei Dinge sind beim Prüfen aufgefallen, die den Plan umsortiert haben:

1. **Die Substanz fehlt nicht.** 24 der 25 Projekte haben eine vollständige
   Fallstudie mit Problem, Vorgehen, Architekturskizze, Kennzahlen, Entscheidungen
   und Grenzen. Es fehlt keine Tiefe, es fehlt eine **Verbindung**.
2. **Drei live stehende Aussagen sind sachlich falsch.** Solange die stimmen,
   ist jede zusätzliche Erzählung ein Aufbau auf unsicherem Grund. Sie kommen
   deshalb vor allem anderen (Abschnitt 6, Schritt 0).

## 1. Ist-Analyse

### Struktur

| Ebene | Ist |
|---|---|
| Routen | neun öffentliche Seiten, alle zweisprachig unter `app/[locale]/` |
| Startseite | Boot-Hero mit Name, Rolle und gesuchter Position · Live-Panel mit Dienstmatrix, Hosts, extern gemessener Erreichbarkeit und kopierbarem `curl`-Befehl · drei Featured-Projekte · Kontakt-CTA |
| Projekte | Übersicht mit 25 Karten, 24 Detail-Fallstudien mit fester Sektionsfolge |
| Tiefe je Fallstudie | Problem, Vorgehen, Architektur (Knoten und Kanten als SVG), Kennzahlen, Ergebnis, Entscheidungen, Grenzen, Zeitachse |
| Belege | `/api/proof` als offene JSON-Schnittstelle, dreistufige Herkunft (Messung, Umgebung, Code-Default), nur die erste Stufe darf „gemessen" heißen |

### Was gut trägt und bleiben soll

- **Der Beweis steht über dem Fold.** Das Live-Panel zeigt Größenordnung und
  Gesundheit im selben Blick und nennt die Messfrische. Wer nicht glaubt, kann
  die Schnittstelle abfragen. Das ist der stärkste Teil der Seite.
- **Die Ehrlichkeits-Mechanik.** Der grüne Puls erscheint nur bei echter externer
  Messung, sonst steht dort „Momentaufnahme". Der Drift-Wert erscheint gar nicht,
  wenn er nicht gemessen wurde, statt als Null. Diese Disziplin ist selten und
  ist selbst ein Argument.
- **Der Architektur-Baustein.** `ArchitectureDiagram` zeichnet aus
  `tiers`/`flows` eine privacy-sichere Skizze mit echtem Text als Knoten. Für
  eine Systemkarte muss nichts Neues gebaut werden.
- **Die Grenzen-Sektion.** Jede Fallstudie benennt, was das System **nicht**
  leistet (eine Person, ein Standort, keine Georedundanz). Für die Zielgruppe
  ist das glaubwürdiger als jede Stärke.

### Die Lücke, präzise benannt

Die Startseite führt von der Person direkt zu drei Projektkacheln. Zwischen
„wer ich bin" und „hier sind einzelne Projekte" fehlt der Satz, der beides
verbindet: **dass diese Projekte Domänen eines Systems sind und miteinander
reden.** Der Kalender trägt den Tagestyp, an dem die Heimautomation hängt; das
Ernährungs- und Vorratssystem bucht gegeneinander; die Wissenssuche föderiert
mehrere Quellen hinter einer Abfrage; eine Sprachkette führt von der Erkennung
über die Entscheidung bis zur Antwort. Nichts davon ist auf der Startseite
sichtbar, und in den Fallstudien steht es verstreut je Projekt.

Das ist der Unterschied zwischen „betreibt viele Dienste" und „hat ein System
gebaut". Für das Ziel der Seite (Festanstellung, `ZIELBILD.md` Abschnitt 1) ist
genau das der Unterschied zwischen einem beeindruckenden Hobby und einer
Berufsqualifikation.

## 2. Drei Befunde, die vor allem anderen kommen

Gemessen am 2026-09-13 gegen die Systemquellen.

| Fundstelle | Steht dort | Gemessen | Warum das zählt |
|---|---|---|---|
| `lib/project-details.ts:190` | Kennzahl „Drift: **0 gegen die Quelle**" | Der Drift wird laufend gemessen, aber seit dem Owner-Entscheid vom 2026-08-31 **bewusst nicht veröffentlicht**. Genau dafür wurden alle Drift-Behauptungen aus dem Fließtext entfernt | Die Aussage widerspricht einer Regel, die dieselbe Codebasis an anderer Stelle durchsetzt (`CLAUDE.md`, „Der Drift wird NICHT veröffentlicht"). Eine unbelegte Null ist schlimmer als eine weggelassene Zahl, und hier steht sie als Kennzahl in großer Typo |
| `lib/project-details.ts:189` | Kennzahl „Dienste live: **165** über die Flotte" | Die Regel lautet: Größenordnung im Text, exakte Zahl nur im gemessenen Panel mit Zeitstempel. Der Fließtext derselben Fallstudie sagt korrekt „über 170" | Zwei verschiedene Zahlen für dieselbe Sache auf einer Seite, eine davon ohne Messung. Ein aufmerksamer Leser findet den Widerspruch in zehn Sekunden |
| `lib/project-details.ts:164`, `lib/project-details.en.1.ts:155`, `lib/projects.ts:282` | „Knowledge-Gateway über **elf** Adapter durchsuchbar", „**Elf Quellen** hängen inzwischen dran … von Dokumenten und Inventar über Marktdaten und Briefe bis zu Büchern" | **Sieben** Adapter. Vier Quellen wurden am 2026-08-28 bewusst ausgebaut, weil Anwendungs- und Betriebsdaten nicht in einen Wissensindex gehören. Der Text nennt namentlich zwei der vier ausgebauten | Die Seite beschreibt eine Architektur, die absichtlich zurückgebaut wurde. Der Rückbau ist die **bessere** Geschichte (eine bewusste Grenzziehung zwischen Wissen und Betriebszustand), sie wird nur nicht erzählt |

Alle drei sind Ein-Zeilen-Korrekturen im Datenmodell, kein Umbau.

## 3. Zielgruppe und Leserreise

Unverändert aus `ZIELBILD.md`: die Seite wirbt um eine **Festanstellung**, nicht
um Mandate. Kein Verkaufsfunnel, keine Leistungen-Spur, kein „hire me"-Ton.

| Persona | Was sie in 30 Sekunden brauchen | Wo die Erzählung das liefert |
|---|---|---|
| Recruiter, kalt | Rolle, Region, Verfügbarkeit | unverändert im Hero (gesuchte Position steht bereits dort) |
| Hiring-Manager, technisch | „Kann der **betreiben**, nicht nur bauen?" | genau hier zahlt die Plattform-Erzählung ein: ein System mit Domänen, Grenzen, Messung und Wiederanlauf ist Betriebsarbeit. 25 Einzelprojekte sind es nicht |
| Teamleitung | Arbeitsweise, Umgang mit Fehlern | Grenzen-Sektionen und die Ehrlichkeits-Mechanik, beide vorhanden, beide zu leise |
| Peers | Inspiration, Code | Projekt-Repos, unverändert |

Leserreise, die der Plan herstellt:

```text
Wer bin ich  ->  Was ich betreibe (ein System, sechs Domänen)
             ->  Wie es zusammenhängt (eine Karte)
             ->  Eine Domäne in der Tiefe (Fallstudie)
             ->  Wie es betrieben und wiederhergestellt wird
             ->  Kontakt
```

Heute fehlen die Schritte zwei und drei; der Leser springt von Schritt eins
direkt in eine einzelne Fallstudie.

## 4. Empfehlung zur Informationsarchitektur

Fünf Varianten standen zur Wahl. Geprüft gegen den Ist-Zustand:

| Variante | Urteil |
|---|---|
| **A. Neue Gesamtsystem-Seite als Leitfallstudie** | teilweise. Eine zehnte Route würde das Problem verschärfen, das sie lösen soll: die Seite hat nicht zu wenig Fläche, sondern zu wenig Verbindung zwischen der vorhandenen. **Stattdessen: die bestehende Infrastruktur-Fallstudie zur Leitfallstudie ausbauen**, sie ist bereits Featured und hat bereits eine Architekturskizze |
| **B. Flagship-Trio (Suite, Wissen, Betrieb)** | ja, aber als **Kuratierung**, nicht als Neubau. Alle drei Fallstudien existieren. Die Featured-Auswahl steht in einer Zeile (`FEATURED_PROJECT_IDS`) |
| **C. Zwei weitere tiefe Fallstudien** | nein, nicht nötig. Beide genannten existieren bereits vollständig |
| **D. Sanitierte Systemkarte** | **ja, das ist der Kern.** Der Baustein existiert, es fehlt die Karte auf Systemebene statt auf Projektebene |
| **E. „Was ich betreibe" als Domänen statt App-Liste** | **ja, als Startseiten-Sektion.** Das ist der fehlende Schritt zwei der Leserreise |

**Empfehlung: D und E bauen, A und B kuratieren, C weglassen.**

Konkret vier Eingriffe, keine neue Route:

### 4.1 Domänen-Band auf der Startseite (neu)

Eine Sektion zwischen Hero und Featured-Projekten. Sechs Domänen, je eine Zeile
aus Name, einem Satz Zweck und einem Satz, **was sie mit einer anderen Domäne
verbindet**. Die Verbindung ist der Inhalt, nicht die Aufzählung.

Vorschlag der sechs (jede ist durch mindestens eine bestehende Fallstudie
belegt, keine neue Behauptung):

| Domäne | Ein Satz | Verbindung |
|---|---|---|
| Haus und Sprache | Heimautomation mit eigener Sprachkette von der Erkennung bis zur Antwort | holt den Tagestyp aus der Zeit-Domäne, statt einen zweiten Kalender zu führen |
| Persönliche Organisation | Zeit, Aufgaben, Ernährung, Vorrat, Post, Dokumente als eine Suite | Vorrat und Ernährung buchen gegeneinander; die Post legt Termine in dieselbe Zeit-Domäne |
| Wissen | eine Abfrage über mehrere Wissensquellen, mit lokaler Sprachmodell-Antwort und semantischer Nachsortierung | trennt bewusst Wissen von Betriebszustand: Anwendungsdaten bleiben draußen |
| Lokale KI | Modelle über mehrere Rechenklassen, vom Einplatinenrechner bis zum Virtualisierungs-Cluster, mit einem Vermittler davor | trägt Sprache, Wissen und Assistenz, ohne dass eine Cloud mitliest |
| Öffentliches | eigene Produkte, Shops und Communitys hinter einem getrennten Zugang | läuft bewusst nicht auf demselben Knoten wie die Steuerung |
| Betrieb | Inventar, Messung, Alarmierung, Sicherung, echte Wiederherstellungsproben | liegt quer unter allem anderen und ist der Grund, warum der Rest überhaupt steht |

Darstellung: `DomainMark`-Ikonik plus je eine Zeile, kein neues Motiv, keine
dritte Farbe. Bewegungsbudget unverändert null für diese Sektion.

### 4.2 Systemkarte auf Systemebene (neu, bestehender Baustein)

Eine Karte mit `ArchitectureDiagram`, aber nicht für ein Projekt, sondern für
das Ganze. Fünf Ebenen, generisch benannt, ohne Hostnamen, Adressen und Ports:

```text
Zugang        öffentlicher Eingang · privater Tunnel
Steuerung     Inventar als einzige Quelle · Ereignis-Bus · Regelwerk
Domänen       Haus · Organisation · Wissen · Öffentliches
Rechnen       Sprachmodelle mehrerer Klassen · Erkennung · Sprachausgabe · Bildinferenz
Betrieb       Messung · Alarmierung · Sicherung · Wiederherstellungsprobe
```

Kanten, die etwas erzählen (nicht alle möglichen): Zugang zeigt **nur** auf
Domänen, nie auf Steuerung. Inventar zeigt auf Domänen. Domänen speisen den
Bus. Betrieb liegt unter allen. Genau diese vier Kanten sind die Aussage.

Platz: als erste Sektion der Infrastruktur-Leitfallstudie, plus eine verkleinerte
Fassung (`ArchThumb`) auf der Startseite als Anker des Domänen-Bandes.

### 4.3 Leitfallstudie schärfen (Bestand)

Die Infrastruktur-Fallstudie beschreibt heute vor allem **Container-Hygiene**
(Inventar, Härtung, Netzzonen). Was fehlt, ist der Absatz darüber: dass auf
dieser Basis Domänen laufen, die einander benutzen. Ergänzt wird eine Sektion
„Was darauf läuft" mit Verweisen in die bestehenden Fallstudien, und die
Kennzahlen werden nach Schritt 0 ehrlich (siehe Abschnitt 2).

### 4.4 Featured-Trio prüfen (eine Zeile)

Heute: Infrastruktur, Ressourcen-Vermittlung, Suite. Vorschlag: Infrastruktur
(das Ganze), Suite (die Breite), Wissen (die Tiefe). Die Ressourcen-Vermittlung
ist ein starkes, aber schmales Stück und trägt die Gesamtaussage weniger.
Entscheidung ist eine Zeile in `lib/projects.ts` und gehört dem Owner.

## 5. Belege, die öffentlich getragen werden

Erlaubt sind nur Aussagen mit einer Quelle und einem Weg, wie sie aktuell bleibt.

| Aussage | Quelle | Aktualisierung | Eignung |
|---|---|---|---|
| Größenordnung der Dienste | `DIENSTE_PROSA`, eine Stelle für die ganze Seite | von Hand, erst bei dauerhaftem Überschreiten der nächsten Zehnerschwelle | ja, ist bereits so gelöst |
| Exakte Dienstzahl plus Messfrische | Sammler über `/api/proof` | automatisch je Lauf | ja, nur im Panel mit Zeitstempel |
| Anzahl Hosts und Rechenklassen | `PROOF_HOSTS` | selten, bei Hardware-Änderung | ja |
| Externe Erreichbarkeit und Verfügbarkeit | externer Watchdog außerhalb des Hauses | automatisch | ja, stärkster Beleg, weil er nicht von hier kommt |
| Sieben Wissensquellen hinter einer Abfrage | Adapter-Verzeichnis | bei Änderung der Quellen | ja, **nach Korrektur** |
| Mehrstufige Sicherung plus echte Wiederherstellungsproben | Prüfer für Sicherungsvollständigkeit, wiederkehrende Probe | automatisch | ja, als Prosa ohne Zahlen |
| Bedarfsgesteuerte Dienste sparen Ressourcen | Wecker-Registry | - | ja, als Prinzip, ohne Einsparzahl |
| Drift-Wert | gemessen | - | **nein**, Owner-Entscheid |
| Container-Gesamtzahl über alle Wirte | - | - | **nein**, altert zu schnell, und die Zahl ist nicht die Aussage |
| Codezeilen | - | - | **nein**, sagt nichts über Betrieb |
| Reifegrad-Bewertungen | subjektiv | - | **nein**, keine Messung dahinter |

## 6. Umsetzung in kleinen Schritten

Jeder Schritt ist ein Commit und für sich lieferbar.

| Schritt | Inhalt | Umfang |
|---|---|---|
| **0** | Die drei Befunde aus Abschnitt 2 korrigieren: Drift-Kennzahl entfernen, exakte Dienstzahl durch die Größenordnung ersetzen, „elf Adapter" auf sieben und den Rückbau als bewusste Entscheidung erzählen (DE und EN) | klein, reine Daten |
| **1** | Systemkarte als Datensatz anlegen (fünf Ebenen, vier Kanten) und in die Infrastruktur-Fallstudie setzen | mittel, bestehender Baustein |
| **2** | Domänen-Band auf der Startseite, sechs Zeilen plus Karten-Miniatur | mittel |
| **3** | Sektion „Was darauf läuft" in der Leitfallstudie, mit Querverweisen in die bestehenden Fallstudien | klein |
| **4** | Featured-Trio nach Owner-Entscheid | eine Zeile |
| **5** | Durchgang durch alle 24 Fallstudien auf weitere Zahlen ohne Quelle, nach demselben Muster wie Schritt 0 | mittel, aber mechanisch |

Reihenfolge ist bindend: Schritt 0 vor allem anderen.

## 7. Prüfungen vor einem späteren Deploy

Bestehende Gates, die ohnehin laufen:

- **Privacy-Gate** in `deploy.sh`: keine internen Namen, Adressen oder Zonen in
  `app/`, `lib/`, `public/`, `scripts/`. ★ `docs/` ist im Gate **nicht**
  enthalten; dieses Dokument hält die Regel deshalb von Hand ein.
- **Rauchtest** nach dem Ausrollen, bricht nicht die Seite, meldet aber.
- **Verifikations-Marker** im Live-HTML (`CLAUDE.md`, Abschnitt am Ende). Neu
  hinzu kämen: Domänen-Band vorhanden, Systemkarte vorhanden, „0 gegen die
  Quelle" ergibt **null** Treffer, „elf Adapter" ergibt **null** Treffer.

Zusätzlich für diesen Umbau:

- **Zugänglichkeit:** die Systemkarte bleibt Text plus SVG-Overlay, keine reine
  Grafik. Kontrastwerte der bestehenden Leiter nicht unterschreiten; die grüne
  Linienfarbe ist für kleine Schrift gesperrt.
- **Bewegung:** Budget bleibt bei höchstens drei Elementen je Seite. Das
  Domänen-Band bekommt keine eigene Animation.
- **Ladeverhalten:** das Hero-H1 bleibt der Kandidat für den größten Inhalt und
  darf weiterhin nicht über Deckkraft animiert werden. Das Domänen-Band steht
  unter dem Fold und darf einblenden.
- **Suchmaschinen:** keine neue Route, also keine neue Sitemap-Arbeit. Die
  Startseiten-Beschreibung sollte nach Schritt 2 den Systemgedanken tragen
  statt der Dienstzahl.
- **Link-Durchlauf** über die ganze Seite nach Schritt 3, weil neue
  Querverweise in Fallstudien entstehen. Nicht-ASCII in Projektkennungen ist
  eine bekannte Falle und ergibt stille 404.

## 8. Abnahmebedingungen

1. Auf der Seite steht keine Zahl mehr ohne Quelle oder Messzeitpunkt.
2. Ein Leser, der nur die Startseite sieht, kann in einem Satz wiedergeben,
   **was als Ganzes betrieben wird**, nicht nur, dass es viel ist.
3. Die Systemkarte enthält keinen Hostnamen, keine Adresse, keinen Port und
   keinen Container-Namen.
4. Keine neue Route, keine dritte Farbe, kein zusätzliches Bewegungselement.
5. Die Positionierung ist unverändert: Werk-Schaufenster mit dem Ziel
   Festanstellung, keine Leistungen-Spur, keine Verkaufssprache.
6. Die Methode des Bauens (Werkzeuge, mit denen entwickelt wird) erscheint
   nirgends als Geschichte. KI bleibt Fachinhalt der Systeme, nicht Arbeitsweise.

## 9. Was der Owner entscheiden muss

1. **Featured-Trio:** bleibt die Ressourcen-Vermittlung vorn, oder rückt die
   Wissens-Domäne nach (Abschnitt 4.4)?
2. **Tonfall des Domänen-Bandes:** nüchterne Systemmeldung oder ein Satz
   Ich-Stimme je Domäne? Beides ist mit der Identität vereinbar, es sollte aber
   eines von beiden konsequent sein.
3. **Lebenslauf:** der Plan lässt den Schalter unberührt. Solange er aus ist,
   endet die Leserreise am Kontaktformular statt an einem Dokument.

## 10. Ausdrücklich nicht Teil dieses Plans

- Keine Änderung an der Seite und kein Deployment. Dieses Dokument ist das
  Ergebnis, nicht ein Zwischenstand einer laufenden Umsetzung.
- Kein neues Design, keine neue Route, keine neue Abhängigkeit.
- Keine Veröffentlichung interner Topologie, Firewall-Regeln, Notfallwege oder
  offener Schwachstellen.
