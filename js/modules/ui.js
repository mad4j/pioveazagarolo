import { DAY_CONFIGS, ARIA_LABEL_DAY, dayFormatter, $ } from './constants.js';
import { getRainIconClass } from './icons.js';
import { buildChart, getDaySlice } from './charts.js';
import { precipitationManager } from './precipitation.js';
import { updateAirQualityDisplay } from './air-quality.js';

export function formatDate(dateString){ return dayFormatter.format(new Date(dateString)); }

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
      if (tempEl && typeof current.temperature_2m==='number') tempEl.textContent = `${Math.round(current.temperature_2m)}°`;
      if (rainEl && typeof current.rain==='number') {
        const mm = current.rain === 0 ? '0' : current.rain.toFixed(1);
        rainEl.textContent = `${mm}  mm`;
      }
      if (pressEl && typeof current.surface_pressure==='number') pressEl.textContent = `${Math.round(current.surface_pressure)} hPa`;
      if (humEl && typeof current.relative_humidity_2m==='number') humEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
      if (windEl && typeof current.wind_speed_10m==='number') windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      if (windDirIcon && typeof current.wind_direction_10m==='number') { const deg=Math.round(current.wind_direction_10m); windDirIcon.style.transform=`rotate(${deg}deg)`; windDirIcon.setAttribute('aria-label',`Direzione vento ${deg}°`); windDirIcon.title=`Direzione vento ${deg}°`; }
      if (iconEl && typeof current.weather_code==='number') { iconEl.className = getRainIconClass(current.weather_code, current.is_day); iconEl.setAttribute('aria-label',`Condizioni attuali codice ${current.weather_code}`);} 
    }
  } catch {}
  const { daily, hourly } = data;
  DAY_CONFIGS.forEach(cfg => {
    const i = cfg.index;
    const iconEl = $(cfg.iconId);
    if (iconEl){ iconEl.className = getRainIconClass(daily.weather_code[i]); iconEl.setAttribute('aria-label',`Meteo ${ARIA_LABEL_DAY[i]} codice ${daily.weather_code[i]}`);}    
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
    
    buildChart(cfg.chartId, probSlice, precipSlice, daily.sunrise[i], daily.sunset[i]);
  });
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
