# Is It Raining in Zagarolo? 🌧️

[![Update Weather Data](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml/badge.svg)](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml)
[![Latest Release](https://img.shields.io/github/v/release/mad4j/pioveazagarolo)](https://github.com/mad4j/pioveazagarolo/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://mad4j.github.io/pioveazagarolo/)
[![Installable PWA badge](https://img.shields.io/badge/PWA-installable-orange.svg)](https://mad4j.github.io/pioveazagarolo/)

**Progressive Web App for Zagarolo weather forecasts** — Hourly rain probability for Today, Tomorrow, and the Day After Tomorrow with interactive charts, air quality indicators, and offline capability.

## ✨ Features

- 📱 **Progressive Web App** – Installable on desktop and mobile
- 🌡️ **Complete forecasts** – Temperature, precipitation, humidity, pressure, wind
- 📊 **Interactive charts** – Local Chart.js for hourly visualization
- 🌫️ **Air quality** – EAQI (European Air Quality Index) indicators
- 🔄 **Automatic updates** – Data fetched hourly (client refresh up to every 30 min)
- 🌙 **Offline mode** – Works without an internet connection
- ⚡ **High performance** – Instant load via Service Worker caching
- 🛰️ **Local assets** – No external CDN dependencies (Bootstrap, Chart.js bundled locally)

## 🏗️ Architecture & Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5 (local)
- **Charts**: Chart.js (local UMD build)
- **PWA**: Service Worker + Web App Manifest
- **Weather Data API**: Open-Meteo
- **Data Files**: `data.json`, optional `data-precipitations.json`
- **Build Tooling**: Node.js (utility scripts only; no bundler yet)
- **CI/CD**: GitHub Actions (hourly data + release automation)
- **Hosting**: GitHub Pages

### Project Structure

```text
├── index.html
├── css/
├── js/
│   ├── main.js
│   └── modules/                # UI, charts, cache, icons, AQ, gestures, etc.
├── vendor/                     # Local third‑party libraries (Bootstrap, Chart.js)
├── data.json                   # Forecast + current conditions (hourly refresh)
├── data-precipitations.json    # Optional observed hourly precipitation
├── service-worker.js
├── manifest.json
└── docs/                       # RFC & documentation
```

### Data Flow

1. Hourly GitHub Action fetches Open-Meteo data for Zagarolo (41.75°N, 12.875°E).
1. Updates `data.json` (and `data-precipitations.json` if precipitation script used).
1. Client fetches `data.json?nocache=<minute>` to mitigate stale caches.
1. Data cached in `localStorage` (TTL 3 hours) and by the Service Worker (stale-while-revalidate for data files).
1. Charts + UI render from cached or freshly fetched data; periodic client refresh every 30 minutes.

## 🌐 Live Demo

[Live deployment](https://mad4j.github.io/pioveazagarolo/)

## 🖐️ Interactions

- Swipe horizontally (mobile) or tap navigation dots to change chart modes.
- Tap icons or temperature to view tooltips (apparent temperature, description, etc.).
- Works offline after first load (network-first for navigation, caching for assets & data).

## 📂 Main Data Files

- `data.json`: Current conditions + multi-day forecast (today, tomorrow, day after). Updated hourly.
- `data-precipitations.json`: Optional observed hourly precipitation for the current day (resets daily).

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- Python 3 (or any static HTTP server)

### Quick Start

```bash
git clone https://github.com/mad4j/pioveazagarolo.git
cd pioveazagarolo
npm install
python -m http.server 8080
# or: npx http-server -p 8080
# Then open http://localhost:8080
```

### Available Scripts

```bash
npm run generate-changelog      # Generate changelog from tags
npm run update-precipitation    # Incrementally update observed precipitation
```

### Validation Checklist

Before committing:

- App loads with no JavaScript errors
- Service Worker registers
- Charts render correctly
- Offline reload works (disable network, refresh)

## 📄 Documentation

- Requirements & interfaces (RFC): [docs/RFC-001-piove-a-zagarolo-requirements.md](docs/RFC-001-piove-a-zagarolo-requirements.md)

## 🔄 Release & Contributions

### Automated Release Process

1. Run the GitHub Actions “Release” workflow.
1. Provide a SemVer (e.g., `1.8.0`).
1. Workflow steps:
   - Bumps `package.json`
   - Creates & pushes tag
   - Regenerates `CHANGELOG.md`
   - Publishes GitHub Release with notes

### Contributing

1. Fork the repository
1. Create a feature branch: `git checkout -b feature/AmazingFeature`
1. Commit using Conventional Commits
1. Push: `git push origin feature/AmazingFeature`
1. Open a Pull Request

### Commit Guidelines

Uses Conventional Commits: see [GUIDELINES_COMMITS.md](GUIDELINES_COMMITS.md)

## 📜 License & Credits

### License

Released under [GNU GPL v3.0](LICENSE)

### Credits

- **Weather Data**: [Open-Meteo](https://open-meteo.com/)
- **Weather Icons**: [Weather Icons](https://github.com/erikflowers/weather-icons)
- **UI Framework**: [Bootstrap 5](https://getbootstrap.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/)

### Location

- **Zagarolo** (RM, Italy) – 41.75°N, 12.875°E (Lazio region)

## 🔮 Roadmap & Future Improvements

### 🎯 High Priority

- TypeScript migration
- Unit tests (e.g., `getRainIconClass`, caching)
- Dark Mode (auto + manual toggle)
- Lighthouse CI integration

### 🚀 Medium Priority

- Lazy loading non-visible charts
- English/Italian i18n (multi-language)
- Dry Interval (“rain-free window”) detection
- Optional rain alert push notifications

### 💡 Future Ideas

- Multi-location via query string
- Historical comparisons
- Export charts (PNG/SVG)
- Embeddable widget (iframe)

### Detailed Improvement Areas

Code Quality & Build:

- Introduce bundler (Vite / esbuild) for minification
- Add ESLint + Prettier
- Extract meteorological helpers for testability

Performance:

- Pre-fetch next `data.json` before scheduled refresh
- Brotli/Gzip compression (hosting level)
- `navigationPreload` API for Service Worker

PWA & Offline:

- Explicit offline fallback snapshot
- IndexedDB persistence for historical trend analysis

Accessibility (a11y):

- Skip link
- Color contrast improvements (Lighthouse / axe)
- Text alternatives for charts
- Support `prefers-reduced-motion`

UX & UI:

- Enhanced tooltips with phenomenon descriptions
- Trend indicators vs previous run
- Skeleton loading states

Data & Features:

- Cumulative daily precipitation
- Extended air quality metrics (PM2.5, PM10, O3)

SEO & Metadata:

- Open Graph / Twitter Cards
- JSON-LD with geo coordinates
- Sitemap & robots.txt

Security:

- Content Security Policy & security headers
- Subresource Integrity

Monitoring:

- Optional Web Vitals logging (privacy-first)
- App version footer

Maintenance:

- Dependency update cadence
- Issue templates & CONTRIBUTING.md
- Dependabot integration

---

*This roadmap evolves based on user feedback. Contributions welcome!*

### UX & UI

- Enhanced tooltips with phenomenon descriptions
- Trend indicators vs previous run
- Skeleton loading states

### Data & Features

- Cumulative daily precipitation
- Extended air quality metrics (PM2.5, PM10, O3)

### SEO & Metadata

- Open Graph / Twitter Cards
- JSON-LD with geo coordinates
- Sitemap & robots.txt

### Security

- Content Security Policy & security headers
- Subresource Integrity

### Monitoring

- Optional Web Vitals logging (privacy-first)
- App version footer

### Maintenance

- Dependency update cadence
- Issue templates & CONTRIBUTING.md
- Dependabot integration
</details>

*This roadmap evolves based on user feedback. Contributions welcome!*

---


