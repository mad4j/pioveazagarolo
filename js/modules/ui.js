import { DAY_CONFIGS, ARIA_LABEL_DAY, dayFormatter, $, chartModes } from './constants.js';
import { getRainIconClass, getWeatherDescription } from './icons.js';
import { buildChart, getDaySlice } from './charts.js';
import { precipitationManager } from './precipitation.js';
import { updateAirQualityDisplay } from './air-quality.js';
import { buildAppropriateChart } from './chart-toggle.js';
import { setupNavigationDots, syncNavigationDotsWithChartMode } from './navigation-dots.js';
import { setupVersionTooltip } from './version-tooltip.js';
import { setupSwipeGestures } from './gesture-handler.js';

export function formatDate(dateString){ return dayFormatter.format(new Date(dateString)); }

// Debounce state for weather icon tooltip
let _lastWeatherTooltip = { target: null, ts: 0 };

/**
 * Mostra tooltip temporaneo con temperatura percepita
 * @param {HTMLElement} tempElement - Elemento temperatura che ha scatenato il tooltip
 * @param {number} apparentTemp - Valore temperatura percepita
 */
export function showApparentTemperatureTooltip(tempElement, apparentTemp) {
  // Rimuovi tooltip esistenti
  document.querySelectorAll('.apparent-temp-tooltip').forEach(t => t.remove());
  
  const tooltip = document.createElement('div');
  tooltip.className = 'apparent-temp-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    z-index: 1000;
    font: 12px 'Helvetica Neue', Arial;
    color: #ecf0f1;
    background: rgba(44,62,80,0.92);
    padding: 6px 8px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,.35);
    max-width: 240px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">
      Temperatura percepita
    </div>
    <div style="font-size: 12px; line-height: 1.2;">
      ${Math.round(apparentTemp)}°C
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Posiziona tooltip vicino all'elemento
  const tempRect = tempElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = tempRect.left + tempRect.width / 2 - tooltipRect.width / 2;
  let top = tempRect.top - tooltipRect.height - 8;
  
  // Aggiusta posizione se esce dal viewport
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  if (top < 8) {
    top = tempRect.bottom + 8; // Mostra sotto se non c'è spazio sopra
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  
  // Anima apparizione
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  });
  
  // Rimuovi tooltip dopo 4 secondi o al click su documento
  const removeTooltip = () => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(-10px)';
    setTimeout(() => tooltip.remove(), 300);
    document.removeEventListener('click', removeTooltip);
  };
  
  setTimeout(removeTooltip, 4000);
  document.addEventListener('click', removeTooltip);
}

/**
 * Updates weather icons for all day cards
 * @param {Object} weatherData - Weather data containing daily weather codes
 */
export function updateWeatherIcons(weatherData) {
  if (!weatherData || !weatherData.daily || !weatherData.daily.weather_code) return;
  
  const { daily } = weatherData;
  DAY_CONFIGS.forEach(cfg => {
    const i = cfg.index;
    const iconEl = $(cfg.iconId);
    if (iconEl && daily.weather_code[i] !== undefined){ 
      iconEl.className = getRainIconClass(daily.weather_code[i]); 
      iconEl.setAttribute('aria-label',`Meteo ${ARIA_LABEL_DAY[i]} codice ${daily.weather_code[i]}`);
      // Add weather code tooltip
      addWeatherIconTooltip(iconEl, daily.weather_code[i]);
    }
  });
}

/**
 * Show weather icon tooltip with weather description (matches air quality tooltip format)
 * @param {HTMLElement} iconElement - Weather icon element
 * @param {string} description - Weather description text
 */
function showWeatherIconTooltip(iconElement, description) {
  const now = Date.now();
  if (_lastWeatherTooltip.target === iconElement && now - _lastWeatherTooltip.ts < 300) {
    return;
  }
  _lastWeatherTooltip = { target: iconElement, ts: now };
  // Remove existing weather icon tooltips
  document.querySelectorAll('.weather-icon-tooltip').forEach(t => t.remove());
  
  const tooltip = document.createElement('div');
  tooltip.className = 'weather-icon-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    z-index: 1000;
    font: 12px 'Helvetica Neue', Arial;
    color: #ecf0f1;
    background: rgba(44,62,80,0.92);
    padding: 6px 8px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,.35);
    max-width: 240px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">
      Condizioni meteo
    </div>
    <div style="font-size: 12px; line-height: 1.2;">
      ${description}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Position tooltip near the icon
  const iconRect = iconElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
  let top = iconRect.top - tooltipRect.height - 8;
  
  // Adjust position if outside viewport
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  if (top < 8) {
    top = iconRect.bottom + 8; // Show below if no space above
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  
  // Animate appearance
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  });
  
  // Remove tooltip after 4 seconds or on document interaction
  const removeTooltip = (evt) => {
    // Ignore the initiating click/tap on the same icon
    if (evt && iconElement && iconElement.contains(evt.target)) return;
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(-10px)';
    setTimeout(() => tooltip.remove(), 300);
    document.removeEventListener('click', removeTooltip, true);
    document.removeEventListener('pointerdown', removeTooltip, true);
    document.removeEventListener('keydown', removeTooltip, true);
  };
  
  setTimeout(removeTooltip, 4000);
  // Defer binding so we don't capture the same initiating event
  setTimeout(() => {
    // Use capture + once to ensure reliable dismissal on the next interaction
    document.addEventListener('click', removeTooltip, { capture: true, once: true });
    document.addEventListener('pointerdown', removeTooltip, { capture: true, once: true });
    document.addEventListener('keydown', removeTooltip, { capture: true, once: true });
  }, 50);
}

/**
 * Add weather code tooltip functionality to a weather icon
 * @param {HTMLElement} iconElement - Weather icon element
 * @param {number} weatherCode - WMO weather code
 */
export function addWeatherIconTooltip(iconElement, weatherCode) {
  if (!iconElement || typeof weatherCode !== 'number') return;
  
  const description = getWeatherDescription(weatherCode);
  
  // Remove any existing event listeners to avoid duplicates
  if (iconElement._weatherTooltipHandler) {
    iconElement.removeEventListener('mouseenter', iconElement._weatherTooltipHandler.mouseenter);
    iconElement.removeEventListener('mouseleave', iconElement._weatherTooltipHandler.mouseleave);
    iconElement.removeEventListener('touchstart', iconElement._weatherTooltipHandler.touchstart);
  }
  
  // Timer for mouse hover delay
  let tooltipTimer = null;
  
  const handlers = {
    mouseenter: () => {
      if (iconElement._weatherTooltipSuppressHoverUntil && Date.now() < iconElement._weatherTooltipSuppressHoverUntil) {
        return;
      }
      clearTimeout(tooltipTimer);
      showWeatherIconTooltip(iconElement, description);
    },
    
    mouseleave: () => {
      tooltipTimer = setTimeout(() => {
        document.querySelectorAll('.weather-icon-tooltip').forEach(t => {
          t.style.opacity = '0';
          t.style.transform = 'translateY(-10px)';
          setTimeout(() => t.remove(), 300);
        });
      }, 500); // Small delay before hiding
    },
    
    touchstart: (e) => {
      // Do not prevent default to keep native gestures intact
      iconElement._weatherTooltipSuppressHoverUntil = Date.now() + 700;
      showWeatherIconTooltip(iconElement, description);
    }
  };
  
  // Store handlers for cleanup
  iconElement._weatherTooltipHandler = handlers;
  
  // Add event listeners
  iconElement.addEventListener('mouseenter', handlers.mouseenter);
  iconElement.addEventListener('mouseleave', handlers.mouseleave);
  iconElement.addEventListener('touchstart', handlers.touchstart, { passive: true });
  
  // Add cursor pointer to indicate interactivity
  iconElement.style.cursor = 'pointer';
}

export function updateCardClass(cardId, percentage) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.remove('high-chance', 'medium-chance', 'low-chance');
  if (percentage >= 60) card.classList.add('high-chance');
  else if (percentage >= 30) card.classList.add('medium-chance');
  else card.classList.add('low-chance');
}

export function showToast(message, type = 'info', duration = 5000, silent = false) {
  if (showToast._last === message && type !== 'error') return;
  showToast._last = message;
  const container = $('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `app-toast ${type}`;
  const btn = document.createElement('button');
  btn.className = 'toast-close';
  btn.setAttribute('aria-label','Chiudi notifica');
  btn.innerHTML = '&times;';
  btn.onclick = () => dismiss();
  toast.innerHTML = `<span>${message}</span>`;
  toast.appendChild(btn);
  container.appendChild(toast);
  if (!silent) {
    const live = $('app-alert');
    if (live) { live.textContent = message; setTimeout(()=> live.textContent = '', 2000); }
  }
  let timer = null;
  if (duration > 0) timer = setTimeout(dismiss, duration);
  function dismiss(){ if (timer) clearTimeout(timer); toast.style.animation='toast-out .35s forwards'; setTimeout(()=>toast.remove(),360);}  
}

export function displayData(data){
  if (!data || !data.daily || !data.hourly) return;
  try {
    const { current } = data;
    if (current) {
      const currCard = $('current-conditions'); if (currCard) currCard.hidden = false;
      const tempEl=$('current-temp'), rainEl=$('current-rain'), pressEl=$('current-pressure'), humEl=$('current-humidity'), windEl=$('current-wind'), windDirIcon=$('current-wind-dir-icon'), iconEl=$('current-icon');
      if (tempEl && typeof current.temperature_2m==='number') {
        tempEl.textContent = `${Math.round(current.temperature_2m)}°`;
        
        // Add apparent temperature tooltip functionality
        if (typeof current.apparent_temperature === 'number') {
          tempEl.style.cursor = 'pointer';
          tempEl.title = 'Clicca per vedere la temperatura percepita';
          
          // Remove existing event listeners to avoid duplicates
          tempEl.removeEventListener('click', tempEl._apparentTempHandler);
          
          // Create and store new event handler
          tempEl._apparentTempHandler = (e) => {
            e.stopPropagation();
            showApparentTemperatureTooltip(tempEl, current.apparent_temperature);
          };
          
          tempEl.addEventListener('click', tempEl._apparentTempHandler);
        }
      }
      if (rainEl && typeof current.rain==='number') {
        const mm = current.rain === 0 ? '0' : current.rain.toFixed(1);
        rainEl.textContent = `${mm}  mm`;
      }
      if (pressEl && typeof current.pressure_msl==='number') pressEl.textContent = `${Math.round(current.pressure_msl)} hPa`;
      if (humEl && typeof current.relative_humidity_2m==='number') humEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
      if (windEl && typeof current.wind_speed_10m==='number') windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      if (windDirIcon && typeof current.wind_direction_10m==='number') { const deg=Math.round(current.wind_direction_10m); windDirIcon.style.transform=`rotate(${deg}deg)`; windDirIcon.setAttribute('aria-label',`Direzione vento ${deg}°`); windDirIcon.title=`Direzione vento ${deg}°`; }
      if (iconEl && typeof current.weather_code==='number') { 
        iconEl.className = getRainIconClass(current.weather_code, current.is_day); 
        iconEl.setAttribute('aria-label',`Condizioni attuali codice ${current.weather_code}`);
        // Add weather code tooltip
        addWeatherIconTooltip(iconEl, current.weather_code);
      }
    }
  } catch {}
  const { daily, hourly } = data;
  
  // Update weather icons for all day cards
  updateWeatherIcons(data);
  
  DAY_CONFIGS.forEach(cfg => {
    const i = cfg.index;
    const maxEl = $(`${cfg.key}-temp-max`); if (maxEl) maxEl.textContent = `${Math.round(daily.temperature_2m_max[i])}°`;
    const minEl = $(`${cfg.key}-temp-min`); if (minEl) minEl.textContent = `${Math.round(daily.temperature_2m_min[i])}°`;
    const percEl = $(`${cfg.key}-percentage`);
    if (percEl) {
      const val = daily.precipitation_probability_max[i];
      // Avoid duplicating wrapping if displayData is called multiple times
      if (!percEl.dataset.enhanced || percEl.dataset.value !== String(val)) {
        percEl.innerHTML = `<span class="value">${val}</span><span class="percent-symbol" aria-hidden="true">%</span>`;
        percEl.dataset.enhanced = 'true';
        percEl.dataset.value = String(val);
      }
    }
    const mmEl = $(`${cfg.key}-mm`); if (mmEl) { const v = daily.precipitation_sum[i]; mmEl.textContent = `${v===0 ? '0' : v.toFixed(1)} mm`; }
    const dateEl = $(`${cfg.key}-date`); if (dateEl) dateEl.textContent = formatDate(daily.time[i]);
    updateCardClass(cfg.cardId, daily.precipitation_probability_max[i]);
    let probSlice = getDaySlice(hourly.precipitation_probability, i);
    let precipSlice = getDaySlice(hourly.precipitation, i);
    
    // For today's chart (index 0), blend actual and forecast data
    if (i === 0) {
      // Clear probability for past hours  
      //probSlice = precipitationManager.blendTodayProbability(probSlice);
      
      // Blend actual and forecast precipitation if data is available
      //if (precipitationManager.isDataValid()) {
      //  precipSlice = precipitationManager.blendTodayPrecipitation(precipSlice);
      //}

      // TODO Questa sezione è da rivedere:
      // il giorno 2025-08-21 tra le 01:00 e le 03:00 c'è stato un aquazzone
      // che questa logica si è perso.
      // Fra 5 giorni verificare se in archivio per quella data gli eventi di precipitazione
      // dalla mezzanotte risultano 0.00, 0.00, 0.10, 0.80, 0.00, ...
      // Eventualmente, eliminare tutta questa sezione e la gestione di data-precipitations.json

      // // Recalculate summary (percentage + mm) using ONLY future hours (including current hour)
      // try {
      //   const currentHour = precipitationManager.getCurrentHourRome();
      //   const futureProb = probSlice.slice(currentHour); // already zeroed past hours
      //   const futurePrecip = precipSlice.slice(currentHour);
      //   let maxProb = 0;
      //   for (const v of futureProb) if (typeof v === 'number' && v > maxProb) maxProb = v;
      //   const sumPrecip = futurePrecip.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);

      //   // Update percentage element for today (oggi)
      //   const percToday = $('today-percentage');
      //   if (percToday) {
      //     if (!percToday.dataset.enhanced || percToday.dataset.value !== String(maxProb)) {
      //       percToday.innerHTML = `<span class="value">${maxProb}</span><span class="percent-symbol" aria-hidden="true">%</span>`;
      //       percToday.dataset.enhanced = 'true';
      //       percToday.dataset.value = String(maxProb);
      //     }
      //     updateCardClass('today-card', maxProb);
      //   }

      //   // Update mm element for today
      //   const mmToday = $('today-mm');
      //   if (mmToday) {
      //     const formatted = sumPrecip === 0 ? '0' : sumPrecip.toFixed(1);
      //       mmToday.textContent = `${formatted} mm`;
      //   }
      // } catch (err) {
      //   console.warn('Errore ricalcolo dati ore future oggi:', err);
      // }
    }
    
    buildAppropriateChart(cfg.chartId, data, i);
  });
  
  // Setup navigation dots
  setupNavigationDots(data);
  
  // Setup swipe gestures for mode switching
  setupSwipeGestures(data);
  
  // Setup version tooltip functionality
  setupVersionTooltip();
  
  // Tooltip display is now handled by navigation dots when user interacts
  
  const lastUpdated = $('last-updated'); 
  if (lastUpdated) {
    try {
      if (data.current && data.current.time) {
        const dt = new Date(data.current.time);
        const formattedTime = dt.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
        lastUpdated.textContent = formattedTime;
      } else {
        lastUpdated.textContent = data.last_update.trim();
      }
    } catch {
      lastUpdated.textContent = data.last_update.trim();
    }
  }
  
  // Aggiorna display qualità dell'aria (EAQI) se disponibile
  // Questa funzione gestisce la visualizzazione delle icone colorate per l'indice europeo di qualità dell'aria
  if (data.air_quality) {
    updateAirQualityDisplay(data.air_quality);
  }
  
  // Load and display version information
  loadVersionInfo();
}

// Load version information from build-info.json
async function loadVersionInfo() {
  try {
    const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`;
    const response = await fetch(`package.json${randomQuery}`);
    if (!response.ok) return;
    const buildInfo = await response.json();
    
    const versionEl = $('app-version');
    if (versionEl && buildInfo.version) {
      const rawVersion = buildInfo.version.trim();
      // Mostra senza patch solo se patch=0 e non ci sono suffissi (es. -rc)
      const m = rawVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:([-][A-Za-z0-9.]+))?$/);
      let display = rawVersion;
      if (m) {
        const [, maj, min, patch, suffix] = m;
        if (patch === '0' && !suffix) {
          display = `${maj}.${min}`;
        }
      }
      versionEl.textContent = display;
    }
  } catch (error) {
    console.warn('Could not load version info:', error.message);
  }
}
