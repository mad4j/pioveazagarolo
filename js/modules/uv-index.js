// Modulo per la gestione dell'indice UV
// Fornisce funzioni per la mappatura livelli UV e colori

import { $ } from './constants.js';

// Mappatura livelli UV secondo WHO/WMO
// Riferimento: https://www.who.int/news-room/q-a-detail/radiation-the-known-health-effects-of-ultraviolet-radiation
const UV_LEVELS = [
  { min: 0, max: 2, level: 'low', color: '#289500', bgColor: '#e8f5e8', label: 'Basso', description: 'Nessuna protezione richiesta' },
  { min: 3, max: 5, level: 'moderate', color: '#f7e400', bgColor: '#fefae8', label: 'Moderato', description: 'Protezione raccomandata' },
  { min: 6, max: 7, level: 'high', color: '#f85900', bgColor: '#fff3e8', label: 'Alto', description: 'Protezione richiesta' },
  { min: 8, max: 10, level: 'very-high', color: '#d8001d', bgColor: '#ffeaea', label: 'Molto alto', description: 'Protezione extra richiesta' },
  { min: 11, max: 99, level: 'extreme', color: '#6b49c8', bgColor: '#f0e6f8', label: 'Estremo', description: 'Protezione massima richiesta' }
];

/**
 * Ottiene le informazioni di livello UV per un dato valore
 * @param {number} uvValue - Valore indice UV (0-15+)
 * @returns {Object} Oggetto con colore, livello e descrizione
 */
export function getUVLevel(uvValue) {
  if (!uvValue || uvValue < 0) return UV_LEVELS[0]; // Default to 'low' for invalid values
  
  for (const level of UV_LEVELS) {
    if (uvValue >= level.min && uvValue <= level.max) {
      return level;
    }
  }
  
  // For values > 15, return the extreme level
  return UV_LEVELS[UV_LEVELS.length - 1];
}