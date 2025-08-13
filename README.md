# Piove domani a Zagarolo?

[![Update Weather Data](https://github.com/mad4j/piovedomaniazagarolo/actions/workflows/build.yml/badge.svg)](https://github.com/mad4j/piovedomaniazagarolo/actions/workflows/build.yml)

Piove domani a Zagarolo?

Tech Report: <https://deepwiki.com/mad4j/piovedomaniazagarolo>

## Changelog Automatico

Il file `CHANGELOG.md` viene generato automaticamente al push di un nuovo tag (`git tag 1.3.0 -m "Release 1.3.0" && git push origin 1.3.0`).

Generazione manuale locale:

```bash
npm install
npm run generate-changelog
```

Poi crea/pusha il tag.

## TODO / Miglioramenti Futuri

Lista di possibili evoluzioni (ordinamento grossolano per impatto vs sforzo):

### Qualità del Codice & Build

- Migrare `main.js` a TypeScript per tipizzazione e refactor più sicuri.
- Introdurre un semplice bundler (es. Vite / esbuild) per minificazione, tree‑shaking e cache busting automatico degli asset.
- Aggiungere linting (ESLint) + formattazione (Prettier) integrati in CI.
- Estrarre funzioni meteo (icon mapping, caching) in moduli separati per testabilità.

### Test & CI/CD

- Aggiungere unit test (Jest) per funzioni: `getRainIconClass`, caching, color mapping barre precipitazione.
- Integrare Lighthouse CI (GitHub Action) per misurare performance / PWA / accessibilità ad ogni PR.
- Validare `manifest.json` e `service-worker.js` in build (workbox-lint o script custom).
- Aggiungere controllo dimensione bundle (size-limit) per prevenire regressioni di peso.

### Performance

- Implementare lazy loading dei grafici non visibili (caricare solo “Oggi”, rimandare gli altri on viewport/interazione).
- Pre-caricare (prefetch) `data.json` di prossimo aggiornamento poco prima del cron previsto.
- Integrare compressione Brotli / Gzip a livello di hosting (documentare nel README se static hosting supporta).
- Usare `Clients.claim()` già presente: valutare anche `navigationPreload` API per ridurre la latenza prima dell'attivazione SW.

### PWA & Offline

- Aggiungere fallback offline esplicito (pagina offline con ultimo snapshot e note).
- Mostrare badge “Offline” quando le richieste rete falliscono e stiamo servendo cache. **[DONE]**
- Persistenza estesa dei dati meteo in IndexedDB (storico ultimi N giorni) per analisi trend.
- Invio opzionale di Web Push per “Probabilità pioggia > X% domani” (con opt‑in chiaro).

### Accessibilità (a11y)

- Aggiungere skip link all’inizio della pagina per saltare ai grafici.
- Migliorare contrasto di alcune classi colore (verificare con Lighthouse / axe) soprattutto per icone e badge probabilità.
- Fornire descrizione testuale alternativa dei grafici (tabella dati nascosta ma accessibile agli screen reader).
- Gestire riduzione motion (prefers-reduced-motion) disabilitando animazioni Chart.js / toast.

### UX & UI

- Dark mode automatica (media query) + toggle manuale con persistenza in `localStorage`.
- Tooltip avanzati: aggiungere descrizione fenomeno (es. “6 mm/h = pioggia forte”).
- Indicatore di trend (freccia ↑/↓) rispetto al run precedente per probabilità massima giornaliera.
- Introdurre skeleton loading per carte prima del primo dato.

### Dati & Funzionalità

- Parametrizzare lat/lon via variabili (es. query string) per riuso su altre località.
- Aggiungere supporto lingua EN (i18n semplice con dizionario).
- Calcolare e mostrare “Finestra Asciutta” (intervallo più lungo senza precipitazioni nelle prossime 24h).
- Mostrare cumulato progressivo precipitazioni della giornata nel grafico.

### SEO & Metadati

- Aggiungere meta Open Graph / Twitter Card (titolo, descrizione, immagine 512).
- Inserire JSON-LD (WebSite / Place) con coordinate località.
- Sitemap (anche se sito one‑page) + robots.txt minimal.

### Sicurezza

- Documentare header consigliati (Content-Security-Policy, Referrer-Policy, Permissions-Policy, X-Content-Type-Options).
- Verificare integrità risorse terze (Subresource Integrity per Bootstrap / Chart.js se serviti via CDN – attualmente locali, valutare update).

### Monitoraggio & Telemetria

- Integrare Web Vitals (CLS/LCP/INP) logging opzionale (con opt‑in privacy) per misurare regressioni.
- Aggiungere versione app (derivata dal tag) visibile nel footer per debug.

### Automazione Release

- Script `npm version` che: aggiorna versione, rigenera changelog, crea tag e triggera workflow.
- Generare automaticamente una pagina Release Notes (HTML) da `CHANGELOG.md`.

### Manutenzione

- Aggiornare periodicamente dipendenze (Bootstrap / Chart.js) e annotare nel changelog.
- Aggiungere GitHub Issue Templates (bug_report, feature_request) e `CONTRIBUTING.md`.
- Abilitare Dependabot per avvisi sicurezza.

### Idee Future

- Modal confronto storico (es. media piogge ultimo anno stesso giorno).
- Export PNG/SVG dei grafici (Chart.js plugin) per condivisione.
- Integrazione widget embeddabile (iframe leggero) per altri siti locali.
- Modal “Come interpretare i dati” con legenda intensità pioggia.

Sezione da aggiornare man mano che emergono nuove esigenze oppure feedback utenti.
