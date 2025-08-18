import { DAY_CONFIGS } from './constants.js';

export const chartInstances = {};

export function getDaySlice(array, dayIndex) {
  const start = dayIndex * 24;
  return array.slice(start, start + 24);
}

// Plugin linea ora corrente (solo grafico today)
export const currentHourLinePlugin = {
  id: 'currentHourLine',
  afterDraw(chart, args, opts) {
    if (chart.config?.data?.labels?.length !== 24) return;
    if (!opts) return;
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
    try {
      const { left } = chart.chartArea;
      if (x > left) {
        ctx.fillStyle = opts.overlayColor || 'rgba(120,120,120,0.15)';
        ctx.fillRect(left, top, x - left, bottom - top);
      }
    } catch {}
    ctx.strokeStyle = opts.color || '#27ae60';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  }
};

// Plugin sunrise/sunset icons
export const sunriseSunsetPlugin = {
  id: 'sunriseSunset',
  afterDraw(chart, args, opts) {
    if (!opts || !opts.sunrise || !opts.sunset) return;
    
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const xScale = chart.scales.x;
    if (!xScale) return;
    
    ctx.save();
    
    // Convert sunrise/sunset times to hours (decimal)
    const sunriseHour = timeStringToHours(opts.sunrise);
    const sunsetHour = timeStringToHours(opts.sunset);
    
    if (sunriseHour !== null) {
      drawSunIcon(ctx, xScale, chartArea, sunriseHour, 'sunrise');
    }
    
    if (sunsetHour !== null) {
      drawSunIcon(ctx, xScale, chartArea, sunsetHour, 'sunset');
    }
    
    ctx.restore();
  }
};

// Helper function to convert time string to decimal hours
function timeStringToHours(timeString) {
  try {
    // Extract time from ISO string like "2025-08-18T06:20"
    const timePart = timeString.split('T')[1];
    if (!timePart) return null;
    
    const [hours, minutes] = timePart.split(':').map(Number);
    return hours + minutes / 60;
  } catch {
    return null;
  }
}

// Helper function to format time for display
function formatTime(timeString) {
  try {
    const timePart = timeString.split('T')[1];
    if (!timePart) return timeString;
    return timePart.substring(0, 5); // Return HH:MM
  } catch {
    return timeString;
  }
}

// Helper function to draw arrow icon for sunrise/sunset
function drawSunIcon(ctx, xScale, chartArea, hour, type) {
  const x = xScale.getPixelForValue(hour);
  const y = chartArea.bottom - 5; // Position at x-axis level
  
  // Only draw if within chart bounds
  if (x < chartArea.left || x > chartArea.right) return;
  
  ctx.fillStyle = type === 'sunrise' ? '#f39c12' : '#e67e22';
  ctx.strokeStyle = type === 'sunrise' ? '#e67e22' : '#d35400';
  ctx.lineWidth = 2;
  
  // Draw arrow pointing up (sunrise) or down (sunset)
  ctx.beginPath();
  
  if (type === 'sunrise') {
    // Up arrow for sunrise
    ctx.moveTo(x, y - 8);      // tip
    ctx.lineTo(x - 4, y - 2);  // left side
    ctx.lineTo(x + 4, y - 2);  // right side
  } else {
    // Down arrow for sunset
    ctx.moveTo(x, y + 8);      // tip
    ctx.lineTo(x - 4, y + 2);  // left side
    ctx.lineTo(x + 4, y + 2);  // right side
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function getPrecipitationBarColor(value) {
  if (value > 30) return '#6c3483';
  if (value > 10) return '#b03a2e';
  if (value > 6) return '#e74c3c';
  if (value > 4) return '#f39c12';
  if (value > 2) return '#27ae60';
  if (value > 1) return '#3498db';
  return '#85c1e9';
}

function isTouchDevice() { return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0; }

export function buildChart(target, probabilityData, precipitationData, sunriseTime = null, sunsetTime = null) {
  const ctx = document.getElementById(target);
  if (!ctx) return;
  if (chartInstances[target]) chartInstances[target].destroy();
  const precipColors = precipitationData.map(getPrecipitationBarColor);
  const m = Math.max(...precipitationData, 1);
  const maxPrecip = m < 2 ? 2 : Math.ceil(m);
  
  // Prepare plugins - always include sunrise/sunset plugin
  const plugins = [sunriseSunsetPlugin];
  if (target === 'today-chart') {
    plugins.push(currentHourLinePlugin);
  }
  
  chartInstances[target] = new Chart(ctx, {
    plugins: plugins,
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5, '0')),
      datasets: [
        {
          label: 'Probabilità (%)',
          type: 'line',
          fill: true,
          tension: 0.4,
          backgroundColor: 'rgba(52, 152, 219, 0.3)',
          borderColor: 'rgb(41, 128, 185)',
          borderWidth: 2,
          data: probabilityData,
          pointBackgroundColor: 'rgb(41, 128, 185)',
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Precipitazione (mm/h)',
          type: 'bar',
          backgroundColor: precipColors,
          borderColor: precipColors,
          borderWidth: 1,
          data: precipitationData,
          yAxisID: 'y1',
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 5 },
      onHover: (event, activeElements, chart) => {
        if (isTouchDevice() && activeElements.length > 0) {
          if (chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout);
          chart._tooltipTimeout = setTimeout(() => {
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.setActiveElements([]);
            chart.update('none');
          }, 3000);
        }
      },
      scales: {
        y: { min: 0, max: 100, position: 'left', grid: { drawOnChartArea: true, color: 'rgba(200,200,200,0.2)', drawTicks: false }, ticks: { display: false } },
        y1: { min: 0, max: maxPrecip, position: 'right', grid: { drawOnChartArea: false, drawTicks: false }, ticks: { display: false } },
        x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 6, color: '#7f8c8d' } }
      },
      plugins: { 
        currentHourLine: { color: '#27ae60', overlayColor: 'rgba(128,128,128,0.18)' },
        sunriseSunset: { 
          sunrise: sunriseTime, 
          sunset: sunsetTime
        },
        legend: { display: false }, 
        tooltip: { 
          backgroundColor: 'rgba(44,62,80,0.9)', 
          callbacks: { 
            title: (items) => `Ore ${items[0].label}`, 
            label: (ctx) => ctx.datasetIndex === 0 ? `Probabilità: ${ctx.parsed.y}%` : `Precipitazione: ${ctx.parsed.y} mm/h`,
            afterBody: (tooltipItems) => {
              // Add sunrise/sunset info to tooltip when hovering near those times
              if (sunriseTime && sunsetTime && tooltipItems.length > 0) {
                const currentHour = parseFloat(tooltipItems[0].label.split(':')[0]);
                const sunrise = timeStringToHours(sunriseTime);
                const sunset = timeStringToHours(sunsetTime);
                
                if (sunrise && sunset) {
                  const daylightHours = sunset - sunrise;
                  const additionalInfo = [];
                  
                  if (Math.abs(currentHour - sunrise) < 1) {
                    additionalInfo.push(`☀️ Alba: ${formatTime(sunriseTime)}`);
                    additionalInfo.push(`⏱️ Ore di luce: ${daylightHours.toFixed(1)}h`);
                  } else if (Math.abs(currentHour - sunset) < 1) {
                    additionalInfo.push(`☀️ Tramonto: ${formatTime(sunsetTime)}`);
                    additionalInfo.push(`⏱️ Ore di luce: ${daylightHours.toFixed(1)}h`);
                  }
                  
                  return additionalInfo;
                }
              }
              return [];
            }
          } 
        } 
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}
