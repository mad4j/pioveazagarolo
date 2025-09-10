// Modulo per la gestione della qualità dell'aria (EAQI - European Air Quality Index)
// Fornisce funzioni per la mappatura colori, icone e tooltip informativi

import { $ } from './constants.js';

// Mappatura EAQI (European Air Quality Index) a colori e descrizioni
// Riferimento: https://www.eea.europa.eu/themes/air/air-quality-index
const EAQI_LEVELS = [
  { min: 0, max: 20, level: 'good', color: '#50f0e6', bgColor: '#e8f8f7', label: 'Buona', description: 'Qualità dell\'aria eccellente' },
  { min: 21, max: 40, level: 'fair', color: '#50ccaa', bgColor: '#e8f5f1', label: 'Discreta', description: 'Qualità dell\'aria buona' },
  { min: 41, max: 60, level: 'moderate', color: '#f0e641', bgColor: '#fefae8', label: 'Moderata', description: 'Qualità dell\'aria accettabile' },
  { min: 61, max: 80, level: 'poor', color: '#ff5050', bgColor: '#ffeaea', label: 'Scarsa', description: 'Possibili effetti sulla salute per gruppi sensibili' },
  { min: 81, max: 100, level: 'very-poor', color: '#960032', bgColor: '#f2e6ea', label: 'Pessima', description: 'Rischi per la salute per tutti' },
  { min: 101, max: 999, level: 'extremely-poor', color: '#7d2181', bgColor: '#f0e6f1', label: 'Estremamente pessima', description: 'Gravi rischi per la salute' }
];

/**
 * Ottiene le informazioni di livello EAQI per un dato valore
 * @param {number} eaqiValue - Valore EAQI (0-300+)
 * @returns {Object} Oggetto con colore, livello e descrizione
 */
export function getEAQILevel(eaqiValue) {
  if (!eaqiValue || eaqiValue < 0) return EAQI_LEVELS[0]; // Default to 'good' for invalid values
  
  for (const level of EAQI_LEVELS) {
    if (eaqiValue >= level.min && eaqiValue <= level.max) {
      return level;
    }
  }
  
  // For values > 300, return the worst level
  return EAQI_LEVELS[EAQI_LEVELS.length - 1];
}

/**
 * Crea SVG cerchio colorato per l'icona della qualità dell'aria
 * @param {number} eaqiValue - Valore EAQI corrente
 * @param {Object} level - Oggetto livello EAQI
 * @returns {string} SVG markup per il cerchio colorato
 */
function createAirQualityCircle(eaqiValue, level) {
  const size = 20;
  const radius = 8;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Cerchio colorato EAQI -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
              fill="${level.color}" 
              stroke="rgba(255,255,255,0.8)" 
              stroke-width="1"
              opacity="0.9"/>
    </svg>
  `;
}

/**
 * Crea e visualizza l'icona della qualità dell'aria per una carta meteo
 * @param {string} cardId - ID della carta contenitore
 * @param {number} eaqiValue - Valore EAQI corrente
 * @param {string} dayKey - Chiave del giorno (today, tomorrow, dayaftertomorrow)
 */
export function createAirQualityIcon(cardId, eaqiValue, dayKey) {
  const card = $(cardId);
  if (!card) return;

  // Trova il contenitore rain-icon dove aggiungere l'icona (a destra delle temperature)
  const rainIconContainer = card.querySelector('.rain-icon');
  if (!rainIconContainer) return;

  // Rimuovi icona esistente se presente
  const existingIcon = rainIconContainer.querySelector('.air-quality-icon');
  if (existingIcon) {
    existingIcon.remove();
  }

  const level = getEAQILevel(eaqiValue);
  
  // Crea elemento icona qualità dell'aria con cerchio colorato
  const airIcon = document.createElement('div');
  airIcon.className = 'air-quality-icon';
  airIcon.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-left: 8px;
    user-select: none;
    flex-shrink: 0;
  `; 
  
  // Inserisci il cerchio colorato SVG
  airIcon.innerHTML = createAirQualityCircle(eaqiValue, level);
  
  airIcon.setAttribute('aria-label', `Qualità dell'aria: ${level.label} (EAQI ${eaqiValue})`);
  airIcon.setAttribute('title', 'Clicca per dettagli qualità dell\'aria');
  airIcon.dataset.eaqi = eaqiValue;
  airIcon.dataset.level = level.level;
  airIcon.dataset.dayKey = dayKey;
  
  // Aggiungi event listener per tooltip (hover e click)
  let tooltipTimer = null;
  
  airIcon.addEventListener('mouseenter', (e) => {
    clearTimeout(tooltipTimer);
    showAirQualityTooltip(airIcon, eaqiValue, level);
  });
  
  airIcon.addEventListener('mouseleave', (e) => {
    tooltipTimer = setTimeout(() => {
      document.querySelectorAll('.air-quality-tooltip').forEach(t => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        setTimeout(() => t.remove(), 300);
      });
    }, 500); // Small delay before hiding
  });
  
  airIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(tooltipTimer);
    showAirQualityTooltip(airIcon, eaqiValue, level);
  });
  
  rainIconContainer.appendChild(airIcon);
}

/**
 * Mostra tooltip temporaneo con dettagli qualità dell'aria
 * @param {HTMLElement} iconElement - Elemento icona che ha scatenato il tooltip
 * @param {number} eaqiValue - Valore EAQI
 * @param {Object} level - Oggetto livello EAQI
 */
export function showAirQualityTooltip(iconElement, eaqiValue, level) {
  // Rimuovi tooltip esistenti
  document.querySelectorAll('.air-quality-tooltip').forEach(t => t.remove());
  
  const tooltip = document.createElement('div');
  tooltip.className = 'air-quality-tooltip';
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
      EAQI: ${eaqiValue}
    </div>
    <div style="font-size: 12px; line-height: 1.2;">
      ${level.description}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Posiziona tooltip vicino all'icona
  const iconRect = iconElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
  let top = iconRect.top - tooltipRect.height - 8;
  
  // Aggiusta posizione se esce dal viewport
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  if (top < 8) {
    top = iconRect.bottom + 8; // Mostra sotto se non c'è spazio sopra
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
 * Aggiorna tutte le icone di qualità dell'aria con i nuovi dati
 * @param {Object} airQualityData - Dati qualità dell'aria dall'API Open-Meteo
 */
export function updateAirQualityDisplay(airQualityData) {
  if (!airQualityData || !airQualityData.current || !airQualityData.hourly) {
    console.warn('Dati qualità dell\'aria non disponibili');
    return;
  }
  
  try {
    // Calcola valori massimi giornalieri dai dati orari (72 ore = 3 giorni)
    const hourlyEAQI = airQualityData.hourly.european_aqi || [];
    const dailyEAQI = [];
    
    // Raggruppa per giorni e calcola massimo per ogni giorno
    for (let day = 0; day < 3; day++) {
      const startHour = day * 24;
      const endHour = startHour + 24;
      const dayValues = hourlyEAQI.slice(startHour, endHour);
      
      if (dayValues.length > 0) {
        dailyEAQI[day] = Math.max(...dayValues);
      }
    }
    
    // Aggiorna icone per le carte giornaliere (oggi, domani, dopodomani)
    const dayConfigs = [
      { cardId: 'today-card', dayKey: 'today', index: 0 },
      { cardId: 'tomorrow-card', dayKey: 'tomorrow', index: 1 },
      { cardId: 'dayaftertomorrow-card', dayKey: 'dayaftertomorrow', index: 2 }
    ];
    
    dayConfigs.forEach(config => {
      const eaqiValue = dailyEAQI[config.index];
      if (eaqiValue !== undefined && eaqiValue !== null) {
        createAirQualityIcon(config.cardId, eaqiValue, config.dayKey);
      }
    });
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento display qualità dell\'aria:', error);
  }
}