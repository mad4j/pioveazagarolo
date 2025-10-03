import { DAY_CONFIGS } from './constants.js';
import { getRainIconClass, getWeatherDescription, getCloudCoverIconClass, getCloudCoverDescription } from './icons.js';

export const chartInstances = {};

export function getDaySlice(array, dayIndex) { const start = dayIndex * 24; return array.slice(start, start + 24); }

/**
 * Calculate unified pressure scale across all three days to ensure 1013 hPa line aligns
 * @param {number[]} pressureData - Array of 72 hourly pressure values (3 days)
 * @returns {{min: number, max: number}} Unified min and max pressure for all charts
 */
export function calculateUnifiedPressureScale(pressureData) {
  if (!pressureData || pressureData.length < 72) return null;
  
  const referencePoint = 1013;
  
  // Get min and max across all 72 hours
  const dataMin = Math.min(...pressureData.slice(0, 72));
  const dataMax = Math.max(...pressureData.slice(0, 72));
  
  // Calculate natural data range with padding
  const dataRange = dataMax - dataMin;
  const basePadding = Math.max(dataRange * 0.15, 3); // 15% padding or minimum 3 hPa
  
  // Start with natural data bounds plus padding
  let minPressure = dataMin - basePadding;
  let maxPressure = dataMax + basePadding;
  
  // Ensure 1013 hPa reference line is visible within the chart
  if (referencePoint < minPressure) {
    // 1013 is below the current range, extend downward
    minPressure = referencePoint - basePadding;
  } else if (referencePoint > maxPressure) {
    // 1013 is above the current range, extend upward  
    maxPressure = referencePoint + basePadding;
  }
  
  // Ensure minimum range for chart readability
  const finalRange = maxPressure - minPressure;
  if (finalRange < 10) {
    const center = (minPressure + maxPressure) / 2;
    minPressure = center - 5;
    maxPressure = center + 5;
  }
  
  return { min: minPressure, max: maxPressure };
}

// Plugin linea ora corrente
export const currentHourLinePlugin = {
  id: 'currentHourLine', afterDraw(chart, args, opts) {
    if (chart.config?.data?.labels?.length !== 24) return; if (!opts) return;
    if (typeof opts._cachedHour !== 'number') {
      try { opts._cachedHour = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Rome' }).format(new Date()), 10); if (Number.isNaN(opts._cachedHour)) opts._cachedHour = new Date().getHours(); }
      catch { opts._cachedHour = new Date().getHours(); }
    }
    const hour = opts._cachedHour;
    const xScale = chart.scales.x; if (!xScale) return;
    const x = xScale.getPixelForValue(hour);
    const { top, bottom, left } = chart.chartArea;
    const ctx = chart.ctx; ctx.save();
    try { if (x > left) { ctx.fillStyle = opts.overlayColor || 'rgba(120,120,120,0.15)'; ctx.fillRect(left, top, x - left, bottom - top); } } catch { }
    ctx.strokeStyle = opts.color || '#27ae60'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore();
  }
};

// Plugin etichette ancorate sull'asse X (00:00, 12:00, 24:00)
export const xAxisAnchorLabelsPlugin = {
  id: 'xAxisAnchorLabels',
  beforeLayout(chart, args, opts) {
    try {
      const extra = Number.isFinite(opts?.paddingBottom) ? opts.paddingBottom : 8;
      const layout = chart.options.layout ?? {};
      const pad = layout.padding ?? 2;
      if (typeof pad === 'number') {
        chart.options.layout.padding = { top: pad, right: pad, bottom: Math.max(pad, extra), left: pad };
      } else if (typeof pad === 'object' && pad) {
        pad.bottom = Math.max(pad.bottom ?? 0, extra);
        chart.options.layout.padding = pad;
      } else {
        chart.options.layout.padding = { top: 2, right: 2, bottom: extra, left: 2 };
      }
    } catch { /* noop */ }
  },
  afterDraw(chart, args, opts) {
    try {
      if (chart.config?.data?.labels?.length !== 24) return;
      const xScale = chart.scales?.x; if (!xScale) return;
      const { left, right, bottom } = chart.chartArea;
      const ctx = chart.ctx; ctx.save();
      // Reset clipping to full canvas to allow drawing outside chartArea
      try {
        ctx.beginPath();
        ctx.rect(0, 0, chart.width, chart.height);
        ctx.clip();
      } catch { }
      const font = (opts && typeof opts.font === 'string') ? opts.font : "10px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.font = font;
      ctx.fillStyle = opts?.color || (isDarkMode() ? '#c0c7cf' : '#7f8c8d');
  ctx.textBaseline = 'top';
      const y = bottom + (Number.isFinite(opts?.offsetY) ? opts.offsetY : 4);
  // Sinistra (00:00) esattamente all'origine dell'asse X
  ctx.textAlign = 'left';
  ctx.fillText('00:00', left, y);
      // Centro (12:00) esattamente sul valore delle 12
      const x12 = xScale.getPixelForValue(12);
      if (x12 >= left && x12 <= right) {
        ctx.textAlign = 'center';
        ctx.fillText('12:00', x12, y);
      }
      // 06:00 centrata sul valore delle 6
      const x6 = xScale.getPixelForValue(6);
      if (x6 >= left && x6 <= right) {
        ctx.textAlign = 'center';
        ctx.fillText('06:00', x6, y);
      }
      // 18:00 centrata sul valore delle 18
      const x18 = xScale.getPixelForValue(18);
      if (x18 >= left && x18 <= right) {
        ctx.textAlign = 'center';
        ctx.fillText('18:00', x18, y);
      }
      // Destra
      ctx.textAlign = 'right';
      ctx.fillText('24:00', right - 2, y);
      ctx.restore();
    } catch { /* ignore draw errors */ }
  }
};

// Plugin icone alba/tramonto
export const sunriseSunsetPlugin = {
  id: 'sunriseSunset', afterDraw(chart, a, opts) {
    if (!opts || !opts.sunrise || !opts.sunset) return;
    const xScale = chart.scales.x; if (!xScale) return;
    const { ctx, chartArea } = chart; ctx.save();
    const sr = timeStringToHours(opts.sunrise); const ss = timeStringToHours(opts.sunset);
    if (sr !== null) drawSunIcon(ctx, xScale, chartArea, sr, 'sunrise');
    if (ss !== null) drawSunIcon(ctx, xScale, chartArea, ss, 'sunset');
    ctx.restore();
  }
};

// Plugin frecce direzione vento
export const windDirectionPlugin = {
  id: 'windDirection', afterDraw(chart, a, opts) {
    if (!opts || !opts.windDirections) return;
    const xScale = chart.scales.x; if (!xScale) return;
    const { ctx, chartArea } = chart; ctx.save();
    opts.windDirections.forEach((direction, index) => {
      if (typeof direction === 'number') {
        drawWindArrow(ctx, xScale, chartArea, index, direction);
      }
    });
    ctx.restore();
  }
};

// Plugin per icone meteo orarie (modalità normale - ogni ora)
export const weatherIconsPlugin = {
  id: 'weatherIcons', 
  afterDraw(chart, args, opts) {
    if (!opts || !opts.weatherCodes || !opts.isDayData) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    
    opts.weatherCodes.forEach((weatherCode, index) => {
      if (typeof weatherCode === 'number') {
        const isDay = opts.isDayData[index];
        drawWeatherIcon(ctx, xScale, chartArea, index, weatherCode, isDay);
      }
    });
    
    ctx.restore();
  }
};

// Plugin per linea 1013 hPa in modalità pressione
export const pressure1013LinePlugin = {
  id: 'pressure1013Line',
  afterDraw(chart, args, opts) {
    const yScale = chart.scales.y;
    if (!yScale) return;
    
    const { ctx, chartArea } = chart;
    const { left, right, top, bottom } = chartArea;
    
    // Get the y pixel position for 1013 hPa
    const y1013 = yScale.getPixelForValue(1013);
    
    // Only draw the line if 1013 is within the visible range
    if (y1013 >= top && y1013 <= bottom) {
      ctx.save();
      ctx.strokeStyle = opts?.color || '#e74c3c';
      ctx.lineWidth = opts?.lineWidth || 2;
      ctx.setLineDash(opts?.lineDash || []);
      ctx.globalAlpha = opts?.opacity || 0.8;
      
      ctx.beginPath();
      ctx.moveTo(left, y1013);
      ctx.lineTo(right, y1013);
      ctx.stroke();
      
      // Etichetta a destra, sotto la linea
      if (opts?.label) {
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.font = (opts.font && typeof opts.font === 'string') ? opts.font : '8px system-ui, -apple-system, Segoe UI, Roboto, Arial';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(opts.label, right - 4, y1013 + 2);
      }
      
      ctx.restore();
    }
  }
};

// Plugin per linea orizzontale di soglia UV (es. UV = 8)
export const uvAlertLinePlugin = {
  id: 'uvAlertLine',
  afterDraw(chart, args, opts) {
    if (!opts || typeof opts.value !== 'number') return;
    const yScale = chart.scales.y2;
    if (!yScale) return;
    const { left, right, top, bottom } = chart.chartArea;
    const y = yScale.getPixelForValue(opts.value);
    if (y < top || y > bottom) return;
    const ctx = chart.ctx; ctx.save();
    // Usa il colore della linea UV se disponibile, altrimenti fallback
    const uvDs = Array.isArray(chart.data?.datasets)
      ? (chart.data.datasets.find(ds => ds?.yAxisID === 'y2' && (ds?.type === 'line' || ds?.type === undefined))
        || chart.data.datasets.find(ds => (ds?.label || '').toLowerCase().includes('uv')))
      : null;
    const derivedColor = uvDs ? (Array.isArray(uvDs.borderColor) ? uvDs.borderColor[0] : uvDs.borderColor) : undefined;
    const strokeColor = opts.color || derivedColor || '#6a1b9a';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.setLineDash(opts.lineDash || [6, 4]);
    ctx.globalAlpha = opts.opacity ?? 0.9;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    if (opts.label) {
      ctx.font = (opts.font && typeof opts.font === 'string') ? opts.font : '8px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top'; // posiziona SOTTO la linea
      ctx.fillText(opts.label, right - 4, y + 2);
    }
    ctx.restore();
  }
};

// Plugin per linea 21°C in modalità temperatura
export const temperature21LinePlugin = {
  id: 'temperature21Line',
  afterDraw(chart, args, opts) {
    const yScale = chart.scales.y;
    if (!yScale) return;
    
    const { ctx, chartArea } = chart;
    const { left, right, top, bottom } = chartArea;
    
    // Get the y pixel position for 21°C
    const y21 = yScale.getPixelForValue(21);
    
    // Only draw the line if 21°C is within the visible range
    if (y21 >= top && y21 <= bottom) {
      ctx.save();
      ctx.strokeStyle = opts?.color || '#27ae60';
      ctx.lineWidth = opts?.lineWidth || 2;
      ctx.setLineDash(opts?.lineDash || [8, 4]);
      ctx.globalAlpha = opts?.opacity || 0.8;
      
      ctx.beginPath();
      ctx.moveTo(left, y21);
      ctx.lineTo(right, y21);
      ctx.stroke();
      
      // Etichetta a destra, sotto la linea
      if (opts?.label) {
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.font = (opts.font && typeof opts.font === 'string') ? opts.font : '8px system-ui, -apple-system, Segoe UI, Roboto, Arial';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(opts.label, right - 4, y21 + 2);
      }
      
      ctx.restore();
    }
  }
};

// Plugin per icone meteo in modalità pressione (ogni 3 ore)
export const pressureWeatherIconsPlugin = {
  id: 'pressureWeatherIcons',
  afterDraw(chart, args, opts) {
    if (!opts || !opts.weatherCodes || !opts.isDayData) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    
    // Intervalli di 3 ore: 0-2, 3-5, 6-8, 9-11, 12-14, 15-17, 18-20, 21-23
    const threeHourIntervals = [
      { start: 0, center: 1 },   // 00:00-02:59, centered at 01:30
      { start: 3, center: 4 },   // 03:00-05:59, centered at 04:30  
      { start: 6, center: 7 },   // 06:00-08:59, centered at 07:30
      { start: 9, center: 10 },  // 09:00-11:59, centered at 10:30
      { start: 12, center: 13 }, // 12:00-14:59, centered at 13:30
      { start: 15, center: 16 }, // 15:00-17:59, centered at 16:30
      { start: 18, center: 19 }, // 18:00-20:59, centered at 19:30
      { start: 21, center: 22 }  // 21:00-23:59, centered at 22:30
    ];
    
    threeHourIntervals.forEach(interval => {
      const { start, center } = interval;
      const codes = [];
      const isDayValues = [];
      
      // Collect weather codes and day/night values for this 3-hour interval
      for (let i = start; i < start + 3 && i < opts.weatherCodes.length; i++) {
        if (typeof opts.weatherCodes[i] === 'number') {
          codes.push(opts.weatherCodes[i]);
          isDayValues.push(opts.isDayData[i]);
        }
      }
      
      if (codes.length === 0) return;
      
      // Select the most appropriate weather code for this interval
      const selectedWeatherCode = selectWeatherCodeForInterval(codes);
      
      // Select the most appropriate day/night value (use middle hour if available)
      const middleIndex = Math.floor(codes.length / 2);
      const selectedIsDay = isDayValues[middleIndex] !== undefined ? isDayValues[middleIndex] : isDayValues[0];
      
      // Draw the icon centered in the 3-hour interval
      drawWeatherIcon(ctx, xScale, chartArea, center, selectedWeatherCode, selectedIsDay);
    });
    
    ctx.restore();
  }
};

/**
 * Selects the most appropriate weather code for a 3-hour interval
 * @param {number[]} codes - Array of weather codes for the interval
 * @returns {number} - Selected weather code
 */
function selectWeatherCodeForInterval(codes) {
  if (codes.length === 0) return 0;
  
  // Choose the highest weather code in the interval
  return Math.max(...codes);
}

// Plugin per icone copertura nuvolosa in modalità temperature (ogni 3 ore)
export const cloudCoverageIconsPlugin = {
  id: 'cloudCoverageIcons',
  afterDraw(chart, args, opts) {
    if (!opts || !opts.cloudCoverageData) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const { ctx, chartArea } = chart;
    ctx.save();
    
    // Intervalli di 3 ore: 0-2, 3-5, 6-8, 9-11, 12-14, 15-17, 18-20, 21-23
    const threeHourIntervals = [
      { start: 0, center: 1 },   // 00:00-02:59, centered at 01:30
      { start: 3, center: 4 },   // 03:00-05:59, centered at 04:30  
      { start: 6, center: 7 },   // 06:00-08:59, centered at 07:30
      { start: 9, center: 10 },  // 09:00-11:59, centered at 10:30
      { start: 12, center: 13 }, // 12:00-14:59, centered at 13:30
      { start: 15, center: 16 }, // 15:00-17:59, centered at 16:30
      { start: 18, center: 19 }, // 18:00-20:59, centered at 19:30
      { start: 21, center: 22 }  // 21:00-23:59, centered at 22:30
    ];
    
    threeHourIntervals.forEach(interval => {
      const { start, center } = interval;
      const cloudValues = [];
      
      // Collect cloud coverage values for this 3-hour interval
      for (let i = start; i < start + 3 && i < opts.cloudCoverageData.length; i++) {
        if (typeof opts.cloudCoverageData[i] === 'number') {
          cloudValues.push(opts.cloudCoverageData[i]);
        }
      }
      
      if (cloudValues.length === 0) return;
      
      // Calculate average cloud coverage for this interval
      const avgCloudCoverage = cloudValues.reduce((sum, val) => sum + val, 0) / cloudValues.length;
      
      // Draw the cloud coverage icon centered in the 3-hour interval
      drawCloudCoverageIcon(ctx, xScale, chartArea, center, avgCloudCoverage);
    });
    
    ctx.restore();
  }
};

function timeStringToHours(str) { try { const t = str.split('T')[1]; if (!t) return null; const [h, m] = t.split(':').map(Number); return h + m / 60; } catch { return null; } }
function formatTime(str) { try { const t = str.split('T')[1]; return t ? t.substring(0, 5) : str; } catch { return str; } }
function formatDaylightHours(decimalHours) {
  try {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return minutes === 0 ? `${hours}h` : `${hours}h${minutes}m`;
  } catch {
    return `${decimalHours.toFixed(1)}h`;
  }
}
function drawSunIcon(ctx, xScale, area, h, type) {
  const x = xScale.getPixelForValue(h);
  if (x < area.left || x > area.right) return;
  // Real glyph characters (not double-escaped) so canvas renders icon instead of literal code
  const glyph = type === 'sunrise' ? '\uf051' : '\uf052';
  ctx.save();
  // Font-face dichiara font-family: 'weathericons' (minuscolo). Riduciamo dimensione.
  ctx.font = '16px weathericons';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = type === 'sunrise' ? '#dd8f11ff' : '#ff3b30';
  // Posizioniamo più in basso (sovrapposto alla linea dell'asse X)
  const y = area.bottom - 6; //  +/- sposta leggermente
  try { ctx.fillText(glyph, x, y); }
  catch { // Fallback: small triangle if font not ready
    ctx.beginPath();
    if (type === 'sunrise') { ctx.moveTo(x, y + 4); ctx.lineTo(x - 5, y + 10); ctx.lineTo(x + 5, y + 10); } else { ctx.moveTo(x, y + 10); ctx.lineTo(x - 5, y + 4); ctx.lineTo(x + 5, y + 4); } ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawWindArrow(ctx, xScale, area, hourIndex, direction) {
  const x = xScale.getPixelForValue(hourIndex);
  if (x < area.left || x > area.right) return;

  const y = area.top + 5; // Position arrows at same height as temperature chart icons
  const arrowLength = 12;
  const arrowHeadSize = 4;

  ctx.save();
  const arrowColor = getWindDirectionColor();
  ctx.strokeStyle = arrowColor;
  ctx.fillStyle = arrowColor;
  ctx.lineWidth = 1.5;

  // Convert wind direction to radians (direction is where wind comes FROM)
  // Subtract 90 degrees to align with north being up
  const angle = ((direction - 90) * Math.PI) / 180;

  // Calculate arrow start and end points, centered around rotation point
  const halfLength = arrowLength / 2;
  const startX = x - Math.cos(angle) * halfLength;
  const startY = y - Math.sin(angle) * halfLength;
  const endX = x + Math.cos(angle) * halfLength;
  const endY = y + Math.sin(angle) * halfLength;

  // Draw arrow shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw arrowhead
  const headAngle1 = angle - 0.5;
  const headAngle2 = angle + 0.5;

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(headAngle1) * arrowHeadSize, endY - Math.sin(headAngle1) * arrowHeadSize);
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(headAngle2) * arrowHeadSize, endY - Math.sin(headAngle2) * arrowHeadSize);
  ctx.stroke();

  ctx.restore();
}

function drawWeatherIcon(ctx, xScale, area, hourIndex, weatherCode, isDay) {
  const x = xScale.getPixelForValue(hourIndex);
  if (x < area.left || x > area.right) return;
  
  // Get the appropriate icon class for the weather code
  const iconClass = getRainIconClass(weatherCode, isDay);
  
  // Extract the icon code from the class (e.g., 'wi wi-day-sunny' -> get the unicode)
  let glyph = '';
  if (iconClass.includes('wi-day-sunny')) glyph = '\uf00d';
  else if (iconClass.includes('wi-night-clear')) glyph = '\uf02e';
  else if (iconClass.includes('wi-cloud')) glyph = '\uf013';
  else if (iconClass.includes('wi-rain')) glyph = '\uf019';
  else if (iconClass.includes('wi-snow')) glyph = '\uf01b';
  else if (iconClass.includes('wi-fog')) glyph = '\uf014';
  else if (iconClass.includes('wi-sprinkle')) glyph = '\uf01c';
  else if (iconClass.includes('wi-thunderstorm')) glyph = '\uf01e';
  else if (iconClass.includes('wi-storm-showers')) glyph = '\uf01d';
  else glyph = '\uf00d'; // Default to sun icon
  
  ctx.save();
  ctx.font = '14px weathericons';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Theme-based color: blue for normal theme, white for dark theme
  ctx.fillStyle = isDarkMode() ? '#f2f2f2' : '#3498db';
  
  // Position icons at the same height as temperature chart icons
  const y = area.top + 5;
  
  try {
    ctx.fillText(glyph, x, y);
  } catch {
    // Fallback: draw a simple circle if font not ready
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawCloudCoverageIcon(ctx, xScale, area, hourIndex, cloudCoverage) {
  const x = xScale.getPixelForValue(hourIndex);
  if (x < area.left || x > area.right) return;
  
  // Get the appropriate icon class for the cloud coverage percentage
  const iconClass = getCloudCoverIconClass(cloudCoverage);
  
  // Extract the icon code from the class (e.g., 'wi wi-cloud' -> get the unicode)
  let glyph = '';
  if (iconClass.includes('wi-cloud')) glyph = '\uf013';
  else if (iconClass.includes('wi-cloudy')) glyph = '\uf002';
  else if (iconClass.includes('wi-day-cloudy')) glyph = '\uf002';
  else if (iconClass.includes('wi-day-sunny-overcast')) glyph = '\uf00c';
  else glyph = '\uf013'; // Default to cloud icon
  
  ctx.save();
  ctx.font = '14px weathericons';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Use consistent color for all cloud coverage icons
  ctx.fillStyle = isDarkMode() ? '#f2f2f2' : '#3498db';
  
  // Position icons at the very top of the chart area for better visibility
  const y = area.top + 5; // Position above weather icons
  
  try {
    ctx.fillText(glyph, x, y);
  } catch {
    // Fallback: draw a simple circle if font not ready
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  ctx.restore();
}

export function getPrecipitationBarColor(v) { if (v > 30) return '#6c3483'; if (v > 10) return '#b03a2e'; if (v > 6) return '#e74c3c'; if (v > 4) return '#f39c12'; if (v > 2) return '#27ae60'; if (v > 1) return '#3498db'; return '#85c1e9'; }

export function getTemperatureLineColor(v) { if (v > 30) return '#e74c3c'; if (v > 25) return '#f39c12'; if (v > 20) return '#f1c40f'; if (v > 15) return '#27ae60'; if (v > 10) return '#3498db'; if (v > 5) return '#2980b9'; return '#34495e'; }

export function getWindSpeedColor(v) { if (v > 50) return '#8e44ad'; if (v > 30) return '#e74c3c'; if (v > 20) return '#f39c12'; if (v > 10) return '#27ae60'; if (v > 5) return '#3498db'; return '#85c1e9'; }

export function getPressureLineColor(v) { if (v > 1030) return '#e74c3c'; if (v > 1020) return '#f39c12'; if (v > 1010) return '#27ae60'; if (v > 1000) return '#3498db'; if (v > 990) return '#9b59b6'; return '#34495e'; }

export function getHumidityBarColor(v) { if (v > 80) return '#99ccff'; if (v > 60) return '#b3d9ff'; if (v > 40) return '#b3e6b3'; if (v > 30) return '#ffeb99'; return '#ffcc99'; }

export function getEAQIBarColor(eaqiValue) { 
  if (eaqiValue <= 20) return '#50f0e6';      // Good
  if (eaqiValue <= 40) return '#50ccaa';      // Fair  
  if (eaqiValue <= 60) return '#f0e641';      // Moderate
  if (eaqiValue <= 80) return '#ff5050';      // Poor
  if (eaqiValue <= 100) return '#960032';     // Very poor
  return '#7d2181';                           // Extremely poor
}

export function getPressureDeltaBarColor(delta) {
  // Color mapping for pressure deltas (pressure - 1013)
  // Positive deltas (high pressure) - warmer colors
  // Negative deltas (low pressure) - cooler colors
  if (delta > 15) return '#8b0000';     // Dark red for very high pressure
  if (delta > 10) return '#c0392b';     // Red for high pressure
  if (delta > 5) return '#e74c3c';      // Light red for moderately high pressure
  if (delta > 2) return '#f39c12';      // Orange for slightly high pressure
  if (delta > -2) return '#95a5a6';     // Gray for neutral pressure
  if (delta > -5) return '#3498db';     // Blue for slightly low pressure
  if (delta > -10) return '#2980b9';    // Darker blue for moderately low pressure
  if (delta > -15) return '#1f3a93';    // Dark blue for low pressure
  return '#0f1419';                     // Very dark blue for very low pressure
}

/**
 * Get warning color for showers/snowfall based on severity
 * @param {number} showersTotal - Total showers amount in mm (sum across interval)
 * @param {number} snowfallTotal - Total snowfall amount in cm (sum across interval)
 * @returns {string|null} Color code for warning icon or null if no warning
 */
export function getShowersSnowfallWarningColor(showersTotal, snowfallTotal) {
  // Convert snowfall to mm equivalent (1cm snow ≈ 10mm water equivalent)
  const snowfallMm = snowfallTotal * 10;
  const totalIntensity = showersTotal + snowfallMm;
  
  if (totalIntensity > 15) return '#e74c3c';     // Red - Heavy (> 15mm total in 3h)
  if (totalIntensity > 3) return '#f39c12';      // Orange - Medium (3-15mm total in 3h)
  if (totalIntensity > 0) return '#f1c40f';      // Yellow - Light (> 0mm total in 3h)
  return null;
}

/**
 * Draw weather icon for showers or snowfall on chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Color of the icon
 * @param {number} showersTotal - Total showers amount in mm (sum across interval)
 * @param {number} snowfallTotal - Total snowfall amount in cm (sum across interval)
 */
function drawShowersSnowfallIcon(ctx, x, y, color, showersTotal, snowfallTotal) {
  ctx.save();
  
  // Determine which icon to use based on predominant type
  // If snowfall is present (even small amounts), show snow icon
  // Otherwise show showers icon
  const glyph = snowfallTotal > 0 ? '\uf01b' : '\uf01a';  // wi-snow : wi-showers
  
  ctx.font = '14px weathericons';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  
  try {
    ctx.fillText(glyph, x, y);
  } catch {
    // Fallback: draw a simple circle if font not ready
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  ctx.restore();
}

// Plugin for showers/snowfall warning icons (one per 3-hour interval)
export const showersSnowfallWarningPlugin = {
  id: 'showersSnowfallWarning',
  afterDraw(chart, args, opts) {
    if (!opts || !opts.showers || !opts.snowfall) return;
    
    const xScale = chart.scales.x;
    if (!xScale) return;
    
    const { ctx, chartArea } = chart;
    const { left, right, top } = chartArea;
    
    ctx.save();
    
    // Intervalli di 3 ore: 0-2, 3-5, 6-8, 9-11, 12-14, 15-17, 18-20, 21-23
    const threeHourIntervals = [
      { start: 0, center: 1 },   // 00:00-02:59, centered at 01:30
      { start: 3, center: 4 },   // 03:00-05:59, centered at 04:30  
      { start: 6, center: 7 },   // 06:00-08:59, centered at 07:30
      { start: 9, center: 10 },  // 09:00-11:59, centered at 10:30
      { start: 12, center: 13 }, // 12:00-14:59, centered at 13:30
      { start: 15, center: 16 }, // 15:00-17:59, centered at 16:30
      { start: 18, center: 19 }, // 18:00-20:59, centered at 19:30
      { start: 21, center: 22 }  // 21:00-23:59, centered at 22:30
    ];
    
    threeHourIntervals.forEach(interval => {
      const { start, center } = interval;
      let showersTotal = 0;
      let snowfallTotal = 0;
      
      // Sum showers and snowfall values for this 3-hour interval
      for (let i = start; i < start + 3 && i < opts.showers.length; i++) {
        showersTotal += opts.showers[i] || 0;
        snowfallTotal += opts.snowfall[i] || 0;
      }
      
      // Calculate warning color based on total precipitation
      const color = getShowersSnowfallWarningColor(showersTotal, snowfallTotal);
      
      if (color) {
        const x = xScale.getPixelForValue(center);
        
        // Only draw if within visible area
        if (x >= left && x <= right) {
          // Position at top of chart area
          const y = top + 8;
          drawShowersSnowfallIcon(ctx, x, y, color, showersTotal, snowfallTotal);
        }
      }
    });
    
    ctx.restore();
  }
};

function isTouchDevice() { return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0; }

function isDarkMode() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }

function getWindDirectionColor() { return isDarkMode() ? '#f2f2f2' : '#3498db'; }

export function buildChart(target, probabilityData, precipitationData, sunriseTime = null, sunsetTime = null, showersData = null, snowfallData = null) {
  const el = document.getElementById(target); if (!el) return;
  // Clean up existing tooltip element tied to this chart target to prevent duplicates
  const staleTip = document.getElementById('chartjs-tooltip-' + target);
  if (staleTip && staleTip.parentNode) { try { staleTip.parentNode.removeChild(staleTip); } catch {}
  }
  if (chartInstances[target]) chartInstances[target].destroy();
  const precipColors = precipitationData.map(getPrecipitationBarColor); const m = Math.max(...precipitationData, 1); const maxPrecip = m < 2 ? 2 : Math.ceil(m);
  const plugins = [sunriseSunsetPlugin]; if (target === 'today-chart') plugins.push(currentHourLinePlugin); 
  // Add showers/snowfall warning plugin if data is available
  if (showersData && snowfallData) plugins.push(showersSnowfallWarningPlugin);
  plugins.push(xAxisAnchorLabelsPlugin);
  chartInstances[target] = new Chart(el, { plugins, data: { labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')), datasets: [{ label: 'Probabilità (%)', type: 'line', fill: true, tension: 0.4, backgroundColor: 'rgba(52,152,219,0.30)', borderColor: 'rgb(41,128,185)', borderWidth: 2, data: probabilityData, pointBackgroundColor: 'rgb(41,128,185)', pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y' }, { label: 'Precipitazione (mm/h)', type: 'bar', backgroundColor: precipColors, borderColor: precipColors, borderWidth: 1, data: precipitationData, yAxisID: 'y1', order: 2 }] }, options: { responsive: true, maintainAspectRatio: false, layout: { padding: 2 }, onHover: (e, a, chart) => { if (isTouchDevice() && a.length) { if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout); chart._tooltipTimeout = setTimeout(() => { chart.tooltip.setActiveElements([], { x: 0, y: 0 }); chart.setActiveElements([]); chart.update('none'); }, 3000); } }, scales: { y: { min: 0, max: 100, position: 'left', grid: { drawOnChartArea: true, color: 'rgba(200,200,200,0.2)', drawTicks: false }, ticks: { display: false } }, y1: { min: 0, max: maxPrecip, position: 'right', grid: { drawOnChartArea: false, drawTicks: false }, ticks: { display: false } }, x: { grid: { display: false }, ticks: { display: false, maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 6, color: '#7f8c8d' } } }, plugins: { currentHourLine: { color: '#27ae60', overlayColor: 'rgba(128,128,128,0.18)' }, sunriseSunset: { sunrise: sunriseTime, sunset: sunsetTime }, showersSnowfallWarning: { showers: showersData || [], snowfall: snowfallData || [] }, legend: { display: false }, tooltip: { enabled: false, external: ({ chart, tooltip }) => { let tip = document.getElementById('chartjs-tooltip-' + target); if (!tip) { tip = document.createElement('div'); tip.id = 'chartjs-tooltip-' + target; Object.assign(tip.style, { position: 'absolute', pointerEvents: 'none', transition: 'all .08s ease', zIndex: 30 }); document.body.appendChild(tip); } if (!tooltip || tooltip.opacity === 0) { tip.style.opacity = 0; return; } const rows = []; if (tooltip.dataPoints?.length) { const dp = tooltip.dataPoints[0]; const idx = dp.dataIndex; const prob = Math.round(dp.parsed.y); const ds2 = chart.data.datasets[1]; let mm = 0; if (ds2 && ds2.data && ds2.data[idx] != null) mm = ds2.data[idx]; const precipStr = mm < 1 && mm > 0 ? mm.toFixed(1) : Math.round(mm); rows.push({ k: 'rain', t: `Pioggia: ${precipStr}mm (${prob}%)` }); if (sunriseTime && sunsetTime) { const hour = parseFloat(dp.label.split(':')[0]); const sr = timeStringToHours(sunriseTime); const ss = timeStringToHours(sunsetTime); if (sr && ss) { const daylight = ss - sr; if (Math.abs(hour - sr) < 1) rows.push({ k: 'sunrise', t: `Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)` }); else if (Math.abs(hour - ss) < 1) rows.push({ k: 'sunset', t: `Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)` }); } } } const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : ''; let html = `<div style=\"font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;\">`; if (title) html += `<div style=\\"font-weight:600; margin-bottom:4px;\\">${title}</div>`; html += '<div style=\"display:flex; flex-direction:column; gap:2px;\">'; rows.forEach(r => { let icon = ''; if (r.k === 'rain') icon = '<i class=\"wi wi-umbrella\" style=\"margin-right:4px; color:#3498db;\"></i>'; else if (r.k === 'sunrise') icon = '<i class=\"wi wi-sunrise\" style=\"margin-right:4px; color:#f39c12;\"></i>'; else if (r.k === 'sunset') icon = '<i class=\"wi wi-sunset\" style=\"margin-right:4px; color:#ff3b30;\"></i>'; html += `<div style=\\"display:flex; align-items:center; font-size:12px; line-height:1.2;\\">${icon}<span>${r.t}</span></div>`; }); html += '</div></div>'; tip.innerHTML = html; const rect = chart.canvas.getBoundingClientRect(); const bodyRect = document.body.getBoundingClientRect(); const left = rect.left + window.pageXOffset + tooltip.caretX + 10; const top = rect.top + window.pageYOffset + tooltip.caretY - 10; tip.style.left = Math.min(left, bodyRect.width - 260) + 'px'; tip.style.top = top + 'px'; tip.style.opacity = 1; } } }, interaction: { mode: 'index', intersect: false } } });
  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { try { chartInstances[target].update(); } catch { } });
  }
}

export function buildTemperatureChart(target, temperatureData, apparentTemperatureData, humidityData = null, sunriseTime = null, sunsetTime = null) {
  const el = document.getElementById(target); 
  if (!el) return; 
  // Clean up existing tooltip before destroying chart to prevent parentNode errors
  const staleTip = document.getElementById('chartjs-tooltip-' + target);
  if (staleTip && staleTip.parentNode) { try { staleTip.parentNode.removeChild(staleTip); } catch {} }
  if (chartInstances[target]) chartInstances[target].destroy();
  
  const tempColors = temperatureData.map(getTemperatureLineColor);
  let minTemp = Math.min(...temperatureData, ...apparentTemperatureData) - 2;
  let maxTemp = Math.max(...temperatureData, ...apparentTemperatureData) + 2;
  
  // Ensure 21°C reference line is always visible in the chart
  const referenceTemp = 21;
  if (minTemp > referenceTemp) {
    minTemp = referenceTemp - 2;
  }
  if (maxTemp < referenceTemp) {
    maxTemp = referenceTemp + 2;
  }
  
  const plugins = [sunriseSunsetPlugin];
  if (target === 'today-chart') plugins.push(currentHourLinePlugin);
  plugins.push(temperature21LinePlugin);
  plugins.push(xAxisAnchorLabelsPlugin);
  
  // Build datasets array - always include temperature lines
  const datasets = [
    { 
      label: 'Temperatura (°C)', 
      type: 'line', 
      fill: false, 
      tension: 0.4, 
      backgroundColor: 'rgb(231,76,60)', 
      borderColor: 'rgb(231,76,60)', 
      borderWidth: 2, 
      data: temperatureData, 
      pointBackgroundColor: tempColors, 
      pointRadius: 0, 
      pointHoverRadius: 4, 
      yAxisID: 'y' 
    },
    { 
      label: 'Temperatura percepita (°C)', 
      type: 'line', 
      fill: false, 
      tension: 0.4, 
      backgroundColor: 'rgba(233,30,99,0.8)', 
      borderColor: 'rgb(233,30,99)', 
      borderWidth: 2, 
      borderDash: [5, 5], 
      data: apparentTemperatureData, 
      pointBackgroundColor: 'rgb(233,30,99)', 
      pointRadius: 0, 
      pointHoverRadius: 4, 
      yAxisID: 'y' 
    }
  ];
  
  // Build scales object
  let scales = { 
    y: { 
      min: minTemp, 
      max: maxTemp, 
      position: 'left', 
      grid: { 
        drawOnChartArea: true, 
        color: 'rgba(200,200,200,0.2)', 
        drawTicks: false 
      }, 
      ticks: { display: false } 
    }, 
    x: { 
      grid: { display: false }, 
      ticks: { 
        display: false,
        maxRotation: 0, 
        minRotation: 0, 
        autoSkip: true, 
        maxTicksLimit: 6, 
        color: '#7f8c8d' 
      } 
    } 
  };
  
  // Add humidity bars if data is available
  if (humidityData && Array.isArray(humidityData)) {
    const humidityColors = humidityData.map(getHumidityBarColor);
    datasets.push({ 
      label: 'Umidità (%)', 
      type: 'bar', 
      backgroundColor: humidityColors, 
      borderColor: humidityColors, 
      borderWidth: 1, 
      data: humidityData, 
      yAxisID: 'y1', 
      order: 2 
    });
    scales.y1 = { 
      min: 0, 
      max: 100, 
      beginAtZero: true,
      position: 'right', 
      grid: { 
        drawOnChartArea: false, 
        drawTicks: false 
      }, 
      ticks: { 
        display: false,
        min: 0,
        max: 100
      },
      bounds: 'data',
      afterBuildTicks: function(scale) {
        // Force the scale to always be 0-100
        scale.min = 0;
        scale.max = 100;
        return;
      }
    };
  }
  
  chartInstances[target] = new Chart(el, { 
    plugins, 
    data: { 
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')), 
      datasets 
    }, 
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      layout: { padding: 2 }, 
      onHover: (e, a, chart) => { 
        if (isTouchDevice() && a.length) { 
          if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout); 
          chart._tooltipTimeout = setTimeout(() => { 
            chart.tooltip.setActiveElements([], { x: 0, y: 0 }); 
            chart.setActiveElements([]); 
            chart.update('none'); 
          }, 3000); 
        } 
      }, 
      scales, 
      plugins: { 
        temperature21Line: {
          color: 'rgb(231,76,60)',
          lineWidth: 2,
          lineDash: [8, 4],
          opacity: 0.8,
          label: '21°C'
        },
        currentHourLine: { 
          color: '#27ae60', 
          overlayColor: 'rgba(128,128,128,0.18)' 
        }, 
        sunriseSunset: { 
          sunrise: sunriseTime, 
          sunset: sunsetTime 
        }, 
        legend: { display: false }, 
        tooltip: { 
          enabled: false, 
          external: ({ chart, tooltip }) => { 
            let tip = document.getElementById('chartjs-tooltip-' + target); 
            if (!tip) { 
              tip = document.createElement('div'); 
              tip.id = 'chartjs-tooltip-' + target; 
              Object.assign(tip.style, { 
                position: 'absolute', 
                pointerEvents: 'none', 
                transition: 'all .08s ease', 
                zIndex: 30 
              }); 
              document.body.appendChild(tip); 
            } 
            if (!tooltip || tooltip.opacity === 0) { 
              tip.style.opacity = 0; 
              return; 
            } 
            const rows = []; 
            if (tooltip.dataPoints?.length) { 
              const dp = tooltip.dataPoints[0]; 
              const idx = dp.dataIndex; 
              const temp = Math.round(dp.parsed.y); 
              const ds2 = chart.data.datasets[1]; 
              let apparent = temp; 
              if (ds2 && ds2.data && ds2.data[idx] != null) apparent = Math.round(ds2.data[idx]); 
              rows.push({ k: 'temp', t: `Temperatura: ${temp}°C` }); 
              if (Math.abs(temp - apparent) > 1) rows.push({ k: 'apparent', t: `Percepita: ${apparent}°C` }); 
              // Add humidity info if available
              const ds3 = chart.data.datasets[2]; 
              if (ds3 && ds3.data && ds3.data[idx] != null) { 
                const humidity = Math.round(ds3.data[idx]); 
                rows.push({ k: 'humidity', t: `Umidità: ${humidity}%` }); 
              } 
              if (sunriseTime && sunsetTime) { 
                const hour = parseFloat(dp.label.split(':')[0]); 
                const sr = timeStringToHours(sunriseTime); 
                const ss = timeStringToHours(sunsetTime); 
                if (sr && ss) { 
                  const daylight = ss - sr; 
                  if (Math.abs(hour - sr) < 1) rows.push({ k: 'sunrise', t: `Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)` }); 
                  else if (Math.abs(hour - ss) < 1) rows.push({ k: 'sunset', t: `Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)` }); 
                } 
              } 
            } 
            const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : ''; 
            let html = `<div style="font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;">`; 
            if (title) html += `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`; 
            html += '<div style="display:flex; flex-direction:column; gap:2px;">'; 
            rows.forEach(r => { 
              let icon = ''; 
              if (r.k === 'temp') icon = '<i class="wi wi-thermometer" style="margin-right:4px; color:#e74c3c;"></i>'; 
              else if (r.k === 'apparent') icon = '<i class="wi wi-thermometer-exterior" style="margin-right:4px; color:#e91e63;"></i>'; 
              else if (r.k === 'humidity') icon = '<i class="wi wi-humidity" style="margin-right:4px; color:#3498db;"></i>';
              else if (r.k === 'sunrise') icon = '<i class="wi wi-sunrise" style="margin-right:4px; color:#f39c12;"></i>'; 
              else if (r.k === 'sunset') icon = '<i class="wi wi-sunset" style="margin-right:4px; color:#ff3b30;"></i>'; 
              html += `<div style="display:flex; align-items:center; font-size:12px; line-height:1.2;">${icon}<span>${r.t}</span></div>`; 
            }); 
            html += '</div></div>'; 
            tip.innerHTML = html; 
            const rect = chart.canvas.getBoundingClientRect(); 
            const bodyRect = document.body.getBoundingClientRect(); 
            const left = rect.left + window.pageXOffset + tooltip.caretX + 10; 
            const top = rect.top + window.pageYOffset + tooltip.caretY - 10; 
            tip.style.left = Math.min(left, bodyRect.width - 260) + 'px'; 
            tip.style.top = top + 'px'; 
            tip.style.opacity = 1; 
          } 
        } 
      }, 
      interaction: { 
        mode: 'index', 
        intersect: false 
      } 
    } 
  });
  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { try { chartInstances[target].update(); } catch { } });
  }
}

export function buildWindChart(target, windSpeedData, windDirectionData, sunriseTime = null, sunsetTime = null) {
  const el = document.getElementById(target);
  if (!el) return;
  
  // Clean up existing tooltip before destroying chart to prevent parentNode errors
  const existingTooltip = document.getElementById('chartjs-tooltip-' + target);
  if (existingTooltip && existingTooltip.parentNode) {
    existingTooltip.parentNode.removeChild(existingTooltip);
  }
  
  if (chartInstances[target]) chartInstances[target].destroy();

  const windColors = windSpeedData.map(getWindSpeedColor);
  const maxSpeed = Math.max(...windSpeedData, 10); // Minimum scale of 10 km/h
  const plugins = [sunriseSunsetPlugin, windDirectionPlugin];
  if (target === 'today-chart') plugins.push(currentHourLinePlugin);
  plugins.push(xAxisAnchorLabelsPlugin);

  chartInstances[target] = new Chart(el, {
    plugins,
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')),
      datasets: [{
        label: 'Velocità vento (km/h)',
        type: 'bar',
        backgroundColor: windColors,
        borderColor: windColors,
        borderWidth: 1,
        data: windSpeedData,
        yAxisID: 'y'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 2 },
      onHover: (e, a, chart) => {
        if (isTouchDevice() && a.length) {
          if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout);
          chart._tooltipTimeout = setTimeout(() => {
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.setActiveElements([]);
            chart.update('none');
          }, 3000);
        }
      },
      scales: {
        y: {
          min: 0,
          max: Math.ceil(maxSpeed * 1.2),
          position: 'left',
          grid: {
            drawOnChartArea: true,
            color: 'rgba(200,200,200,0.2)',
            drawTicks: false
          },
          ticks: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
            display: false,
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            color: '#7f8c8d'
          }
        }
      },
      plugins: {
        currentHourLine: {
          color: '#27ae60',
          overlayColor: 'rgba(128,128,128,0.18)'
        },
        sunriseSunset: {
          sunrise: sunriseTime,
          sunset: sunsetTime
        },
        windDirection: {
          windDirections: windDirectionData
        },
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: ({ chart, tooltip }) => {
            let tip = document.getElementById('chartjs-tooltip-' + target);
            if (!tip) {
              tip = document.createElement('div');
              tip.id = 'chartjs-tooltip-' + target;
              Object.assign(tip.style, {
                position: 'absolute',
                pointerEvents: 'none',
                transition: 'all .08s ease',
                zIndex: 30
              });
              document.body.appendChild(tip);
            }

            if (!tooltip || tooltip.opacity === 0) {
              // Defensive check - ensure tip still exists and has a parent before manipulating it
              if (tip && tip.parentNode) {
                tip.style.opacity = 0;
              }
              return;
            }

            const rows = [];
            if (tooltip.dataPoints?.length) {
              const dp = tooltip.dataPoints[0];
              const idx = dp.dataIndex;
              const speed = Math.round(dp.parsed.y);
              const direction = windDirectionData[idx];

              rows.push({ k: 'wind', t: `Vento: ${speed} km/h` });

              if (typeof direction === 'number') {
                const directionText = getWindDirectionText(direction);
                const italianName = getItalianWindName(directionText);
                const directionDisplay = italianName ? `${directionText} (${italianName})` : directionText;
                rows.push({ k: 'direction', t: `Direzione: ${directionDisplay}` });
              }

              if (sunriseTime && sunsetTime) {
                const hour = parseFloat(dp.label.split(':')[0]);
                const sr = timeStringToHours(sunriseTime);
                const ss = timeStringToHours(sunsetTime);
                if (sr && ss) {
                  const daylight = ss - sr;
                  if (Math.abs(hour - sr) < 1) {
                    rows.push({ k: 'sunrise', t: `Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)` });
                  } else if (Math.abs(hour - ss) < 1) {
                    rows.push({ k: 'sunset', t: `Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)` });
                  }
                }
              }
            }

            const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : '';
            let html = `<div style="font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;">`;

            if (title) {
              html += `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`;
            }

            html += '<div style="display:flex; flex-direction:column; gap:2px;">';
            rows.forEach(r => {
              let icon = '';
              if (r.k === 'wind') icon = '<i class="wi wi-strong-wind" style="margin-right:4px; color:#3498db;"></i>';
              else if (r.k === 'direction') icon = `<i class="wi wi-wind-direction" style="margin-right:4px; color:${getWindDirectionColor()};"></i>`;
              else if (r.k === 'sunrise') icon = '<i class="wi wi-sunrise" style="margin-right:4px; color:#f39c12;"></i>';
              else if (r.k === 'sunset') icon = '<i class="wi wi-sunset" style="margin-right:4px; color:#ff3b30;"></i>';

              html += `<div style="display:flex; align-items:center; font-size:12px; line-height:1.2;">${icon}<span>${r.t}</span></div>`;
            });
            html += '</div></div>';

            tip.innerHTML = html;

            const rect = chart.canvas.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const left = rect.left + window.pageXOffset + tooltip.caretX + 10;
            const top = rect.top + window.pageYOffset + tooltip.caretY - 10;

            // Defensive check - ensure tip still exists and has a parent before setting final styles
            if (tip && tip.parentNode) {
              tip.style.left = Math.min(left, bodyRect.width - 260) + 'px';
              tip.style.top = top + 'px';
              tip.style.opacity = 1;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });

  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      try {
        chartInstances[target].update();
      } catch (e) { }
    });
  }
}

export function buildPressureChart(target, pressureData, sunriseTime = null, sunsetTime = null, weatherCodes = null, isDayData = null, unifiedScale = null) {
  const el = document.getElementById(target);
  if (!el) return;
  // Clean up existing tooltip before destroying chart to prevent duplicates
  const staleTip = document.getElementById('chartjs-tooltip-' + target);
  if (staleTip && staleTip.parentNode) { try { staleTip.parentNode.removeChild(staleTip); } catch {} }
  if (chartInstances[target]) chartInstances[target].destroy();

  // Calculate pressure deltas (pressure - 1013)
  const pressureDeltas = pressureData.map(pressure => pressure - 1013);
  const deltasColors = pressureDeltas.map(getPressureDeltaBarColor);
  
  let minPressure, maxPressure;
  
  // Use unified scale if provided, otherwise calculate individual scale
  if (unifiedScale && typeof unifiedScale.min === 'number' && typeof unifiedScale.max === 'number') {
    minPressure = unifiedScale.min;
    maxPressure = unifiedScale.max;
  } else {
    // Calculate scale to ensure 1013 hPa is visible but not necessarily centered
    const dataMin = Math.min(...pressureData);
    const dataMax = Math.max(...pressureData);
    const referencePoint = 1013;
    
    // Calculate natural data range with padding
    const dataRange = dataMax - dataMin;
    const basePadding = Math.max(dataRange * 0.15, 3); // 15% padding or minimum 3 hPa
    
    // Start with natural data bounds plus padding
    minPressure = dataMin - basePadding;
    maxPressure = dataMax + basePadding;
    
    // Ensure 1013 hPa reference line is visible within the chart
    if (referencePoint < minPressure) {
      // 1013 is below the current range, extend downward
      minPressure = referencePoint - basePadding;
    } else if (referencePoint > maxPressure) {
      // 1013 is above the current range, extend upward  
      maxPressure = referencePoint + basePadding;
    }
    
    // Ensure minimum range for chart readability
    const finalRange = maxPressure - minPressure;
    if (finalRange < 10) {
      const center = (minPressure + maxPressure) / 2;
      minPressure = center - 5;
      maxPressure = center + 5;
    }
  }
  
  const referencePoint = 1013;
  
  // Calculate delta scale range - center delta bars on 1013 hPa line
  const maxDelta = Math.max(...pressureDeltas.map(Math.abs));
  const deltaRange = Math.max(maxDelta, 5); // Minimum range of 5 hPa
  
  // Calculate where 1013 hPa falls in the pressure scale (as a fraction from 0 to 1)
  const pressurePosition = (referencePoint - minPressure) / (maxPressure - minPressure);
  
  // Adjust delta scale so that 0 (zero delta) aligns with 1013 hPa position
  // We want: (0 - minDelta) / (maxDeltaValue - minDelta) = pressurePosition
  // Solving: minDelta = -pressurePosition * 2 * deltaRange, maxDeltaValue = (1 - pressurePosition) * 2 * deltaRange
  const minDelta = -pressurePosition * 2 * deltaRange;
  const maxDeltaValue = (1 - pressurePosition) * 2 * deltaRange;
  
  const plugins = [sunriseSunsetPlugin, pressure1013LinePlugin];
  if (target === 'today-chart') plugins.push(currentHourLinePlugin);
  if (weatherCodes && isDayData) plugins.push(pressureWeatherIconsPlugin);
  plugins.push(xAxisAnchorLabelsPlugin);

  chartInstances[target] = new Chart(el, {
    plugins,
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')),
      datasets: [
        {
          label: 'Delta Pressione (hPa)',
          type: 'bar',
          backgroundColor: deltasColors,
          borderColor: deltasColors,
          borderWidth: 0,
          data: pressureDeltas,
          yAxisID: 'y1',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 2 },
      onHover: (e, a, chart) => {
        if (isTouchDevice() && a.length) {
          if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout);
          chart._tooltipTimeout = setTimeout(() => {
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.setActiveElements([]);
            chart.update('none');
          }, 3000);
        }
      },
      scales: {
        y: {
          min: minPressure,
          max: maxPressure,
          position: 'left',
          grid: {
            drawOnChartArea: false,
            drawTicks: false
          },
          ticks: { display: false }
        },
        y1: {
          min: minDelta,
          max: maxDeltaValue,
          position: 'right',
          grid: {
            drawOnChartArea: false,
            drawTicks: false
          },
          ticks: { display: false },
          display: false // Hide the axis completely
        },
        x: {
          grid: { display: false },
          ticks: {
            display: false,
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            color: '#7f8c8d'
          }
        }
      },
      plugins: {
        pressure1013Line: {
          color: 'rgb(142, 68, 173)',
          lineWidth: 2,
          lineDash: [8, 4],
          opacity: 0.8,
          label: '1013 hPa'
        },
        currentHourLine: {
          color: '#27ae60',
          overlayColor: 'rgba(128,128,128,0.18)'
        },
        sunriseSunset: {
          sunrise: sunriseTime,
          sunset: sunsetTime
        },
        pressureWeatherIcons: {
          weatherCodes: weatherCodes,
          isDayData: isDayData
        },
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: ({ chart, tooltip }) => {
            let tip = document.getElementById('chartjs-tooltip-' + target);
            if (!tip) {
              tip = document.createElement('div');
              tip.id = 'chartjs-tooltip-' + target;
              Object.assign(tip.style, {
                position: 'absolute',
                pointerEvents: 'none',
                transition: 'all .08s ease',
                zIndex: 30
              });
              document.body.appendChild(tip);
            }

            if (!tooltip || tooltip.opacity === 0) {
              tip.style.opacity = 0;
              return;
            }

            const rows = [];
            if (tooltip.dataPoints?.length) {
              // Bar dataset now at index 0 shows delta, calculate actual pressure
              const deltaDataPoint = tooltip.dataPoints.find(dp => dp.datasetIndex === 0);
              if (deltaDataPoint) {
                // Delta is (pressure - 1013), so pressure = delta + 1013
                const delta = deltaDataPoint.parsed.y;
                const pressure = Math.round(delta + 1013);
                rows.push({ k: 'pressure', t: `Pressione: ${pressure} hPa` });

                // Add weather information if available
                if (weatherCodes && isDayData) {
                  const hourIndex = deltaDataPoint.dataIndex;
                  const weatherCode = weatherCodes[hourIndex];
                  const isDay = isDayData[hourIndex];
                  
                  if (typeof weatherCode === 'number') {
                    const weatherDesc = getWeatherDescription(weatherCode);
                    const iconClass = getRainIconClass(weatherCode, isDay);
                    rows.push({ k: 'weather', t: weatherDesc, weatherCode, isDay, iconClass });
                  }
                }

                if (sunriseTime && sunsetTime) {
                  const hour = parseFloat(deltaDataPoint.label.split(':')[0]);
                  const sr = timeStringToHours(sunriseTime);
                  const ss = timeStringToHours(sunsetTime);
                  if (sr && ss) {
                    const daylight = ss - sr;
                    if (Math.abs(hour - sr) < 1) rows.push({ k: 'sunrise', t: `Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)` });
                    else if (Math.abs(hour - ss) < 1) rows.push({ k: 'sunset', t: `Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)` });
                  }
                }
              }
            }

            const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : '';
            let html = `<div style="font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;">`;
            if (title) html += `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`;
            html += '<div style="display:flex; flex-direction:column; gap:2px;">';
            rows.forEach(r => {
              let icon = '';
              if (r.k === 'pressure') icon = '<i class="wi wi-barometer" style="margin-right:4px; color:#8e44ad;"></i>';
              else if (r.k === 'weather') {
                // Use the actual weather icon and apply theme-based color
                const iconClass = r.iconClass || 'wi wi-cloud';
                const iconColor = isDarkMode() ? '#f2f2f2' : '#3498db'; // White for dark theme, blue for normal theme
                icon = `<i class="${iconClass}" style="margin-right:4px; color:${iconColor};"></i>`;
              }
              else if (r.k === 'sunrise') icon = '<i class="wi wi-sunrise" style="margin-right:4px; color:#f39c12;"></i>';
              else if (r.k === 'sunset') icon = '<i class="wi wi-sunset" style="margin-right:4px; color:#ff3b30;"></i>';
              html += `<div style="display:flex; align-items:center; font-size:12px; line-height:1.2;">${icon}<span>${r.t}</span></div>`;
            });
            html += '</div></div>';

            tip.innerHTML = html;

            const rect = chart.canvas.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const left = rect.left + window.pageXOffset + tooltip.caretX + 10;
            const top = rect.top + window.pageYOffset + tooltip.caretY - 10;
            tip.style.left = Math.min(left, bodyRect.width - 260) + 'px';
            tip.style.top = top + 'px';
            tip.style.opacity = 1;
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });

  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      try {
        chartInstances[target].update();
      } catch (e) { }
    });
  }
}

function getWindDirectionText(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

function getItalianWindName(compassDirection) {
  const windNames = {
    'N': 'Tramontana',
    'NE': 'Grecale', 
    'E': 'Levante',
    'SE': 'Scirocco',
    'S': 'Ostro',
    'SW': 'Libeccio',
    'W': 'Ponente', 
    'NW': 'Maestrale'
  };
  return windNames[compassDirection] || null;
}

/**
 * Construisce un grafico a barre per la qualità dell'aria (EAQI)
 * @param {string} target - ID dell'elemento canvas
 * @param {Array} eaqiData - Array di valori EAQI orari (24 elementi)
 * @param {string} sunriseTime - Orario alba (opzionale)
 * @param {string} sunsetTime - Orario tramonto (opzionale) 
 */
export function buildAirQualityChart(target, eaqiData, uvData = null, sunriseTime = null, sunsetTime = null, cloudCoverageData = null) {
  const el = document.getElementById(target);
  if (!el) return;
  if (chartInstances[target]) chartInstances[target].destroy();

  // Mappa i colori EAQI per ogni valore
  const eaqiColors = eaqiData.map(getEAQIBarColor);
  
  // Calcola il range per le scale
  const maxEAQI = Math.max(...eaqiData);
  const minEAQI = Math.min(...eaqiData);

  // Calcola range UV se disponibile
  const UV_ALERT_THRESHOLD = 8;
  const hasUV = Array.isArray(uvData) && uvData.length === eaqiData.length;
  const maxUV = hasUV ? Math.max(...uvData, 0) : 0;
  const uvAxisMax = hasUV ? Math.max(10, 2*UV_ALERT_THRESHOLD) : 10;
  
  // Assicura un range minimo per leggibilità
  let scaleMax = Math.max(maxEAQI + 5, 50); // Almeno 50 per vedere i livelli base
  let scaleMin = Math.max(0, minEAQI - 5);

  const plugins = [sunriseSunsetPlugin];
  if (target === 'today-chart') plugins.push(currentHourLinePlugin);
  if (cloudCoverageData) plugins.push(cloudCoverageIconsPlugin);
  if (hasUV) plugins.push(uvAlertLinePlugin);
  plugins.push(xAxisAnchorLabelsPlugin);

  chartInstances[target] = new Chart(el, {
    plugins,
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')),
      datasets: [
        {
          label: 'Qualità dell\'aria (EAQI)',
          type: 'bar',
          backgroundColor: eaqiColors,
          borderColor: eaqiColors.map(color => color),
          borderWidth: 1,
          data: eaqiData,
          maxBarThickness: 30,
          yAxisID: 'y',
          order: 2
        },
        ...(hasUV ? [{
          label: 'UV Index',
          type: 'line',
          fill: true,
          tension: 0.35,
          backgroundColor: 'rgba(106, 27, 154, 0.20)',
          borderColor: '#6a1b9a',
          borderWidth: 2,
          data: uvData,
          pointBackgroundColor: 'rgba(106, 27, 154, 0.20)',
          pointBorderColor: '#6a1b9a',
          pointBorderWidth: 0,
          pointRadius: 0,
          pointHitRadius: 4,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#6a1b9a',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          yAxisID: 'y2',
          order: 1
        }] : [])
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 2 },
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (e, a, chart) => {
        if (isTouchDevice() && a.length) {
          if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout);
          chart._tooltipTimeout = setTimeout(() => {
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.setActiveElements([]);
            chart.update('none');
          }, 3000);
        }
      },
      scales: {
        y: {
          min: scaleMin,
          max: scaleMax,
          grid: {
            drawOnChartArea: false,
            drawTicks: false
          },
          ticks: { display: false }
        },
        ...(hasUV ? {
          y2: {
            min: 0,
            max: uvAxisMax,
            position: 'right',
            grid: { drawOnChartArea: false, drawTicks: false },
            ticks: { display: false }
          }
        } : {}),
        x: {
          grid: { display: false },
          ticks: {
            display: false,
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            color: '#7f8c8d'
          }
        }
      },
      plugins: {
        currentHourLine: {
          color: '#27ae60',
          overlayColor: 'rgba(128,128,128,0.18)'
        },
        sunriseSunset: {
          sunrise: sunriseTime,
          sunset: sunsetTime
        },
        cloudCoverageIcons: cloudCoverageData ? {
          cloudCoverageData: cloudCoverageData
        } : undefined,
        uvAlertLine: hasUV ? {
          value: UV_ALERT_THRESHOLD,
          lineWidth: 2,
          lineDash: [6, 4],
          label: 'UV 8'
        } : undefined,
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: ({ chart, tooltip }) => {
            let tip = document.getElementById('chartjs-tooltip-' + target);
            if (!tip) {
              tip = document.createElement('div');
              tip.id = 'chartjs-tooltip-' + target;
              Object.assign(tip.style, {
                position: 'absolute',
                pointerEvents: 'none',
                transition: 'all .08s ease',
                zIndex: 30
              });
              document.body.appendChild(tip);
            }

            if (!tooltip || tooltip.opacity === 0) {
              tip.style.opacity = 0;
              return;
            }

            const rows = [];
            if (tooltip.dataPoints?.length) {
              // Trova il punto EAQI (dataset bar)
              const dpEAQI = tooltip.dataPoints.find(dp => dp.datasetIndex === 0) || tooltip.dataPoints[0];
              const idx = dpEAQI.dataIndex;
              const eaqiValue = Math.round(dpEAQI.parsed.y);
              
              // Determina il livello di qualità dell'aria
              let eaqiLevel = 'Buona';
              if (eaqiValue > 100) eaqiLevel = 'Estremamente pessima';
              else if (eaqiValue > 80) eaqiLevel = 'Pessima';
              else if (eaqiValue > 60) eaqiLevel = 'Scarsa';
              else if (eaqiValue > 40) eaqiLevel = 'Moderata';
              else if (eaqiValue > 20) eaqiLevel = 'Discreta';
              
              rows.push({ k: 'eaqi', t: `EAQI: ${eaqiValue} (${eaqiLevel})` });

              // Aggiungi UV se disponibile
              if (hasUV && chart.data.datasets[1] && chart.data.datasets[1].label === 'UV Index') {
                const uvValRaw = chart.data.datasets[1].data[idx];
                if (uvValRaw != null) {
                  const uvVal = Math.round(uvValRaw * 10) / 10;
                  let uvLevel = 'Basso';
                  if (uvVal >= 11) uvLevel = 'Estremo';
                  else if (uvVal >= 8) uvLevel = 'Molto alto';
                  else if (uvVal >= 6) uvLevel = 'Alto';
                  else if (uvVal >= 3) uvLevel = 'Moderato';
                  rows.push({ k: 'uv', t: `UV: ${uvVal} (${uvLevel})` });
                }
              }

              // Add cloud coverage info if available
              const cloudCoveragePlugin = chart.options.plugins.cloudCoverageIcons;
              if (cloudCoveragePlugin && cloudCoveragePlugin.cloudCoverageData && cloudCoveragePlugin.cloudCoverageData[idx] != null) {
                const cloudCoverage = Math.round(cloudCoveragePlugin.cloudCoverageData[idx]);
                const cloudDesc = getCloudCoverDescription(cloudCoverage);
                rows.push({ k: 'cloud', t: `Copertura: ${cloudDesc}` });
              }

              if (sunriseTime && sunsetTime) {
                const hour = parseFloat(dpEAQI.label.split(':')[0]);
                const sr = timeStringToHours(sunriseTime);
                const ss = timeStringToHours(sunsetTime);
                if (sr && ss) {
                  const daylight = ss - sr;
                  if (Math.abs(hour - sr) < 1) {
                    rows.push({ k: 'sunrise', t: `Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)` });
                  } else if (Math.abs(hour - ss) < 1) {
                    rows.push({ k: 'sunset', t: `Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)` });
                  }
                }
              }
            }

            const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : '';
            let html = `<div style="font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;">`;
            if (title) html += `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`;
            html += '<div style="display:flex; flex-direction:column; gap:2px;">';
            rows.forEach(r => {
              let icon = '';
              if (r.k === 'eaqi') icon = '<i class="wi wi-smog" style="margin-right:4px; color:#50ccaa;"></i>';
              else if (r.k === 'uv') icon = '<i class="wi wi-day-sunny" style="margin-right:4px; color:#bb86fc;"></i>';
              else if (r.k === 'cloud') icon = '<i class="wi wi-cloud" style="margin-right:4px; color:#95a5a6;"></i>';
              else if (r.k === 'sunrise') icon = '<i class="wi wi-sunrise" style="margin-right:4px; color:#f39c12;"></i>';
              else if (r.k === 'sunset') icon = '<i class="wi wi-sunset" style="margin-right:4px; color:#ff3b30;"></i>';
              html += `<div style="display:flex; align-items:center; font-size:12px; line-height:1.2;">${icon}<span>${r.t}</span></div>`;
            });
            html += '</div></div>';

            tip.innerHTML = html;

            const rect = chart.canvas.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const left = rect.left + window.pageXOffset + tooltip.caretX + 10;
            const top = rect.top + window.pageYOffset + tooltip.caretY - 10;

            tip.style.left = Math.min(left, bodyRect.width - 260) + 'px';
            tip.style.top = top + 'px';
            tip.style.opacity = 1;
          }
        }
      }
    }
  });
}
