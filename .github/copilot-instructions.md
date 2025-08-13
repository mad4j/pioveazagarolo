# Piove a Zagarolo? - Weather PWA

Progressive Web App (PWA) weather application for Zagarolo, Italy. Shows 3-day weather forecast with hourly precipitation probability and temperature data.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

This is a **static web application** with minimal Node.js tooling. No complex build system or compilation required.

### Essential Setup
- `npm install` -- completes in < 1 second. No external dependencies needed.
- Start local development server: `python3 -m http.server 8080` or any static file server
- Access application: `http://localhost:8080`

### Core Scripts (All complete in < 1 second)
- `npm run generate-changelog` -- generates CHANGELOG.md from git commit history and tags
- `npm run build-info` -- generates build-info.json with build timestamp and commit info

**NEVER set timeouts > 30 seconds for any command** - all operations complete in under 1 second.

## Validation

### Manual Testing Scenarios
Always test these scenarios after making changes:

1. **Basic Application Load**:
   - Start local server: `python3 -m http.server 8080`
   - Open `http://localhost:8080`
   - Verify weather cards display for Today/Tomorrow/Day After Tomorrow
   - Confirm weather icons, temperatures, and precipitation data appear

2. **PWA Functionality**:
   - Verify Service Worker registers (check browser console)
   - Test offline functionality by stopping server and refreshing
   - Confirm charts load correctly with Chart.js
   - Verify responsive design on mobile viewport

3. **Data Integrity**:
   - Check `data.json` contains valid weather data structure
   - Verify last_update timestamp is recent
   - Test `getRainIconClass()` function with different weather codes

### Pre-commit Validation
Always run before committing changes:
- Test application loads without JavaScript errors
- Verify Service Worker registration succeeds
- Confirm PWA manifest is valid
- Check that data.json parses correctly

**No linting or automated tests exist** - manual validation is required.

## Architecture & Key Files

### Critical Files
- `index.html` -- Main application page (5.7KB)
- `main.js` -- Core application logic (18KB, 433 lines)
- `service-worker.js` -- PWA service worker (2.4KB, 83 lines)
- `pwa-install.js` -- PWA installation handler (1.4KB, 44 lines)
- `data.json` -- Weather data (updated every 2 hours by GitHub Actions)
- `manifest.json` -- PWA manifest file

### Project Structure
```
/
├── index.html              # Main application
├── main.js                 # Core JavaScript logic
├── service-worker.js       # PWA service worker
├── pwa-install.js          # PWA install handler
├── data.json               # Weather data (auto-updated)
├── manifest.json           # PWA manifest
├── package.json            # Node.js scripts only
├── css/                    # Stylesheets
│   ├── main.css           # Custom styles
│   └── weather-icons.min.css # Weather icon fonts
├── vendor/                 # Third-party libraries
│   ├── bootstrap/         # Bootstrap 5 CSS/JS
│   └── chart/             # Chart.js library
├── scripts/                # Node.js utility scripts
│   ├── generate-changelog.js
│   └── write-build-info.js
└── .github/workflows/      # CI/CD automation
    ├── build.yml          # Weather data updates
    └── changelog.yml      # Changelog generation
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5 (local vendor files)
- **Charts**: Chart.js (local vendor files)
- **PWA**: Service Worker, Web App Manifest
- **Scripts**: Node.js for changelog/build-info generation only
- **Data Source**: Open-Meteo API (updated via GitHub Actions)

## Key Functions & Code Patterns

### Weather Icon Mapping (`main.js`)
```javascript
function getRainIconClass(weatherCode) {
    // Maps WMO weather codes to Weather Icons CSS classes
    // Test with codes: 0,1 (sunny), 61,63,65 (rain), 95,96,99 (thunderstorm)
}
```

### Data Caching
- Uses localStorage for weather data caching (3-hour TTL)
- Service Worker implements cache-first strategy for static assets
- Stale-while-revalidate for data.json

### Chart Configuration
- Three charts: Today (with current hour line), Tomorrow, Day After Tomorrow
- Custom Chart.js plugin for current hour overlay
- Responsive design with precipitation probability and intensity

## Common Tasks

### Adding New Weather Features
1. Modify weather data processing in `displayData()` function
2. Update icon mapping in `getRainIconClass()` if needed
3. Test with current data.json structure
4. Verify Service Worker cache includes new assets

### Updating Dependencies
1. Bootstrap: Replace files in `vendor/bootstrap/`
2. Chart.js: Replace files in `vendor/chart/`
3. Weather Icons: Update `css/weather-icons.min.css` and `font/` directory
4. Update Service Worker cache list in `service-worker.js`

### Release Process
1. Commit changes with conventional commit format (see GUIDELINES_COMMITS.md)
2. Create and push git tag: `git tag v1.x.x -m "Release v1.x.x" && git push origin v1.x.x`
3. GitHub Action automatically generates/updates CHANGELOG.md
4. Create GitHub Release manually from tag

## Data Format

### Weather Data Structure (data.json)
```json
{
  "hourly": {
    "precipitation": [/* 72 hours of data */],
    "precipitation_probability": [/* 72 hours of data */]
  },
  "daily": {
    "temperature_2m_max": [/* 3 days */],
    "temperature_2m_min": [/* 3 days */],
    "weather_code": [/* 3 days */],
    "precipitation_sum": [/* 3 days */],
    "precipitation_probability_max": [/* 3 days */]
  },
  "last_update": "2025-08-13 18:18"
}
```

### Weather Codes (WMO Standard)
- 0,1: Clear/sunny
- 2,3: Partly cloudy
- 45,48: Fog
- 51,53,55,56,57: Drizzle
- 61,63,65,80,81,82: Rain
- 71,73,75,77: Snow
- 95,96,99: Thunderstorm

## Troubleshooting

### Common Issues
- **Charts not loading**: Check Chart.js library path in index.html
- **Service Worker errors**: Verify cache list matches actual files
- **PWA not installing**: Check manifest.json validity
- **Data not updating**: Verify data.json structure and API response

### GitHub Actions
- Weather data updates every 2 hours via `build.yml` workflow
- Changelog generation on git tag push via `changelog.yml` workflow
- No other CI/CD processes exist

### Local Development
- Use any static file server (Python, Node.js http-server, Live Server extension)
- No compilation or transpilation needed
- Hot reload not available - refresh browser manually
- Service Worker may cache aggressively - use Ctrl+Shift+R for hard refresh

## Performance Notes
- **Application startup**: Instant (static files only)
- **Service Worker registration**: < 100ms
- **Chart rendering**: < 500ms with 72-hour dataset
- **PWA install prompt**: Automatic on supported browsers

All core functionality works offline after first visit due to Service Worker caching.