import { CHART_MODES, chartModes, saveChartMode } from './constants.js';
import { toggleChartMode } from './chart-toggle.js';
import { showEnhancedChartModeTooltip } from './gesture-handler.js';

// Enhanced tooltip functionality now handled by gesture-handler.js

/**
 * Updates the visual state of navigation dots to reflect the current chart mode
 * @param {string} activeMode - The currently active chart mode
 */
export function updateNavigationDots(activeMode) {
  const dots = document.querySelectorAll('.nav-dot');
  
  dots.forEach(dot => {
    const dotMode = dot.getAttribute('data-mode');
    if (dotMode === activeMode) {
      dot.classList.add('active');
      dot.setAttribute('aria-pressed', 'true');
    } else {
      dot.classList.remove('active');
      dot.setAttribute('aria-pressed', 'false');
    }
  });
}

/**
 * Sets up event listeners for navigation dots
 * @param {Object} weatherData - Weather data object to pass to chart toggle
 */
export function setupNavigationDots(weatherData) {
  const dots = document.querySelectorAll('.nav-dot');
  
  dots.forEach(dot => {
    const mode = dot.getAttribute('data-mode');
    
    // Remove existing listeners to avoid duplicates
    dot.removeEventListener('click', dot._clickHandler);
    
    // Create and store new event handler
    dot._clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the current mode from any chart (they should all be synchronized)
      const currentMode = chartModes['today-chart'];
      
      // Only switch if clicking a different mode
      if (mode !== currentMode) {
        // Update chart modes directly to the clicked mode
        Object.keys(chartModes).forEach(chartId => {
          chartModes[chartId] = mode;
        });
        
        // Save the new mode
        saveChartMode(mode);
        
        // Trigger chart updates using the existing toggle system
        // We'll simulate this by calling toggleChartMode until we get to the desired mode
        switchToMode(mode, weatherData);
        
        // Update navigation dots visual state
        updateNavigationDots(mode);
        
        // Show enhanced tooltip to indicate the active mode
        showEnhancedChartModeTooltip(mode);
      }
    };
    
    dot.addEventListener('click', dot._clickHandler);
    
    // Set initial aria-pressed state
    dot.setAttribute('aria-pressed', 'false');
    dot.setAttribute('role', 'button');
  });
  
  // Set initial active state
  const currentMode = chartModes['today-chart'];
  updateNavigationDots(currentMode);
}

/**
 * Switches charts to a specific mode by directly updating charts
 * @param {string} targetMode - The mode to switch to
 * @param {Object} weatherData - Weather data object
 */
function switchToMode(targetMode, weatherData) {
  // Import chart building functions
  import('./charts.js').then(({ buildChart, buildTemperatureChart, buildWindChart, buildPressureChart, buildAirQualityChart, getDaySlice }) => {
    if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
    
    // Chart IDs and their corresponding day indices
    const chartConfigs = [
      { chartId: 'today-chart', dayIndex: 0 },
      { chartId: 'tomorrow-chart', dayIndex: 1 },
      { chartId: 'dayaftertomorrow-chart', dayIndex: 2 }
    ];
    
    // Check data availability before switching
    let actualMode = targetMode;
    if (targetMode === CHART_MODES.TEMPERATURE) {
      if (!weatherData.hourly.temperature_2m || !weatherData.hourly.apparent_temperature) {
        actualMode = CHART_MODES.PRECIPITATION;
      }
    } else if (targetMode === CHART_MODES.WIND) {
      if (!weatherData.hourly.wind_speed_10m || !weatherData.hourly.wind_direction_10m) {
        actualMode = CHART_MODES.PRECIPITATION;
      }
    } else if (targetMode === CHART_MODES.PRESSURE) {
      if (!weatherData.hourly.pressure_msl) {
        actualMode = CHART_MODES.PRECIPITATION;
      }
    } else if (targetMode === CHART_MODES.AIR_QUALITY) {
      if (!weatherData.air_quality || !weatherData.air_quality.hourly || !weatherData.air_quality.hourly.european_aqi) {
        actualMode = CHART_MODES.PRECIPITATION;
      }
    }
    
    // Update all charts simultaneously
    chartConfigs.forEach(({ chartId, dayIndex }) => {
      // Update mode tracking for all charts
      chartModes[chartId] = actualMode;
      
      // Get sunrise/sunset times for this day
      const sunriseTime = weatherData.daily.sunrise?.[dayIndex];
      const sunsetTime = weatherData.daily.sunset?.[dayIndex];
      
      if (actualMode === CHART_MODES.TEMPERATURE) {
        // Switch to temperature chart
        const temperatureSlice = getDaySlice(weatherData.hourly.temperature_2m, dayIndex);
        const apparentTempSlice = getDaySlice(weatherData.hourly.apparent_temperature, dayIndex);
        const humiditySlice = weatherData.hourly.relative_humidity_2m ? getDaySlice(weatherData.hourly.relative_humidity_2m, dayIndex) : null;
        buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, humiditySlice, sunriseTime, sunsetTime);
      } else if (actualMode === CHART_MODES.WIND) {
        // Switch to wind chart
        const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
        const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
        buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
      } else if (actualMode === CHART_MODES.PRESSURE) {
        // Switch to pressure chart
        const pressureSlice = getDaySlice(weatherData.hourly.pressure_msl, dayIndex);
        const weatherCodeSlice = weatherData.hourly.weather_code ? getDaySlice(weatherData.hourly.weather_code, dayIndex) : null;
        const isDaySlice = weatherData.hourly.is_day ? getDaySlice(weatherData.hourly.is_day, dayIndex) : null;
        buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime, weatherCodeSlice, isDaySlice);
      } else if (actualMode === CHART_MODES.AIR_QUALITY) {
        // Switch to air quality chart
        const eaqiSlice = getDaySlice(weatherData.air_quality.hourly.european_aqi, dayIndex);
        buildAirQualityChart(chartId, eaqiSlice, sunriseTime, sunsetTime);
      } else {
        // Switch to precipitation chart
        const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
        const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
        buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime);
      }
    });
    
    // Update navigation dots to reflect actual mode (in case target mode wasn't available)
    if (actualMode !== targetMode) {
      updateNavigationDots(actualMode);
    }
  });
}

/**
 * Updates navigation dots when chart mode changes from other sources (like double-click)
 * This function should be called whenever the chart mode changes
 */
export function syncNavigationDotsWithChartMode() {
  const currentMode = chartModes['today-chart'];
  updateNavigationDots(currentMode);
}