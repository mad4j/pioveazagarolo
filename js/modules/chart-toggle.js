import { CHART_MODES, chartModes, $, saveChartMode } from './constants.js';
import { buildChart, buildTemperatureChart, buildWindChart, buildPressureChart, buildEAQIChart, getDaySlice } from './charts.js';

// Keep a reference to sync function to avoid import issues
let syncNavigationDots = null;
let showTooltip = null;

// Initialize sync function when module loads
document.addEventListener('DOMContentLoaded', () => {
  import('./navigation-dots.js').then(({ syncNavigationDotsWithChartMode, showChartModeTooltip }) => {
    syncNavigationDots = syncNavigationDotsWithChartMode;
    showTooltip = showChartModeTooltip;
  }).catch(err => {
    console.warn('Could not load navigation dots sync:', err);
  });
});

// Chart tooltip functionality removed - now handled by navigation-dots.js

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
  console.log(`📊 Debug: toggleChartMode called with chartId: ${triggeredChartId}`);
  console.log(`📊 Debug: weatherData available:`, !!weatherData);
  console.log(`📊 Debug: air_quality data available:`, !!weatherData?.air_quality?.hourly?.european_aqi);
  
  if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
  
  // Hide any visible tooltips immediately before switching modes
  hideAllChartTooltips();
  
  // Get current mode from any chart (they should all be synchronized)
  const currentMode = chartModes['today-chart'];
  
  // Cycle through modes: precipitation → temperature → wind → pressure → air-quality → precipitation
  let newMode;
  if (currentMode === CHART_MODES.PRECIPITATION) {
    newMode = CHART_MODES.TEMPERATURE;
  } else if (currentMode === CHART_MODES.TEMPERATURE) {
    newMode = CHART_MODES.WIND;
  } else if (currentMode === CHART_MODES.WIND) {
    newMode = CHART_MODES.PRESSURE;
  } else if (currentMode === CHART_MODES.PRESSURE) {
    newMode = CHART_MODES.AIR_QUALITY;
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
    if (!weatherData.hourly.pressure_msl) {
      // Pressure data not available, stay in precipitation mode
      actualNewMode = CHART_MODES.PRECIPITATION;
    }
  } else if (newMode === CHART_MODES.AIR_QUALITY) {
    if (!weatherData.air_quality?.hourly?.european_aqi) {
      // Air quality data not available, stay in precipitation mode
      actualNewMode = CHART_MODES.PRECIPITATION;
    }
  }
  
  // Save the new mode to localStorage for persistence across page refreshes
  saveChartMode(actualNewMode);
  
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
      const humiditySlice = weatherData.hourly.relative_humidity_2m ? getDaySlice(weatherData.hourly.relative_humidity_2m, dayIndex) : null;
      buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, humiditySlice, sunriseTime, sunsetTime);
    } else if (actualNewMode === CHART_MODES.WIND) {
      // Switch to wind chart
      const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
      const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
      buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
    } else if (actualNewMode === CHART_MODES.PRESSURE) {
      // Switch to pressure chart
      const pressureSlice = getDaySlice(weatherData.hourly.pressure_msl, dayIndex);
      const weatherCodeSlice = weatherData.hourly.weather_code ? getDaySlice(weatherData.hourly.weather_code, dayIndex) : null;
      const isDaySlice = weatherData.hourly.is_day ? getDaySlice(weatherData.hourly.is_day, dayIndex) : null;
      buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime, weatherCodeSlice, isDaySlice);
    } else if (actualNewMode === CHART_MODES.AIR_QUALITY) {
      // Switch to air quality chart
      const eaqiSlice = getDaySlice(weatherData.air_quality.hourly.european_aqi, dayIndex);
      buildEAQIChart(chartId, eaqiSlice, sunriseTime, sunsetTime);
    } else {
      // Switch to precipitation chart
      const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
      const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
      buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
    }
  });
  
  // Mode indicator tooltip is now handled by navigation dots only
  
  // Sync navigation dots with the new mode
  if (syncNavigationDots) {
    syncNavigationDots();
  } else {
    // Fallback: try to import and call sync function
    import('./navigation-dots.js').then(({ syncNavigationDotsWithChartMode }) => {
      syncNavigationDotsWithChartMode();
    }).catch(err => {
      console.warn('Could not sync navigation dots:', err);
    });
  }
  
  // Show tooltip to indicate the new mode
  if (showTooltip) {
    showTooltip(actualNewMode);
  } else {
    // Fallback: try to import and call tooltip function
    import('./navigation-dots.js').then(({ showChartModeTooltip }) => {
      showChartModeTooltip(actualNewMode);
    }).catch(err => {
      console.warn('Could not show chart mode tooltip:', err);
    });
  }
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
    const humiditySlice = weatherData.hourly.relative_humidity_2m ? getDaySlice(weatherData.hourly.relative_humidity_2m, dayIndex) : null;
    buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, humiditySlice, sunriseTime, sunsetTime);
  } else if (currentMode === CHART_MODES.WIND && weatherData.hourly.wind_speed_10m && weatherData.hourly.wind_direction_10m) {
    const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
    const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
    buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
  } else if (currentMode === CHART_MODES.PRESSURE && weatherData.hourly.pressure_msl) {
    const pressureSlice = getDaySlice(weatherData.hourly.pressure_msl, dayIndex);
    const weatherCodeSlice = weatherData.hourly.weather_code ? getDaySlice(weatherData.hourly.weather_code, dayIndex) : null;
    const isDaySlice = weatherData.hourly.is_day ? getDaySlice(weatherData.hourly.is_day, dayIndex) : null;
    buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime, weatherCodeSlice, isDaySlice);
  } else if (currentMode === CHART_MODES.AIR_QUALITY && weatherData.air_quality?.hourly?.european_aqi) {
    const eaqiSlice = getDaySlice(weatherData.air_quality.hourly.european_aqi, dayIndex);
    buildEAQIChart(chartId, eaqiSlice, sunriseTime, sunsetTime);
  } else {
    // Default to precipitation chart and ensure all charts are in precipitation mode
    chartModes[chartId] = CHART_MODES.PRECIPITATION;
    const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
    const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
    buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
  }
}