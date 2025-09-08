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
- `npm run generate-changelog` -- generates CHANGELOG.md from git commit history and tags (~0.2s)
- `npm run build-info` -- generates build-info.json with build timestamp and commit info (~0.2s)

**Timing Expectations:**
- `npm install` -- completes in ~0.3 seconds
- All npm scripts complete in under 0.5 seconds
- **NEVER set timeouts > 30 seconds for any command** - all operations complete in under 1 second.

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
   - Confirm weather icons display correctly for codes: 0,1 (sunny), 61,63,65 (rain), 95,96,99 (thunderstorm)

4. **Mobile Responsiveness**:
   - Test on mobile viewport (375x667px) - layout should adapt correctly
   - Verify touch interactions work on mobile devices
   - Confirm all elements are readable and accessible on small screens

### Pre-commit Validation
Always run before committing changes:
- Test application loads without JavaScript errors
- Verify Service Worker registration succeeds
- Confirm PWA manifest is valid
- Check that data.json parses correctly

**No linting or automated tests exist** - manual validation is required.

## Architecture & Key Files

### Critical Files
- `index.html` -- Main application page (6.9KB)
- `js/main.js` -- Core application logic (33KB, 802 lines)
- `service-worker.js` -- PWA service worker (2.5KB, 85 lines)
- `js/pwa-install.js` -- PWA installation handler (1.4KB, 44 lines)
- `data.json` -- Weather data (updated every 30 minutes by GitHub Actions)
- `manifest.json` -- PWA manifest file

### Project Structure
```
/
├── index.html              # Main application
├── js/
│   ├── main.js             # Core JavaScript logic
│   └── pwa-install.js      # PWA install handler
├── service-worker.js       # PWA service worker
├── data.json               # Weather data (auto-updated)
├── manifest.json           # PWA manifest
├── package.json            # Node.js scripts only
├── css/                    # Stylesheets
│   ├── main.css           # Custom styles
│   └── weather-icons.min.css # Weather icon fonts
├── vendor/                 # Third-party libraries
│   ├── bootstrap/         # Bootstrap 5 CSS/JS
│   └── chart/             # Chart.js library
├── _scripts/               # Node.js utility scripts
│   ├── generate-changelog.js
│   ├── write-build-info.js
│   └── create-release-notes.js
└── .github/workflows/      # CI/CD automation
    ├── build.yml          # Weather data updates
    ├── changelog.yml      # Changelog generation
    └── release.yml        # Release automation
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5 (local vendor files)
- **Charts**: Chart.js (local vendor files)
- **PWA**: Service Worker, Web App Manifest
- **Scripts**: Node.js for changelog/build-info generation only
- **Data Source**: Open-Meteo API (updated via GitHub Actions)

## Key Functions & Code Patterns

### Weather Icon Mapping (`js/main.js`)
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
- Charts render automatically when data loads (confirmed working)

### Mobile Debug Features
- Built-in mobile debugging panel available in `js/main.js`
- Console logs show "🔍 DEBUG MOBILE - Script caricato" when loaded
- Debug functions: `window.exportDebugData()` and `window.emailDebugData()`

## Common Tasks

### Adding New Weather Features
1. Modify weather data processing in `displayData()` function in `js/main.js`
2. Update icon mapping in `getRainIconClass()` if needed
3. Test with current data.json structure
4. Verify Service Worker cache includes new assets in `service-worker.js`

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
  "latitude": 41.75,
  "longitude": 12.875,
  "current": {
    "time": "2025-08-17T05:30",
    "temperature_2m": 20.0,
    "rain": 0.00,
    "weather_code": 3,
    "pressure_msl": 978.4,
    "precipitation": 0.00,
    "relative_humidity_2m": 75
  },
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
  "last_update": "2025-08-17 05:43"
}
```

**Key Points:**
- Contains current conditions plus 72-hour forecasts
- Updated automatically every 30 minutes via GitHub Actions
- Uses Open-Meteo API with WMO weather codes
- Location: Zagarolo, Italy (41.75°N, 12.875°E)

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
- **Charts not loading**: Check Chart.js library path in index.html (`vendor/chart/chart.umd.min.js`)
- **Service Worker errors**: Verify cache list matches actual files in `service-worker.js`
- **PWA not installing**: Check manifest.json validity - icons must exist (`watermark-512x512.png`, `watermark-512x512-maskable.png`)
- **Data not updating**: Verify data.json structure and API response from Open-Meteo
- **Offline functionality not working**: Hard refresh (Ctrl+Shift+R) to clear SW cache and re-register

### Validation Commands
Always run these commands to verify the application state:
```bash
# Verify all dependencies
npm install

# Test all npm scripts work
npm run build-info
npm run generate-changelog

# Validate JSON files
python3 -c "import json; json.load(open('data.json')); print('data.json valid')"
python3 -c "import json; json.load(open('manifest.json')); print('manifest.json valid')"

# Start local server for testing
python3 -m http.server 8080
```

### GitHub Actions
- Weather data updates every 30 minutes via `build.yml` workflow
- Changelog generation on git tag push via `changelog.yml` workflow
- Automated release process via `release.yml` workflow (manual trigger)

### Local Development
- Use any static file server (Python, Node.js http-server, Live Server extension)
- No compilation or transpilation needed
- Hot reload not available - refresh browser manually
- Service Worker may cache aggressively - use Ctrl+Shift+R for hard refresh

### Complete Development Workflow
```bash
# 1. Setup project
cd /path/to/pioveazagarolo
npm install

# 2. Start development
python3 -m http.server 8080

# 3. Open http://localhost:8080 in browser
# 4. Make changes to files
# 5. Refresh browser to see changes (Ctrl+Shift+R if SW cached)

# 6. Before committing, validate:
npm run build-info  # Test scripts work
python3 -c "import json; json.load(open('manifest.json'))"  # Validate JSON

# 7. Test offline functionality:
# Stop server, refresh browser - should still work

# 8. Test mobile responsiveness:
# Use browser dev tools to test mobile viewport (375x667px)
```

## Performance Notes
- **Application startup**: Instant (static files only, no compilation)
- **Service Worker registration**: < 100ms (confirmed working in testing)
- **Chart rendering**: < 500ms with 72-hour dataset (charts load automatically)
- **PWA install prompt**: Automatic on supported browsers
- **Offline functionality**: Fully functional - all resources cached after first visit
- **Data loading**: Near-instant from localStorage cache, with background refresh

**Tested Performance:**
- Initial page load: < 1 second
- Chart canvas rendering: Immediate (confirmed with hasContent check)
- Service Worker activation: < 100ms
- Offline mode: Works perfectly (tested by stopping server)

## Final Validation Checklist

Run this complete checklist to verify everything works:

```bash
# 1. Setup and Dependencies
cd /path/to/pioveazagarolo
npm install                    # Should complete in ~0.3s

# 2. Test all scripts
npm run build-info            # Should complete in ~0.2s
npm run generate-changelog    # Should complete in ~0.2s

# 3. Validate JSON files
python3 -c "import json; json.load(open('data.json')); print('data.json valid')"
python3 -c "import json; json.load(open('manifest.json')); print('manifest.json valid')"

# 4. Start development server
python3 -m http.server 8080

# 5. Open http://localhost:8080 and verify:
#    - Weather cards display (Today/Tomorrow/Day After Tomorrow)
#    - Charts render in each card
#    - Current conditions show (temperature, humidity, pressure)
#    - Weather icons display correctly
#    - PWA install button appears

# 6. Test mobile responsive (browser dev tools):
#    - Switch to mobile viewport (375x667px)
#    - Verify layout adapts correctly

# 7. Test offline functionality:
#    - Stop server (Ctrl+C)
#    - Refresh browser page
#    - App should still load completely from Service Worker cache

# 8. Test Service Worker:
#    - Check browser console for "Service Worker registrato con successo"
#    - No JavaScript errors should appear
```

**Everything should work flawlessly if you follow these instructions exactly.**