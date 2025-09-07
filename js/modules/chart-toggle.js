import { CHART_MODES, chartModes, $ } from './constants.js';
import { buildChart, buildTemperatureChart, getDaySlice } from './charts.js';

/**
 * Shows a temporary tooltip indicating current chart mode
 * @param {string} chartId - Target chart ID
 * @param {string} mode - Current chart mode
 */
export function showChartModeTooltip(chartId, mode) {
  // Remove existing chart mode tooltips
  document.querySelectorAll('.chart-mode-tooltip').forEach(t => t.remove());
  
  const chartElement = $(chartId);
  if (!chartElement) return;
  
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-mode-tooltip';
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
  
  const modeText = mode === CHART_MODES.PRECIPITATION ? 'Precipitazioni' : 'Temperature';
  const icon = mode === CHART_MODES.PRECIPITATION ? 
    '<i class="wi wi-umbrella" style="margin-right: 4px; color: #3498db;"></i>' :
    '<i class="wi wi-thermometer" style="margin-right: 4px; color: #e74c3c;"></i>';
  
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">
      Modalità grafico
    </div>
    <div style="display: flex; align-items: center; font-size: 12px; line-height: 1.2;">
      ${icon}<span>${modeText}</span>
    </div>
    <div style="font-size: 10px; margin-top: 4px; color: #bdc3c7;">
      Doppio click per cambiare
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Position tooltip above the chart
  const chartRect = chartElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = chartRect.left + chartRect.width / 2 - tooltipRect.width / 2;
  let top = chartRect.top - tooltipRect.height - 10;
  
  // Adjust if tooltip would go off-screen
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
  if (top < 10) top = chartRect.bottom + 10;
  
  tooltip.style.left = left + window.pageXOffset + 'px';
  tooltip.style.top = top + window.pageYOffset + 'px';
  
  // Animate in
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  });
  
  // Remove tooltip after 3 seconds or on click
  const removeTooltip = () => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(-10px)';
    setTimeout(() => tooltip.remove(), 300);
    document.removeEventListener('click', removeTooltip);
  };
  
  setTimeout(removeTooltip, 3000);
  document.addEventListener('click', removeTooltip, { once: true });
}

/**
 * Toggles chart mode between precipitation and temperature for ALL charts simultaneously
 * @param {string} triggeredChartId - Chart ID that triggered the toggle
 * @param {Object} weatherData - Weather data object
 */
export function toggleChartMode(triggeredChartId, weatherData) {
  if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
  
  // Get current mode from any chart (they should all be synchronized)
  const currentMode = chartModes['today-chart'];
  const newMode = currentMode === CHART_MODES.PRECIPITATION ? CHART_MODES.TEMPERATURE : CHART_MODES.PRECIPITATION;
  
  // Chart IDs and their corresponding day indices
  const chartConfigs = [
    { chartId: 'today-chart', dayIndex: 0 },
    { chartId: 'tomorrow-chart', dayIndex: 1 },
    { chartId: 'dayaftertomorrow-chart', dayIndex: 2 }
  ];
  
  let actualNewMode = newMode;
  
  // Check if temperature data is available before switching
  if (newMode === CHART_MODES.TEMPERATURE) {
    if (!weatherData.hourly.temperature_2m || !weatherData.hourly.apparent_temperature) {
      // Temperature data not available, stay in precipitation mode
      actualNewMode = CHART_MODES.PRECIPITATION;
    }
  }
  
  // Update all charts simultaneously
  chartConfigs.forEach(({ chartId, dayIndex }) => {
    // Update mode tracking for all charts
    chartModes[chartId] = actualNewMode;
    
    // Get sunrise/sunset times for this day
    const sunriseTime = weatherData.daily.sunrise?.[dayIndex];
    const sunsetTime = weatherData.daily.sunset?.[dayIndex];
    
    if (actualNewMode === CHART_MODES.TEMPERATURE) {
      // Switch to temperature chart
      const temperatureSlice = getDaySlice(weatherData.hourly.temperature_2m, dayIndex);
      const apparentTempSlice = getDaySlice(weatherData.hourly.apparent_temperature, dayIndex);
      buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, sunriseTime, sunsetTime);
    } else {
      // Switch to precipitation chart
      const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
      const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
      buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
    }
  });
  
  // Show mode indicator on the chart that was clicked
  showChartModeTooltip(triggeredChartId, actualNewMode);
}

/**
 * Adds double-click event listeners to all chart containers
 * @param {Object} weatherData - Weather data object
 */
export function setupChartToggleListeners(weatherData) {
  const chartIds = ['today-chart', 'tomorrow-chart', 'dayaftertomorrow-chart'];
  
  chartIds.forEach(chartId => {
    const chartElement = $(chartId);
    if (!chartElement) return;
    
    // Remove existing listeners to avoid duplicates
    chartElement.removeEventListener('dblclick', chartElement._toggleHandler);
    
    // Create and store new event handler
    chartElement._toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleChartMode(chartId, weatherData);
    };
    
    chartElement.addEventListener('dblclick', chartElement._toggleHandler);
    
    // Also handle touch devices with double-tap
    let lastTouchTime = 0;
    let tapCount = 0;
    chartElement.removeEventListener('touchend', chartElement._doubleTapHandler);
    
    chartElement._doubleTapHandler = (e) => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastTouchTime;
      
      // Reset tap count if too much time has passed
      if (timeDiff > 300) {
        tapCount = 0;
      }
      
      tapCount++;
      lastTouchTime = currentTime;
      
      if (tapCount === 2) {
        // Double-tap detected
        e.preventDefault();
        e.stopPropagation();
        toggleChartMode(chartId, weatherData);
        // Reset for next double-tap sequence
        tapCount = 0;
        lastTouchTime = 0;
      }
    };
    
    chartElement.addEventListener('touchend', chartElement._doubleTapHandler, { passive: false });
  });
}

/**
 * Builds appropriate chart based on current global mode
 * @param {string} chartId - Target chart ID
 * @param {Object} weatherData - Weather data object
 * @param {number} dayIndex - Day index (0, 1, 2)
 */
export function buildAppropriateChart(chartId, weatherData, dayIndex) {
  if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
  
  // Use global mode (all charts should be in same mode)
  const currentMode = chartModes['today-chart'];
  const sunriseTime = weatherData.daily.sunrise?.[dayIndex];
  const sunsetTime = weatherData.daily.sunset?.[dayIndex];
  
  if (currentMode === CHART_MODES.TEMPERATURE && weatherData.hourly.temperature_2m && weatherData.hourly.apparent_temperature) {
    const temperatureSlice = getDaySlice(weatherData.hourly.temperature_2m, dayIndex);
    const apparentTempSlice = getDaySlice(weatherData.hourly.apparent_temperature, dayIndex);
    buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, sunriseTime, sunsetTime);
  } else {
    // Default to precipitation chart and ensure all charts are in precipitation mode
    chartModes[chartId] = CHART_MODES.PRECIPITATION;
    const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
    const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
    buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
  }
}