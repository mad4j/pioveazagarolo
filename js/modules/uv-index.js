// Modulo per la gestione dell'indice UV
// Fornisce funzioni per la mappatura livelli UV, colori e icone

import { $ } from './constants.js';

// Mappatura livelli UV secondo WHO/WMO
// Riferimento: https://www.who.int/news-room/q-a-detail/radiation-the-known-health-effects-of-ultraviolet-radiation
const UV_LEVELS = [
  { min: 0, max: 2, level: 'low', color: '#289500', bgColor: '#e8f5e8', label: 'Basso', description: 'Nessuna protezione richiesta', icon: '\uf00d' }, // wi-day-sunny
  { min: 3, max: 5, level: 'moderate', color: '#f7e400', bgColor: '#fefae8', label: 'Moderato', description: 'Protezione raccomandata', icon: '\uf00d' }, // wi-day-sunny
  { min: 6, max: 7, level: 'high', color: '#f85900', bgColor: '#fff3e8', label: 'Alto', description: 'Protezione richiesta', icon: '\uf00d' }, // wi-day-sunny
  { min: 8, max: 10, level: 'very-high', color: '#d8001d', bgColor: '#ffeaea', label: 'Molto alto', description: 'Protezione extra richiesta', icon: '\uf00d' }, // wi-day-sunny
  { min: 11, max: 99, level: 'extreme', color: '#6b49c8', bgColor: '#f0e6f8', label: 'Estremo', description: 'Protezione massima richiesta', icon: '\uf00d' } // wi-day-sunny
];

/**
 * Ottiene le informazioni di livello UV per un dato valore
 * @param {number} uvValue - Valore indice UV (0-15+)
 * @returns {Object} Oggetto con colore, livello e descrizione
 */
export function getUVLevel(uvValue) {
  if (!uvValue || uvValue < 0) return UV_LEVELS[0]; // Default to 'low' for invalid values
  
  for (const level of UV_LEVELS) {
    if (uvValue >= level.min && uvValue <= level.max) {
      return level;
    }
  }
  
  // For values > 15, return the extreme level
  return UV_LEVELS[UV_LEVELS.length - 1];
}

/**
 * Crea SVG cerchio colorato per l'icona UV
 * @param {number} uvValue - Valore indice UV corrente
 * @param {Object} level - Oggetto livello UV
 * @returns {string} SVG markup per il cerchio colorato
 */
function createUVCircle(uvValue, level) {
  const size = 18;
  const radius = 7;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Cerchio colorato UV -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
              fill="${level.color}" 
              stroke="rgba(255,255,255,0.8)" 
              stroke-width="1"
              opacity="0.9"/>
      <!-- Valore UV al centro -->
      <text x="${centerX}" y="${centerY}" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-family="Arial, sans-serif" 
            font-size="8" 
            font-weight="bold" 
            fill="white">${uvValue}</text>
    </svg>
  `;
}

/**
 * Calcola il valore UV massimo per un intervallo di 3 ore
 * @param {Array} uvData - Array di valori UV orari
 * @param {number} startHour - Ora di inizio intervallo (0-21)
 * @returns {number} Valore UV massimo nell'intervallo
 */
export function getMaxUVForInterval(uvData, startHour) {
  if (!uvData || !Array.isArray(uvData)) return 0;
  
  const intervalValues = [];
  for (let i = startHour; i < startHour + 3 && i < uvData.length; i++) {
    if (typeof uvData[i] === 'number' && uvData[i] >= 0) {
      intervalValues.push(uvData[i]);
    }
  }
  
  return intervalValues.length > 0 ? Math.max(...intervalValues) : 0;
}

/**
 * Disegna icona UV per il chart plugin
 * @param {CanvasRenderingContext2D} ctx - Contesto canvas
 * @param {Object} xScale - Scala X del grafico
 * @param {Object} chartArea - Area del grafico
 * @param {number} centerHour - Ora centrale per posizionare l'icona
 * @param {number} uvValue - Valore UV da visualizzare
 */
export function drawUVIcon(ctx, xScale, chartArea, centerHour, uvValue) {
  if (uvValue <= 0) return; // Non disegnare se UV è 0
  
  const x = xScale.getPixelForValue(centerHour);
  if (x < chartArea.left || x > chartArea.right) return;
  
  const level = getUVLevel(uvValue);
  const y = chartArea.top - 20; // Posiziona sopra il grafico
  
  ctx.save();
  
  // Disegna cerchio colorato
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, 2 * Math.PI);
  ctx.fillStyle = level.color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Disegna valore UV al centro
  ctx.fillStyle = 'white';
  ctx.font = 'bold 8px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(uvValue), x, y);
  
  ctx.restore();
}

/**
 * Plugin Chart.js per visualizzare icone UV sugli intervalli di 3 ore
 */
export const uvIndexPlugin = {
  id: 'uvIndex',
  afterDraw(chart, args, opts) {
    if (!opts || !opts.uvData) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    
    // Intervalli di 3 ore: 0-2, 3-5, 6-8, 9-11, 12-14, 15-17, 18-20, 21-23
    const threeHourIntervals = [
      { start: 0, center: 1.5 },   // 00:00-02:59, centered at 01:30
      { start: 3, center: 4.5 },   // 03:00-05:59, centered at 04:30  
      { start: 6, center: 7.5 },   // 06:00-08:59, centered at 07:30
      { start: 9, center: 10.5 },  // 09:00-11:59, centered at 10:30
      { start: 12, center: 13.5 }, // 12:00-14:59, centered at 13:30
      { start: 15, center: 16.5 }, // 15:00-17:59, centered at 16:30
      { start: 18, center: 19.5 }, // 18:00-20:59, centered at 19:30
      { start: 21, center: 22.5 }  // 21:00-23:59, centered at 22:30
    ];
    
    threeHourIntervals.forEach(interval => {
      const { start, center } = interval;
      const maxUV = getMaxUVForInterval(opts.uvData, start);
      
      if (maxUV > 0) {
        drawUVIcon(ctx, xScale, chartArea, center, maxUV);
      }
    });
    
    ctx.restore();
  }
};