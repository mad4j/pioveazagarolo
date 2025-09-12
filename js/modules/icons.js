// Mapping codici WMO -> classi icone
export function getRainIconClass(weatherCode, isDay) {
  if ([95, 96, 99].includes(weatherCode)) return 'wi wi-thunderstorm';
  if ([85, 86].includes(weatherCode)) return 'wi wi-storm-showers';
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'wi wi-rain';
  if ([71, 73, 75, 77].includes(weatherCode)) return 'wi wi-snow';
  if ([45, 48].includes(weatherCode)) return 'wi wi-fog';
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'wi wi-sprinkle';
  if ([2, 3].includes(weatherCode)) return 'wi wi-cloud';
  if ([0, 1].includes(weatherCode)) {
    // Use day/night icons for clear sky conditions when isDay is provided
    if (isDay === 1) return 'wi wi-day-sunny';
    if (isDay === 0) return 'wi wi-night-clear';
    return 'wi wi-day-sunny'; // Default to day icon if isDay not specified
  }
  return 'wi wi-cloud';
}

// Mapping codici WMO -> descrizioni italiane
export function getWeatherDescription(weatherCode) {
  if ([95, 96, 99].includes(weatherCode)) return 'Temporale';
  if ([85, 86].includes(weatherCode)) return 'Rovesci di neve';
  if ([61, 63, 65].includes(weatherCode)) return 'Pioggia';
  if ([80, 81, 82].includes(weatherCode)) return 'Rovesci';
  if ([71, 73, 75, 77].includes(weatherCode)) return 'Neve';
  if ([45, 48].includes(weatherCode)) return 'Nebbia';
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'Pioggerella';
  if ([2, 3].includes(weatherCode)) return 'Nuvoloso';
  if ([0, 1].includes(weatherCode)) return 'Sereno';
  return 'Variabile';
}

// Mapping copertura nuvolosa -> classi icone
export function getCloudCoverIconClass(cloudCoverPercentage) {
  if (cloudCoverPercentage >= 75) return 'wi wi-cloud';           // Coperto
  if (cloudCoverPercentage >= 50) return 'wi wi-cloudy';          // Molto nuvoloso
  if (cloudCoverPercentage >= 25) return 'wi wi-day-cloudy';      // Parzialmente nuvoloso
  return 'wi wi-day-sunny-overcast';                              // Poco nuvoloso/sereno
}

// Mapping copertura nuvolosa -> descrizioni italiane
export function getCloudCoverDescription(cloudCoverPercentage) {
  if (cloudCoverPercentage >= 75) return 'Coperto';
  if (cloudCoverPercentage >= 50) return 'Molto nuvoloso';
  if (cloudCoverPercentage >= 25) return 'Parzialmente nuvoloso';
  return 'Poco nuvoloso';
}
