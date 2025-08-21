# Changelog (Auto-Generato)

Generato da _scripts/generate-changelog.js

## [1.6.4] - 2025-08-21

### Other
- chore(release): prepare 1.6.4 (af6c269)
- fic(ui): comment out precipitation blending and summary logic (ea83e28)
- chore: aggiornamento dati meteo (rolling) (6a21126)
- chore: aggiornamento dati meteo (rolling) (cec7919)

## [1.6.3] - 2025-08-20

### Fix
- fix(ci): switch to rolling amend for weather data commits (885c578)
- fix(ci): removed unused file (a043138)

### Data Updates
1 commit di aggiornamento dati

### Other
- chore(release): prepare 1.6.3 (ef523fc)
- chore: aggiornamento dati meteo (rolling) (1994c0c)
- chore: aggiornamento dati meteo (rolling) (cb92d7d)
- chore: aggiornamento dati meteo (rolling) (1c04766)
- en(ci): update workflow schedule to run every 15 minutes (dd0e0e1)
- chore: aggiornamento dati meteo (rolling) (6a245df)
- chore: aggiornamento dati meteo (rolling) (71904c1)
- chore: auto-update CHANGELOG for 1.6.2 (021b3fd)

## [1.6.2] - 2025-08-20

### Fix
- fix(pwa): update service worker to cache package.json (8f46cd9)

### Data Updates
1 commit di aggiornamento dati

### Other
- chore: auto-update CHANGELOG for 1.6.1 (3c2e532)

## [1.6.1] - 2025-08-20

### Other
- Update package.json (fc1ead1)
- Create update-precipitation.js (f993591)
- chore: auto-update CHANGELOG for 1.6.0 (66f1774)

## [1.6.0] - 2025-08-20

### Other
- en(ui): enhance today's precipitation summary to use future hours (7ab176a)
- chore: auto-update CHANGELOG for 1.5.4 (b7e4b14)

## [1.5.4] - 2025-08-19

### Other
- chore(release): prepare 1.5.4 (b6d1373)
- en(ci): remove version/build info files and update version handling (7e23ece)
- en(ui): style version info text in footer (ae704f5)
- chore: auto-update CHANGELOG for 1.5.3 (d9c5faf)

## [1.5.3] - 2025-08-19

### Data Updates
1 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.3 (2bf736b)
- chore: test release (51a4eaf)
- chore: auto-update CHANGELOG (623de1c)
- Remove custom versioning and build scripts (a064782)

## [1.5.2] - 2025-08-19

### Data Updates
2 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.2 (e713a7d)
- Update version to 1.5.2 and adjust version info usage (b9f6f40)
- Remove unused version info CSS and update footer markup (226a89d)
- removed unused files (01af19f)

## [1.5.1] - 2025-08-19

### Data Updates
6 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.1 (9444c77)
- Update build-info.json (01f5480)
- Update service-worker.js (9da9428)
- Update version.json (f6bd7e5)
- Update version.json (2db0d96)
- Update build.yml (0318495)

## [1.5.0] - 2025-08-19

### Features
- feat: implement automatic version management system (f6ecd5b)
- en(ui); improve chart sunrise/sunset icons and code clarity (fed8f3e)

### Build
- build(pages): add Jekyll exclude config to skip tooling and meta files (cd14216)

### Tests
- test: complete version management system validation (498f34b)

### Data Updates
25 commit di aggiornamento dati

### Other
- chore(release): prepare 1.5.0 (d3976df)
- en(ui): display version without patch if patch is zero (b0e0ee5)
- en(ci): automate version sync and cache bump in release workflow (2e5a461)
- chore: test hook (35d61b4)
- update (2a06b9b)
- Initial plan for automatic version management (b260fc5)
- Initial plan (e858a9a)
- en(ui): minify and optimize chart module code (7ff75d2)
- chore: auto-update CHANGELOG for 1.4.1 (22263a2)

## [1.4.1] - 2025-08-19

### Features
- en(ui): improve chart tooltip and adjust rain info styles (95e79da)
- en(ui): improve day-info alignment and spacing in CSS (c657286)
- added meteo bulletin (437f2c1)
- feat(ci): generation of meteo bulletin (bb65e87)
- en(ui): improve rain percentage display with better alignment (4d80ff8)
- en(pwa): remove duplicate icon entry from manifest.json (74dd8dd)
- Add sunrise and sunset information to weather charts (69fd834)
- feat: Add sunrise/sunset icons to weather charts (1b566b7)
- Initial analysis: Add sunrise/sunset feature planning (b418280)
- en(ci): added sunraise and sunset information (62dbab2)

### Fix
- Update debug-mobile.js (216b7ba)
- fix(ci): added bulletin dump (fd7c580)
- fix(ci): added write permissions to meteo.yml (f7eaefa)
- en(ui): fixed footer last-update style (af2bb7a)
- fix(ci): fixed OpenMeteo API curl command for sunraise and sunset. (e3cbb2c)
- en(ui): fix rain unit display and reorder rain percentage in UI (6bc8798)

### Docs
- docs: validate and confirm GitHub Copilot instructions are comprehensive and accurate (9d94e05)

### Data Updates
78 commit di aggiornamento dati

### Other
- chore(release): prepare 1.4.1 (1a69394)
- Update service-worker.js (a3e8f10)
- Update main.css (1ef5d07)
- Update main.css (e71c9f7)
- en(ui): more space for diagrams (dcbb5f0)
- Update main.css (e986e7e)
- Implement precipitation probability clearing for past hours in Today chart (1ced176)
- Initial plan (005a10b)
- Initial plan (f8b59a8)
- Update meteo.yml (4990e43)
- en(ui): sunraise and sunset icon colors (6529599)
- en(ui): better readability of current temp in dark mode (e1d26c7)
- Align sunrise and sunset arrows at same height level (714aed6)
- Update sunrise/sunset icons to use simple arrows positioned at x-axis (4854053)
- Initial plan (5b9600b)
- removed obsolete files (5e889d6)
- en(ui): better visualization of 0 values (09b9d20)
- en(ui): update precipitation units to mm/h in UI and tooltips (f92dd8a)
- chore: auto-update CHANGELOG for 1.4.0 (51f82c9)

## [1.4.0] - 2025-08-17

### Features
- en(ui): added zero-padding to hour labels. (9cab411)
- feat(ui): replace footer text with clock icon (c1c6e22)
- feat(ui): remove time from current bar and move to footer (596396b)
- en(ui): add current wind speed and direction display (1b15d5c)
- en(ci): add more fields to weather data retrieval (a6e7403)
- feat(ui): aggiunge sezione condizioni attuali con temperatura, pioggia, pressione e umidità (a1b3233)
- en(ci): added current humidity index (3032adb)
- en(ci): added current weather data (c3979f1)

### Fix
- fix(ci): better precision on geographic coordinates (e11392f)
- fix(ui): update precipitation unit from mm/h to mm (2c6ba0b)
- fix(ui): aligned temperature units (4048841)
- fix(ui): prevent mobile tap card movement with comprehensive CSS override (4898f9c)
- fix(ui): disable card movement on focus/hover in vertical layout (dd1fbbd)
- fix: make external links open in new window/tab (ea4fa69)

### Refactor
- en(ui): refactor rain probability UI for improved layout (8ab6a56)
- en(ui): refactor rain probability layout for improved alignment (a5320bd)
- en(code): refactor JS to ES modules and modularize codebase (1c204c2)
- en(code): refactor displayData and chart logic for clarity and reuse (b732e64)

### Docs
- docs: complete comprehensive copilot instructions with final validation checklist (96be745)
- docs: update copilot instructions with accurate file sizes, paths, and timing (bea333c)
- docs: initial validation of copilot instructions requirements (76e9cd4)

### Data Updates
43 commit di aggiornamento dati

### Other
- chore(release): prepare 1.4.0 (eebd602)
- en(ui): rename precipitation.json to data-precipitations.json (82743a7)
- en(ci): change workflow schedule to run every 15 minutes (7b8bb64)
- Ensure precipitation.json maintains exactly 24 values max (3fd58ba)
- Implement effective precipitation values for past hours in Today chart (1ccb1ae)
- Initial plan (df931e0)
- Initial plan (6d24c49)
- Implement day/night icon support based on is_day field (0669417)
- Initial plan (03496f0)
- Update main.css (6fe8d62)
- Update main.css (a1ffb12)
- en(ui): optimization of main.css (911449c)
- en(ui): compacted current wind information (45cc9f4)
- Update main.js (be93886)
- Update index.html (5b9f165)
- Use umbrella icon for current precipitation and display units as mm instead of mm/h (9188a78)
- Replace precipitation icons with umbrella icons and update units to mm/h (6102690)
- Initial plan (b52eae0)
- Initial plan (20e4cdc)
- Initial plan (6a40f7b)
- Initial plan (353be08)
- en(ci): update weather data every 30 min (3d04b3a)
- en(ci): stored only the number of weather data updates (ec81c34)
- chore: auto-update CHANGELOG for 1.3.1 (8545ed6)

## [1.3.1] - 2025-08-16

### Fix
- fix(ui): reduced footer bottom padding (18acf10)
- fix(ui): reduced fotter bottom margin (16a11ba)
- fix(paw); added maskable icon (e08c715)

### Docs
- docs(changelog): update for 1.3.0 (c1d18e8)

### CI
- ci(release): add automated release workflow and script (5998922)

### Data Updates
6 commit di aggiornamento dati

### Other
- chore(release): prepare 1.3.1 (6f1347a)
- Update README.md (845cdef)
- Update package-lock.json (c416848)

## [1.3.0] - 2025-08-16

### Features
- feat(responsive): ottimizza layout mobile per evitare lo scroll verticale (537e244)
- ux: cursore standard sul titolo con tooltip build (9efd154)
- feat(pwa): tooltip titolo con build date e commit (cfb916d)
- ux(chart): auto-hide tooltip touch dopo 5s (dc8947d)
- ux(chart): limita tooltip a 5s solo su dispositivi touch (b2841a8)
- ux(chart): auto-hide tooltip dopo 10s inattivita (e99f5f1)
- feat(pwa): mostra badge offline e forza update sw (cache v4) (783ae14)
- ux(theme): migliora leggibilità titoli giorno in dark mode (144db49)

### Fix
- fix(ui): restyling for vertical layout (dbebe79)
- fix(ui): restyling for vertical layout (e694de2)
- fix(debug): redesign debug panel UI and improve controls (1f044a4)
- fixe(debug): add triple-click debug activator to mobile debug tools (cedd27b)
- fix(project): remove zip resource and move scripts to _scripts (0a51b3d)
- fix(responsive); bump cache version to v5 in service worker (e350b51)
- Fix footer visibility on Samsung mobile screens (1d80b86)
- fix(style): source code reformatted (7d4cc92)
- fix(responsive): update card margin and revise responsive styles (25987a7)
- fix(responsive): avoid height overflow (668e0cd)
- fix(responsive): removed overloaded media profiles (663899f)
- fix(chart): rimuovi highlight del pallino quando il tooltip scompare su dispositivi touch (66cd6ce)

### Refactor
- refactor: sposta main.js, service-worker.js e pwa-install.js in js/ (ed88ff3)

### Docs
- docs: add comprehensive copilot instructions (2b6d5d1)
- docs: initialize copilot instructions task (7834468)
- docs: add commit guidelines & enhance changelog categories (662d396)

### CI
- ci: fix workflow indentation and build-info on push (f6aabf6)
- ci: genera build-info in workflow schedulato (fa90f24)

### Data Updates
35 commit di aggiornamento dati

### Other
- chore(release): prepare 1.3.0 (version bump, notes) (f72e3c2)
- Update index.html (5b7efc1)
- Update service-worker.js (719f9c5)
- Update manifest.json (e0b807d)
- Update manifest.json (b5d3f8a)
- update (38a4ca6)
- Update main.js (d976f61)
- Update index.html (beb87c3)
- update (1d153ae)
- update (b11f356)
- Initial plan (6c9c52f)
- style(pwa): ridotta leggermente la dimensione dei pulsanti Install e Update per maggiore compattezza UI (f32efcb)
- Implement 5-second tooltip timeout for touchscreen devices (618f963)
- Initial plan (62ef4ac)
- Initial plan (bb6bab8)
- Delete RELEASE_NOTES_0.2.0.md (d6a4ee4)
- Removed support for build-info (c17c0db)
- removed build info support (f065e37)
- Update README.md (af0b2cd)
- Create RELEASE_NOTES_0.2.0.md (9a37be1)
- chore: setup automatic changelog generation (73cc865)

## [1.2.0] - 2025-08-13

### Features
- Add overlay to left of current hour line in chart (ff54d86)
- Add current hour line plugin to today's chart (97e5923)
- Add localStorage caching for weather data (44ee26b)
- Improve service worker update handling and cache version (b92ff57)
- Add offline assets, toasts, and PWA improvements (b9718c9)
- added Meteo API credits (ec542ac)

### Fix
- Fixed Clear Sky codes (c9b7dba)
- fixed weatherCode management (6b92635)
- fixes (0a4a283)

### Refactor
- Refactor install/update button styles and toast logic (5510037)

### Docs
- docs: renumber release 0.2.0 -> 1.2.0 (e8ace24)
- docs: add standalone release notes for 0.2.0 (1b4ff33)

### Data Updates
967 commit di aggiornamento dati

### Other
- chore: add CHANGELOG for 0.2.0 (166c494)
- Update index.html (c828c86)
- Update main.css (902f940)
- more margins (557df11)

## [1.1.0] - 2025-05-24

### Features
- added temperature (447cef6)

### Fix
- fixed dynamic layout (066e54e)

### Data Updates
23 commit di aggiornamento dati

### Other
- Update build.yml (757cf73)
- Update build.yml (e008c42)
- Update index.html (15819bd)
- Update build.yml (a8b36c4)
- Update build.yml (32d4b81)
- Update index.html (20318e1)
- Update README.md (d32b3ac)
- Update manifest.json (13a02cc)
- Update build.yml (140dad5)

## [1.0.2] - 2025-05-22

### Data Updates
25 commit di aggiornamento dati

### Other
- Update manifest.json (fa3b3fd)
- Update main.css (b175d98)
- Update main.css (50d72b5)

## [1.0.1] - 2025-05-20

### Data Updates
1 commit di aggiornamento dati

### Other
- Update main.css (5794bfe)
- more screen sizes (83ea561)

## [1.0.0] - 2025-05-20

### Features
- added color to precipitations bars (5f0a6a1)
- added last_update information directly in data.json file (533667a)
- added layout profile for high-end mobiles (8de3564)
- added last update date (82819ca)
- added daily mm (9e06ad6)
- added install button (fb63e13)
- added random string to avoid cached data (d6b2cd2)
- added watermark (5631635)
- PWA package (f21e275)
- added dates (b09362c)
- added favicon (968455b)

### Refactor
- layout refactoring (5ab37bd)
- project refactoring (38ee3f8)
- refactoring (c691d4a)

### Data Updates
3653 commit di aggiornamento dati

### Other
- Update main.css (9d2ce50)
- Update main.css (a8e36b5)
- Update index.html (f05b1a8)
- Update index.html (6e3900c)
- Update main.css (12560dd)
- Update main.css (465402b)
- Update main.css (6424dde)
- Update main.css (f1e1f7b)
- Update main.css (bcb0d94)
- Update main.css (77e6a82)
- Update main.js (33ca7d2)
- Update main.js (b36624b)
- Update build.yml (f719aa5)
- Update service-worker.js (a131603)
- Update service-worker.js (8b448b1)
- Update main.js (f26bac1)
- Update service-worker.js (2bbe44d)
- Update build.yml (f954234)
- Update build.yml (41609fc)
- Update main.css (67e633b)
- Update main.css (3d1d3a1)
- Update main.css (81adbad)
- Update main.css (36156c8)
- Update main.css (18bdf0d)
- Update main.css (1ed288d)
- Update main.css (1ee3c49)
- Update main.css (de57a45)
- Update main.js (3fb5b67)
- compact layout (f1ec5f1)
- Update main.js (dfdebbb)
- Update service-worker.js (99cbef4)
- Create lastupdate.txt (9cfd286)
- Update manifest.json (73293f2)
- Update manifest.json (c2808a2)
- Update manifest.json (fdfffe7)
- Update index.html (fad25f7)
- update (51ae7f4)
- Update main.css (65901b3)
- Update main.css (8e46c6e)
- Update main.css (1d0f4ac)
- Update main.css (6d5ee07)
- align of text (a5d4181)
- Update index.html (c4e6d6c)
- Update index.html (c3ea52f)
- Update index.html (6355442)
- Update service-worker.js (3c57aac)
- Update service-worker.js (a0168d0)
- Update service-worker.js (500e602)
- update (afad353)
- Update manifest.json (8cd3c53)
- Update manifest.json (5c8b015)
- Update manifest.json (980aca2)
- Update manifest.json (e45014c)
- Update index.html (4aa2204)
- Update index.html (db94eae)
- exclude resources from github pages (c6fc2f5)
- update (469a0bf)
- Update index.html (982b79e)
- Update index.html (7e7d39c)
- Update index.html (f452eac)
- Update build.yml (0a2d8a5)
- Update index.html (cc6c1cf)
- Update index.html (fa6c48b)
- Update index.html (616d9b3)
- Update index.html (8b6ca96)
- Update index.html (d2550a7)
- Update build.yml (0064f6e)
- use precipitation mm (d8be22e)
- Update build.yml (0adbdfe)
- Update index.html (b9f7542)
- avoid cache if network available (6843751)
- Update README.md (3d8ea13)
- Update README.md (9bb48f8)
- avoid label rotation (56a256c)
- smaller dates (7be3c1b)
- smooth lines in charts (389021d)
- Update build.yml (0c6b9aa)
- Update index.html (74db91e)
- update (f5fd77e)
- Update index.html (b4df9a7)
- Update index.html (33a52be)
- Update index.html (e85d1ed)
- Update index.html (d020b66)
- Update index.html (c61f842)
- Update index.html (30d103e)
- Update index.html (cc59e67)
- Update index.html (18b80e2)
- Update index.html (7177200)
- Update build.yml (00f9599)
- Update index.html (a47c88b)
- Update index.html (6af94d9)
- Update index.html (1698eb8)
- Update index.html (ceefaa0)
- Update index.html (9536d9b)
- Update index.html (e2441d9)
- Update index.html (afc7fcd)
- Update index.html (b6cb1d2)
- Update index.html (61d7d52)
- Update index.html (fa4194a)
- Update index.html (0dd5d32)
- Update index.html (47261dc)
- Update build.yml (d1ebc5d)
- Update index.html (fefec52)
- Create index.html (c83b8a0)
- Update build.yml (3bc5e2d)
- Update build.yml (0117347)
- Update build.yml (0ec480e)
- Create build.yml (e03cbff)
- Initial commit (7ccd3a5)

