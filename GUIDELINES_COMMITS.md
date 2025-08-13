# Linee Guida Commit (Conventional Style)

Formato: `tipo(scope opzionale)!: descrizione breve`

Corpo (opzionale) dopo una riga vuota. Footer per BREAKING CHANGE / issue.

## Tipi Principali

- feat: nuova funzionalità
- fix: correzione bug
- refactor: modifica interna senza nuove feature/bugfix
- data: aggiornamenti dati automatizzati
- perf: miglioramento prestazioni
- docs: sola documentazione
- style: formattazione senza logica
- chore: manutenzione generica
- build: toolchain / dipendenze build
- ci: pipeline integrazione continua
- test: aggiunta o modifica test
- deps: aggiornamenti dipendenze
- security: fix di sicurezza
- revert: annulla commit precedente
- ux: miglioramenti UX
- pwa: migliorie PWA (può essere usato come scope: `feat(pwa): ...`)

## Esempi

```text
feat: aggiunge overlay linea ora corrente
fix(weather): gestisce codici Clear Sky
refactor(ui): semplifica componenti grafico precipitazioni
data: aggiornamento dataset previsioni 2025-08-14
perf(cache): riduce tempo di fetch del 30%
docs(readme): aggiunge sezione changelog automatico
chore: configura workflow changelog
deps: aggiorna chart.js a 4.4.0
security: sanifica input query
revert: revert "feat: caching locale" (abc1234)
```

## Breaking Changes

Indicare `!` dopo tipo/scope oppure footer:

```text
feat(api)!: rimuove campo legacy

BREAKING CHANGE: il campo X è stato rimosso; aggiornare i client.
```

## Regole Rapide

1. Soggetto < 72 caratteri, imperativo presente.
2. Niente punto finale nel soggetto.
3. Usare `data:` per commit automatici di dati.
4. Un solo concetto per commit (atomico).

## Mappatura nel Changelog

| Tipo | Categoria |
|------|-----------|
| feat, ux, pwa | Features |
| fix, security | Fix / Security |
| refactor | Refactor |
| perf | Performance |
| docs | Docs |
| build | Build |
| ci | CI |
| test | Tests |
| deps | Dependencies |
| data | Data Updates |
| chore, style, revert | Other |

## Script

Lo script `scripts/generate-changelog.js` rileva automaticamente questi prefissi e popola le sezioni.

## Flusso Release

1. Commit con prefissi coerenti.
2. `git tag 1.3.0 -m "Release 1.3.0" && git push origin 1.3.0`
3. Workflow aggiorna `CHANGELOG.md`.
4. Creare/pubblicare release GitHub.
