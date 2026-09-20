const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const locationName = document.getElementById("locationName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const clouds = document.getElementById("clouds");
const rainValue = document.getElementById("rainValue");

const weatherWorld = document.getElementById("weatherWorld");
const rainContainer = document.getElementById("rain");

const speechBubble = document.getElementById("speechBubble");
const announcement = document.getElementById("announcement");
const speakBtn = document.getElementById("speakBtn");

let currentWeatherText = "";
let currentCity = "Chennai";
let currentTemperature = 0;

const weatherCodes = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌧️"],
    56: ["Freezing drizzle", "🌧️"],
    57: ["Heavy freezing drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"],
    67: ["Heavy freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "❄️"],
    77: ["Snow grains", "❄️"],
    80: ["Light showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Heavy showers", "⛈️"],
    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Heavy thunderstorm", "⛈️"]
};

async function getCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to find location");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return data.results[0];
}

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,is_day&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather service unavailable");
    }

    return await response.json();
}

function createRain() {

    rainContainer.innerHTML = "";

    for (let i = 0; i < 120; i++) {

        const drop = document.createElement("div");

        drop.className = "rain-drop";

        drop.style.left = Math.random() * 100 + "%";

        drop.style.animationDelay =
            Math.random() * 1 + "s";

        drop.style.animationDuration =
            0.4 + Math.random() * 0.5 + "s";

        rainContainer.appendChild(drop);
    }
}

function removeRain() {
    rainContainer.innerHTML = "";
}

function updateSky(weatherCode, isDay) {

    weatherWorld.classList.remove(
        "night",
        "cloudy",
        "rainy"
    );

    removeRain();

    if (!isDay) {
        weatherWorld.classList.add("night");
    }

    if (
        weatherCode === 2 ||
        weatherCode === 3 ||
        weatherCode === 45 ||
        weatherCode === 48
    ) {
        weatherWorld.classList.add("cloudy");
    }

    if (
        weatherCode >= 51 &&
        weatherCode <= 99
    ) {
        weatherWorld.classList.add("rainy");
        createRain();
    }
}

function generateAnnouncement(city, temp, text) {

    return `Good day! This is your live weather reporter from ${city}. 
The current temperature is ${Math.round(temp)} degrees Celsius, 
with ${text.toLowerCase()}. 
Please stay updated and plan your day accordingly.`;
}

function speakWeather() {

    if (!currentWeatherText) {
        return;
    }

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(currentWeatherText);

        speech.rate = 0.9;
        speech.pitch = 1;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);

        speechBubble.textContent =
            currentWeatherText;
    } else {

        speechBubble.textContent =
            "Your browser does not support voice announcements.";
    }
}

async function loadWeather(city) {

    try {

        condition.textContent = "Fetching live weather...";
        weatherIcon.textContent = "🌍";

        const location = await getCoordinates(city);

        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );

        const current = weather.current;

        currentCity = location.name;

        currentTemperature =
            current.temperature_2m;

        const weatherInfo =
            weatherCodes[current.weather_code] ||
            ["Unknown weather", "🌍"];

        const weatherText =
            weatherInfo[0];

        const icon =
            weatherInfo[1];

        locationName.textContent =
            `${location.name}, ${location.country}`;

        temperature.textContent =
            Math.round(current.temperature_2m);

        condition.textContent =
            weatherText;

        weatherIcon.textContent =
            icon;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        wind.textContent =
            `${Math.round(current.wind_speed_10m)} km/h`;

        clouds.textContent =
            `${current.cloud_cover}%`;

        rainValue.textContent =
            `${current.rain} mm`;

        updateSky(
            current.weather_code,
            current.is_day
        );

        currentWeatherText =
            generateAnnouncement(
                currentCity,
                currentTemperature,
                weatherText
            );

        announcement.textContent =
            `🎙️ ${currentWeatherText}`;

        speechBubble.textContent =
            `Hello! I'm reporting live from ${currentCity}. 
Currently, it's ${Math.round(currentTemperature)}°C with ${weatherText.toLowerCase()}.`;

    } catch (error) {

        locationName.textContent =
            "Location unavailable";

        condition.textContent =
            error.message;

        weatherIcon.textContent =
            "❌";

        announcement.textContent =
            "🎙️ Unable to fetch the latest weather information.";

    }
}

searchBtn.addEventListener("click", () => {

    const city =
        cityInput.value.trim();

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    loadWeather(city);
});

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    locationBtn.textContent =
        "📍 Detecting...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const weather =
                    await getWeather(
                        latitude,
                        longitude
                    );

                const current =
                    weather.current;

                const weatherInfo =
                    weatherCodes[current.weather_code] ||
                    ["Unknown weather", "🌍"];

                locationName.textContent =
                    "Your Current Location";

                temperature.textContent =
                    Math.round(current.temperature_2m);

                condition.textContent =
                    weatherInfo[0];

                weatherIcon.textContent =
                    weatherInfo[1];

                humidity.textContent =
                    `${current.relative_humidity_2m}%`;

                wind.textContent =
                    `${Math.round(current.wind_speed_10m)} km/h`;

                clouds.textContent =
                    `${current.cloud_cover}%`;

                rainValue.textContent =
                    `${current.rain} mm`;

                updateSky(
                    current.weather_code,
                    current.is_day
                );

                currentCity =
                    "your current location";

                currentTemperature =
                    current.temperature_2m;

                currentWeatherText =
                    generateAnnouncement(
                        currentCity,
                        currentTemperature,
                        weatherInfo[0]
                    );

                announcement.textContent =
                    `🎙️ ${currentWeatherText}`;

                speechBubble.textContent =
                    `Reporting live from your location. 
It is currently ${Math.round(currentTemperature)}°C with ${weatherInfo[0].toLowerCase()}.`;

            } catch (error) {

                alert("Unable to fetch your local weather.");

            }

            locationBtn.textContent =
                "📍 My Location";
        },

        () => {

            alert(
                "Location access was denied. Please allow location permission."
            );

            locationBtn.textContent =
                "📍 My Location";
        }
    );
});

speakBtn.addEventListener(
    "click",
    speakWeather
);

loadWeather("Chennai");

setInterval(() => {

    if (currentCity !== "your current location") {
        loadWeather(currentCity);
    }

}, 10 * 60 * 1000);