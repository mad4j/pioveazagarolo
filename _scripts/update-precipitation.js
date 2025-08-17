#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates data-precipitations.json with current actual precipitation data
 * Reads from data.json and updates the actual precipitation history
 * 
 * Behavior:
 * - Maintains exactly 24 values maximum (hours 0-23 for current day)
 * - When day changes: automatically resets to start fresh for new day
 * - During same day: accumulates hourly data, never exceeds 24 hours
 * - Removes any future hours or invalid hours (outside 0-23 range)
 * - Data structure: { date, timezone, hourly_actual: { time[], precipitation[] }, last_update }
 */

const dataPath = path.join(__dirname, '..', 'data.json');
const precipPath = path.join(__dirname, '..', 'data-precipitations.json');

try {
  // Load current weather data
  const weatherData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Load or initialize precipitation data
  let precipData;
  try {
    precipData = JSON.parse(fs.readFileSync(precipPath, 'utf8'));
  } catch (e) {
    // Initialize if file doesn't exist
    precipData = {
      date: "",
      timezone: "Europe/Rome", 
      hourly_actual: {
        time: [],
        precipitation: []
      },
      last_update: ""
    };
  }

  // Get current time in Rome timezone
  const now = new Date();
  const romeTime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);

  const currentDate = romeTime.split(' ')[0]; // YYYY-MM-DD
  const currentHour = parseInt(romeTime.split(' ')[1].split(':')[0]); // HH

  // Check if we need to reset for a new day
  if (precipData.date !== currentDate) {
    console.log(`New day detected: ${precipData.date} -> ${currentDate}`);
    precipData.date = currentDate;
    precipData.hourly_actual.time = [];
    precipData.hourly_actual.precipitation = [];
  }

  // Find current precipitation from current weather data
  let currentPrecipitation = 0;
  if (weatherData.current && typeof weatherData.current.precipitation === 'number') {
    currentPrecipitation = weatherData.current.precipitation;
  } else if (weatherData.current && typeof weatherData.current.rain === 'number') {
    currentPrecipitation = weatherData.current.rain;
  }

  // Create time string for current hour
  const currentTimeStr = `${currentDate}T${currentHour.toString().padStart(2, '0')}:00`;
  
  // Check if we already have data for this hour
  const existingIndex = precipData.hourly_actual.time.indexOf(currentTimeStr);
  
  if (existingIndex >= 0) {
    // Update existing hour data 
    precipData.hourly_actual.precipitation[existingIndex] = currentPrecipitation;
    console.log(`Updated hour ${currentHour}: ${currentPrecipitation} mm`);
  } else {
    // Add new hour data
    precipData.hourly_actual.time.push(currentTimeStr);
    precipData.hourly_actual.precipitation.push(currentPrecipitation);
    console.log(`Added hour ${currentHour}: ${currentPrecipitation} mm`);
  }

  // Remove future hours and ensure we maintain only 24 values max (hours 0-23)
  const validIndices = precipData.hourly_actual.time
    .map((timeStr, index) => {
      const hour = parseInt(timeStr.split('T')[1].split(':')[0]);
      // Only keep hours that are valid (0-23) and not in the future
      return (hour >= 0 && hour <= 23 && hour <= currentHour) ? index : -1;
    })
    .filter(index => index >= 0);

  precipData.hourly_actual.time = validIndices.map(i => precipData.hourly_actual.time[i]);
  precipData.hourly_actual.precipitation = validIndices.map(i => precipData.hourly_actual.precipitation[i]);

  // Additional safety: ensure arrays never exceed 24 elements
  if (precipData.hourly_actual.time.length > 24) {
    precipData.hourly_actual.time = precipData.hourly_actual.time.slice(-24);
    precipData.hourly_actual.precipitation = precipData.hourly_actual.precipitation.slice(-24);
    console.log('Trimmed precipitation data to maintain 24-hour limit');
  }

  // Update last_update timestamp
  precipData.last_update = romeTime.replace('T', ' ');

  // Write updated precipitation data
  fs.writeFileSync(precipPath, JSON.stringify(precipData, null, 2));
  
  console.log(`Updated data-precipitations.json with ${precipData.hourly_actual.time.length} hours of data`);
  console.log(`Current hour ${currentHour}: ${currentPrecipitation} mm`);

} catch (error) {
  console.error('Error updating precipitation data:', error);
  process.exit(1);
}