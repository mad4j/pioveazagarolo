# Changelog (Auto-Generato)

Generato da _scripts/generate-changelog.js

## [1.8.0] - 2025-09-10

### Features
- Add EAQI chart mode infrastructure and navigation (efed2fc4)
- Add "doppio click per cambiare" to navigation tooltip and remove double-click tooltips (a944785f)
- Add tooltip display for visualization mode changes (ced8aee5)
- Move navigation dots to footer and add version tooltip functionality (bd8e9d48)
- Implement improved pressure chart scaling for 1013 hPa reference line (6758a501)
- Add pressure delta bars to pressure chart mode (e58dd787)
- feat(wind): add Italian wind names to direction tooltips (e504e776)
- Add 1013 hPa reference line to pressure charts and remove other grid lines (b4d2fc64)
- feat: Complete hourly weather icons implementation (08c2c248)
- feat: Add hourly weather code icons to pressure charts (4075ce5c)
- Improve apparent temperature line visibility in temperature charts (070355d4)
- Improve apparent temperature line visibility in charts (d919d877)
- Complete humidity feature implementation with testing and validation (2acf8335)
- Add hourly humidity visualization to temperature charts (c700428d)
- Add hourly pressure mode to weather charts (654afbde)
- Add pressure chart mode functionality (0431d769)
- Add wind chart mode implementation (f760345f)
- Implement chart mode toggle improvements (2c3690a4)
- feat: Implement synchronized chart switching and remove chart bullets (e85e6774)
- feat: Add hourly temperature charts with double-click toggle functionality (ff5dcad2)
- feat(ui): format daylight hours as "12h23m" in chart tooltips (cdde81c3)
- Add apparent temperature tooltip functionality (cac92238)

### Fix
- Debug EAQI chart mode functionality - navigation working, fixing module imports (f44702dd)
- Fix weather icons to use theme-based colors instead of day/night (d7312e86)
- Fix delta bars alignment to center on 1013 hPa reference line (2a4c362f)
- Fix wind mode chart tooltip: remove degrees and align direction entry (2264eb16)
- Fix wind mode chart tooltip: remove degrees and fix alignment (fe51bffb)
- Fix wind direction icon color in day mode to use blue (#3498db) (b22f1e12)
- Fix wind direction icon visibility in dark mode (d91ebad1)
- Fix humidity scale to always be fixed at 0%-100% (e1cd1aa2)
- fix: Hide chart tooltips immediately on mode switch (fd52128a)
- fix: restore pull-to-refresh gesture while preserving text selection prevention (729a320b)
- Add direction icon for wind chart tooltip (partial fix) (ed7aa0c3)
- Fix wind arrow rotation to center around rotation point instead of tip (76ac5c13)
- Fix wind direction icon to point where wind goes TO instead of comes FROM (d628c672)
- Fix PWA application: resolve JavaScript syntax error and restore missing script (80c67c37)
- Fix charts.js formatting and complete wind chart implementation (88029d17)
- fix: Resolve mobile double-tap detection for chart mode switching (6dffd309)
- fix: Improve temperature chart fallback logic and update cache version (d98103df)
- Fix air quality needle visibility in dark mode (50db804e)

### Performance
- Final validation: Tooltip functionality working perfectly (a70e52b9)
- Final validation: Wind direction icons working perfectly in all modes (50e04672)

### Docs
- docs: comprehensive README update with badges, architecture, and improved structure (709fc453)

### Other
- chore(release): prepare 1.8.0 (1616043c)
- Remove test files and update service worker cache (c0d0f286)
- Move last update time to header top left while keeping title centered (bf4c9b37)
- Initial plan (c8612573)
- chore: aggiornamento dati meteo (rolling) (21642f8b)
- chore: aggiornamento dati meteo (rolling) (6a7a7ebf)
- chore: aggiornamento dati meteo (rolling) (7444dad5)
- Complete EAQI visualization mode implementation - fully functional (684482cb)
- Initial plan (e30ee0ba)
- chore: aggiornamento dati meteo (rolling) (252fe5bc)
- Remove tooltip instruction from chart mode tooltip (44d10af3)
- chore: aggiornamento dati meteo (rolling) (4ddb8f0c)
- Show tooltip on double-click chart mode changes (9fade5a2)
- chore: aggiornamento dati meteo (rolling) (bff7e99e)
- Initial plan (2bc23bf6)
- Update weather code selection logic to use highest code in pressure visualization (3ef3db7b)
- Initial plan for weather code selection logic update (7d98dc9a)
- Initial plan (2106ffc1)
- Reduce press duration for version tooltip (918911ed)
- chore: aggiornamento dati meteo (rolling) (c3972df8)
- Make navigation dots more compact, ensure title centering, and uniform active dot color (1005b963)
- Implement navigation dots for chart mode selection (8b65be8a)
- Initial plan (1e5ec0a5)
- Complete weather icons color enhancement for pressure mode (31197a1a)
- Implement weather icon color changes for pressure mode (bf5bbcd1)
- Initial plan (658cf1a9)
- Move mode change tooltip to bottom and show on page load (f41f2e81)
- Move mode change tooltip to bottom and show on page load (87b17b6f)
- Initial plan (e9980f4f)
- chore: aggiornamento dati meteo (rolling) (708d5373)
- Implement localStorage persistence for chart mode - partial working (62bfb998)
- Initial plan (89a11a17)
- chore: aggiornamento dati meteo (rolling) (91b754e8)
- Initial plan (d5c6dd9b)
- Initial plan (4f00de5a)
- Initial plan (8d13bfbc)
- chore: aggiornamento dati meteo (rolling) (d3dd5969)
- Initial analysis of wind mode chart tooltip issue (aade76aa)
- Initial plan (25a4d024)
- chore: aggiornamento dati meteo (rolling) (0d6b9b7f)
- Update 1013 hPa line: green color, dashed style, centered scale (d2f5c48e)
- chore: aggiornamento dati meteo (rolling) (081b9000)
- Initial plan (e66aee99)
- chore: aggiornamento dati meteo (rolling) (783d1dfb)
- chore: aggiornamento dati meteo (rolling) (166439c7)
- Initial plan (2062c9a1)
- chore: aggiornamento dati meteo (rolling) (6ceb5784)
- chore: aggiornamento dati meteo (rolling) (1bca9621)
- Final implementation of 3-hour weather icons for pressure mode (4e0c93b3)
- Implement 3-hour interval weather icons for pressure mode charts (6f68dfcf)
- Initial plan (a00f4fe0)
- chore: aggiornamento dati meteo (rolling) (53379f87)
- Initial plan (379cee2b)
- chore: aggiornamento dati meteo (rolling) (a522193e)
- chore: aggiornamento dati meteo (rolling) (268f7f8e)
- Change pressure data from surface to sea level (pressure_msl) (74aefabc)
- Initial plan (9b7b9e4a)
- Initial plan (1a509610)
- Initial plan (1e25b0b7)
- chore: aggiornamento dati meteo (rolling) (22758f0a)
- Initial plan (c3a66d2d)
- Initial plan (de0a7670)
- chore: aggiornamento dati meteo (rolling) (8c54b007)
- Initial plan (91f62254)
- Update notes.txt (48bfa234)
- chore: aggiornamento dati meteo (rolling) (47185f1f)
- Complete hourly pressure mode implementation with testing validation (cc76e870)
- Initial plan (2d31fd8d)
- chore: aggiornamento dati meteo (rolling) (4908171b)
- Prevent text selection on weather cards and reformat charts.js (b2fd5041)
- chore: aggiornamento dati meteo (rolling) (dcd2e56d)
- chore: aggiornamento dati meteo (rolling) (b1b43e9e)
- Initial plan (7d884f05)
- Use meteorological convention for wind direction display (a8c65657)
- Initial plan (3ac19239)
- chore: aggiornamento dati meteo (rolling) (ab385000)
- Initial plan (083cb625)
- chore: aggiornamento dati meteo (rolling) (b314e4d5)
- chore: aggiornamento dati meteo (rolling) (a68e1034)
- Initial plan (3a8391c7)
- Initial plan (911344b0)
- chore: aggiornamento dati meteo (rolling) (1f4ac3d4)
- chore: aggiornamento dati meteo (rolling) (625b0ee7)
- Initial plan (886ce097)
- Initial plan (bb39f746)
- chore: aggiornamento dati meteo (rolling) (d086cc0b)
- Initial plan (b5550e9a)
- chore: aggiornamento dati meteo (rolling) (39b2162c)
- Initial plan (45748866)
- chore: aggiornamento dati meteo (rolling) (efc22f14)
- Initial analysis: Air Quality needle dark mode issue (2c6de3ca)
- Initial plan (e8e62070)
- chore: aggiornamento dati meteo (rolling) (198150ac)
- chore: aggiornamento dati meteo (rolling) (ddbb64bb)

## [1.7.2] - 2025-08-31

### Features
- feat: enhance air quality icons with thicker lines and 270-degree arc (1779a39b)

### Fix
- Implement air quality gauge restyling: thicker arc, fixed needle color, -45° rotation (85e0e363)
- fix: correct air quality arc to properly display 270-degree range (8a898ff2)

### Other
- chore(release): prepare 1.7.2 (ed4d8b20)
- chore: aggiornamento dati meteo (rolling) (a83c74d6)
- Initial plan (7236eedb)
- Initial plan (d99ab4b6)
- Replace air quality circular icons with gauge-style icons (19caecbe)
- Initial analysis of air quality icon replacement task (ce6c0933)
- Initial plan (6d11816c)
- chore: aggiornamento dati meteo (rolling) (eaec1bdf)

## [1.7.1] - 2025-08-31

### Fix
- Fix air quality icons display by calculating daily maximums from hourly data (acdef8cd)

### Other
- chore(release): prepare 1.7.1 (e1a2444c)
- Unify air quality tooltip styling with chart tooltips (f97c8ac7)
- Initial plan (1bd1b0a6)
- chore: aggiornamento dati meteo (rolling) (6a3c341c)
- Reduce air quality icon size from 20px to 16px (37b9c371)
- Transform air quality icons to simple colored dots and update tooltips (8f256218)
- Initial plan (36006a9d)
- chore: aggiornamento dati meteo (rolling) (acbb0d84)
- Initial assessment: Air quality icons not displaying due to data structure mismatch (fe16fc2d)
- Initial plan (7f88e591)
- chore: aggiornamento dati meteo (rolling) (3a024a8c)

## [1.7.0] - 2025-08-31

### Features
- feat: move air quality icons to right of temperature column (3d18ff79)
- feat: implement air quality (EAQI) indicators with tooltips (c864c492)
- feat: plan air quality implementation for EAQI indicators (20af54e3)
- en(ci): add .nojekyll file to project (a940dfe2)

### Other
- chore(release): prepare 1.7.0 (f9f2e32c)
- Update service-worker.js (6df9a790)
- chore: restore original data.json and finalize air quality implementation (f1390cfa)
- Initial plan (5bef9cff)
- chore: aggiornamento dati meteo (rolling) (dec9bc71)
- Change cron schedule to run every 45 minutes (d594713f)
- Change workflow schedule to run every 30 minutes (29120351)
- chore: aggiornamento dati meteo (rolling) (f640889d)
- chore: auto-update CHANGELOG for 1.6.4 (6255f8d9)

## [1.6.4] - 2025-08-21

### Other
- chore(release): prepare 1.6.4 (af6c2698)
- fic(ui): comment out precipitation blending and summary logic (ea83e287)
- chore: aggiornamento dati meteo (rolling) (6a211269)
- chore: aggiornamento dati meteo (rolling) (cec7919c)

## [1.6.3] - 2025-08-20

### Fix
- fix(ci): switch to rolling amend for weather data commits (885c5788)
- fix(ci): removed unused file (a0431383)

### Data Updates
1 commit di aggiornamento dati

### Other
- chore(release): prepare 1.6.3 (ef523fc5)
- chore: aggiornamento dati meteo (rolling) (1994c0c3)
- chore: aggiornamento dati meteo (rolling) (cb92d7d0)
- chore: aggiornamento dati meteo (rolling) (1c047668)
- en(ci): update workflow schedule to run every 15 minutes (dd0e0e1d)
- chore: aggiornamento dati meteo (rolling) (6a245df0)
- chore: aggiornamento dati meteo (rolling) (71904c1b)
- chore: auto-update CHANGELOG for 1.6.2 (021b3fd1)

## [1.6.2] - 2025-08-20

### Fix
- fix(pwa): update service worker to cache package.json (8f46cd95)

### Data Updates
1 commit di aggiornamento dati

### Other
- chore: auto-update CHANGELOG for 1.6.1 (3c2e5329)

## [1.6.1] - 2025-08-20

### Other
- Update package.json (fc1ead1c)
- Create update-precipitation.js (f993591a)
- chore: auto-update CHANGELOG for 1.6.0 (66f1774c)

## [1.6.0] - 2025-08-20

### Other
- en(ui): enhance today's precipitation summary to use future hours (7ab176ae)
- chore: auto-update CHANGELOG for 1.5.4 (b7e4b14a)

## [1.5.4] - 2025-08-19

### Other
- chore(release): prepare 1.5.4 (b6d13732)
- en(ci): remove version/build info files and update version handling (7e23ecee)
- en(ui): style version info text in footer (ae704f5f)
- chore: auto-update CHANGELOG for 1.5.3 (d9c5faff)

## [1.5.3] - 2025-08-19

### Data Updates
1 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.3 (2bf736bb)
- chore: test release (51a4eaf1)
- chore: auto-update CHANGELOG (623de1cf)
- Remove custom versioning and build scripts (a064782b)

## [1.5.2] - 2025-08-19

### Data Updates
2 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.2 (e713a7d3)
- Update version to 1.5.2 and adjust version info usage (b9f6f40b)
- Remove unused version info CSS and update footer markup (226a89d2)
- removed unused files (01af19fb)

## [1.5.1] - 2025-08-19

### Data Updates
6 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.1 (9444c77f)
- Update build-info.json (01f54806)
- Update service-worker.js (9da94289)
- Update version.json (f6bd7e55)
- Update version.json (2db0d968)
- Update build.yml (03184951)

## [1.5.0] - 2025-08-19

### Features
- feat: implement automatic version management system (f6ecd5b7)
- en(ui); improve chart sunrise/sunset icons and code clarity (fed8f3e5)

### Build
- build(pages): add Jekyll exclude config to skip tooling and meta files (cd14216a)

### Tests
- test: complete version management system validation (498f34be)

### Data Updates
25 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.0 (d3976df4)
- en(ui): display version without patch if patch is zero (b0e0ee56)
- en(ci): automate version sync and cache bump in release workflow (2e5a461a)
- chore: test hook (35d61b4c)
- update (2a06b9bc)
- Initial plan for automatic version management (b260fc52)
- Initial plan (e858a9ad)
- en(ui): minify and optimize chart module code (7ff75d2d)
- chore: auto-update CHANGELOG for 1.4.1 (22263a22)

## [1.4.1] - 2025-08-19

### Features
- en(ui): improve chart tooltip and adjust rain info styles (95e79da2)
- en(ui): improve day-info alignment and spacing in CSS (c6572867)
- added meteo bulletin (437f2c14)
- feat(ci): generation of meteo bulletin (bb65e873)
- en(ui): improve rain percentage display with better alignment (4d80ff8f)
- en(pwa): remove duplicate icon entry from manifest.json (74dd8dda)
- Add sunrise and sunset information to weather charts (69fd834e)
- feat: Add sunrise/sunset icons to weather charts (1b566b79)
- Initial analysis: Add sunrise/sunset feature planning (b4182805)
- en(ci): added sunraise and sunset information (62dbab2c)

### Fix
- Update debug-mobile.js (216b7bac)
- fix(ci): added bulletin dump (fd7c5808)
- fix(ci): added write permissions to meteo.yml (f7eaefa1)
- en(ui): fixed footer last-update style (af2bb7ad)
- fix(ci): fixed OpenMeteo API curl command for sunraise and sunset. (e3cbb2cf)
- en(ui): fix rain unit display and reorder rain percentage in UI (6bc8798a)

### Docs
- docs: validate and confirm GitHub Copilot instructions are comprehensive and accurate (9d94e051)

### Data Updates
78 commit di aggiornamento dati

### Other
- chore(release): prepare 1.4.1 (1a693945)
- Update service-worker.js (a3e8f100)
- Update main.css (1ef5d079)
- Update main.css (e71c9f7e)
- en(ui): more space for diagrams (dcbb5f0f)
- Update main.css (e986e7eb)
- Implement precipitation probability clearing for past hours in Today chart (1ced176e)
- Initial plan (005a10b3)
- Initial plan (f8b59a84)
- Update meteo.yml (4990e437)
- en(ui): sunraise and sunset icon colors (65295998)
- en(ui): better readability of current temp in dark mode (e1d26c71)
- Align sunrise and sunset arrows at same height level (714aed61)
- Update sunrise/sunset icons to use simple arrows positioned at x-axis (4854053b)
- Initial plan (5b9600be)
- removed obsolete files (5e889d68)
- en(ui): better visualization of 0 values (09b9d200)
- en(ui): update precipitation units to mm/h in UI and tooltips (f92dd8a8)
- chore: auto-update CHANGELOG for 1.4.0 (51f82c91)

## [1.4.0] - 2025-08-17

### Features
- en(ui): added zero-padding to hour labels. (9cab411d)
- feat(ui): replace footer text with clock icon (c1c6e22f)
- feat(ui): remove time from current bar and move to footer (596396b2)
- en(ui): add current wind speed and direction display (1b15d5c8)
- en(ci): add more fields to weather data retrieval (a6e7403f)
- feat(ui): aggiunge sezione condizioni attuali con temperatura, pioggia, pressione e umidità (a1b32333)
- en(ci): added current humidity index (3032adb7)
- en(ci): added current weather data (c3979f11)

### Fix
- fix(ci): better precision on geographic coordinates (e11392f1)
- fix(ui): update precipitation unit from mm/h to mm (2c6ba0b7)
- fix(ui): aligned temperature units (40488419)
- fix(ui): prevent mobile tap card movement with comprehensive CSS override (4898f9c6)
- fix(ui): disable card movement on focus/hover in vertical layout (dd1fbbd6)
- fix: make external links open in new window/tab (ea4fa692)

### Refactor
- en(ui): refactor rain probability UI for improved layout (8ab6a561)
- en(ui): refactor rain probability layout for improved alignment (a5320bd9)
- en(code): refactor JS to ES modules and modularize codebase (1c204c27)
- en(code): refactor displayData and chart logic for clarity and reuse (b732e64b)

### Docs
- docs: complete comprehensive copilot instructions with final validation checklist (96be745a)
- docs: update copilot instructions with accurate file sizes, paths, and timing (bea333c8)
- docs: initial validation of copilot instructions requirements (76e9cd43)

### Data Updates
43 commit di aggiornamento dati

### Other
- chore(release): prepare 1.4.0 (eebd602d)
- en(ui): rename precipitation.json to data-precipitations.json (82743a75)
- en(ci): change workflow schedule to run every 15 minutes (7b8bb648)
- Ensure precipitation.json maintains exactly 24 values max (3fd58ba6)
- Implement effective precipitation values for past hours in Today chart (1ccb1aec)
- Initial plan (df931e01)
- Initial plan (6d24c491)
- Implement day/night icon support based on is_day field (06694175)
- Initial plan (03496f05)
- Update main.css (6fe8d624)
- Update main.css (a1ffb12c)
- en(ui): optimization of main.css (911449c2)
- en(ui): compacted current wind information (45cc9f40)
- Update main.js (be938867)
- Update index.html (5b9f1653)
- Use umbrella icon for current precipitation and display units as mm instead of mm/h (9188a78c)
- Replace precipitation icons with umbrella icons and update units to mm/h (6102690d)
- Initial plan (b52eae0a)
- Initial plan (20e4cdca)
- Initial plan (6a40f7bb)
- Initial plan (353be083)
- en(ci): update weather data every 30 min (3d04b3a5)
- en(ci): stored only the number of weather data updates (ec81c349)
- chore: auto-update CHANGELOG for 1.3.1 (8545ed60)

## [1.3.1] - 2025-08-16

### Fix
- fix(ui): reduced footer bottom padding (18acf10d)
- fix(ui): reduced fotter bottom margin (16a11ba0)
- fix(paw); added maskable icon (e08c715d)

### Docs
- docs(changelog): update for 1.3.0 (c1d18e8b)

### CI
- ci(release): add automated release workflow and script (5998922a)

### Data Updates
6 commit di aggiornamento dati

### Other
- chore(release): prepare 1.3.1 (6f1347a8)
- Update README.md (845cdef0)
- Update package-lock.json (c416848a)

## [1.3.0] - 2025-08-16

### Features
- feat(responsive): ottimizza layout mobile per evitare lo scroll verticale (537e2441)
- ux: cursore standard sul titolo con tooltip build (9efd154d)
- feat(pwa): tooltip titolo con build date e commit (cfb916db)
- ux(chart): auto-hide tooltip touch dopo 5s (dc8947d6)
- ux(chart): limita tooltip a 5s solo su dispositivi touch (b2841a83)
- ux(chart): auto-hide tooltip dopo 10s inattivita (e99f5f16)
- feat(pwa): mostra badge offline e forza update sw (cache v4) (783ae148)
- ux(theme): migliora leggibilità titoli giorno in dark mode (144db493)

### Fix
- fix(ui): restyling for vertical layout (dbebe790)
- fix(ui): restyling for vertical layout (e694de2f)
- fix(debug): redesign debug panel UI and improve controls (1f044a48)
- fixe(debug): add triple-click debug activator to mobile debug tools (cedd27b1)
- fix(project): remove zip resource and move scripts to _scripts (0a51b3d2)
- fix(responsive); bump cache version to v5 in service worker (e350b514)
- Fix footer visibility on Samsung mobile screens (1d80b867)
- fix(style): source code reformatted (7d4cc92e)
- fix(responsive): update card margin and revise responsive styles (25987a71)
- fix(responsive): avoid height overflow (668e0cd0)
- fix(responsive): removed overloaded media profiles (663899fc)
- fix(chart): rimuovi highlight del pallino quando il tooltip scompare su dispositivi touch (66cd6ce9)

### Refactor
- refactor: sposta main.js, service-worker.js e pwa-install.js in js/ (ed88ff30)

### Docs
- docs: add comprehensive copilot instructions (2b6d5d13)
- docs: initialize copilot instructions task (7834468f)
- docs: add commit guidelines & enhance changelog categories (662d3960)

### CI
- ci: fix workflow indentation and build-info on push (f6aabf65)
- ci: genera build-info in workflow schedulato (fa90f248)

### Data Updates
35 commit di aggiornamento dati

### Other
- chore(release): prepare 1.3.0 (version bump, notes) (f72e3c28)
- Update index.html (5b7efc19)
- Update service-worker.js (719f9c50)
- Update manifest.json (e0b807d9)
- Update manifest.json (b5d3f8a8)
- update (38a4ca68)
- Update main.js (d976f61a)
- Update index.html (beb87c30)
- update (1d153aef)
- update (b11f3568)
- Initial plan (6c9c52f7)
- style(pwa): ridotta leggermente la dimensione dei pulsanti Install e Update per maggiore compattezza UI (f32efcbf)
- Implement 5-second tooltip timeout for touchscreen devices (618f9638)
- Initial plan (62ef4ac8)
- Initial plan (bb6bab8b)
- Delete RELEASE_NOTES_0.2.0.md (d6a4ee43)
- Removed support for build-info (c17c0dba)
- removed build info support (f065e378)
- Update README.md (af0b2cd8)
- Create RELEASE_NOTES_0.2.0.md (9a37be1d)
- chore: setup automatic changelog generation (73cc8658)

## [1.2.0] - 2025-08-13

### Features
- Add overlay to left of current hour line in chart (ff54d867)
- Add current hour line plugin to today's chart (97e59235)
- Add localStorage caching for weather data (44ee26b0)
- Improve service worker update handling and cache version (b92ff578)
- Add offline assets, toasts, and PWA improvements (b9718c9f)
- added Meteo API credits (ec542aca)

### Fix
- Fixed Clear Sky codes (c9b7dba9)
- fixed weatherCode management (6b92635a)
- fixes (0a4a2836)

### Refactor
- Refactor install/update button styles and toast logic (55100375)

### Docs
- docs: renumber release 0.2.0 -> 1.2.0 (e8ace24b)
- docs: add standalone release notes for 0.2.0 (1b4ff33d)

### Data Updates
967 commit di aggiornamento dati

### Other
- chore: add CHANGELOG for 0.2.0 (166c4947)
- Update index.html (c828c868)
- Update main.css (902f940b)
- more margins (557df119)

## [1.1.0] - 2025-05-24

### Features
- added temperature (447cef6a)

### Fix
- fixed dynamic layout (066e54ee)

### Data Updates
23 commit di aggiornamento dati

### Other
- Update build.yml (757cf735)
- Update build.yml (e008c42d)
- Update index.html (15819bda)
- Update build.yml (a8b36c47)
- Update build.yml (32d4b819)
- Update index.html (20318e1b)
- Update README.md (d32b3ace)
- Update manifest.json (13a02cc7)
- Update build.yml (140dad51)

## [1.0.2] - 2025-05-22

### Data Updates
25 commit di aggiornamento dati

### Other
- Update manifest.json (fa3b3fd7)
- Update main.css (b175d982)
- Update main.css (50d72b54)

## [1.0.1] - 2025-05-20

### Data Updates
1 commit di aggiornamento dati

### Other
- Update main.css (5794bfe3)
- more screen sizes (83ea5614)

## [1.0.0] - 2025-05-20

### Features
- added color to precipitations bars (5f0a6a17)
- added last_update information directly in data.json file (533667a7)
- added layout profile for high-end mobiles (8de3564b)
- added last update date (82819ca3)
- added daily mm (9e06ad60)
- added install button (fb63e13c)
- added random string to avoid cached data (d6b2cd29)
- added watermark (56316357)
- PWA package (f21e2752)
- added dates (b09362ce)
- added favicon (968455b2)

### Refactor
- layout refactoring (5ab37bdc)
- project refactoring (38ee3f8e)
- refactoring (c691d4a4)

### Data Updates
3653 commit di aggiornamento dati

### Other
- Update main.css (9d2ce50f)
- Update main.css (a8e36b50)
- Update index.html (f05b1a82)
- Update index.html (6e3900c4)
- Update main.css (12560dd2)
- Update main.css (465402ba)
- Update main.css (6424dde6)
- Update main.css (f1e1f7b9)
- Update main.css (bcb0d94a)
- Update main.css (77e6a82f)
- Update main.js (33ca7d22)
- Update main.js (b36624ba)
- Update build.yml (f719aa56)
- Update service-worker.js (a131603f)
- Update service-worker.js (8b448b1c)
- Update main.js (f26bac1f)
- Update service-worker.js (2bbe44d4)
- Update build.yml (f954234f)
- Update build.yml (41609fc3)
- Update main.css (67e633bf)
- Update main.css (3d1d3a15)
- Update main.css (81adbad4)
- Update main.css (36156c8b)
- Update main.css (18bdf0da)
- Update main.css (1ed288d9)
- Update main.css (1ee3c49c)
- Update main.css (de57a458)
- Update main.js (3fb5b67c)
- compact layout (f1ec5f14)
- Update main.js (dfdebbb5)
- Update service-worker.js (99cbef4d)
- Create lastupdate.txt (9cfd2860)
- Update manifest.json (73293f29)
- Update manifest.json (c2808a25)
- Update manifest.json (fdfffe77)
- Update index.html (fad25f73)
- update (51ae7f4f)
- Update main.css (65901b33)
- Update main.css (8e46c6e6)
- Update main.css (1d0f4ac7)
- Update main.css (6d5ee07a)
- align of text (a5d4181b)
- Update index.html (c4e6d6cd)
- Update index.html (c3ea52fe)
- Update index.html (63554425)
- Update service-worker.js (3c57aac0)
- Update service-worker.js (a0168d0e)
- Update service-worker.js (500e6020)
- update (afad3538)
- Update manifest.json (8cd3c532)
- Update manifest.json (5c8b0150)
- Update manifest.json (980aca20)
- Update manifest.json (e45014c0)
- Update index.html (4aa22044)
- Update index.html (db94eaea)
- exclude resources from github pages (c6fc2f5f)
- update (469a0bfc)
- Update index.html (982b79e0)
- Update index.html (7e7d39c8)
- Update index.html (f452eacf)
- Update build.yml (0a2d8a51)
- Update index.html (cc6c1cfd)
- Update index.html (fa6c48b6)
- Update index.html (616d9b3f)
- Update index.html (8b6ca96a)
- Update index.html (d2550a78)
- Update build.yml (0064f6e1)
- use precipitation mm (d8be22e6)
- Update build.yml (0adbdfe5)
- Update index.html (b9f7542f)
- avoid cache if network available (6843751f)
- Update README.md (3d8ea13d)
- Update README.md (9bb48f8e)
- avoid label rotation (56a256c3)
- smaller dates (7be3c1b7)
- smooth lines in charts (389021d3)
- Update build.yml (0c6b9aa7)
- Update index.html (74db91e9)
- update (f5fd77e0)
- Update index.html (b4df9a72)
- Update index.html (33a52be4)
- Update index.html (e85d1ed7)
- Update index.html (d020b666)
- Update index.html (c61f8429)
- Update index.html (30d103e5)
- Update index.html (cc59e673)
- Update index.html (18b80e27)
- Update index.html (71772005)
- Update build.yml (00f95991)
- Update index.html (a47c88bb)
- Update index.html (6af94d95)
- Update index.html (1698eb84)
- Update index.html (ceefaa0b)
- Update index.html (9536d9bd)
- Update index.html (e2441d95)
- Update index.html (afc7fcd3)
- Update index.html (b6cb1d20)
- Update index.html (61d7d524)
- Update index.html (fa4194ae)
- Update index.html (0dd5d327)
- Update index.html (47261dc1)
- Update build.yml (d1ebc5db)
- Update index.html (fefec522)
- Create index.html (c83b8a03)
- Update build.yml (3bc5e2d6)
- Update build.yml (01173479)
- Update build.yml (0ec480e7)
- Create build.yml (e03cbfff)
- Initial commit (7ccd3a5c)

