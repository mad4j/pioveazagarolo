# Release 1.3.0 (2025-08-16)

## Novità / Miglioramenti

- Layout verticale ottimizzato e miglior leggibilità elementi principali (e694de2, dbebe79)
- Miglioramenti stile PWA: dimensioni pulsanti install/update più compatte (f32efcb)
- Ottimizzazione layout mobile per evitare scroll verticale (537e244)

## Correzioni

- Serie di fix responsive: margini card, overflow altezza, rimozione media queries superflue (25987a7, 668e0cd, 663899f)
- Correzione evidenziazione punto grafico al termine tooltip su touch (66cd6ce)
- Footer ora visibile correttamente su alcuni dispositivi Samsung (1d80b86)
- Ulteriori piccoli aggiustamenti UI (5b7efc1, dbebe79)

## Debug & Strumenti

- Redesign pannello debug e controlli migliorati (1f044a4)
- Attivatore debug triple‑click su mobile (cedd27b)

## PWA & Manifest

- Aggiornamenti a service worker (719f9c5) e manifest (b5d3f8a, e0b807d)

## Refactor / Struttura Progetto

- Spostati file JS principali in `js/` (ed88ff3)
- Riorganizzazione script di build in `_scripts/` e cleanup risorse non necessarie (0a51b3d)

## Documentazione

- Istruzioni Copilot estese (2b6d5d1)

## Aggiornamenti Dati

- 33 commit di aggiornamento dati meteo ("weather data updated" / "data updated")

## Note

- Aggiornato `package.json` per puntare ai nuovi percorsi degli script (`_scripts/`).
- Dopo il tag, eseguire `npm run generate-changelog` (o attendere GitHub Action) per rigenerare `CHANGELOG.md` con la sezione 1.3.0.
