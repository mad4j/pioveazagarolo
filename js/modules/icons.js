// Mapping codici WMO -> classi icone
export function getRainIconClass(weatherCode) {
  if ([95, 96, 99].includes(weatherCode)) return 'wi wi-thunderstorm';
  if ([85, 86].includes(weatherCode)) return 'wi wi-storm-showers';
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'wi wi-rain';
  if ([71, 73, 75, 77].includes(weatherCode)) return 'wi wi-snow';
  if ([45, 48].includes(weatherCode)) return 'wi wi-fog';
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'wi wi-sprinkle';
  if ([2, 3].includes(weatherCode)) return 'wi wi-cloud';
  if ([0, 1].includes(weatherCode)) return 'wi wi-day-sunny';
  return 'wi wi-cloud';
}
