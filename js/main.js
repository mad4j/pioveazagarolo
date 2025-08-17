// Date formatter riusabile
const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
function formatDate(dateString) {
    return dayFormatter.format(new Date(dateString));
}

// Funzione per rilevare dispositivi touchscreen
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

// Mappa grafici per eventuale aggiornamento futuro
const chartInstances = {};

// Config giorno riusata (evita ricreazione ad ogni displayData)
const DAY_CONFIGS = [
    { key: 'today', index: 0, chartId: 'today-chart', cardId: 'today-card', iconId: 'today-icon' },
    { key: 'tomorrow', index: 1, chartId: 'tomorrow-chart', cardId: 'tomorrow-card', iconId: 'tomorrow-icon' },
    { key: 'dayaftertomorrow', index: 2, chartId: 'dayaftertomorrow-chart', cardId: 'dayaftertomorrow-card', iconId: 'dayaftertomorrow-icon' }
];
const ARIA_LABEL_DAY = ['oggi', 'domani', 'dopodomani'];

// Helper DOM breve
const $ = (id) => document.getElementById(id);

// Plugin linea ora corrente (Europa/Rome) per il grafico di "Oggi"
// La linea è calcolata solo al primo draw (cache) e non si aggiorna finché non si ricarica la pagina.
const currentHourLinePlugin = {
    id: 'currentHourLine',
    afterDraw(chart, args, opts) {
        if (chart.config?.data?.labels?.length !== 24) return; // aspettati 24 ore
        if (!opts) return;
        // Usa ora già cache oppure calcola e memorizza
        if (typeof opts._cachedHour !== 'number') {
            try {
                opts._cachedHour = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Rome' }).format(new Date()), 10);
                if (Number.isNaN(opts._cachedHour)) opts._cachedHour = new Date().getHours();
            } catch {
                opts._cachedHour = new Date().getHours();
            }
        }
        const hour = opts._cachedHour;
        const xScale = chart.scales.x;
        if (!xScale) return;
        const x = xScale.getPixelForValue(hour);
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        // Overlay grigio a sinistra della linea dell'ora corrente (solo chart oggi)
        try {
            const { left, right } = chart.chartArea;
            if (x > left) {
                ctx.fillStyle = opts.overlayColor || 'rgba(120,120,120,0.15)';
                ctx.fillRect(left, top, x - left, bottom - top);
            }
        } catch {}
    	ctx.strokeStyle = opts.color || '#27ae60';
        ctx.lineWidth = 1; // più fine
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.restore();
    }
};

function getDaySlice(array, dayIndex) {
    const start = dayIndex * 24;
    return array.slice(start, start + 24);
}

// ----- Caching configurazione -----
const DATA_CACHE_KEY = 'weatherDataV1';
const DATA_CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 ore (cron ogni 2h -> margine)
let lastToastMessage = '';

function loadCachedData() {
    try {
        const raw = localStorage.getItem(DATA_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data || !parsed.storedAt) return null;
        if (Date.now() - parsed.storedAt > DATA_CACHE_TTL_MS) return null; // scaduto
        return parsed;
    } catch {
        return null;
    }
}

function saveCachedData(data) {
    try {
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ storedAt: Date.now(), data }));
    } catch (e) {
        // Se quota piena prova a liberare e ritentare una sola volta
        try { localStorage.removeItem(DATA_CACHE_KEY); } catch {}
        try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ storedAt: Date.now(), data })); } catch {}
    }
}

function updateCardClass(cardId, percentage) {
    const card = document.getElementById(cardId);
    card.classList.remove('high-chance', 'medium-chance', 'low-chance');
    if (percentage >= 60) {
        card.classList.add('high-chance');
    } else if (percentage >= 30) {
        card.classList.add('medium-chance');
    } else {
        card.classList.add('low-chance');
    }
}

function getPrecipitationBarColor(value) {
    if (value > 30) return '#6c3483'; // Nubifragio: viola scuro
    if (value > 10) return '#b03a2e'; // Rovescio: rosso scuro
    if (value > 6) return '#e74c3c'; // Pioggia forte: rosso
    if (value > 4) return '#f39c12'; // Pioggia moderata: arancio
    if (value > 2) return '#27ae60'; // Pioggia leggera: verde
    if (value > 1) return '#3498db'; // Pioggia debole: azzurro
    return '#85c1e9'; // Sotto 1 mm/h: azzurro chiaro
}

function buildChart(target, probabilityData, precipitationData) {
    const ctx = document.getElementById(target);
    if (!ctx) return;
    if (chartInstances[target]) {
        chartInstances[target].destroy();
    }
    // Pre-calcolo colori (evita doppia map)
    const precipColors = precipitationData.map(getPrecipitationBarColor);
    const maxPrecip = (() => {
        const m = Math.max(...precipitationData, 1);
        if (m < 2) return 2; // scala minima
        return Math.ceil(m);
    })();
    chartInstances[target] = new Chart(ctx, {
    plugins: target === 'today-chart' ? [currentHourLinePlugin] : [],
        data: {
            labels: [...Array(24).keys()].map(hour => `${hour}:00`),
            datasets: [
                {
                    label: 'Probabilità (%)',
                    type: 'line',
                    fill: true,
                    // Chart.js v4 usa "tension" (lineTension deprecated)
                    tension: 0.4,
                    backgroundColor: 'rgba(52, 152, 219, 0.3)',
                    borderColor: 'rgb(41, 128, 185)',
                    borderWidth: 2,
                    data: probabilityData,
                    pointBackgroundColor: 'rgb(41, 128, 185)',
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y',
                },
                {
                    label: 'Precipitazione (mm/h)',
                    type: 'bar',
                    backgroundColor: precipColors,
                    borderColor: precipColors,
                    borderWidth: 1,
                    data: precipitationData,
                    yAxisID: 'y1',
                    order: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 5 },
            onHover: (event, activeElements, chart) => {
                // Implementa timeout di 3 secondi per dispositivi touchscreen
                if (isTouchDevice() && activeElements.length > 0) {
                    // Cancella qualsiasi timeout precedente
                    if (chart._tooltipTimeout) {
                        clearTimeout(chart._tooltipTimeout);
                    }
                    // Imposta nuovo timeout di 3 secondi
                    chart._tooltipTimeout = setTimeout(() => {
                        chart.tooltip.setActiveElements([], {x: 0, y: 0});
                        chart.setActiveElements([]);
                        chart.update('none');
                    }, 3000);
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    position: 'left',
                    grid: { drawOnChartArea: true, color: 'rgba(200, 200, 200, 0.2)', drawTicks: false },
                    ticks: { display: false, font: { family: "'Montserrat', sans-serif", size: 10 } }
                },
                y1: {
                    min: 0,
                    max: maxPrecip,
                    position: 'right',
                    grid: { drawOnChartArea: false, drawTicks: false },
                    ticks: { display: false, font: { family: "'Montserrat', sans-serif", size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6,
                        font: { family: "'Montserrat', sans-serif", size: 10 },
                        color: '#7f8c8d'
                    }
                }
            },
            plugins: {
                currentHourLine: { color: '#27ae60', overlayColor: 'rgba(128,128,128,0.18)' }, // opzioni plugin (solo se presente)
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleFont: { family: "'Montserrat', sans-serif", size: 12 },
                    bodyFont: { family: "'Montserrat', sans-serif", size: 12 },
                    callbacks: {
                        title: function (tooltipItems) {
                            return `Ore ${tooltipItems[0].label}`;
                        },
                        label: function (context) {
                            if (context.datasetIndex === 0) {
                                return `Probabilità: ${context.parsed.y}%`;
                            } else {
                                return `Precipitazione: ${context.parsed.y} mm`;
                            }
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false }
        },
    });
}

// Icone meteo basate su WMO weather_code
function getRainIconClass(weatherCode) {
    if ([95, 96, 99].includes(weatherCode)) return 'wi wi-thunderstorm';     // Temporale
    if ([85, 86].includes(weatherCode)) return 'wi wi-storm-showers';        // Neve
    if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'wi wi-rain'; // Pioggia
    if ([71, 73, 75, 77].includes(weatherCode)) return 'wi wi-snow';         // Neve
    if ([45, 48].includes(weatherCode)) return 'wi wi-fog';                  // Nebbia
    if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'wi wi-sprinkle'; // Pioviggine
    if ([2, 3].includes(weatherCode)) return 'wi wi-cloud';                  // Parzialmente nuvoloso
    if ([0, 1].includes(weatherCode)) return 'wi wi-day-sunny';              // Sereno
    return 'wi wi-cloud';                                                    // Default nuvoloso
}

function displayData(data) {
    if (!data || !data.daily || !data.hourly) return; // robustezza
    // Condizioni attuali
    try {
        const { current } = data;
        if (current) {
            const currCard = document.getElementById('current-conditions');
            if (currCard) currCard.hidden = false;
            const tempEl = $('current-temp');
            const rainEl = $('current-rain');
            const pressEl = $('current-pressure');
            const humEl = $('current-humidity');
            const windEl = $('current-wind');
            const windDirIcon = $('current-wind-dir-icon');
            const iconEl = $('current-icon');
            const timeEl = $('current-time');
            if (tempEl && typeof current.temperature_2m === 'number') tempEl.textContent = `${Math.round(current.temperature_2m)}°`;
            if (rainEl && typeof current.rain === 'number') rainEl.textContent = `${current.rain.toFixed(1)}  mm`;
            if (pressEl && typeof current.surface_pressure === 'number') pressEl.textContent = `${Math.round(current.surface_pressure)} hPa`;
            if (humEl && typeof current.relative_humidity_2m === 'number') humEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
            if (windEl && typeof current.wind_speed_10m === 'number') windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
            if (windDirIcon && typeof current.wind_direction_10m === 'number') {
                const deg = Math.round(current.wind_direction_10m);
                windDirIcon.style.transform = `rotate(${deg}deg)`;
                windDirIcon.setAttribute('aria-label', `Direzione vento ${deg}°`);
                windDirIcon.title = `Direzione vento ${deg}°`;
            }
            if (iconEl && typeof current.weather_code === 'number') {
                iconEl.className = getRainIconClass(current.weather_code);
                iconEl.setAttribute('aria-label', `Condizioni attuali codice ${current.weather_code}`);
            }
            if (timeEl && current.time) {
                try {
                    const dt = new Date(current.time);
                    timeEl.textContent = dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                } catch { timeEl.textContent = '--:--'; }
            }
        }
    } catch {}

    // Dati giornalieri (loop per eliminare ripetizioni)
    const { daily, hourly } = data;
    DAY_CONFIGS.forEach(cfg => {
        const i = cfg.index;
        // Icona
        const iconEl = document.getElementById(cfg.iconId);
        if (iconEl) {
            iconEl.className = getRainIconClass(daily.weather_code[i]);
            iconEl.setAttribute('aria-label', `Meteo ${ARIA_LABEL_DAY[i]} codice ${daily.weather_code[i]}`);
        }
        // Temperature
        const maxEl = document.getElementById(`${cfg.key}-temp-max`);
        const minEl = document.getElementById(`${cfg.key}-temp-min`);
        if (maxEl) maxEl.textContent = `${Math.round(daily.temperature_2m_max[i])}°`;
        if (minEl) minEl.textContent = `${Math.round(daily.temperature_2m_min[i])}°`;
        // Probabilità e mm
        const percEl = document.getElementById(`${cfg.key}-percentage`);
        const mmEl = document.getElementById(`${cfg.key}-mm`);
        if (percEl) percEl.textContent = `${daily.precipitation_probability_max[i]}%`;
        if (mmEl) mmEl.textContent = `${daily.precipitation_sum[i].toFixed(1)} mm`;
        // Data
        const dateEl = document.getElementById(`${cfg.key}-date`);
        if (dateEl) dateEl.textContent = formatDate(daily.time[i]);
        // Classe card
        updateCardClass(cfg.cardId, daily.precipitation_probability_max[i]);
        // Grafici (usiamo getDaySlice + index)
        const probSlice = getDaySlice(hourly.precipitation_probability, i);
        const precipSlice = getDaySlice(hourly.precipitation, i);
        buildChart(cfg.chartId, probSlice, precipSlice);
    });

    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) lastUpdated.textContent = data.last_update.trim();
}

async function retrieveData() {
    try {
        const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`; // invalida ogni minuto
        const response = await fetch(`data.json${randomQuery}`);
        if (!response.ok) throw new Error('Errore nel caricamento dei dati meteo');
        const data = await response.json();
        displayData(data);
        // Nessun messaggio di successo: interfaccia silenziosa
        saveCachedData(data);
    // Messaggio success handler gestito in displayData quando proveniamo da cache
    } catch (error) {
        console.error('Errore:', error);
        const cached = loadCachedData();
        if (cached) {
            // Mostra dati cache senza notifiche
            displayData(cached.data);
        } else {
            showToast('Errore rete. Ritento fra 60 secondi...', 'error');
        }
        setTimeout(retrieveData, 60_000);
    }
}
// showError/hideError/announceUpdate rimossi: logica accorpata in showToast / retrieveData

// Sistema toast riutilizzabile
function showToast(message, type = 'info', duration = 5000, silent = false) {
    // Deduplica immediata se stesso messaggio recente (entro 2s window basata su referenza)
    if (message === lastToastMessage && type !== 'error') return;
    lastToastMessage = message;
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `app-toast ${type}`;
    const btn = document.createElement('button');
    btn.className = 'toast-close';
    btn.setAttribute('aria-label', 'Chiudi notifica');
    btn.innerHTML = '&times;';
    btn.onclick = () => dismiss();
    toast.innerHTML = `<span>${message}</span>`;
    toast.appendChild(btn);
    container.appendChild(toast);

    if (!silent) {
        const live = document.getElementById('app-alert');
        if (live) {
            live.textContent = message;
            setTimeout(() => { live.textContent = ''; }, 2000);
        }
    }

    let autoTimer = null;
    if (duration > 0) {
        autoTimer = setTimeout(() => dismiss(), duration);
    }

    function dismiss() {
        if (autoTimer) clearTimeout(autoTimer);
        toast.style.animation = 'toast-out .35s forwards';
        setTimeout(() => toast.remove(), 360);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Gestione badge offline
    const offlineBadge = document.getElementById('offline-badge');
    function updateOfflineBadge() {
        if (!offlineBadge) return;
        if (navigator.onLine) {
            offlineBadge.hidden = true;
        } else {
            offlineBadge.hidden = false;
        }
    }
    window.addEventListener('online', () => {
        updateOfflineBadge();
        showToast('Connessione ripristinata', 'success', 3000, true);
        // Provo un refresh dati se eravamo offline
        retrieveData();
    });
    window.addEventListener('offline', () => {
        updateOfflineBadge();
        showToast('Sei offline: dati da cache', 'info', 4000, true);
    });
    updateOfflineBadge();
    const cached = loadCachedData();
    if (cached) displayData(cached.data);
    retrieveData();
    // Aggiornamento periodico (stale-while-revalidate lato client) ogni 30 minuti
    setInterval(retrieveData, 30 * 60 * 1000);
});

if ('serviceWorker' in navigator) {
    const updateBtn = document.getElementById('update-button');
    navigator.serviceWorker.register('service-worker.js').then(registration => {
        console.log('Service Worker registrato con successo:', registration.scope);

        function showUpdateButton(sw) {
            if (!updateBtn) return;
            updateBtn.style.display = 'inline-flex';
            updateBtn.onclick = () => {
                if (sw && sw.state === 'installed') {
                    sw.postMessage('SKIP_WAITING');
                }
            };
        }

        // SW già in waiting
        if (registration.waiting) {
            showUpdateButton(registration.waiting);
        }

        // Nuovo SW trovato
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateButton(newWorker);
                }
            });
        });

        // Dopo skipWaiting ricarico pagina
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });

        // Poll ogni 5 minuti per update (in caso di mancato evento)
        setInterval(async () => {
            try {
                await registration.update();
            } catch {}
        }, 300_000);

        // Se compare un waiting successivo senza updatefound (edge cases)
        setInterval(() => {
            if (registration.waiting && updateBtn && updateBtn.style.display === 'none') {
                showToast('Nuovo aggiornamento disponibile', 'info', 4000);
                showUpdateButton(registration.waiting);
            }
        }, 10_000);
    }).catch(error => {
        console.error('Errore nella registrazione del Service Worker:', error);
    });
}

// Script di debug mobile con output visuale sulla pagina
console.log('🔍 DEBUG MOBILE - Script caricato');

// Crea un pannello di debug visuale
function createDebugPanel() {
  // Rimuovi pannello esistente se presente
  const existing = document.getElementById('mobile-debug-panel');
  if (existing) existing.remove();
    // Inietta CSS una sola volta
    if (!document.getElementById('debug-panel-styles')) {
        const style = document.createElement('style');
        style.id = 'debug-panel-styles';
        style.textContent = `
            .debug-btns-wrap { position: fixed; top: 10px; right: 10px; z-index: 10000; display: flex; gap: 6px; }
            .debug-btn { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; cursor: pointer; padding: 0; transition: background .2s, transform .15s; box-shadow: 0 2px 4px rgba(0,0,0,.25); }
            .debug-btn:hover { background: #334155; }
            .debug-btn:active { transform: translateY(1px); }
            .debug-btn svg { width: 20px; height: 20px; stroke: currentColor; }
            .debug-btn.debug-toggle-active { background: #0d9488; border-color: #0f766e; }
            #mobile-debug-panel { backdrop-filter: blur(6px); }
            @media (prefers-color-scheme: light) {
                .debug-btn { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
                .debug-btn:hover { background: #e2e8f0; }
                .debug-btn.debug-toggle-active { background: #14b8a6; color: #ffffff; border-color: #0d9488; }
            }
        `;
        document.head.appendChild(style);
    }
  
  const panel = document.createElement('div');
  panel.id = 'mobile-debug-panel';
    panel.style.cssText = `
        position: fixed; top: 58px; left: 10px; right: 10px; background: rgba(15,23,42,0.92); color: #a5f3fc; font-family: 'Courier New', monospace; font-size: 11px; padding: 12px 12px 16px; border-radius: 10px; z-index: 9999; max-height: 250px; overflow-y: auto; white-space: pre-wrap; display: none; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,.4);
    `;
  
  // Aggiungi pulsanti di controllo
    const controls = document.createElement('div');
    controls.className = 'debug-btns-wrap';
  
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'debug-btn';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Mostra/Nascondi log debug');
    toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>`;
  
    const copyBtn = document.createElement('button');
    copyBtn.className = 'debug-btn';
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copia log');
    copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>`;
  
    const clearBtn = document.createElement('button');
    clearBtn.className = 'debug-btn';
    clearBtn.type = 'button';
    clearBtn.setAttribute('aria-label', 'Svuota log');
    clearBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
        </svg>`;
  
  controls.appendChild(toggleBtn);
  controls.appendChild(copyBtn);
  controls.appendChild(clearBtn);
  
  document.body.appendChild(panel);
  document.body.appendChild(controls);
  
  // Event listeners
    toggleBtn.addEventListener('click', () => {
        const show = panel.style.display === 'none';
        panel.style.display = show ? 'block' : 'none';
        toggleBtn.classList.toggle('debug-toggle-active', show);
    });
  
    copyBtn.addEventListener('click', () => {
        const restore = copyBtn.innerHTML;
        const setOk = () => {
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>';
            setTimeout(() => copyBtn.innerHTML = restore, 1200);
        };
        navigator.clipboard.writeText(panel.textContent).then(setOk).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = panel.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setOk();
        });
    });
  
  clearBtn.addEventListener('click', () => {
    panel.textContent = '';
    window.debugLogs = [];
  });
  
  return panel;
}

// Array per salvare tutti i log
window.debugLogs = [];
// Stato attivazione debug (pannello + pulsanti)
window._debugActivated = false;

// Attivatore debug: 3 click/tap rapidi sul titolo (h1) o elemento con data-debug-activator
function setupDebugActivator() {
    const activator = document.querySelector('[data-debug-activator]') || document.querySelector('h1');
    if (!activator) return; // Nessun titolo trovato
    // Aspetto interattivo + disabilita selezione testo durante i click rapidi
    activator.style.cursor = 'pointer';
    activator.style.userSelect = 'none';
    activator.style.webkitUserSelect = 'none';
    if (!activator.getAttribute('title')) activator.setAttribute('title', 'Triplo click per attivare il debug');
    // Evita selezione accidentale su alcuni browser durante tripli tap
    activator.addEventListener('selectstart', e => e.preventDefault());
    let clickCount = 0;
    let timer = null;
    activator.addEventListener('click', () => {
        if (window._debugActivated) return;
        clickCount++;
        if (timer) clearTimeout(timer);
        // Finestra 1500ms per i 3 click
        timer = setTimeout(() => { clickCount = 0; }, 1500);
        if (clickCount >= 3) {
            window._debugActivated = true;
            clickCount = 0;
            if (timer) { clearTimeout(timer); timer = null; }
            // Feedback visivo leggero
            activator.style.outline = '2px solid #27ae60';
            setTimeout(() => { activator.style.outline = ''; }, 1200);
            initMobileDebug();
            gatherViewportInfo('debug-activated');
        }
    });
}

// Funzione per loggare con output sia console che visuale
function mobileLog(message, data = {}) {
    if (!window._debugActivated) return; // Non loggare prima dell'attivazione (mantiene la pagina pulita)
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}\n${JSON.stringify(data, null, 2)}\n---\n`;
  
  // Log in console
  console.log(message, data);
  
  // Salva nel nostro array
  window.debugLogs.push({ timestamp, message, data });
  
  // Mostra nel pannello visuale
  const panel = document.getElementById('mobile-debug-panel');
  if (panel) {
    panel.textContent += logEntry;
    panel.scrollTop = panel.scrollHeight;
  }
}

// Funzione per raccogliere info viewport
function gatherViewportInfo(event = 'unknown') {
    if (!window._debugActivated) return; // Ignora prima di attivazione
  const info = {
    evento: event,
    timestamp: new Date().toLocaleTimeString(),
    
    // Dimensioni finestra
    windowInner: `${window.innerWidth}x${window.innerHeight}`,
    windowOuter: `${window.outerWidth}x${window.outerHeight}`,
    screen: `${screen.width}x${screen.height}`,
    
    // Document
    docClient: document.documentElement ? `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}` : 'N/A',
    
    // Body
    bodyClient: document.body ? `${document.body.clientWidth}x${document.body.clientHeight}` : 'N/A',
    bodyScroll: document.body ? `${document.body.scrollWidth}x${document.body.scrollHeight}` : 'N/A',
    
    // Visual Viewport (iOS Safari)
    visualViewport: window.visualViewport ? `${window.visualViewport.width}x${window.visualViewport.height}` : 'N/A',
    
    // Dashboard
    dashboardHeight: (() => {
      const el = document.querySelector('.dashboard-container');
      return el ? el.offsetHeight : 'N/A';
    })(),
    
    // Footer check
    footerInfo: (() => {
      const footer = document.querySelector('footer');
      if (!footer) return 'Footer non trovato';
      
      const rect = footer.getBoundingClientRect();
      return {
        visible: rect.bottom <= window.innerHeight && rect.top >= 0,
        position: `top:${Math.round(rect.top)} bottom:${Math.round(rect.bottom)}`,
        windowHeight: window.innerHeight
      };
    })(),
    
    // Scroll
    scroll: `x:${window.scrollX} y:${window.scrollY}`,
    
    // User agent
    isMobile: navigator.userAgent.includes('Mobile'),
    
    // Safe areas (se supportate)
    safeAreas: (() => {
      if (CSS && CSS.supports && CSS.supports('top: env(safe-area-inset-top)')) {
        const style = getComputedStyle(document.documentElement);
        return {
          top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
          bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px'
        };
      }
      return 'Non supportate';
    })()
  };
  
  mobileLog(`📱 VIEWPORT - ${event}`, info);
  return info;
}

// Inizializza quando il DOM è pronto
function initMobileDebug() {
    if (document.getElementById('mobile-debug-panel')) return; // già creato
    createDebugPanel();
    // Mobile log/gather verranno eseguiti ora (debug attivo)
    mobileLog('🚀 Debug mobile inizializzato');
    gatherViewportInfo('init');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupDebugActivator();
});

window.addEventListener('load', () => {
    // Eseguirà solo dopo attivazione
    setTimeout(() => gatherViewportInfo('1sec-after-load'), 1000);
    setTimeout(() => gatherViewportInfo('3sec-after-load'), 3000);
});

window.addEventListener('resize', () => {
  gatherViewportInfo('resize');
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => gatherViewportInfo('orientation-change'), 200);
});

// Scroll tracking con throttling
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => gatherViewportInfo('scroll-end'), 200);
});

// Visual Viewport API (importante per iOS)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    gatherViewportInfo('visual-viewport-resize');
  });
}

// Page show (refresh/cache)
window.addEventListener('pageshow', (event) => {
  const source = event.persisted ? 'cache' : 'fresh';
  gatherViewportInfo(`pageshow-${source}`);
});

// Visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    gatherViewportInfo('visibility-visible');
  }
});

// Funzioni globali per debug
window.exportDebugData = function() {
  const data = {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    logs: window.debugLogs
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug-mobile-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.emailDebugData = function() {
  const data = window.debugLogs.map(log => 
    `[${log.timestamp}] ${log.message}\n${JSON.stringify(log.data, null, 2)}`
  ).join('\n\n');
  
  const subject = encodeURIComponent('Debug Viewport Mobile');
  const body = encodeURIComponent(data);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

// Auto-start se il documento è già pronto
if (document.readyState !== 'loading') {
    setupDebugActivator();
}

// Log finale (rimane silente se non attivato)
mobileLog('📱 Script debug mobile caricato');