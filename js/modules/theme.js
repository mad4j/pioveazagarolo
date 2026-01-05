// Theme management module - handles light/dark theme switching with user preference override

const THEME_KEY = 'weatherThemeV1';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';
const THEME_AUTO = 'auto';

/**
 * Get the stored theme preference
 * @returns {string} 'light', 'dark', or 'auto'
 */
export function getThemePreference() {
  try {
    return localStorage.getItem(THEME_KEY) || THEME_AUTO;
  } catch {
    return THEME_AUTO;
  }
}

/**
 * Set the theme preference
 * @param {string} theme - 'light', 'dark', or 'auto'
 */
export function setThemePreference(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Fail silently if localStorage is not available
  }
}

/**
 * Get the system's preferred color scheme
 * @returns {boolean} true if system prefers dark mode
 */
function getSystemDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if dark mode is active (considering user preference and system preference)
 * @returns {boolean} true if dark mode should be active
 */
export function isDarkMode() {
  const preference = getThemePreference();
  
  if (preference === THEME_DARK) return true;
  if (preference === THEME_LIGHT) return false;
  
  // Auto mode: follow system preference
  return getSystemDarkMode();
}

/**
 * Apply the theme to the document
 */
export function applyTheme() {
  const preference = getThemePreference();
  const htmlElement = document.documentElement;
  
  // Remove existing theme attributes
  htmlElement.removeAttribute('data-theme');
  
  if (preference === THEME_LIGHT) {
    htmlElement.setAttribute('data-theme', 'light');
  } else if (preference === THEME_DARK) {
    htmlElement.setAttribute('data-theme', 'dark');
  }
  // For 'auto', don't set data-theme attribute, let CSS media query handle it
}

/**
 * Toggle between light, dark, and auto themes
 * @returns {string} The new theme preference
 */
export function toggleTheme() {
  const current = getThemePreference();
  let next;
  
  // Cycle: auto -> light -> dark -> auto
  if (current === THEME_AUTO) {
    next = THEME_LIGHT;
  } else if (current === THEME_LIGHT) {
    next = THEME_DARK;
  } else {
    next = THEME_AUTO;
  }
  
  setThemePreference(next);
  applyTheme();
  
  return next;
}

/**
 * Initialize theme on page load
 */
export function initTheme() {
  applyTheme();
  
  // Listen for system theme changes when in auto mode
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getThemePreference() === THEME_AUTO) {
        applyTheme();
        // Dispatch custom event so charts can update if needed
        window.dispatchEvent(new CustomEvent('themechange'));
      }
    };
    
    // Use addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * Get the current theme name for display
 * @returns {string} Human-readable theme name
 */
export function getThemeName() {
  const preference = getThemePreference();
  const isDark = isDarkMode();
  
  if (preference === THEME_AUTO) {
    return isDark ? 'Auto (Scuro)' : 'Auto (Chiaro)';
  } else if (preference === THEME_LIGHT) {
    return 'Chiaro';
  } else {
    return 'Scuro';
  }
}
