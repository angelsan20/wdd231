const apiKey = '75abf527fae825e37839123d9575a76f';
const lat = '10.2544';
const lon = '-68.0117';

const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

const weatherContainer = document.getElementById('weather-info');
const unitToggleBtn = document.getElementById('unit-toggle');

let isCelsius = true;
let currentWeatherData = null;
let forecastWeatherData = null;

function toFahrenheit(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
}

async function apiFetch() {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (currentResponse.ok && forecastResponse.ok) {
            currentWeatherData = await currentResponse.json();
            forecastWeatherData = await forecastResponse.json();
            
            renderWeather();
        } else {
            throw Error(await currentResponse.text());
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherContainer.innerHTML = '<p>Unable to load weather data at this time.</p>';
    }
}

function renderWeather() {
    if (!currentWeatherData || !forecastWeatherData) return;

    const tempC = Math.round(currentWeatherData.main.temp);
    const displayTemp = isCelsius ? tempC : toFahrenheit(tempC);
    const unitSymbol = isCelsius ? '&deg;C' : '&deg;F';

    const description = currentWeatherData.weather[0].description;
    const iconCode = currentWeatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const capitalizedDesc = description.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const dailyForecasts = forecastWeatherData.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);

    weatherContainer.innerHTML = `
        <div class="current-weather">
            <img src="${iconUrl}" alt="${capitalizedDesc}" width="64" height="64">
            <div>
                <p class="weather-temp">${displayTemp}${unitSymbol}</p>
                <p class="weather-desc">${capitalizedDesc}</p>
            </div>
        </div>
        <hr>
        <h3>3-Day Forecast</h3>
        <ul class="forecast-list">
            ${dailyForecasts.map(day => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayTempC = Math.round(day.main.temp);
                const dayDisplayTemp = isCelsius ? dayTempC : toFahrenheit(dayTempC);
                return `<li><strong>${dayName}:</strong> ${dayDisplayTemp}${unitSymbol}</li>`;
            }).join('')}
        </ul>
    `;
}

// Units change
if (unitToggleBtn) {
    unitToggleBtn.addEventListener('click', () => {
        isCelsius = !isCelsius;
        unitToggleBtn.classList.toggle('active', !isCelsius);
        renderWeather();
    });
}

apiFetch();