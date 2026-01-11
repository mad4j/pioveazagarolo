# RFC-001: Piove a Zagarolo — Requirements and Interfaces

Status: Draft

Last-Updated: 2026-01-11

Authors: Project maintainers

## Status of This Memo

This document specifies the requirements, user interface, modules, and parameters for the “Piove a Zagarolo” progressive web application (PWA). Distribution of this memo is unlimited.

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in RFC 2119.

## Abstract

Piove a Zagarolo is a static PWA that displays local weather forecasts and air quality for Zagarolo with focus on hourly precipitation probability and intensity. It runs entirely from static assets, fetches JSON data updated hourly via CI, renders interactive charts via Chart.js, and works offline via a Service Worker. This RFC defines functional and non-functional requirements, UI behavior, data model, module interfaces, custom chart plugins, caching, service worker strategy, and configuration parameters.

## Terminology

- “App”: the Piove a Zagarolo PWA.
- “Today/Tomorrow/Day After”: 24h day windows indexed 0/1/2.
- “EAQI”: European Air Quality Index.
- “SW”: Service Worker.
- “Data file(s)”: `data.json` (forecast/current) and optional `data-precipitations.json` (actual precipitation).

Requirements Identification: Normative requirements in this RFC are tagged with bracketed identifiers like `[FR-001]`. These IDs are stable and intended for traceability.

## Goals and Non‑Goals (Informative)

Goals:

- The App MUST render three day cards (Today, Tomorrow, Day After) with precipitation summary and temperatures.
- The App MUST render one chart per day, switching modes globally across all days: precipitation, temperature, wind, pressure, air quality.
- The App MUST function offline after first load via SW cached assets and stale‑while‑revalidate data strategy.
- The App MUST be usable on mobile (375×667) with gesture support and accessible labels.
- The App SHOULD surface current conditions with apparent temperature quick tooltip.

Non‑Goals:

- Server-side rendering, authentication, or multi‑location support are out of scope.
- Historical archives beyond today’s actual precipitation are not mandated by this RFC.

## Architecture Overview

- Static site, entry `index.html`, scripts under `js/`, modules under `js/modules/`.
- Data: `data.json` provides `current`, `hourly` (>=72 items), and `daily` (3 items), plus nested `air_quality`. Optional `data-precipitations.json` contains actual hourly precipitation for “today”.
- Rendering: Chart.js UMD (`vendor/chart/chart.umd.min.js`) with custom plugins.
- UI: Bootstrap CSS/JS (local) plus weather icon font.
- Caching: localStorage cache of `data.json` for 3h; SW caches static assets; `data.json` is stale‑while‑revalidate.
- Update cadence: initial load, retry on failure, auto refresh every 30 minutes; SW upgrade via `#update-button`.

## Data Model and Files

Primary file `data.json` (example in repo) SHALL include:

- [DATA-001]: Section `current` with fields: `time`, `temperature_2m`, `apparent_temperature`, `rain`, `precipitation`, `pressure_msl`, `relative_humidity_2m`, `wind_speed_10m`, `wind_direction_10m`, `weather_code`, `is_day`.
- [DATA-002]: Section `hourly` as aligned arrays (same length) for: `time`, `precipitation` (mm/h), `precipitation_probability` (%), `temperature_2m` (°C), `apparent_temperature` (°C), `wind_speed_10m` (km/h), `wind_direction_10m` (°), `pressure_msl` (hPa), `relative_humidity_2m` (%), `weather_code` (WMO), `is_day` (0/1), `cloud_cover` (%), `uv_index`.
- [DATA-003]: Section `daily` with exactly 3 items, each containing: `time` (date), `sunrise`, `sunset`, `temperature_2m_max/min`, `weather_code`, `precipitation_sum` (mm), `precipitation_probability_max` (%), `moon_phase` (0-1).
- [DATA-004]: Section `air_quality` with `current.european_aqi` and `hourly.european_aqi` (length aligned with the selected 24h window).
- [DATA-005]: Field `last_update` as a human-readable timestamp.

Optional file `data-precipitations.json` (actuals):

- [DATA-006]: Shape MUST be `{ date: 'YYYY-MM-DD', hourly_actual: { time: [ISO hours…], precipitation: [mm/h…] } }`.
- [DATA-007]: Actuals MAY be used to blend past hours for “today”; even if UI blending is disabled, the Precipitation Manager interfaces SHALL remain stable.

- [DATA-008]: Clients MUST fetch `data.json` with a minute-based cache buster: `data.json?nocache=<floor(now/60s)>`.

## Functional Requirements

- [FR-001]: The App MUST display a current conditions card (temperature, rain mm, pressure, humidity, wind speed and direction icon, weather icon with tooltip).
- [FR-002]: The App MUST display three day cards (Today/Tomorrow/Day After) with date, max/min temperatures, daily precipitation probability (%), daily precipitation sum (mm), a day icon with tooltip, moon phase indicator with tooltip, and air quality indicator.
- [FR-003]: The App MUST render one chart per day, and all charts MUST share a global mode and switch together via navigation dots or swipe.
- [FR-010]: Chart mode “Precipitation” MUST show precipitation probability (%) as a line and precipitation (mm/h) as bars; include sunrise/sunset markers and a current‑hour line on Today.
- [FR-011]: Chart mode “Temperature” MUST show temperature and apparent temperature as lines; MAY include humidity bars; MUST include sunrise/sunset markers and a current‑hour line on Today; SHOULD render cloud‑coverage icons every 3h.
- [FR-012]: Chart mode “Wind” MUST show wind speed as bars and draw per‑hour wind direction arrows; include sunrise/sunset markers and a current‑hour line on Today.
- [FR-013]: Chart mode “Pressure” MUST show pressure delta bars centered around 1013 hPa; MUST draw a 1013 hPa reference line; MAY show weather icons (3‑hourly); include sunrise/sunset markers and a current‑hour line on Today.
- [FR-014]: Chart mode “Air Quality” MUST show EAQI as bars; MAY include a UV index line with alert threshold; MAY include cloud‑coverage icons; include sunrise/sunset markers and a current‑hour line on Today.
- [FR-020]: Swiping MUST cycle through chart modes; navigation dots MUST reflect and control the active mode.
- [FR-021]: In‑chart custom HTML tooltips MUST present contextual values and sunrise/sunset hints near boundary hours. Weather icons and current temperature MUST show short tooltips on tap/click.
- [FR-023]: When offline, the App MUST load from SW cache and MAY use localStorage cached `data.json` if network fails.

## User Interface Requirements

- [UI-001]: Layout MUST be legible on mobile 375×667; charts MUST render with aspect ratio disabled to improve readability.
- [UI-002]: Day cards MUST reflect probability class styling: `high-chance` (>=60%), `medium-chance` (>=30%), else `low-chance`.
- [UI-003]: Weather icons MUST map WMO weather codes via `getRainIconClass(code, isDay?)` and expose descriptive labels.
- [UI-004]: The App version from `package.json` MUST be shown; minor format MAY collapse `X.Y.0` to `X.Y`.
- [UI-005]: When a new SW is installed, an update button MUST appear (`#update-button`) and trigger `SKIP_WAITING` on click.

## Theme and Dark Mode

- [THEME-001]: The App MUST support dark mode by defaulting to the user's system color scheme preference (`prefers-color-scheme`).
- [THEME-002]: The App MUST provide an explicit theme toggle (light/dark/system) accessible via UI controls with clear labels.
- [THEME-003]: The selected theme preference MUST persist across sessions and reloads.
- [THEME-004]: Chart color palettes MUST adapt to the active theme to maintain readability of lines, bars, gridlines, and plugins.
- [THEME-005]: Weather icons and other glyphs MUST retain sufficient contrast in both themes.
- [THEME-006]: Focus indicators and interactive states MUST remain visible and meet contrast requirements in dark mode.

## Module Interfaces (Public)

Files and functions named here describe their public interface; internal details MAY change without breaking the contract.

1. `js/modules/charts.js`

- [API-001]: The module MUST export the functions listed below with the described parameter shapes; return types MAY evolve without breaking callers when backward compatible.

- `getDaySlice(array, dayIndex:number): any[]` — returns a 24h slice at day index (0..2).
- `buildChart(target:string, probabilityData:number[24], precipitationData:number[24], sunriseTime?:string, sunsetTime?:string): void` — Precipitation chart.
- `buildTemperatureChart(target:string, temperatureData:number[24], apparentTemperatureData:number[24], humidityData?:number[24], sunriseTime?:string, sunsetTime?:string): void`.
- `buildWindChart(target:string, windSpeedData:number[24], windDirectionData:number[24], sunriseTime?:string, sunsetTime?:string): void`.
- `buildPressureChart(target:string, pressureData:number[24], sunriseTime?:string, sunsetTime?:string, weatherCodes?:number[24], isDayData?:number[24]): void`.
- `buildAirQualityChart(target:string, eaqiData:number[24], uvData?:number[24], sunriseTime?:string, sunsetTime?:string, cloudCoverageData?:number[24]): void`.

Custom Chart.js Plugins (options objects):

- `currentHourLinePlugin` (`currentHourLine`): `{ color?:string, overlayColor?:string }`.
- `xAxisAnchorLabelsPlugin` (`xAxisAnchorLabels`): `{ paddingBottom?:number, offsetY?:number, font?:string, color?:string }` (draws 00:00/06:00/12:00/18:00/24:00 labels).
- `sunriseSunsetPlugin` (`sunriseSunset`): `{ sunrise?:string, sunset?:string }` (ISO local `T` times like `2025-09-21T06:55`).
- `windDirectionPlugin` (`windDirection`): `{ windDirections:number[24] }` (degrees FROM which wind blows; draws arrows).
- `weatherIconsPlugin` (internal: precipitation mode): `{ weatherCodes:number[24], isDayData:number[24] }`.
- `pressure1013LinePlugin` (`pressure1013Line`): `{ color?:string, lineWidth?:number, lineDash?:number[], opacity?:number, label?:string, font?:string }`.
- `temperature21LinePlugin` (`temperature21Line`): `{ color?:string, lineWidth?:number, lineDash?:number[], opacity?:number, label?:string, font?:string }` (21°C reference line in temperature mode).
- `temperatureZeroLinePlugin` (`temperatureZeroLine`): `{ color?:string, lineWidth?:number, lineDash?:number[], opacity?:number, label?:string, font?:string }` (0°C reference line in temperature mode, shown only when minimum temperature is below zero).
- `uvAlertLinePlugin` (`uvAlertLine`): `{ value:number, color?:string, lineWidth?:number, lineDash?:number[], opacity?:number, label?:string, font?:string }` (drawn on UV Y2 scale).
- `pressureWeatherIconsPlugin` (pressure mode, 3‑hour grouping): `{ weatherCodes:number[24], isDayData:number[24] }`.
- `cloudCoverageIconsPlugin` (temperature/air quality): `{ cloudCoverageData:number[24] }` (3‑hour grouping).

1. `js/modules/chart-toggle.js`

- [API-002]: The module MUST export `buildAppropriateChart` and select the correct builder based on the global chart mode and data availability.

- `buildAppropriateChart(chartId:string, weatherData:DataJson, dayIndex:0|1|2): void` — chooses a builder based on global mode and data availability.

1. `js/modules/constants.js`

- [API-003]: The module MUST define the constants and helpers listed below; names are normative for cross-module integration.

- `DATA_CACHE_KEY: 'weatherDataV1'`
- `DATA_CACHE_TTL_MS: number` (default 3h)
- `CHART_MODE_CACHE_KEY: 'chartModeV1'`
- `CHART_MODES`: `{ PRECIPITATION|'precipitation', TEMPERATURE|'temperature', WIND|'wind', PRESSURE|'pressure', AIR_QUALITY|'air-quality' }`
- `DAY_CONFIGS`: day descriptors `{ key, index, chartId, cardId, iconId, moonId }`.
- `saveChartMode(mode:string): void` — persists global mode.
- `loadSavedChartMode(): string|null` — loads persisted mode.
- `chartModes: Record<chartId,string>` — in‑memory synced global state.

1. `js/modules/cache.js`

- [API-004]: The module MUST enforce TTL using `DATA_CACHE_TTL_MS` and store under `DATA_CACHE_KEY`.

- `loadCachedData(): { storedAt:number, data:DataJson } | null` — returns cached data if present and fresh.
- `saveCachedData(data:DataJson): void` — stores with timestamp.

1. `js/modules/precipitation.js` (Precipitation Manager)

- [API-005]: The module MUST load `data-precipitations.json` best‑effort and provide blend helpers that preserve forecast values for future hours.

- `loadActualData(): Promise<boolean>` — loads `data-precipitations.json` (minute cache buster) into memory.
- `blendTodayPrecipitation(forecast:number[24]): number[24]` — uses actuals for past/current hours; forecast for future.
- `blendTodayProbability(forecast:number[24]): number[24]` — zeroes past hours.
- `getCurrentHourRome(): number (0..23)`; `getCurrentDateRome(): 'YYYY-MM-DD'`.
- `isDataValid(): boolean` — actuals are for today.

1. `js/main.js` (Entry)

- [API-006]: The entry script MUST implement the fetch → optional actuals load → display → cache flow; on failure it MUST fall back to cache and schedule a retry.

- Fetch `data.json?nocache=<minute>`; on success: `precipitationManager.loadActualData()` (best‑effort) then `displayData(data)` and `saveCachedData(data)`.
- On failure: try localStorage cache, show toast, and schedule retry after ~60s with jitter.
- Auto refresh every 30 minutes; registers SW and manages update button lifecycle.

1. `js/modules/ui.js` (UI composition)

- [API-007]: The module MUST expose `displayData` that populates cards and delegates per‑day charts via `buildAppropriateChart`; it MUST also expose icon and tooltip helpers for weather and apparent temperature.

- `displayData(data:DataJson): void` — populates cards and builds per‑day charts via `buildAppropriateChart`.
- `updateWeatherIcons(weatherData)`, `addWeatherIconTooltip(el, code)`, `showApparentTemperatureTooltip(el, value)`.
- Emits toasts via `showToast(message, type?:'info'|'success'|'error', duration?:ms)` and updates version, A11Y labels.

1. UX helpers

- [UX-001]: `navigation-dots.js` and `gesture-handler.js` MUST keep all three charts in sync to the same `CHART_MODES` value.
- [UX-002]: `navigation-dots.js` and `gesture-handler.js` SHOULD announce the active chart mode.
- `version-tooltip.js`, `air-quality.js`, `moon-phases.js` — present version, EAQI, and moon phase mini‑UI elements.

1. `js/modules/moon-phases.js` (Moon Phases)

- [API-008]: The module MUST export functions for moon phase icons, names, tooltips, and indicator creation.

- `getMoonPhaseIcon(phase:number): string` — returns moon phase emoji (🌑🌒🌓🌔🌕🌖🌗🌘) based on phase value (0-1).
- `getMoonPhaseName(phase:number): string` — returns Italian moon phase name (Luna Nuova, Primo Quarto, Luna Piena, etc.).
- `getMoonPhasePercentage(phase:number): number` — returns illumination percentage (0-100).
- `getMoonPhaseTooltip(phase:number): string` — returns HTML content for Bootstrap tooltip.
- `createMoonPhaseIndicator(cardId:string, phase:number, moonId:string): HTMLElement` — creates and inserts moon phase indicator element.

## Service Worker Requirements

- [SW-001]: Cache name MUST be versioned via constant `CACHE_NAME` in `service-worker.js`; bumping it MUST trigger a fresh install.
- [SW-002]: On install, the SW MUST pre‑cache the app shell (`urlsToCache`) including `data.json`, `data-precipitations.json`, fonts, and vendor JS/CSS.
- Fetch strategy requirements:
  - [SW-003]: Navigations MUST use network‑first with cache fallback to `./` or `index.html`.
  - [SW-004]: `data.json` and `data-precipitations.json` MUST use stale‑while‑revalidate in the SW cache.
  - [SW-005]: Other assets MUST use cache‑first with network fallback.
- [SW-006]: On activate, old caches MUST be deleted.
- [SW-007]: On activate, clients MUST be claimed.
- [SW-008]: The SW MUST listen for `'SKIP_WAITING'` messages to activate immediately when instructed.

## Caching and Persistence Parameters

- [CACHE-001]: Local cache key MUST be `weatherDataV1` with TTL `DATA_CACHE_TTL_MS = 3 h`.
- [CACHE-002]: Chart mode preference key MUST be `chartModeV1`.
- [CACHE-003]: Client fetches of `data.json` and `data-precipitations.json` MUST include `?nocache=<floor(now/60s)>`.
- [RUN-001]: The App MUST auto‑refresh data every 30 minutes.
- [RUN-002]: On fetch error, the App SHOULD retry after ~60 seconds with jitter.
- [CACHE-004]: Theme preference (if not set to system) MUST be persisted locally (e.g., localStorage) with a stable key and applied early during startup to avoid a flash of incorrect theme.

## Error Handling and Resilience

- [ERR-001]: If network fetch fails, the App SHOULD load from localStorage cache and inform the user with a transient toast. When going online/offline, an info toast SHOULD be emitted and the offline badge toggled.
- [ERR-002]: Chart builders MUST defensively destroy any previous Chart instance and associated tooltip elements to avoid leaks or duplicate DOM.
- [ERR-003]: Plugins MUST be tolerant of missing scales or datasets and NOOP safely.

## Performance Requirements

- [PERF-001]: Initial page load SHOULD complete within a few seconds on 3G; cache‑buster SHOULD align to the minute to avoid excessive invalidation.
- [PERF-002]: DOM and Chart.js operations SHOULD be O(24) per chart with minimal layout thrashing; fonts SHOULD be awaited (`document.fonts.ready`) to ensure glyph rendering.

## Accessibility and Internationalization

- [A11Y-001]: The UI MUST provide ARIA labels for day cards, weather icons, and control buttons.
- [A11Y-002]: Numerics MUST use Italian locale formatting where applicable.
- [A11Y-003]: Tooltips MUST be dismissible and not trap focus; announcements SHOULD use a polite live region.
- [A11Y-004]: Color contrast in all themes MUST meet WCAG 2.1 AA (or better) for text and essential UI components.

## Security and Privacy Considerations

- [SEC-001]: The App MUST store only ephemeral weather data in localStorage; no PII MUST be collected. SW caching MUST store only static assets and the latest data files.
- [SEC-002]: External network calls SHOULD be limited to fetching local `data.json` served by the hosting environment; third‑party trackers MUST NOT be used.

## Release and CI

- [REL-001]: Releases SHOULD follow Conventional Commits with automated changelog generation; weather data updates via GitHub Actions occur hourly.
- [REL-002]: Bumping `CACHE_NAME` in `service-worker.js` MUST be coordinated with a release so users see the update prompt.

## Backwards Compatibility

- [BC-001]: Additive fields in `data.json` are backward compatible.
- [BC-002]: Removing or renaming fields referenced by this RFC is a breaking change and MUST bump a major version.

## Open Questions

- Actual vs forecast precipitation blending for “today” is implemented but currently disabled in UI. Decide whether to enable after validating data quality.
- Define a policy for handling missing `air_quality` section (mode should gracefully fall back to precipitation).

## Appendix A: Chart Mode Datasets

- Precipitation: `line(y='y', 0..100)` + `bar(y1='y1', 0..maxPrecip)`.
- Temperature: `line(temp)` + `line(apparent, dashed)` + optional `bar(humidity)` + 21°C reference line + 0°C reference line (when min temp < 0).
- Wind: `bar(speed)` + arrows plugin from `wind_direction_10m`.
- Pressure: `bar(delta)` + 1013 line + optional weather icons.
- Air Quality: `bar(EAQI)` + optional `line(UV)` + UV alert line.

## References

- RFC 2119: Key words for use in RFCs to Indicate Requirement Levels.
- Chart.js documentation (matching local UMD build).
- Open-Meteo API documentation <https://open-meteo.com/en/docs>.
