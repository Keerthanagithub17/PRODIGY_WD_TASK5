
const API_KEY = "ba7a979f60e59aacfd4b4c53ea4eb4dd";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const error = document.getElementById("error");

searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (city === "") {
        error.textContent = "Please enter a city name.";
        return;
    }

    getWeatherByCity(city);
});

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

locationBtn.addEventListener("click", function () {
    getWeatherByLocation();
});

async function getWeatherByCity(city) {

    error.textContent = "Loading weather...";

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch weather data");
        }

        displayWeather(data);

        error.textContent = "";

    } catch (err) {

        error.textContent = "Unable to fetch weather data. Check the city name or API key.";

        console.log(err);
    }
}

function getWeatherByLocation() {

    if (!navigator.geolocation) {
        error.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    error.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        async function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

                const url =
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

                const response = await fetch(url);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to fetch weather data");
                }

                displayWeather(data);

                error.textContent = "";

            } catch (err) {

                error.textContent = "Unable to fetch weather data.";

                console.log(err);
            }
        },

        function () {
            error.textContent = "Location permission was denied.";
        }
    );
}

function displayWeather(data) {

    document.getElementById("city").textContent = data.name;

    document.getElementById("country").textContent =
        data.sys.country;

    document.getElementById("temperature").textContent =
        `${Math.round(data.main.temp)}°C`;

    document.getElementById("condition").textContent =
        data.weather[0].description;

    document.getElementById("humidity").textContent =
        `${data.main.humidity}%`;

    document.getElementById("wind").textContent =
        `${Math.round(data.wind.speed * 3.6)} km/h`;

    document.getElementById("feelsLike").textContent =
        `${Math.round(data.main.feels_like)}°C`;

    document.getElementById("pressure").textContent =
        `${data.main.pressure} hPa`;

    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

