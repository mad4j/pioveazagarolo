// Module for handling actual vs forecast precipitation data
export class PrecipitationManager {
  constructor() {
    this.actualData = null;
    this._lastFetchMinute = null;
  }

  /**
   * Load actual precipitation data from data-precipitations.json
   */
  async loadActualData() {
    try {
      const minuteKey = Math.floor(Date.now() / (60 * 1000));
      if (this._lastFetchMinute === minuteKey && this.actualData) {
        return true;
      }
      const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`;
      const response = await fetch(`data-precipitations.json${randomQuery}`);
      if (!response.ok) {
        console.warn('Could not load data-precipitations.json, using forecast data only');
        return false;
      }
      this.actualData = await response.json();
      this._lastFetchMinute = minuteKey;
      console.log('Loaded actual precipitation data:', this.actualData);
      return true;
    } catch (error) {
      console.warn('Error loading data-precipitations.json:', error);
      this.actualData = null;
      return false;
    }
  }

  /**
   * Get current hour in Rome timezone
   */
  getCurrentHourRome() {
    try {
      const now = new Date();
      const hour = parseInt(new Intl.DateTimeFormat('en-GB', { 
        hour: 'numeric', 
        hour12: false, 
        timeZone: 'Europe/Rome' 
      }).format(now), 10);
      return Number.isNaN(hour) ? new Date().getHours() : hour;
    } catch {
      return new Date().getHours();
    }
  }

  /**
   * Get current date in Rome timezone (YYYY-MM-DD format)
   */
  getCurrentDateRome() {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Rome',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      }).format(now);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Blend actual precipitation data with forecast data for today's chart
   * @param {Array} forecastPrecipitation - 24-hour forecast precipitation array
   * @returns {Array} - Blended precipitation array (actual for past hours, forecast for future)
   */
  blendTodayPrecipitation(forecastPrecipitation) {
    if (!this.actualData || !forecastPrecipitation || forecastPrecipitation.length !== 24) {
      return forecastPrecipitation;
    }

    const currentDate = this.getCurrentDateRome();
    const currentHour = this.getCurrentHourRome();

    // Check if actual data is for today
    if (this.actualData.date !== currentDate) {
      console.log(`Actual data is for ${this.actualData.date}, today is ${currentDate}. Using forecast only.`);
      return forecastPrecipitation;
    }

    // Create blended array starting with forecast values
    const blended = [...forecastPrecipitation];

    // Replace past hours with actual data
    if (this.actualData.hourly_actual && this.actualData.hourly_actual.time) {
      this.actualData.hourly_actual.time.forEach((timeStr, index) => {
        const hour = parseInt(timeStr.split('T')[1].split(':')[0]);
        
        // Only use actual data for hours that have passed (including current hour)
        if (hour <= currentHour && hour >= 0 && hour < 24) {
          const actualValue = this.actualData.hourly_actual.precipitation[index];
          if (typeof actualValue === 'number') {
            blended[hour] = actualValue;
          }
        }
      });
    }

    console.log(`Blended precipitation data: ${blended.slice(0, currentHour + 1).length} actual hours, ${24 - currentHour - 1} forecast hours`);
    return blended;
  }

  /**
   * Clear precipitation probability for past hours in today's chart
   * @param {Array} forecastProbability - 24-hour forecast probability array
   * @returns {Array} - Probability array with past hours set to 0
   */
  blendTodayProbability(forecastProbability) {
    if (!forecastProbability || forecastProbability.length !== 24) {
      return forecastProbability;
    }

    const currentHour = this.getCurrentHourRome();
    
    // Create blended array starting with forecast values
    const blended = [...forecastProbability];

    // Set probability to 0 for all past hours (excluding current hour)
    for (let hour = 0; hour < currentHour; hour++) {
      blended[hour] = 0;
    }

    console.log(`Blended probability data: ${currentHour} past hours cleared, ${24 - currentHour} forecast hours maintained`);
    return blended;
  }

  /**
   * Check if precipitation data is available and up to date
   */
  isDataValid() {
    if (!this.actualData) return false;
    
    const currentDate = this.getCurrentDateRome();
    return this.actualData.date === currentDate;
  }
}

// Create singleton instance
export const precipitationManager = new PrecipitationManager();