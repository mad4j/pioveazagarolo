/**
 * Version tooltip functionality - shows version when title is pressed/held for 5 seconds
 */

let pressTimer = null;
let tooltipTimer = null;
let isTooltipVisible = false;

const VERSION_TOOLTIP_ID = 'version-tooltip';
const PAGE_TITLE_ID = 'page-title';
const PRESS_DURATION = 2000; // 2 seconds
const TOOLTIP_DURATION = 5000; // 5 seconds

/**
 * Shows the version tooltip
 */
function showVersionTooltip() {
  const tooltip = document.getElementById(VERSION_TOOLTIP_ID);
  if (!tooltip || isTooltipVisible) return;
  
  tooltip.hidden = false;
  tooltip.classList.add('show');
  isTooltipVisible = true;
  
  // Auto-hide after 5 seconds
  tooltipTimer = setTimeout(() => {
    hideVersionTooltip();
  }, TOOLTIP_DURATION);
  
  console.log('📱 Version tooltip shown');
}

/**
 * Hides the version tooltip
 */
function hideVersionTooltip() {
  const tooltip = document.getElementById(VERSION_TOOLTIP_ID);
  if (!tooltip || !isTooltipVisible) return;
  
  tooltip.classList.remove('show');
  setTimeout(() => {
    tooltip.hidden = true;
  }, 300); // Wait for fade out animation
  
  isTooltipVisible = false;
  
  // Clear any pending timers
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  
  console.log('📱 Version tooltip hidden');
}

/**
 * Clears the press timer
 */
function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

/**
 * Handles start of press/touch on title
 */
function handlePressStart(event) {
  // Prevent default to avoid text selection
  event.preventDefault();
  
  // Clear any existing timers
  clearPressTimer();
  
  // Start press timer
  pressTimer = setTimeout(() => {
    showVersionTooltip();
    pressTimer = null;
  }, PRESS_DURATION);
  
  console.log('📱 Press started on title');
}

/**
 * Handles end of press/touch on title
 */
function handlePressEnd(event) {
  // Clear press timer if still active
  clearPressTimer();
}

/**
 * Handles any interaction that should hide the tooltip
 */
function handlePageInteraction(event) {
  // Only hide if tooltip is visible and it's not the title element
  if (isTooltipVisible && event.target.id !== PAGE_TITLE_ID) {
    hideVersionTooltip();
  }
}

/**
 * Sets up the version tooltip functionality
 */
export function setupVersionTooltip() {
  const pageTitle = document.getElementById(PAGE_TITLE_ID);
  if (!pageTitle) {
    console.warn('Page title element not found');
    return;
  }
  
  // Add press/hold listeners to title
  pageTitle.addEventListener('mousedown', handlePressStart);
  pageTitle.addEventListener('mouseup', handlePressEnd);
  pageTitle.addEventListener('mouseleave', handlePressEnd);
  
  // Touch events for mobile
  pageTitle.addEventListener('touchstart', handlePressStart, { passive: false });
  pageTitle.addEventListener('touchend', handlePressEnd);
  pageTitle.addEventListener('touchcancel', handlePressEnd);
  
  // Global listeners to hide tooltip on any interaction
  document.addEventListener('click', handlePageInteraction);
  document.addEventListener('scroll', handlePageInteraction);
  document.addEventListener('keydown', handlePageInteraction);
  document.addEventListener('touchstart', handlePageInteraction);
  
  // Prevent context menu on title to avoid interference
  pageTitle.addEventListener('contextmenu', (e) => e.preventDefault());
  
  console.log('📱 Version tooltip functionality initialized');
}

/**
 * Cleanup function
 */
export function cleanupVersionTooltip() {
  clearPressTimer();
  hideVersionTooltip();
  
  // Remove event listeners
  const pageTitle = document.getElementById(PAGE_TITLE_ID);
  if (pageTitle) {
    pageTitle.removeEventListener('mousedown', handlePressStart);
    pageTitle.removeEventListener('mouseup', handlePressEnd);
    pageTitle.removeEventListener('mouseleave', handlePressEnd);
    pageTitle.removeEventListener('touchstart', handlePressStart);
    pageTitle.removeEventListener('touchend', handlePressEnd);
    pageTitle.removeEventListener('touchcancel', handlePressEnd);
    pageTitle.removeEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  document.removeEventListener('click', handlePageInteraction);
  document.removeEventListener('scroll', handlePageInteraction);
  document.removeEventListener('keydown', handlePageInteraction);
  document.removeEventListener('touchstart', handlePageInteraction);
}