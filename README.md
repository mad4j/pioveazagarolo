# Is It Raining in Zagarolo? 🌧️

[![Update Weather Data](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml/badge.svg)](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml)
[![Latest Release](https://img.shields.io/github/v/release/mad4j/pioveazagarolo)](https://github.com/mad4j/pioveazagarolo/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://mad4j.github.io/pioveazagarolo/)

**Progressive Web App for Zagarolo weather forecasts** — Hourly rain probability for Today, Tomorrow, and the Day After Tomorrow with interactive charts and air quality indicators.

![PWA Screenshot](https://img.shields.io/badge/PWA-installable-orange.svg)

## ✨ Features

- 📱 **Progressive Web App** – Installable on desktop and mobile
- 🌡️ **Complete forecasts** – Temperature, precipitation, humidity, pressure, wind
- 📊 **Interactive charts** – Local Chart.js for hourly visualization
- 🌫️ **Air quality** – EAQI (European Air Quality Index) indicators
- 🔄 **Automatic updates** – Data fetched hourly (client refresh up to every 30 min)
- 📱 **Responsive design** – Optimized for all devices
- 🌙 **Offline mode** – Works without an internet connection
- ⚡ **High performance** – Instant load via Service Worker caching

## 🏗️ Architecture & Technologies

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Local Bootstrap 5
- **Charts**: Local Chart.js
- **PWA**: Service Worker + Web App Manifest
- **Weather Data API**: Open-Meteo
- **Build Tooling**: Node.js (utility scripts only)
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

### Project Structure
```
├── index.html
├── js/
│   ├── modules/
│   └── main.js
├── css/
├── vendor/                # Local third‑party libraries (Bootstrap, Chart.js)
├── data.json              # Forecast + current conditions (updated hourly)
├── data-precipitations.json (optional observed hourly rain)
├── service-worker.js
├── manifest.json
└── .github/workflows/
```

### Data Flow
1. GitHub Actions workflow runs hourly
2. Fetches Open-Meteo data (Zagarolo: 41.75°N, 12.875°E)
3. Writes/updates `data.json` and (if available) `data-precipitations.json`
4. App loads data with localStorage caching (TTL 3h)
5. Service Worker provides offline capability (network / SW caching strategies)

## 🚀 Demo & Installation

### 🌐 Live Demo
https://mad4j.github.io/pioveazagarolo/

### 📱 Install as PWA
1. Open the app in a supported browser
2. Use the browser’s “Install” or “Add to Home Screen”
3. Launch it like a native app

## 🖐️ Interactions

- Switch chart modes: horizontal swipe on cards or tap navigation dots.
- Tooltips: tap weather icons or temperature for details (e.g., apparent temp, description).
- Offline: once loaded, it works without a connection.

## 📂 Main Data Files

- `data.json`: Current conditions + multi‑day forecast. Updated hourly by workflow. Client refresh interval: 30 minutes (with retry every 60s on failure).
- `data-precipitations.json`: Optional observed hourly precipitation (current day only, up to 24 points, resets daily).

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
# Open http://localhost:8080
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
- Offline reload works (stop server, refresh)

## 📄 Documentation

- Requirements & interfaces (RFC): [docs/RFC-001-piove-a-zagarolo-requirements.md](docs/RFC-001-piove-a-zagarolo-requirements.md)

## 🔄 Release & Contributions

### Automated Release Process
1. Run the GitHub Actions “Release” workflow
2. Provide a SemVer (e.g., `1.8.0`)
3. Workflow:
   - Bumps `package.json`
   - Creates & pushes tag
   - Regenerates `CHANGELOG.md`
   - Publishes GitHub Release with notes

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit using Conventional Commits
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

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

---

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

<details>
<summary>📋 Detailed Improvement List</summary>

### Code Quality & Build
- Introduce bundler (Vite / esbuild) for minification
- Add ESLint + Prettier
- Extract meteorological helpers for testability

### Performance
- Pre-fetch next `data.json` before scheduled refresh
- Brotli/Gzip compression (hosting level)
- `navigationPreload` API for SW

### PWA & Offline
- Explicit offline fallback snapshot
- IndexedDB persistence for historical trend analysis

### Accessibility (a11y)
- Skip link
- Color contrast improvements (Lighthouse / axe)
- Textual alternatives for charts
- Support `prefers-reduced-motion`

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

---

