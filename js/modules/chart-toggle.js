import { CHART_MODES, chartModes, $ } from './constants.js';
import { buildChart, buildTemperatureChart, buildWindChart, buildPressureChart, getDaySlice } from './charts.js';

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
    position: fixed;
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
  
  let modeText, icon;
  if (mode === CHART_MODES.PRECIPITATION) {
    modeText = 'Precipitazioni';
    icon = '<i class="wi wi-umbrella" style="margin-right: 4px; color: #3498db;"></i>';
  } else if (mode === CHART_MODES.TEMPERATURE) {
    modeText = 'Temperature';
    icon = '<i class="wi wi-thermometer" style="margin-right: 4px; color: #e74c3c;"></i>';
  } else if (mode === CHART_MODES.PRESSURE) {
    modeText = 'Pressione';
    icon = '<i class="wi wi-barometer" style="margin-right: 4px; color: #8e44ad;"></i>';
  } else {
    modeText = 'Vento';
    icon = '<i class="wi wi-strong-wind" style="margin-right: 4px; color: #27ae60;"></i>';
  }
  
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
  
  // Position tooltip at the top center of the page
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let left = (window.innerWidth - tooltipRect.width) / 2;
  let top = 20; // Fixed top position
  
  // Ensure tooltip doesn't go off-screen horizontally
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  
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
 * Removes all visible chart tooltips immediately
 */
function hideAllChartTooltips() {
  // Hide all chart tooltips by finding tooltip DOM elements
  const chartIds = ['today-chart', 'tomorrow-chart', 'dayaftertomorrow-chart'];
  chartIds.forEach(chartId => {
    const tooltip = document.getElementById(`chartjs-tooltip-${chartId}`);
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  });
}

/**
 * Toggles chart mode between precipitation and temperature for ALL charts simultaneously
 * @param {string} triggeredChartId - Chart ID that triggered the toggle
 * @param {Object} weatherData - Weather data object
 */
export function toggleChartMode(triggeredChartId, weatherData) {
  if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
  
  // Hide any visible tooltips immediately before switching modes
  hideAllChartTooltips();
  
  // Get current mode from any chart (they should all be synchronized)
  const currentMode = chartModes['today-chart'];
  
  // Cycle through modes: precipitation → temperature → wind → pressure → precipitation
  let newMode;
  if (currentMode === CHART_MODES.PRECIPITATION) {
    newMode = CHART_MODES.TEMPERATURE;
  } else if (currentMode === CHART_MODES.TEMPERATURE) {
    newMode = CHART_MODES.WIND;
  } else if (currentMode === CHART_MODES.WIND) {
    newMode = CHART_MODES.PRESSURE;
  } else {
    newMode = CHART_MODES.PRECIPITATION;
  }
  
  // Chart IDs and their corresponding day indices
  const chartConfigs = [
    { chartId: 'today-chart', dayIndex: 0 },
    { chartId: 'tomorrow-chart', dayIndex: 1 },
    { chartId: 'dayaftertomorrow-chart', dayIndex: 2 }
  ];
  
  let actualNewMode = newMode;
  
  // Check data availability before switching
  if (newMode === CHART_MODES.TEMPERATURE) {
    if (!weatherData.hourly.temperature_2m || !weatherData.hourly.apparent_temperature) {
      // Temperature data not available, stay in precipitation mode
      actualNewMode = CHART_MODES.PRECIPITATION;
    }
  } else if (newMode === CHART_MODES.WIND) {
    if (!weatherData.hourly.wind_speed_10m || !weatherData.hourly.wind_direction_10m) {
      // Wind data not available, stay in precipitation mode
      actualNewMode = CHART_MODES.PRECIPITATION;
    }
  } else if (newMode === CHART_MODES.PRESSURE) {
    if (!weatherData.hourly.surface_pressure) {
      // Pressure data not available, stay in precipitation mode
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
    } else if (actualNewMode === CHART_MODES.WIND) {
      // Switch to wind chart
      const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
      const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
      buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
    } else if (actualNewMode === CHART_MODES.PRESSURE) {
      // Switch to pressure chart
      const pressureSlice = getDaySlice(weatherData.hourly.surface_pressure, dayIndex);
      buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime);
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
    
    // Get the forecast card container (parent of chart-container)
    const chartContainer = chartElement.parentElement; // .chart-container
    const forecastCard = chartContainer ? chartContainer.parentElement : null; // .forecast-card
    
    if (!forecastCard) return;
    
    // Remove existing listeners to avoid duplicates
    chartElement.removeEventListener('dblclick', chartElement._toggleHandler);
    forecastCard.removeEventListener('dblclick', forecastCard._toggleHandler);
    
    // Create and store new event handler for the entire forecast card
    forecastCard._toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleChartMode(chartId, weatherData);
    };
    
    forecastCard.addEventListener('dblclick', forecastCard._toggleHandler);
    
    // Also handle touch devices with double-tap on the entire forecast card
    let lastTouchTime = 0;
    let tapCount = 0;
    chartElement.removeEventListener('touchend', chartElement._doubleTapHandler);
    forecastCard.removeEventListener('touchend', forecastCard._doubleTapHandler);
    
    forecastCard._doubleTapHandler = (e) => {
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
    
    forecastCard.addEventListener('touchend', forecastCard._doubleTapHandler, { passive: false });
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
  } else if (currentMode === CHART_MODES.WIND && weatherData.hourly.wind_speed_10m && weatherData.hourly.wind_direction_10m) {
    const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
    const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
    buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
  } else if (currentMode === CHART_MODES.PRESSURE && weatherData.hourly.surface_pressure) {
    const pressureSlice = getDaySlice(weatherData.hourly.surface_pressure, dayIndex);
    buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime);
  } else {
    // Default to precipitation chart and ensure all charts are in precipitation mode
    chartModes[chartId] = CHART_MODES.PRECIPITATION;
    const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
    const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
    buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
  }
}