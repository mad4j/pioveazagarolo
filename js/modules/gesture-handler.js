import { CHART_MODES, chartModes, saveChartMode } from './constants.js';

/**
 * Gesture detection module for swipe-based mode switching
 * Handles left/right swipe gestures on forecast cards to change chart modes
 */

// Gesture configuration
const SWIPE_CONFIG = {
  MIN_DISTANCE: 50,      // Minimum swipe distance in pixels
  MAX_DURATION: 300,     // Maximum swipe duration in ms
  MAX_VERTICAL: 60,      // Maximum vertical movement to still be considered horizontal swipe (reduced to be more strict)
  VELOCITY_THRESHOLD: 0.15, // Minimum velocity (pixels/ms) - increased for more confident swipes
  PREVENT_DEFAULT_THRESHOLD: 40 // Minimum horizontal movement before preventing default (preserves pull-to-refresh)
};

// Global reference to current enhanced tooltip for management
let currentEnhancedTooltip = null;
let enhancedTooltipTimer = null;

/**
 * Hides the enhanced chart mode tooltip if it's currently visible
 */
export function hideEnhancedChartModeTooltip() {
  if (currentEnhancedTooltip) {
    currentEnhancedTooltip.style.opacity = '0';
    currentEnhancedTooltip.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      if (currentEnhancedTooltip && currentEnhancedTooltip.parentNode) {
        currentEnhancedTooltip.parentNode.removeChild(currentEnhancedTooltip);
      }
      currentEnhancedTooltip = null;
    }, 400);
    
    // Clear any pending auto-hide timer
    if (enhancedTooltipTimer) {
      clearTimeout(enhancedTooltipTimer);
      enhancedTooltipTimer = null;
    }
    
    console.log('📊 Enhanced chart mode tooltip hidden');
  }
}

/**
 * Shows an enhanced tooltip with mode name and swipe direction hints
 * @param {string} mode - The current chart mode
 */
export function showEnhancedChartModeTooltip(mode) {
  // Hide any existing enhanced tooltips first
  hideEnhancedChartModeTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.className = 'enhanced-chart-mode-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, var(--primary-color), #1d2b36);
    color: #fff;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 2000;
    font-size: 0.9rem;
    line-height: 1.4;
    text-align: center;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
    transition: all 0.4s ease;
    pointer-events: auto;
    max-width: 280px;
    cursor: pointer;
  `;
  
  // Mode names and descriptions
  const modeInfo = {
    [CHART_MODES.PRECIPITATION]: { 
      name: 'Precipitazioni', 
      icon: '🌧️',
      desc: 'Probabilità e intensità di pioggia'
    },
    [CHART_MODES.TEMPERATURE]: { 
      name: 'Temperature', 
      icon: '🌡️',
      desc: 'Temperature reali e percepite'
    },
    [CHART_MODES.WIND]: { 
      name: 'Vento', 
      icon: '💨',
      desc: 'Velocità e direzione del vento'
    },
    [CHART_MODES.PRESSURE]: { 
      name: 'Pressione', 
      icon: '🔘',
      desc: 'Pressione atmosferica'
    },
    [CHART_MODES.AIR_QUALITY]: { 
      name: 'Qualità dell\'aria', 
      icon: '🍃',
      desc: 'Indice qualità dell\'aria europea'
    }
  };
  
  const info = modeInfo[mode] || { name: mode, icon: '📊', desc: 'Modalità grafici' };
  
  tooltip.innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${info.icon}</div>
    <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.3rem;">
      ${info.name}
    </div>
    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.8); margin-bottom: 0.8rem;">
      ${info.desc}
    </div>
    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">
      ← Scorri per cambiare modalità →
    </div>
  `;
  
  document.body.appendChild(tooltip);
  currentEnhancedTooltip = tooltip;
  
  // Add click handler to hide tooltip when clicked
  tooltip.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideEnhancedChartModeTooltip();
  });
  
  // Show tooltip with animation
  setTimeout(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);
  
  // Auto-hide after 3 seconds
  enhancedTooltipTimer = setTimeout(() => {
    hideEnhancedChartModeTooltip();
  }, 3000);
  
  console.log(`📊 Enhanced chart mode tooltip shown: ${info.name}`);
}

// Chart modes in order for cycling
const MODE_ORDER = [
  CHART_MODES.PRECIPITATION,
  CHART_MODES.TEMPERATURE,
  CHART_MODES.WIND,
  CHART_MODES.PRESSURE,
  CHART_MODES.AIR_QUALITY
];

/**
 * Gets the next mode in the cycle
 * @param {string} currentMode - Current chart mode
 * @param {number} direction - Direction: 1 for next, -1 for previous
 * @returns {string} Next mode
 */
function getNextMode(currentMode, direction) {
  const currentIndex = MODE_ORDER.indexOf(currentMode);
  if (currentIndex === -1) return MODE_ORDER[0]; // Default to first mode
  
  let nextIndex;
  if (direction > 0) {
    // Right swipe - next mode
    nextIndex = (currentIndex + 1) % MODE_ORDER.length;
  } else {
    // Left swipe - previous mode  
    nextIndex = (currentIndex - 1 + MODE_ORDER.length) % MODE_ORDER.length;
  }
  
  return MODE_ORDER[nextIndex];
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
 * Switches to a specific chart mode using the existing navigation system
 * @param {string} targetMode - The mode to switch to
 * @param {Object} weatherData - Weather data object
 */
function switchToModeViaSwiping(targetMode, weatherData) {
  // Hide any visible tooltips immediately before switching modes
  hideAllChartTooltips();
  
  // Add mode switching animation to all forecast cards
  const forecastCards = document.querySelectorAll('.forecast-card');
  forecastCards.forEach(card => card.classList.add('mode-switching'));
  
  // Remove animation class after animation completes
  setTimeout(() => {
    forecastCards.forEach(card => card.classList.remove('mode-switching'));
  }, 600);
  
  // Import and use the existing switchToMode function from navigation-dots
  import('./navigation-dots.js').then(({ updateNavigationDots }) => {
    // Import chart building functions directly
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
      
      // Save the new mode
      saveChartMode(actualMode);
      
      // Update navigation dots to reflect the change
      updateNavigationDots(actualMode);
      
      // Show enhanced tooltip to indicate the active mode
      showEnhancedChartModeTooltip(actualMode);
      
      console.log(`📱 Swipe gesture: switched to ${actualMode} mode`);
    });
  }).catch(err => {
    console.warn('Could not switch mode via swipe:', err);
  });
}

/**
 * Creates a swipe gesture handler for a forecast card element
 * @param {HTMLElement} element - The element to attach swipe detection to
 * @param {Object} weatherData - Weather data object for mode switching
 * @returns {Object} Gesture handler with cleanup function
 */
function createSwipeHandler(element, weatherData) {
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = null;
  let touchMoved = false;

  const handleTouchStart = (e) => {
    // Only handle single finger touches
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    touchMoved = false;
    
    // Add visual feedback class for touch start
    element.classList.add('swiping');
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    if (e.touches.length !== 1) return;
    
    touchMoved = true;
    
    // Allow vertical scrolling by not preventing default for primarily vertical movements
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    
    // Only prevent default if we're confident this is a horizontal swipe gesture
    // Use stricter thresholds to preserve pull-to-refresh functionality
    // Require significant horizontal movement AND horizontal dominance
    if (deltaX >= SWIPE_CONFIG.PREVENT_DEFAULT_THRESHOLD && 
        deltaX > deltaY * 1.5 && 
        deltaY < SWIPE_CONFIG.MAX_VERTICAL) {
      e.preventDefault();
      
      // Add stronger visual feedback during confirmed swipe
      if (!element.classList.contains('swipe-active')) {
        element.classList.add('swipe-active');
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null || touchStartTime === null) return;
    
    // Remove visual feedback classes
    element.classList.remove('swiping', 'swipe-active');
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;
    const deltaTime = endTime - touchStartTime;
    const distance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);
    const velocity = distance / deltaTime;
    
    // Reset tracking
    touchStartX = null;
    touchStartY = null;
    touchStartTime = null;
    
    // Check if this qualifies as a horizontal swipe
    const isHorizontalSwipe = 
      distance >= SWIPE_CONFIG.MIN_DISTANCE &&
      verticalDistance <= SWIPE_CONFIG.MAX_VERTICAL &&
      deltaTime <= SWIPE_CONFIG.MAX_DURATION &&
      velocity >= SWIPE_CONFIG.VELOCITY_THRESHOLD &&
      touchMoved;
    
    if (isHorizontalSwipe) {
      // Determine swipe direction
      const direction = deltaX > 0 ? 1 : -1; // right = 1, left = -1
      
      // Get current mode and calculate next mode
      const currentMode = chartModes['today-chart'];
      const nextMode = getNextMode(currentMode, direction);
      
      // Only switch if the mode would actually change
      if (nextMode !== currentMode) {
        // Prevent any other touch events from firing
        e.preventDefault();
        e.stopPropagation();
        
        // Add successful swipe feedback
        element.classList.add('swipe-success');
        setTimeout(() => {
          element.classList.remove('swipe-success');
        }, 300);
        
        // Switch to new mode
        switchToModeViaSwiping(nextMode, weatherData);
      }
    }
  };

  // Add event listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Return cleanup function
  return {
    destroy() {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  };
}

/**
 * Sets up swipe gesture detection on all forecast cards
 * @param {Object} weatherData - Weather data object for mode switching
 * @returns {Object} Object with cleanup function for all gesture handlers
 */
export function setupSwipeGestures(weatherData) {
  const handlers = [];
  const forecastCards = document.querySelectorAll('.forecast-card');
  
  forecastCards.forEach(card => {
    const handler = createSwipeHandler(card, weatherData);
    handlers.push(handler);
    
    // Add visual feedback class for touch interactions
    card.classList.add('swipe-enabled');
  });
  
  console.log(`📱 Swipe gestures enabled on ${forecastCards.length} forecast cards`);
  
  // Return cleanup function for all handlers
  return {
    destroy() {
      handlers.forEach(handler => handler.destroy());
      // Remove visual feedback classes
      forecastCards.forEach(card => card.classList.remove('swipe-enabled'));
    }
  };
}