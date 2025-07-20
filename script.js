// WeatherAPI Key
const weatherApiKey = "9935873d36cd496caa2212100252007";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton"); // For current location
const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecast");
const errorDiv = document.getElementById("error");
const recentContainer = document.getElementById("recentCitiesContainer");
const recentDropdown = document.getElementById("recentCitiesDropdown");

// 📍 Handle City Search
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name.");
  fetchWeatherByCity(city);
  updateRecentCities(city);
});

// 📍 Handle Current Location Search
locationButton.addEventListener("click", () => {
  clearUI();
  showLoading("Fetching your location...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError("Location access denied or unavailable.");
    }
  );
});

// 📍 Handle Recent Dropdown Selection
recentDropdown.addEventListener("change", (e) => {
  const selectedCity = e.target.value;
  fetchWeatherByCity(selectedCity);
});

// 🔹 Fetch Weather By City Name
async function fetchWeatherByCity(city) {
  clearUI();
  try {
    showLoading(`Fetching weather for ${city}...`);

    const currentURL = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`;
    const forecastURL = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=3`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    if (currentData.error || forecastData.error) throw new Error(currentData.error?.message || forecastData.error?.message);

    renderCurrentWeather(currentData);
    renderForecast(forecastData.forecast.forecastday);

  } catch (error) {
    showError(`❌ ${error.message}`);
  }
}

// 🔹 Fetch Weather By Coordinates
async function fetchWeatherByCoords(lat, lon) {
  clearUI();
  try {
    const locationQuery = `${lat},${lon}`;
    const currentURL = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${locationQuery}`;
    const forecastURL = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${locationQuery}&days=3`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    if (currentData.error || forecastData.error) throw new Error(currentData.error?.message || forecastData.error?.message);

    renderCurrentWeather(currentData);
    renderForecast(forecastData.forecast.forecastday);

  } catch (error) {
    showError(`❌ ${error.message}`);
  }
}

// 🧩 Render Current Weather
function renderCurrentWeather(data) {
  const { name } = data.location;
  const { temp_c, humidity, wind_kph, condition } = data.current;

  currentWeather.innerHTML = `
    <h2 class="text-xl font-semibold text-gray-800">${name}</h2>
    <img src="${condition.icon}" alt="${condition.text}" class="mx-auto" />
    <p>🌡️ Temp: ${temp_c}°C</p>
    <p>💧 Humidity: ${humidity}%</p>
    <p>💨 Wind: ${wind_kph} kph</p>
    <p class="italic text-gray-600">${condition.text}</p>
  `;
}

// 🧩 Render 3-Day Forecast
function renderForecast(days) {
  forecastSection.innerHTML = days.map(day => {
    const date = new Date(day.date).toLocaleDateString();
    const icon = day.day.condition.icon;
    const { avgtemp_c, avghumidity, maxwind_kph } = day.day;

    return `
      <div class="bg-blue-100 p-4 rounded-md text-center space-y-2">
        <h3 class="font-semibold text-blue-800">${date}</h3>
        <img src="${icon}" class="mx-auto" />
        <p>🌡️ Temp: ${avgtemp_c}°C</p>
        <p>💧 Humidity: ${avghumidity}%</p>
        <p>💨 Wind: ${maxwind_kph} kph</p>
      </div>
    `;
  }).join("");
}

// 💾 Track Recent Cities in localStorage
function updateRecentCities(city) {
  let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recent.includes(city)) {
    recent.push(city);
    localStorage.setItem("recentCities", JSON.stringify(recent));
  }
  renderRecentDropdown(recent);
}

function renderRecentDropdown(cities) {
  if (cities.length === 0) return;
  recentContainer.classList.remove("hidden");
  recentDropdown.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join("");
}

// 🔧 Utility Functions
function showError(message) {
  errorDiv.innerText = message;
  errorDiv.classList.remove("hidden");
}
function showLoading(msg) {
  currentWeather.innerHTML = `<p class="text-blue-600 italic">${msg}</p>`;
}
function clearUI() {
  currentWeather.innerHTML = "";
  forecastSection.innerHTML = "";
  errorDiv.classList.add("hidden");
}