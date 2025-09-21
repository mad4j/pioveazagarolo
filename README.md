# Piove a Zagarolo? 🌧️

[![Update Weather Data](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml/badge.svg)](https://github.com/mad4j/pioveazagarolo/actions/workflows/build.yml)
[![Latest Release](https://img.shields.io/github/v/release/mad4j/pioveazagarolo)](https://github.com/mad4j/pioveazagarolo/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://mad4j.github.io/pioveazagarolo/)

**Progressive Web App per le previsioni meteo di Zagarolo** - Visualizza le probabilità di pioggia per oggi, domani e dopodomani con grafici orari interattivi e indicatori di qualità dell'aria.

![Screenshot dell'app](https://img.shields.io/badge/PWA-installabile-orange.svg)

## ✨ Caratteristiche

- 📱 **Progressive Web App** - Installabile come app nativa su desktop e mobile
- 🌡️ **Previsioni complete** - Temperatura, precipitazioni, umidità, pressione e vento
- 📊 **Grafici interattivi** - Chart.js per visualizzazioni orarie delle precipitazioni
- 🌫️ **Qualità dell'aria** - Indicatori EAQI (European Air Quality Index)
- 🔄 **Aggiornamento automatico** - Dati aggiornati ogni ora tramite Open-Meteo API
- 📱 **Design responsive** - Ottimizzato per tutti i dispositivi
- 🌙 **Modalità offline** - Funziona senza connessione internet
- ⚡ **Performance elevate** - Caricamento istantaneo con Service Worker

## 🏗️ Architettura e Tecnologie

### Stack Tecnologico
- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **UI Framework**: Bootstrap 5 (locale)
- **Grafici**: Chart.js (locale)
- **PWA**: Service Worker, Web App Manifest
- **API Dati**: Open-Meteo API
- **Build**: Node.js (solo per script di utility)
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

### Struttura del Progetto
```
├── index.html              # Pagina principale dell'applicazione
├── js/                     # Logica JavaScript modulare
│   ├── modules/           # Moduli dell'applicazione
│   └── main.js            # Script principale
├── css/                   # Fogli di stile
├── vendor/                # Librerie di terze parti (Bootstrap, Chart.js)
├── data.json              # Dati meteo (aggiornati automaticamente)
├── service-worker.js      # Service Worker per PWA
├── manifest.json          # Manifest PWA
└── .github/workflows/     # Automazioni CI/CD
```

### Flusso dei Dati
1. **GitHub Actions** esegue ogni ora il workflow di aggiornamento
2. Scarica dati da **Open-Meteo API** (Zagarolo: 41.75°N, 12.875°E)
3. Aggiorna `data.json` e `data-precipitations.json`
4. L'app carica i dati con caching localStorage (3h TTL)
5. **Service Worker** garantisce funzionamento offline

## 🚀 Demo e Installazione

### 🌐 Demo Live
Visita: **[https://mad4j.github.io/pioveazagarolo/](https://mad4j.github.io/pioveazagarolo/)**

### 📱 Installazione PWA
1. Apri l'app nel browser
2. Clicca sull'icona "Installa" nella barra superiore
3. Segui le istruzioni del browser per installare l'app
4. L'app sarà disponibile come applicazione nativa

## 🖐️ Interazioni

- Cambio modalità grafici: scorri orizzontalmente sulle card oppure tocca i puntini in basso.
- Tooltip: tocca le icone meteo o la temperatura per dettagli (ad es. percepita, descrizione meteo).
- Offline: dopo il primo avvio, l'app funziona anche senza connessione.

## File Dati Principali

- `data.json`: Previsioni e condizioni attuali (aggiornato ogni 30 min via GitHub Actions)
- `data-precipitations.json`: Precipitazioni reali orarie del giorno corrente (build incrementale, max 24 valori, reset giornaliero)

## 🛠️ Sviluppo Locale

### Prerequisiti
- Node.js 18+ (per script di utility)
- Python 3 (per server di sviluppo) o qualsiasi server HTTP statico

### Setup Rapido
```bash
# Clona il repository
git clone https://github.com/mad4j/pioveazagarolo.git
cd pioveazagarolo

# Installa dipendenze (solo per script)
npm install

# Avvia server di sviluppo
python3 -m http.server 8080
# oppure
npx http-server -p 8080

# Apri http://localhost:8080
```

### Script Disponibili
```bash
# Genera changelog da git tags
npm run generate-changelog

# Aggiorna precipitazioni incrementali
npm run update-precipitation
```

### Validazione
Prima di committare, verifica che:
- L'app si carichi senza errori JavaScript
- Il Service Worker si registri correttamente
- I grafici si visualizzino correttamente
- La modalità offline funzioni (ferma il server e ricarica)

## � Documentazione

- Requisiti e interfacce (RFC): [docs/RFC-001-piove-a-zagarolo-requirements.md](docs/RFC-001-piove-a-zagarolo-requirements.md)

## �🔄 Release e Contributi

### Processo di Release Automatico
Per pubblicare una nuova versione:
1. Usa il workflow GitHub **Release** (Actions > Release > Run workflow)
2. Specifica la versione SemVer (es: `1.8.0`)
3. Il workflow esegue automaticamente:
   - Bump di `package.json`
   - Creazione e push del tag
   - Rigenerazione `CHANGELOG.md`
   - Creazione GitHub Release con note

### Contribuire al Progetto
1. Fai fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commita le modifiche seguendo [Conventional Commits](GUIDELINES_COMMITS.md)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Linee Guida Commit
Il progetto usa [Conventional Commits](https://conventionalcommits.org/). Vedi [GUIDELINES_COMMITS.md](GUIDELINES_COMMITS.md) per dettagli.

## 📜 Licenza e Crediti

### Licenza
Questo progetto è distribuito sotto licenza [GNU General Public License v3.0](LICENSE).

### Crediti
- **Dati meteo**: [Open-Meteo API](https://open-meteo.com/) - Servizio gratuito per previsioni meteorologiche
- **Icone meteo**: [Weather Icons](https://github.com/erikflowers/weather-icons) - Font iconografico per condizioni meteorologiche
- **UI Framework**: [Bootstrap 5](https://getbootstrap.com/) - Framework CSS responsive
- **Grafici**: [Chart.js](https://www.chartjs.org/) - Libreria JavaScript per grafici interattivi

### Località
- **Zagarolo** (RM, Italia) - Coordinate: 41.75°N, 12.875°E
- Zona: Lazio, Provincia di Roma, Monti Prenestini

---

## 🔮 Roadmap e Miglioramenti Futuri

Roadmap delle prossime evoluzioni pianificate (in ordine di priorità):

### 🎯 Alta Priorità
- **TypeScript Migration**: Migrazione a TypeScript per maggiore robustezza
- **Unit Testing**: Test automatici per funzioni critiche (`getRainIconClass`, caching)
- **Dark Mode**: Modalità scura automatica e toggle manuale
- **Lighthouse CI**: Integrazione per monitoraggio performance/PWA/accessibilità

### 🚀 Media Priorità  
- **Lazy Loading**: Caricamento differito grafici non visibili
- **Multi-lingua**: Supporto inglese con sistema i18n
- **Finestra Asciutta**: Calcolo intervalli senza precipitazioni
- **Push Notifications**: Notifiche opzionali per allerte pioggia

### 💡 Idee Future
- **Multi-località**: Supporto per altre città tramite query string
- **Dati storici**: Confronto con medie storiche stesso periodo
- **Export grafici**: Condivisione PNG/SVG dei grafici
- **Widget embeddabile**: iframe per integrazione su altri siti

<details>
<summary>📋 Lista dettagliata miglioramenti</summary>

### Qualità del Codice & Build
- Introdurre bundler (Vite/esbuild) per minificazione e tree-shaking
- Aggiungere linting (ESLint) + formattazione (Prettier)
- Estrarre funzioni meteo in moduli separati per testabilità

### Performance
- Pre-caricare `data.json` prima del prossimo aggiornamento
- Compressione Brotli/Gzip a livello hosting
- `navigationPreload` API per ridurre latenza Service Worker

### PWA & Offline
- Fallback offline esplicito con ultimo snapshot
- Persistenza IndexedDB per storico dati (analisi trend)

### Accessibilità (a11y)
- Skip link per navigazione rapida
- Migliorare contrasto colori (Lighthouse/axe)
- Descrizioni testuali alternative per grafici
- Supporto `prefers-reduced-motion`

### UX & UI
- Tooltip avanzati con descrizioni fenomeni ("6 mm/h = pioggia forte")
- Indicatori trend rispetto al run precedente
- Skeleton loading per carte prima del caricamento

### Dati & Funzionalità
- Cumulato progressivo precipitazioni giornaliero
- Supporto qualità dell'aria estesa (PM2.5, PM10, O3)

### SEO & Metadati
- Meta Open Graph/Twitter Card
- JSON-LD con coordinate località
- Sitemap e robots.txt

### Sicurezza
- Content Security Policy e security headers
- Subresource Integrity per risorse esterne

### Monitoraggio
- Web Vitals logging opzionale (privacy-first)
- Versione app visibile nel footer

### Manutenzione
- Aggiornamento periodico dipendenze
- GitHub Issue Templates e CONTRIBUTING.md
- Dependabot per avvisi sicurezza

</details>

---

*Sezione aggiornata in base a feedback utenti e necessità emergenti. Contributi e suggerimenti sono sempre benvenuti!*

