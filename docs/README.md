# docs, sami-portfolio

Stand: 2026-09-13

Fach- und Planungsdokumente zu `djouhri.de`. Betriebs- und Agentenregeln stehen
weiterhin eine Ebene höher:

- `../README.md`, Einstieg für Menschen (Stack, Routen, Konfiguration, lokal bauen)
- `../CLAUDE.md`, harte Regeln, Design-Identität, Fallen, Verifikations-Marker
- `../DEPLOY.md`, kanonische Quelle und Deploy-Weg (maßgeblich)
- `../ZIELBILD.md`, Positionierung und Roadmap der Seite

## Inhalt

| Dokument | Zweck |
|---|---|
| [`PLAN_PLATTFORM_ERZAEHLUNG_2026-09.md`](PLAN_PLATTFORM_ERZAEHLUNG_2026-09.md) | Ist-Analyse und Richtungsentscheidung. Die drei sachlichen Korrekturen sind umgesetzt, ebenso die Betriebs-Achse (Logbuch, Startseiten-Sektion, `/betrieb`). Domänen-Band und Systemkarte sind zurückgestellt. Der Statusblock oben im Dokument sagt, was gilt. Kein Deploy. |

## Regeln für dieses Verzeichnis

- Planungsdateien tragen oben einen `Stand:`-Zeitstempel.
- Keine internen Hostnamen, IP-Adressen, Container-Namen oder Ports. Dieses
  Repository wird gespiegelt; was hier steht, kann nach außen gelangen.
- Keine Zählstände als dauerhafte Wahrheit. Wo eine Zahl gebraucht wird, gehört
  die Messquelle daneben.
