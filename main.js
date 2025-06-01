function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('it-IT', options);
}

function updateCardClass(cardId, percentage) {
    const card = document.getElementById(cardId);
    card.classList.remove('high-chance', 'medium-chance', 'low-chance');
    if (percentage >= 60) {
        card.classList.add('high-chance');
    } else if (percentage >= 30) {
        card.classList.add('medium-chance');
    } else {
        card.classList.add('low-chance');
    }
}

function getPrecipitationBarColor(value) {
    if (value > 30) return '#6c3483'; // Nubifragio: viola scuro
    if (value > 10) return '#b03a2e'; // Rovescio: rosso scuro
    if (value > 6) return '#e74c3c'; // Pioggia forte: rosso
    if (value > 4) return '#f39c12'; // Pioggia moderata: arancio
    if (value > 2) return '#27ae60'; // Pioggia leggera: verde
    if (value > 1) return '#3498db'; // Pioggia debole: azzurro
    return '#85c1e9'; // Sotto 1 mm/h: azzurro chiaro
}

function buildChart(target, probabilityData, precipitationData) {
    const ctx = document.getElementById(target);
    new Chart(ctx, {
        
        data: {
            labels: [...Array(24).keys()].map(hour => `${hour}:00`),
            datasets: [
                {
                    label: 'Probabilità (%)',
                    type: 'line',
                    fill: true,
                    lineTension: 0.4,
                    backgroundColor: 'rgba(52, 152, 219, 0.3)',
                    borderColor: 'rgb(41, 128, 185)',
                    borderWidth: 2,
                    data: probabilityData,
                    pointBackgroundColor: 'rgb(41, 128, 185)',
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    yAxisID: 'y',
                },
                {
                    label: 'Precipitazione (mm)',
                    type: 'bar',
                    backgroundColor: precipitationData.map(getPrecipitationBarColor),
                    borderColor: precipitationData.map(getPrecipitationBarColor),
                    borderWidth: 1,
                    data: precipitationData,
                    yAxisID: 'y1',
                    order: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 5 },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    position: 'left',
                    grid: { drawOnChartArea: true, color: 'rgba(200, 200, 200, 0.2)', drawTicks: false },
                    ticks: { display: false, font: { family: "'Montserrat', sans-serif", size: 10 } }
                },
                y1: {
                    min: 0,
                    max: Math.max(...precipitationData, 1) < 2 ? 2 : Math.ceil(Math.max(...precipitationData, 1)),
                    position: 'right',
                    grid: { drawOnChartArea: false, drawTicks: false },
                    ticks: { display: false, font: { family: "'Montserrat', sans-serif", size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6,
                        font: { family: "'Montserrat', sans-serif", size: 10 },
                        color: '#7f8c8d'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleFont: { family: "'Montserrat', sans-serif", size: 12 },
                    bodyFont: { family: "'Montserrat', sans-serif", size: 12 },
                    callbacks: {
                        title: function (tooltipItems) {
                            return `Ore ${tooltipItems[0].label}`;
                        },
                        label: function (context) {
                            if (context.datasetIndex === 0) {
                                return `Probabilità: ${context.parsed.y}%`;
                            } else {
                                return `Precipitazione: ${context.parsed.y} mm`;
                            }
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false }
        },
    });
}

function getRainIconClass(weatherCode) {
    if ([95, 96, 99].includes(weatherCode)) return 'wi wi-thunderstorm'; // Temporale
    if ([85, 86].includes(weatherCode)) return 'wi wi-storm-showers';   // Neve
    if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'wi wi-rain'; // Pioggia
    if ([71, 73, 75, 77].includes(weatherCode)) return 'wi wi-snow';    // Neve
    if ([45, 48].includes(weatherCode)) return 'wi wi-fog';             // Nebbia
    if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'wi wi-sprinkle'; // Pioviggine
    if ([1, 2, 3].includes(weatherCode)) return 'wi wi-cloud';          // Parzialmente nuvoloso
    if (weatherCode === 0) return 'wi wi-day-sunny';                    // Sereno
    return 'wi wi-cloud';                                               // Default nuvoloso
}

function displayData(data) {
    const todayData = data.hourly.precipitation_probability.slice(0, 24);
    const tomorrowData = data.hourly.precipitation_probability.slice(24, 48);
    const dayAfterTomorrowData = data.hourly.precipitation_probability.slice(48, 72);

    const todayPrecip = data.hourly.precipitation.slice(0, 24);
    const tomorrowPrecip = data.hourly.precipitation.slice(24, 48);
    const dayAfterTomorrowPrecip = data.hourly.precipitation.slice(48, 72);

    const todayPercentage = data.daily.precipitation_probability_max[0];
    const tomorrowPercentage = data.daily.precipitation_probability_max[1];
    const dayAfterTomorrowPercentage = data.daily.precipitation_probability_max[2];

    const precipitationToday = data.daily.precipitation_sum[0];
    const precipitationTomorrow = data.daily.precipitation_sum[1];
    const precipitationDayAfterTomorrow = data.daily.precipitation_sum[2];

    // Cambia icona in base al weather_code
    document.getElementById('today-icon').className = getRainIconClass(data.daily.weather_code[0]);
    document.getElementById('tomorrow-icon').className = getRainIconClass(data.daily.weather_code[1]);
    document.getElementById('dayaftertomorrow-icon').className = getRainIconClass(data.daily.weather_code[2]);

    // Temperatura max/min accanto all'icona
    document.getElementById('today-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[0])}°`;
    document.getElementById('today-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[0])}°`;
    document.getElementById('tomorrow-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[1])}°`;
    document.getElementById('tomorrow-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[1])}°`;
    document.getElementById('dayaftertomorrow-temp-max').textContent = `${Math.round(data.daily.temperature_2m_max[2])}°`;
    document.getElementById('dayaftertomorrow-temp-min').textContent = `${Math.round(data.daily.temperature_2m_min[2])}°`;

    document.getElementById("today-percentage").textContent = `${todayPercentage}%`;
    document.getElementById("today-mm").textContent = `${precipitationToday.toFixed(1)} mm`;
    document.getElementById("tomorrow-percentage").textContent = `${tomorrowPercentage}%`;
    document.getElementById("tomorrow-mm").textContent = `${precipitationTomorrow.toFixed(1)} mm`;
    document.getElementById("dayaftertomorrow-percentage").textContent = `${dayAfterTomorrowPercentage}%`;
    document.getElementById("dayaftertomorrow-mm").textContent = `${precipitationDayAfterTomorrow.toFixed(1)} mm`;

    document.getElementById("today-date").textContent = formatDate(data.daily.time[0]);
    document.getElementById("tomorrow-date").textContent = formatDate(data.daily.time[1]);
    document.getElementById("dayaftertomorrow-date").textContent = formatDate(data.daily.time[2]);

    updateCardClass("today-card", todayPercentage);
    updateCardClass("tomorrow-card", tomorrowPercentage);
    updateCardClass("dayaftertomorrow-card", dayAfterTomorrowPercentage);

    buildChart("today-chart", todayData, todayPrecip);
    buildChart("tomorrow-chart", tomorrowData, tomorrowPrecip);
    buildChart("dayaftertomorrow-chart", dayAfterTomorrowData, dayAfterTomorrowPrecip);

    document.getElementById("last-updated").textContent = data.last_update.trim();
}

async function retrieveData() {
    try {
        const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`;
        const response = await fetch(`data.json${randomQuery}`);
        if (!response.ok) {
            throw new Error('Errore nel caricamento dei dati meteo');
        }
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore nel caricamento dei dati. Riprova più tardi.');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    retrieveData();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registrato con successo:', registration.scope);
        })
        .catch(error => {
            console.error('Errore nella registrazione del Service Worker:', error);
        });
}
