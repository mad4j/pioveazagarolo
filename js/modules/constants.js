// Costanti e helper riusabili
export const DATA_CACHE_KEY = 'weatherDataV1';
export const DATA_CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 ore
export const CHART_MODE_CACHE_KEY = 'chartModeV1';

// Chart modes
export const CHART_MODES = {
  PRECIPITATION: 'precipitation',
  TEMPERATURE: 'temperature',
  WIND: 'wind',
  PRESSURE: 'pressure',
  AIR_QUALITY: 'air-quality'
};

export const DAY_CONFIGS = [
  { key: 'today', index: 0, chartId: 'today-chart', cardId: 'today-card', iconId: 'today-icon', moonId: 'today-moon' },
  { key: 'tomorrow', index: 1, chartId: 'tomorrow-chart', cardId: 'tomorrow-card', iconId: 'tomorrow-icon', moonId: 'tomorrow-moon' },
  { key: 'dayaftertomorrow', index: 2, chartId: 'dayaftertomorrow-chart', cardId: 'dayaftertomorrow-card', iconId: 'dayaftertomorrow-icon', moonId: 'dayaftertomorrow-moon' }
];
export const ARIA_LABEL_DAY = ['oggi','domani','dopodomani'];
export const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
export const $ = (id) => document.getElementById(id);

/**
 * Saves the current chart mode to localStorage
 * @param {string} mode - Chart mode to save
 */
export function saveChartMode(mode) {
  try {
    localStorage.setItem(CHART_MODE_CACHE_KEY, mode);
  } catch (e) {
    // Silently fail if localStorage is not available
    console.warn('Could not save chart mode to localStorage:', e);
  }
}

/**
 * Loads the saved chart mode from localStorage
 * @returns {string|null} - Saved chart mode or null if not available
 */
export function loadSavedChartMode() {
  try {
    return localStorage.getItem(CHART_MODE_CACHE_KEY);
  } catch (e) {
    // Silently fail if localStorage is not available
    console.warn('Could not load chart mode from localStorage:', e);
    return null;
  }
}

// Chart mode state tracking - initialized with saved preference or default
const savedMode = loadSavedChartMode();
const initialMode = savedMode && Object.values(CHART_MODES).includes(savedMode) 
  ? savedMode 
  : CHART_MODES.PRECIPITATION;

export const chartModes = {
  'today-chart': initialMode,
  'tomorrow-chart': initialMode,
  'dayaftertomorrow-chart': initialMode
};
