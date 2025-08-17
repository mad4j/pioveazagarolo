# Changelog (Auto-Generato)

Generato da _scripts/generate-changelog.js

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

- weather data updated (063168f)
- weather data updated (88cf564)
- weather data updated (faa9e62)
- weather data updated (ec24f2c)
- weather data updated (03b3e33)
- weather data updated (8367125)

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
