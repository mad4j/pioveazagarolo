import { CHART_MODES, chartModes } from './constants.js';
import { buildChart, buildTemperatureChart, buildWindChart, buildPressureChart, buildAirQualityChart, getDaySlice, calculateUnifiedPressureScale } from './charts.js';

/**
 * Builds appropriate chart based on current global mode
 * @param {string} chartId - Target chart ID
 * @param {Object} weatherData - Weather data object
 * @param {number} dayIndex - Day index (0, 1, 2)
 * @param {Object} unifiedPressureScale - Optional unified pressure scale for pressure mode
 */
export function buildAppropriateChart(chartId, weatherData, dayIndex, unifiedPressureScale = null) {
  if (!weatherData || !weatherData.daily || !weatherData.hourly) return;
  
  // Use global mode (all charts should be in same mode)
  const currentMode = chartModes['today-chart'];
  const sunriseTime = weatherData.daily.sunrise?.[dayIndex];
  const sunsetTime = weatherData.daily.sunset?.[dayIndex];
  
  if (currentMode === CHART_MODES.TEMPERATURE && weatherData.hourly.temperature_2m && weatherData.hourly.apparent_temperature) {
    const temperatureSlice = getDaySlice(weatherData.hourly.temperature_2m, dayIndex);
    const apparentTempSlice = getDaySlice(weatherData.hourly.apparent_temperature, dayIndex);
    const humiditySlice = weatherData.hourly.relative_humidity_2m ? getDaySlice(weatherData.hourly.relative_humidity_2m, dayIndex) : null;
    const windSpeedSlice = weatherData.hourly.wind_speed_10m ? getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex) : null;
    buildTemperatureChart(chartId, temperatureSlice, apparentTempSlice, humiditySlice, sunriseTime, sunsetTime, windSpeedSlice);
  } else if (currentMode === CHART_MODES.WIND && weatherData.hourly.wind_speed_10m && weatherData.hourly.wind_direction_10m) {
    const windSpeedSlice = getDaySlice(weatherData.hourly.wind_speed_10m, dayIndex);
    const windDirectionSlice = getDaySlice(weatherData.hourly.wind_direction_10m, dayIndex);
    buildWindChart(chartId, windSpeedSlice, windDirectionSlice, sunriseTime, sunsetTime);
  } else if (currentMode === CHART_MODES.PRESSURE && weatherData.hourly.pressure_msl) {
    const pressureSlice = getDaySlice(weatherData.hourly.pressure_msl, dayIndex);
    const weatherCodeSlice = weatherData.hourly.weather_code ? getDaySlice(weatherData.hourly.weather_code, dayIndex) : null;
    const isDaySlice = weatherData.hourly.is_day ? getDaySlice(weatherData.hourly.is_day, dayIndex) : null;
    buildPressureChart(chartId, pressureSlice, sunriseTime, sunsetTime, weatherCodeSlice, isDaySlice, unifiedPressureScale);
  } else if (currentMode === CHART_MODES.AIR_QUALITY && weatherData.air_quality && weatherData.air_quality.hourly && weatherData.air_quality.hourly.european_aqi) {
    const eaqiSlice = getDaySlice(weatherData.air_quality.hourly.european_aqi, dayIndex);
    const uvSlice = weatherData.hourly.uv_index ? getDaySlice(weatherData.hourly.uv_index, dayIndex) : null;
    const cloudCoverageSlice = weatherData.hourly.cloud_cover ? getDaySlice(weatherData.hourly.cloud_cover, dayIndex) : null;
    buildAirQualityChart(chartId, eaqiSlice, uvSlice, sunriseTime, sunsetTime, cloudCoverageSlice);
  } else {
    // Default to precipitation chart and ensure all charts are in precipitation mode
    chartModes[chartId] = CHART_MODES.PRECIPITATION;
    const probabilitySlice = getDaySlice(weatherData.hourly.precipitation_probability, dayIndex);
    const precipitationSlice = getDaySlice(weatherData.hourly.precipitation, dayIndex);
    const showersSlice = weatherData.hourly.showers ? getDaySlice(weatherData.hourly.showers, dayIndex) : null;
    const snowfallSlice = weatherData.hourly.snowfall ? getDaySlice(weatherData.hourly.snowfall, dayIndex) : null;
    buildChart(chartId, probabilitySlice, precipitationSlice, sunriseTime, sunsetTime, showersSlice, snowfallSlice);
  }
}