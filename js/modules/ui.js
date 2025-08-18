import { DAY_CONFIGS, ARIA_LABEL_DAY, dayFormatter, $ } from './constants.js';
import { getRainIconClass } from './icons.js';
import { buildChart, getDaySlice } from './charts.js';
import { precipitationManager } from './precipitation.js';

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
    const percEl = $(`${cfg.key}-percentage`); if (percEl) percEl.textContent = `${daily.precipitation_probability_max[i]}%`;
    const mmEl = $(`${cfg.key}-mm`); if (mmEl) { const v = daily.precipitation_sum[i]; mmEl.textContent = `${v===0 ? '0' : v.toFixed(1)} mm`; }
    const dateEl = $(`${cfg.key}-date`); if (dateEl) dateEl.textContent = formatDate(daily.time[i]);
    updateCardClass(cfg.cardId, daily.precipitation_probability_max[i]);
    const probSlice = getDaySlice(hourly.precipitation_probability, i);
    let precipSlice = getDaySlice(hourly.precipitation, i);
    
    // For today's chart (index 0), blend actual and forecast precipitation
    if (i === 0 && precipitationManager.isDataValid()) {
      precipSlice = precipitationManager.blendTodayPrecipitation(precipSlice);
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
}
