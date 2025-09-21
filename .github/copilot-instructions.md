## Piove a Zagarolo — Copilot Instructions

Use this as the single source of truth for AI agents working in this repo. Keep changes small, avoid tooling churn, and test manually in the browser.

### Overview
- Static PWA (no bundler). All assets are local. Entry: `index.html`, `js/main.js`.
- Data from `data.json` (forecast/current) and optional `data-precipitations.json` (actual hourly today). Updated by GitHub Actions.
- Charts via local `vendor/chart/chart.umd.min.js`; UI via local Bootstrap.

### Architecture (modules under `js/modules/`)
- `ui.js`: `displayData()` renders cards, tooltips (`showApparentTemperatureTooltip`, `addWeatherIconTooltip`).
- `charts.js`: chart builders + custom Chart.js plugins: `currentHourLinePlugin`, `xAxisAnchorLabelsPlugin`, `sunriseSunsetPlugin`, `windDirectionPlugin`, `weatherIconsPlugin`, `pressure1013LinePlugin`, `uvAlertLinePlugin`. Uses `getDaySlice()` to slice 24h windows.
- `icons.js`: `getRainIconClass(weatherCode, isDay)`, `getWeatherDescription`, cloud-cover helpers.
- `constants.js`: element IDs, day configs, chart modes, `DATA_CACHE_TTL_MS` (3h), keys.
- `cache.js`: `loadCachedData()`/`saveCachedData()` with TTL guard.
- `precipitation.js`: loads `data-precipitations.json`; blending helpers exist but are currently not applied in `ui.js` (left as TODO).
- `chart-toggle.js`, `navigation-dots.js`, `gesture-handler.js`, `version-tooltip.js`, `air-quality.js`: UX, mode switching, gestures, A11Y.

### Data & SW
- `js/main.js`: fetches `data.json?nocache=<minute>`, loads actual precipitation, then `displayData()` and caches; retries each 60s on error; refreshes every 30m.
- Service Worker `service-worker.js`:
  - Navigate: network-first with cache fallback.
  - `data.json`/`data-precipitations.json`: stale-while-revalidate.
  - Static assets: cache-first. Bump `CACHE_NAME` to force updates; client sends `SKIP_WAITING` via `#update-button`.

### Dev Workflow (fast)
- Install: `npm install` (utility scripts only; <1s).
- Serve locally: `python -m http.server 8080` then open `http://localhost:8080`.
- Scripts: `npm run generate-changelog`, `npm run build-info`, `npm run update-precipitation`.
- Prefer timeouts <30s; repo work is instant.

### Conventions & Patterns
- 24h slices per day: `DAY_CONFIGS` and `getDaySlice()`; indexes 0/1/2 map to Oggi/Domani/Dopodomani.
- Weather icons: call `getRainIconClass(code, isDay)` for current; daily cards pass code only (no day/night).
- Caching: localStorage key `weatherDataV1`; clear expired entries (3h). SW caches both data files.
- Adding assets/libs: copy under `vendor/` or `css/font/` and add to SW cache list.
- Adding chart modes: extend `CHART_MODES` and update builder in `chart-toggle.js`/`charts.js`.

### Requirements Doc (RFC)
- Location: `docs/RFC-001-piove-a-zagarolo-requirements.md` (English). This is the canonical spec for features, UI, data schema, chart modes, plugins, caching and SW behavior.
- Use RFC 2119 language (MUST/SHOULD/MAY). Keep “Status” and “Last-Updated” current.
- Update WHEN you:
  - Add/change chart modes, datasets, or custom plugin options.
  - Change `data.json`/`data-precipitations.json` schema or semantics.
  - Change caching params (`DATA_CACHE_TTL_MS`, keys) or SW strategies/`CACHE_NAME`.
  - Adjust navigation dots/gestures or A11Y labels that affect behavior.
- Update HOW:
  - Keep module interface signatures in sync with exports in `js/modules/*.js`.
  - Document plugin option objects exactly as accepted by builders/plugins.
  - Ordered lists style: prefix with `1.` consistently; add blank lines around lists/headings (markdownlint MD029/MD032/MD022).
  - Reflect chart datasets in “Appendix A” (precip/temp/wind/pressure/air-quality).
- Pre-merge checklist:
  - README “Documentazione” links to the RFC and still resolves.
  - SW/cache values in RFC match `service-worker.js` and `constants.js`.
  - Headings/lists render cleanly (no lint warnings about spacing).
- Non-goals: don’t duplicate README usage/installation; don’t rename/renumber RFC-001 (add new RFCs as `RFC-00N-*` if needed and cross-link).

### Validation (manual)
- Load app: cards for Today/Tomorrow/Day After Tomorrow, charts render, icons match codes (0/1 clear; 61/63/65 rain; 95/96/99 thunder).
- PWA: SW registers, offline reload works; `#update-button` prompts update when `CACHE_NAME` changes.
- Data: `data.json` parses; `last_update` recent. Optional `data-precipitations.json` loads without errors.
- Mobile: 375×667 viewport usable; gestures and dots switch chart modes.

### Release & CI
- Weather data updated hourly via `build.yml`. Changelog via tags or `generate-changelog`.
- Preferred release: run the GitHub Actions “Release” workflow (bumps version, tags, changelog, GitHub Release). Follow Conventional Commits.

Questions or gaps? Tell us what’s unclear (e.g., chart mode wiring, SW cache list) and I’ll refine this guide.