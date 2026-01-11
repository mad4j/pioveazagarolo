/**
 * Moon phases module
 * Handles moon phase calculations, icons, and descriptions
 * @module moon-phases
 */

/**
 * Get moon phase icon based on phase value
 * @param {number} phase - Moon phase value (0-1): 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
 * @returns {string} Moon phase emoji icon
 */
export function getMoonPhaseIcon(phase) {
    if (phase === undefined || phase === null) return '🌑';
    
    // Normalize to 0-1 range
    const normalized = phase % 1;
    
    // Moon phases:
    // 0.00 - New Moon 🌑
    // 0.03-0.22 - Waxing Crescent 🌒
    // 0.22-0.28 - First Quarter 🌓
    // 0.28-0.47 - Waxing Gibbous 🌔
    // 0.47-0.53 - Full Moon 🌕
    // 0.53-0.72 - Waning Gibbous 🌖
    // 0.72-0.78 - Last Quarter 🌗
    // 0.78-0.97 - Waning Crescent 🌘
    // 0.97-1.00 - New Moon 🌑
    
    if (normalized < 0.03) return '🌑';
    if (normalized < 0.22) return '🌒';
    if (normalized < 0.28) return '🌓';
    if (normalized < 0.47) return '🌔';
    if (normalized < 0.53) return '🌕';
    if (normalized < 0.72) return '🌖';
    if (normalized < 0.78) return '🌗';
    if (normalized < 0.97) return '🌘';
    return '🌑';
}

/**
 * Get moon phase name in Italian
 * @param {number} phase - Moon phase value (0-1)
 * @returns {string} Moon phase name in Italian
 */
export function getMoonPhaseName(phase) {
    if (phase === undefined || phase === null) return 'Luna Nuova';
    
    const normalized = phase % 1;
    
    if (normalized < 0.03) return 'Luna Nuova';
    if (normalized < 0.22) return 'Luna Crescente';
    if (normalized < 0.28) return 'Primo Quarto';
    if (normalized < 0.47) return 'Gibbosa Crescente';
    if (normalized < 0.53) return 'Luna Piena';
    if (normalized < 0.72) return 'Gibbosa Calante';
    if (normalized < 0.78) return 'Ultimo Quarto';
    if (normalized < 0.97) return 'Luna Calante';
    return 'Luna Nuova';
}

/**
 * Get moon phase percentage (illumination)
 * @param {number} phase - Moon phase value (0-1)
 * @returns {number} Illumination percentage (0-100)
 */
export function getMoonPhasePercentage(phase) {
    if (phase === undefined || phase === null) return 0;
    
    const normalized = phase % 1;
    
    // Calculate illumination percentage
    // 0 = 0%, 0.5 = 100%, 1 = 0%
    if (normalized <= 0.5) {
        return Math.round(normalized * 2 * 100);
    } else {
        return Math.round((1 - normalized) * 2 * 100);
    }
}

/**
 * Get detailed moon phase tooltip content
 * @param {number} phase - Moon phase value (0-1)
 * @returns {string} HTML content for tooltip
 */
export function getMoonPhaseTooltip(phase) {
    const name = getMoonPhaseName(phase);
    const percentage = getMoonPhasePercentage(phase);
    const icon = getMoonPhaseIcon(phase);
    
    return `
        <div class="text-center">
            <div style="font-size: 2rem; margin-bottom: 0.25rem;">${icon}</div>
            <div style="font-weight: 600;">${name}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">Illuminazione: ${percentage}%</div>
        </div>
    `;
}

/**
 * Create moon phase indicator element with tooltip
 * @param {number} phase - Moon phase value (0-1)
 * @param {string} elementId - ID for the element
 * @returns {HTMLElement} Moon phase indicator element
 */
export function createMoonPhaseIndicator(phase, elementId) {
    const container = document.createElement('div');
    container.id = elementId;
    container.className = 'moon-phase-indicator';
    container.style.display = 'inline-block';
    container.style.cursor = 'help';
    container.setAttribute('data-bs-toggle', 'tooltip');
    container.setAttribute('data-bs-placement', 'top');
    container.setAttribute('data-bs-html', 'true');
    container.setAttribute('data-bs-title', getMoonPhaseTooltip(phase));
    
    const icon = document.createElement('span');
    icon.textContent = getMoonPhaseIcon(phase);
    icon.style.fontSize = '1.2rem';
    icon.setAttribute('aria-label', getMoonPhaseName(phase));
    
    container.appendChild(icon);
    
    return container;
}
