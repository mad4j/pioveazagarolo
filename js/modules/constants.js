// Costanti e helper riusabili
export const DATA_CACHE_KEY = 'weatherDataV1';
export const DATA_CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 ore
export const DAY_CONFIGS = [
  { key: 'today', index: 0, chartId: 'today-chart', cardId: 'today-card', iconId: 'today-icon' },
  { key: 'tomorrow', index: 1, chartId: 'tomorrow-chart', cardId: 'tomorrow-card', iconId: 'tomorrow-icon' },
  { key: 'dayaftertomorrow', index: 2, chartId: 'dayaftertomorrow-chart', cardId: 'dayaftertomorrow-card', iconId: 'dayaftertomorrow-icon' }
];
export const ARIA_LABEL_DAY = ['oggi','domani','dopodomani'];
export const dayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
export const $ = (id) => document.getElementById(id);
