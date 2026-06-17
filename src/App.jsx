import Skeleton from "./components/Skeleton";
import { useEffect, useState } from "react";
import "./App.css";
import Logo from "./assets/Logo.png";
import { Card } from "./components/Card";
import { AirQualityPanel } from "./components/AirQualityPanel";
import { BackToTop } from "./components/BackToTop";
import { Footer } from "./components/Footer";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { Hero } from "./components/Hero";
import { ThemeToggle } from "./components/ThemeToggle";
import WeatherMap from "./components/WeatherMap";
import { WeatherCharts } from "./components/WeatherCharts";
import {
  formatTemperature,
  formatWindSpeed,
  formatPressure,
  validateWeatherData,
} from "./utils/weatherUtils";

function App() {
  const [city, setCity] = useState(() => {
    return localStorage.getItem("selectedCity") || "Patna";
  });
  const [cityInfo, setCityInfo] = useState(() => {
    return localStorage.getItem("selectedCityInfo") || "Patna";
  });
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  // New States
  const [isCelsius, setIsCelsius] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteCities, setFavoriteCities] = useState(() => {
    const saved = localStorage.getItem("favoriteCities");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("weather");
  const [backgroundClass, setBackgroundClass] = useState(
    "bg-gradient-to-br from-blue-900 to-blue-600",
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [weather, setWeather] = useState({
    temperature: null,
    latitude: null,
    longitude: null,
    moisture: null,
    windSpeed: null,
    pressure: null,
    humidity: null,
    cloud: null,
    condition: null,
    icon: null,
    feelsLike: null,
    uv: null,
  });

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("selectedCity", city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem("selectedCityInfo", cityInfo);
  }, [cityInfo]);

  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const buildWeatherSummary = (data, useCelsius) => {
    const { current, location } = data;

    return {
      temperature: useCelsius ? current.temp_c : current.temp_f,
      latitude: location.lat,
      longitude: location.lon,
      moisture: useCelsius ? current.dewpoint_c : current.dewpoint_f,
      windSpeed: current.wind_kph,
      pressure: current.pressure_mb,
      humidity: current.humidity,
      cloud: current.cloud,
      condition: current.condition.text,
      icon: current.condition.icon.startsWith("//")
        ? `https:${current.condition.icon}`
        : current.condition.icon,
      feelsLike: useCelsius ? current.feelslike_c : current.feelslike_f,
      uv: current.uv,
    };
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cityInfo.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const res = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityInfo}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInfo]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=yes`;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setError("City not found");
          setWeatherData(null);
          return;
        }
        setError(null);
        const data = await response.json();

        // Validate weather data
        if (!validateWeatherData(data)) {
          setError("Invalid weather data received");
          setWeatherData(null);
          return;
        }

        setWeatherData(data);
        setForecastData(data.forecast?.forecastday || []);

        const locationName = data.location.name;
        if (!city.includes(",")) {
          setRecentSearches((prev) => {
            const filtered = prev.filter(
              (s) => s.toLowerCase() !== locationName.toLowerCase(),
            );
            return [locationName, ...filtered].slice(0, 5);
          });
        }

        const isDay = data.current.is_day;
        const conditionText = data.current.condition.text.toLowerCase();

        if (isDay === 0) {
          setBackgroundClass("bg-gradient-to-br from-indigo-900 to-black");
        } else if (
          conditionText.includes("sunny") ||
          conditionText.includes("clear")
        ) {
          setBackgroundClass("bg-gradient-to-br from-yellow-400 to-orange-500");
        } else if (
          conditionText.includes("rain") ||
          conditionText.includes("drizzle")
        ) {
          setBackgroundClass("bg-gradient-to-br from-gray-700 to-blue-900");
        } else if (
          conditionText.includes("cloud") ||
          conditionText.includes("overcast")
        ) {
          setBackgroundClass("bg-gradient-to-br from-gray-400 to-gray-600");
        } else if (
          conditionText.includes("snow") ||
          conditionText.includes("ice")
        ) {
          setBackgroundClass("bg-gradient-to-br from-blue-100 to-blue-300");
        } else {
          setBackgroundClass("bg-gradient-to-br from-blue-900 to-blue-600");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      }
    };

    if (city) {
      fetchData();
    }
  }, [city]);

  useEffect(() => {
    if (weatherData) {
      setWeather(buildWeatherSummary(weatherData, isCelsius));
    }
  }, [isCelsius, weatherData]);

  const toggleUnit = () => {
    setIsCelsius((current) => !current);
  };

  const handleSearch = () => {
    const query = cityInfo.trim();

    if (!query) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setCityInfo(query);
    setShowSuggestions(false);
    setCity(query);
  };

  const handleSuggestionClick = (suggestion) => {
    const query = suggestion.region
      ? `${suggestion.name}, ${suggestion.region}`
      : suggestion.name;

    setCityInfo(query);
    setShowSuggestions(false);
    setError(null);
    setCity(query);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    setCityInfo("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCity(`${latitude},${longitude}`);
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setError("The request to get user location timed out");
            break;
          default:
            setError("An unknown error occurred while fetching location");
            break;
        }
      },
    );
  };

  const handleChange = (e) => {
    setCityInfo(e.target.value);
  };

  const isCitySaved = (cityName) => {
    return favoriteCities.some(
      (city) => city.name.toLowerCase() === cityName.toLowerCase(),
    );
  };

  const saveCity = () => {
    if (!weatherData) return;

    const cityPayload = {
      name: weatherData.location.name,
      region: weatherData.location.region,
      country: weatherData.location.country,
      temp: isCelsius ? weatherData.current.temp_c : weatherData.current.temp_f,
      condition: weatherData.current.condition.text,
      icon: weatherData.current.condition.icon,
    };

    setFavoriteCities((prev) => {
      const exists = prev.some(
        (city) => city.name.toLowerCase() === cityPayload.name.toLowerCase(),
      );

      if (exists) return prev;

      return [cityPayload, ...prev];
    });
  };

  const removeCity = (cityName) => {
    setFavoriteCities((prev) =>
      prev.filter((city) => city.name.toLowerCase() !== cityName.toLowerCase()),
    );
  };

  const loadFavoriteCity = (cityName) => {
    setCity(cityName);
    setCityInfo(cityName);
    setActiveTab("weather");
  };

  const getWeatherInsights = () => {
    const insights = [];

    if (weather.temperature >= 35) {
      insights.push({
        title: "Stay hydrated in high temperatures",
        description: `Temperatures above ${weather.temperature}°C — drink water regularly and avoid prolonged sun exposure.`,
        emoji: "🌡️",
        accent: "yellow",
      });
    }

    if (weather.uv >= 6) {
      insights.push({
        title: "High UV exposure today",
        description: `UV index is currently ${weather.uv}. Use sunscreen and avoid excessive sun exposure.`,
        emoji: "🧴",
        accent: "yellow",
      });
    }

    if (weather.windSpeed >= 25) {
      insights.push({
        title: "Strong winds expected outside",
        description: `Wind speeds at ${weather.windSpeed} KPH — be cautious while traveling outdoors.`,
        emoji: "💨",
        accent: "blue",
      });
    }

    if (weather.humidity >= 80) {
      insights.push({
        title: "High humidity levels today",
        description: `Humidity is currently ${weather.humidity}% which may make the weather feel warmer.`,
        emoji: "💧",
        accent: "cyan",
      });
    }

    if (weather.condition?.toLowerCase().includes("rain")) {
      insights.push({
        title: "Carry an umbrella before heading out",
        description:
          "Rainy conditions are expected today. Keep an umbrella or raincoat handy.",
        emoji: "🌧️",
        accent: "purple",
      });
    }

    if (
      weather.condition?.toLowerCase().includes("sunny") ||
      weather.condition?.toLowerCase().includes("clear")
    ) {
      insights.push({
        title: "Great weather for outdoor activities",
        description:
          "Clear skies and pleasant visibility make this ideal for outdoor plans.",
        emoji: "☀️",
        accent: "green",
      });
    }

    if (
      weather.condition?.toLowerCase().includes("overcast") ||
      weather.condition?.toLowerCase().includes("cloudy")
    ) {
      insights.push({
        title: "Cloudy skies expected today",
        description:
          "Dense cloud cover may reduce sunlight throughout the day.",
        emoji: "☁️",
        accent: "gray",
      });
    }

    if (
      weather.condition?.toLowerCase().includes("mist") ||
      weather.condition?.toLowerCase().includes("fog") ||
      weather.condition?.toLowerCase().includes("haze")
    ) {
      insights.push({
        title: "Reduced visibility outdoors",
        description:
          "Mist or fog conditions may affect visibility while driving or traveling.",
        emoji: "🌫️",
        accent: "cyan",
      });
    }

    if (weather.condition?.toLowerCase().includes("thunder")) {
      insights.push({
        title: "Thunderstorm conditions detected",
        description:
          "Take precautions and avoid open areas during thunderstorms.",
        emoji: "⛈️",
        accent: "purple",
      });
    }

    if (weather.condition?.toLowerCase().includes("snow")) {
      insights.push({
        title: "Snowfall expected today",
        description:
          "Cold and snowy conditions may affect travel and outdoor activities.",
        emoji: "❄️",
        accent: "blue",
      });
    }

    if (weather.temperature <= 10) {
      insights.push({
        title: "Cold weather detected",
        description:
          "Wear warm clothing and avoid prolonged exposure to cold weather.",
        emoji: "🧥",
        accent: "cyan",
      });
    }
    return insights;
  };

  const ErrorBox = () => {
    return (
      <div className="errorbox my-10 p-4 bg-red-100 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-red-600">{error}</h1>
      </div>
    );
  };

  const WeatherChart = () => {
    const [weather, setWeather] = useState(null);

    const getWeather = async (city) => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`
      );

      const data = await response.json();
      setWeather(data);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {if (city) {getWeather(city);}}, [city]);
    return (
      <div>
        {weather && weather.forecast && (
        <WeatherCharts
          forecastData={weather.forecast.forecastday}
        />
      )}
      </div>
    );
  }

  const WeatherDetail = () => {
    if (!weatherData) return null;
    const { current, location } = weatherData;
    const temp = isCelsius ? current.temp_c : current.temp_f;
    const feelsLike = isCelsius ? current.feelslike_c : current.feelslike_f;
    const unit = isCelsius ? "°C" : "°F";
    const insights = getWeatherInsights();
    const cityName = location.name;
    const region = location.region;
    const airQuality = current.air_quality;

    return (
      <div className="weather-workspace">
        <div className="weather-toolbar">
          <div>
            <p className="section-kicker">Live Weather</p>
            <h2 className="text-3xl font-black tracking-tight m-0 text-current">
              {cityName} weather at a glance
            </h2>
          </div>
          <button
            onClick={toggleUnit}
            className="unit-switch"
            title={`Switch to ${isCelsius ? "Fahrenheit" : "Celsius"}`}
            aria-label={`Switch to ${isCelsius ? "Fahrenheit" : "Celsius"}`}
          >
            {isCelsius ? "°C" : "°F"} / Switch to {isCelsius ? "°F" : "°C"}
          </button>
        </div>

        <div className="weather-current-panel weather-panel">
          <div className="weather-current-overview">
            <p className="weather-status">Current conditions</p>
            <h3>{cityName}</h3>
            <p>
              {region ? `${region}, ${location.country}` : location.country}
            </p>
            <div className="weather-current">
              <div className="weather-current-left">
                {weather.icon && (
                  <img
                    src={weather.icon}
                    alt={weather.condition || "Weather condition"}
                  />
                )}
                <div>
                  <strong>{weather.condition}</strong>
                  <span>{location.localtime}</span>
                </div>
              </div>
              <div className="weather-current-temp">
                <strong>
                  {temp}
                  {unit}
                </strong>
                <span>
                  Feels like {feelsLike}
                  {unit}
                </span>
              </div>
            </div>
          </div>

          <div className="weather-side-actions">
            <div className="hero-chip">
              Lat {weather.latitude} / Lon {weather.longitude}
            </div>

            <button
              onClick={saveCity}
              className={`save-city-button ${
                isCitySaved(cityName) ? "saved" : ""
              }`}
            >
              {isCitySaved(cityName) ? "Saved" : "☆ Add city to favorites"}
            </button>
          </div>
        </div>

        <div className="weather-summary-grid">
          <Card
            badge="Temperature"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.temperature}${unit}`
  )
}
            text="Live temperature from WeatherAPI."
            subtle
          />
          <Card
            badge="Wind"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.windSpeed} KPH`
  )
}
            
            text="Wind speed and air movement."
            subtle
          />
          <Card
            badge="Humidity"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.humidity}%`
  )
}
            text="Moisture in the air right now."
            subtle
          />
          <Card
            badge="Pressure"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.pressure} mb`
  )
}
            
            text="Barometric pressure reading."
            subtle
          />
          <Card
            badge="Dew point"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.moisture}${unit}`
  )
}
            text="Perceived moisture point."
            subtle
          />
          <Card
            badge="UV index"
title={
  !weatherData ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    `${weather.uv}`
  )
}
            text="UV exposure guidance for the day."
            subtle
          />
        </div>


        <AirQualityPanel airQuality={airQuality} />

        <div>
          <WeatherChart/>
        </div>

        {insights.length > 0 && (
          <section className="section-block compact">
            <div className="section-heading align-start">
              <p className="section-kicker">Daily guidance</p>
              <h2>What to keep in mind today</h2>
              <p>
                Short, practical advice based on the live weather conditions in{" "}
                {cityName}.
              </p>
            </div>

            <FeaturesGrid>
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  icon={<span aria-hidden="true">{insight.emoji}</span>}
                  badge={insight.accent}
                  title={insight.title}
                  text={insight.description}
                />
              ))}
            </FeaturesGrid>
          </section>
        )}

        <section className="section-block compact" id="map">
          <WeatherMap
            weatherData={weatherData}
            isCelsius={isCelsius}
            apiKey={import.meta.env.VITE_WEATHER_API_KEY}
            theme={theme}
            onSelectLocation={(newCity) => {
              setCity(newCity);
              setCityInfo(newCity);
              window.location.hash = "#top";
            }}
          />
        </section>

        {forecastData && forecastData.length > 0 && (
          <section
            className="section-block compact weather-metrics-grid"
            id="forecast"
          >
            <div className="section-heading align-start">
              <p className="section-kicker">Forecast</p>
              <h2>3-day outlook</h2>
              <p>
                A quick read on the next few days so the app feels like a
                complete weather product, not just a lookup tool.
              </p>
            </div>

            <div className="forecast-grid">
              {forecastData.map((day) => {
                const maxTemp = isCelsius
                  ? day.day.maxtemp_c
                  : day.day.maxtemp_f;
                const minTemp = isCelsius
                  ? day.day.mintemp_c
                  : day.day.mintemp_f;

                return (
                  <article key={day.date} className="forecast-card">
                    <p>
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <img
                      src={day.day.condition.icon}
                      alt={day.day.condition.text}
                    />
                    <strong>
                      {maxTemp}
                      {unit}
                    </strong>
                    <span>
                      {minTemp}
                      {unit}
                    </span>
                    <small>{day.day.condition.text}</small>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  };

  const heroWeather = weatherData
    ? weather
    : {
        temperature: "--",
        condition: "Searching for live data",
        icon: null,
        feelsLike: "--",
        humidity: "--",
        windSpeed: "--",
      };

  return (
    <div className="app-shell">
      <BackToTop />
      <div className="page-shell">
        <header className="topbar">
          <a 
            className="brand" 
            href="#top" 
            aria-label="BreezeNow home"
            onClick={() => setActiveTab("weather")}
          >
            <img src={Logo} alt="BreezeNow" className="brand-mark" />
            <span>
              BreezeNow
              <small>Weather, reimagined</small>
            </span>
          </a>

          <div className="topbar-actions">
            <button
              className={`ghost-link ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              ☆ Favorites
            </button>
            <a 
              className="ghost-link" 
              href="#weather"
              onClick={() => setActiveTab("weather")}
            >
              Weather
            </a>
            <a 
              className="ghost-link" 
              href="#map"
              onClick={() => setActiveTab("weather")}
            >
              Weather Map
            </a>
            <a 
              className="ghost-link" 
              href="#forecast"
              onClick={() => setActiveTab("weather")}
            >
              Forecast
            </a>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <Hero
          kicker="Real-time weather"
          headline={[
            "A calmer way to check the ",
            <span key="accent" className="accent-text">
              weather
            </span>,
            " every day.",
          ]}
          description="BreezeNow keeps the interface focused, fast, and easy to scan. Start with Patna, switch units instantly, and get the important details without noise."
          actions={
            <>
              <a className="primary-button" href="#weather">
                Explore live weather
              </a>
              <a className="secondary-button" href="#forecast">
                See the forecast
              </a>
            </>
          }
        >
          <div className="hero-art landing-hero-art">
            <div className="hero-art-glow" />
            <div className={`hero-device landing-device ${backgroundClass}`}>
              <div className="hero-device-top">
                <div className="weather-device-brand">
                  <img src={Logo} alt="BreezeNow" />
                  <div>
                    <span>Live weather</span>
                    <strong>
                      {weatherData ? weatherData.location.name : "Patna"}
                    </strong>
                  </div>
                </div>
                <div className="hero-chip">
                  {isCelsius ? "Celsius" : "Fahrenheit"}
                </div>
              </div>

              <div className="hero-device-panel weather-current">
                <div>
                  <p>Condition</p>
                  <strong>{heroWeather.condition}</strong>
                </div>
                <div className="hero-chip">
                  {weatherData ? weatherData.location.country : "India"}
                </div>
              </div>

             <div className="landing-stat-row">
  <article>
    <strong>
      {!weatherData ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          {heroWeather.temperature}
          {isCelsius ? "°C" : "°F"}
        </>
      )}
    </strong>
    <span>
      {!weatherData ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <>
          Feels like {heroWeather.feelsLike}
          {isCelsius ? "°C" : "°F"}
        </>
      )}
    </span>
  </article>

  <article>
    <strong>
      {!weatherData ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        `${heroWeather.humidity}%`
      )}
    </strong>
    <span>Humidity and visibility snapshot</span>
  </article>

  <article>
    <strong>
      {!weatherData ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        `${heroWeather.windSpeed} KPH`
      )}
    </strong>
    <span>Wind speed right now</span>
  </article>

  <article>
    <strong>
      {!weatherData ? (
        <Skeleton className="h-8 w-10" />
      ) : (
        weatherData.forecast?.forecastday?.length || 0
      )}
    </strong>
    <span>Forecast days ready</span>
  </article>
</div>

              <div className="hero-device-footer" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </Hero>

        <section className="section-block">
          <div className="section-heading">
            <p className="section-kicker">Why it feels premium</p>
            <h2>Focused weather cards instead of a cluttered dashboard.</h2>
            <p>
              BreezeNow keeps the page visually light while still surfacing the
              details people actually check.
            </p>
          </div>

          <FeaturesGrid>
            <Card
              badge="Fast"
              title="Instant city lookup"
              text="Search any city or pick a recent one without losing the page context."
            />
            <Card
              badge="Clear"
              title="Readable temperature units"
              text="Celsius is the default, with one tap to switch units when needed."
            />
            <Card
              badge="Useful"
              title="Advisories that matter"
              text="Short weather guidance appears only when the conditions justify it."
            />
            <Card
              badge="Live"
              title="Forecasts with intent"
              text="A clean three-day outlook gives the page a complete, product-like feel."
            />
          </FeaturesGrid>
        </section>

        <section className="section-block compact" id="weather">
          <div className="section-heading align-start">
            <p className="section-kicker">Search</p>
            <h2>Check a location in one line.</h2>
            <p>
              Search is still available, but the presentation is calmer and
              closer to a polished landing page than a raw utility screen.
            </p>
          </div>

          <div className="weather-search">
            <label className="sr-only" htmlFor="weather-city">
              City name
            </label>
            <div className="weather-search-wrapper">
              <input
                id="weather-city"
                type="text"
                placeholder="Enter city name"
                value={cityInfo}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="weather-search-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id || suggestion.url}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="suggestion-name">
                        {suggestion.name}
                      </span>
                      <span className="suggestion-region">
                        {suggestion.region ? `${suggestion.region}, ` : ""}
                        {suggestion.country}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSearch} className="primary-button">
              Search
            </button>
            <button
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              className="secondary-button"
              title="Use Current Location"
            >
              {loadingLocation ? "Detecting..." : "Use Current Location"}
            </button>
          </div>

          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <span>Recent</span>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCity(search);
                    setCityInfo(search);
                  }}
                  className="recent-chip"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </section>
        {activeTab === "favorites" && (
          <div className="favorites-modal-overlay">
            <div className="favorites-modal">
              <div className="favorites-header">
                <div>
                  <p className="section-kicker">Starred cities</p>
                  <h2>Your saved locations</h2>
                </div>

                {favoriteCities.length > 0 && (
                  <span className="favorites-helper">Tap a card to load</span>
                )}
                <button
                  className="favorites-close"
                  onClick={() => setActiveTab("weather")}
                >
                  ✕
                </button>
              </div>

              {favoriteCities.length === 0 ? (
                <div className="favorites-empty">
                  <div className="favorites-empty-icon">☆</div>

                  <h3>No starred cities yet</h3>

                  <p>
                    Search for a city and tap "Save city" to add it here for
                    quick access.
                  </p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favoriteCities.map((cityCard) => (
                    <div
                      key={cityCard.name}
                      className={`favorite-card ${
                        cityCard.name === weatherData?.location?.name
                          ? "active"
                          : ""
                      }`}
                      onClick={() => loadFavoriteCity(cityCard.name)}
                    >
                      <button
                        className="favorite-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCity(cityCard.name);
                        }}
                      >
                        × Remove
                      </button>

                      <div className="favorite-card-top">
                        <h3>{cityCard.name}</h3>

                        <p>
                          {cityCard.region}, {cityCard.country}
                        </p>
                      </div>

                      <div className="favorite-weather">
                        <span>{cityCard.condition}</span>

                        <strong>
                          {cityCard.temp}
                          {isCelsius ? "°C" : "°F"}
                        </strong>
                      </div>

                      {cityCard.name === weatherData?.location?.name && (
                        <div className="favorite-active">Active</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {error ? (
          <div className="weather-alert">{error}</div>
        ) : (
          <WeatherDetail />
        )}
      </div>

      <Footer />
    </div>
  );
}
export default App;
