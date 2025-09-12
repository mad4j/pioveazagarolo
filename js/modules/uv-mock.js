// Modulo per generare dati UV di test
// Questo modulo è temporaneo e sarà sostituito quando i dati UV saranno disponibili dall'API

/**
 * Genera dati UV di test per un giorno (24 ore)
 * Simula un andamento realistico con picchi nelle ore centrali
 * @param {number} dayIndex - Indice del giorno (0=oggi, 1=domani, 2=dopodomani)
 * @returns {Array<number>} Array di 24 valori UV orari
 */
export function generateMockUVData(dayIndex = 0) {
  const uvData = new Array(24).fill(0);
  
  // Valori UV basati sull'ora del giorno (0-23)
  for (let hour = 0; hour < 24; hour++) {
    if (hour >= 6 && hour <= 18) { // Solo durante le ore diurne
      // Calcola un valore UV realistico basato sull'ora
      // Picco verso mezzogiorno, con variazioni casuali leggere
      const baseUV = Math.sin((hour - 6) * Math.PI / 12) * 8; // Curva sinusoidale
      const randomVariation = (Math.random() - 0.5) * 2; // ±1 variazione casuale
      const seasonalFactor = 0.8; // Settembre, UV più bassi
      
      // Aggiungi una piccola variazione per giorno
      const dayVariation = (dayIndex * 0.5) - 0.5; // -0.5 a +0.5
      
      uvData[hour] = Math.max(0, Math.round((baseUV + randomVariation + dayVariation) * seasonalFactor));
    }
  }
  
  return uvData;
}

/**
 * Controlla se i dati UV sono disponibili nei dati meteo
 * @param {Object} weatherData - Dati meteo dall'API
 * @returns {boolean} True se i dati UV sono disponibili
 */
export function hasUVData(weatherData) {
  return weatherData && 
         weatherData.hourly && 
         weatherData.hourly.uv_index && 
         Array.isArray(weatherData.hourly.uv_index);
}

/**
 * Ottiene i dati UV per un giorno specifico
 * @param {Object} weatherData - Dati meteo dall'API
 * @param {number} dayIndex - Indice del giorno (0-2)
 * @returns {Array<number>} Array di 24 valori UV orari
 */
export function getUVDataForDay(weatherData, dayIndex) {
  // Se i dati UV sono disponibili nell'API, usali
  if (hasUVData(weatherData)) {
    const start = dayIndex * 24;
    return weatherData.hourly.uv_index.slice(start, start + 24);
  }
  
  // Altrimenti usa i dati mock per testing
  return generateMockUVData(dayIndex);
}