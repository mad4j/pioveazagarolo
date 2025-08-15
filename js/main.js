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
    chartInstances[target] = new Chart(ctx, {
    plugins: target === 'today-chart' ? [currentHourLinePlugin] : [],
        data: {
            labels: [...Array(24).keys()].map(hour => `${hour}:00`),
            datasets: [
                {
                    label: 'Probabilità (%)',
                    type: 'line',
                    fill: true,
                    lineTension: 0.4,
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
                    label: 'Precipitazione (mm)',
                    type: 'bar',
                    backgroundColor: precipitationData.map(getPrecipitationBarColor),
                    borderColor: precipitationData.map(getPrecipitationBarColor),
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
                // Implementa timeout di 5 secondi per dispositivi touchscreen
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
                    max: Math.max(...precipitationData, 1) < 2 ? 2 : Math.ceil(Math.max(...precipitationData, 1)),
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
    const todayData = getDaySlice(data.hourly.precipitation_probability, 0);
    const tomorrowData = getDaySlice(data.hourly.precipitation_probability, 1);
    const dayAfterTomorrowData = getDaySlice(data.hourly.precipitation_probability, 2);

    const todayPrecip = getDaySlice(data.hourly.precipitation, 0);
    const tomorrowPrecip = getDaySlice(data.hourly.precipitation, 1);
    const dayAfterTomorrowPrecip = getDaySlice(data.hourly.precipitation, 2);

    const todayPercentage = data.daily.precipitation_probability_max[0];
    const tomorrowPercentage = data.daily.precipitation_probability_max[1];
    const dayAfterTomorrowPercentage = data.daily.precipitation_probability_max[2];

    const precipitationToday = data.daily.precipitation_sum[0];
    const precipitationTomorrow = data.daily.precipitation_sum[1];
    const precipitationDayAfterTomorrow = data.daily.precipitation_sum[2];

    // Cambia icona in base al weather_code
    const todayIcon = document.getElementById('today-icon');
    const tomorrowIcon = document.getElementById('tomorrow-icon');
    const dayAfterTomorrowIcon = document.getElementById('dayaftertomorrow-icon');
    if (todayIcon) {
        todayIcon.className = getRainIconClass(data.daily.weather_code[0]);
        todayIcon.setAttribute('aria-label', `Meteo oggi codice ${data.daily.weather_code[0]}`);
    }
    if (tomorrowIcon) {
        tomorrowIcon.className = getRainIconClass(data.daily.weather_code[1]);
        tomorrowIcon.setAttribute('aria-label', `Meteo domani codice ${data.daily.weather_code[1]}`);
    }
    if (dayAfterTomorrowIcon) {
        dayAfterTomorrowIcon.className = getRainIconClass(data.daily.weather_code[2]);
        dayAfterTomorrowIcon.setAttribute('aria-label', `Meteo dopodomani codice ${data.daily.weather_code[2]}`);
    }

    // Temperatura max/min accanto all'icona
    document.getElementById('today-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[0])}°`;
    document.getElementById('today-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[0])}°`;
    document.getElementById('tomorrow-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[1])}°`;
    document.getElementById('tomorrow-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[1])}°`;
    document.getElementById('dayaftertomorrow-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[2])}°`;
    document.getElementById('dayaftertomorrow-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[2])}°`;

    document.getElementById("today-percentage").textContent = `${todayPercentage}%`;
    document.getElementById("today-mm").textContent = `${precipitationToday.toFixed(1)} mm`;
    document.getElementById("tomorrow-percentage").textContent = `${tomorrowPercentage}%`;
    document.getElementById("tomorrow-mm").textContent = `${precipitationTomorrow.toFixed(1)} mm`;
    document.getElementById("dayaftertomorrow-percentage").textContent = `${dayAfterTomorrowPercentage}%`;
    document.getElementById("dayaftertomorrow-mm").textContent = `${precipitationDayAfterTomorrow.toFixed(1)} mm`;

    document.getElementById("today-date").textContent = formatDate(data.daily.time[0]);
    document.getElementById("tomorrow-date").textContent = formatDate(data.daily.time[1]);
    document.getElementById("dayaftertomorrow-date").textContent = formatDate(data.daily.time[2]);

    updateCardClass("today-card", todayPercentage);
    updateCardClass("tomorrow-card", tomorrowPercentage);
    updateCardClass("dayaftertomorrow-card", dayAfterTomorrowPercentage);

    buildChart("today-chart", todayData, todayPrecip);
    buildChart("tomorrow-chart", tomorrowData, tomorrowPrecip);
    buildChart("dayaftertomorrow-chart", dayAfterTomorrowData, dayAfterTomorrowPrecip);

    const lastUpdated = document.getElementById("last-updated");
    if (lastUpdated) lastUpdated.textContent = data.last_update.trim();
    // Nessun toast di aggiornamento per evitare rumore
}

async function retrieveData() {
    try {
        const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`; // invalida ogni minuto
        const response = await fetch(`data.json${randomQuery}`);
        if (!response.ok) throw new Error('Errore nel caricamento dei dati meteo');
        const data = await response.json();
        displayData(data);
        hideError();
        saveCachedData(data);
    // Messaggio success handler gestito in displayData quando proveniamo da cache
    } catch (error) {
        console.error('Errore:', error);
        const cached = loadCachedData();
        if (cached) {
            // Mostra dati cache senza notifiche
            displayData(cached.data);
        } else {
            showError('Errore rete. Ritento fra 60 secondi...');
        }
        setTimeout(retrieveData, 60_000);
    }
}

function showError(message) {
    showToast(message, 'error');
}

function hideError() {
    // Non serve più con i toast; eventuale implementazione futura
}

function announceUpdate(message) { /* disabilitato per evitare popup eccessivi */ }

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


// Esegue una stima (heuristic) solo se Android + aspect ratio verticale
function estimateNavBar() {
  const ua = navigator.userAgent.toLowerCase();
  if (!ua.includes('android')) return 0;
  // Heuristic: se innerHeight/outerHeight < 0.93 ipotizza nav bar 48px
  const ratio = window.innerHeight / window.outerHeight;
  return ratio < 0.93 ? 48 : 0;
}
document.documentElement.style.setProperty('--nav-bar-height', estimateNavBar() + 'px');


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