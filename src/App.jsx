import { useEffect, useState } from 'react'
import './App.css'
import Logo from './assets/Logo.png'

function App() {
  const [city, setCity] = useState("");
  const [cityInfo, setCityInfo] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  // New States
  const [isCelsius, setIsCelsius] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [backgroundClass, setBackgroundClass] = useState("bg-gradient-to-br from-blue-900 to-blue-600");
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    // Geolocation on initial load
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCity(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (err) => {
          console.log("Geolocation error", err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cityInfo.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityInfo}`);
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

        setWeatherData(data);
        setForecastData(data.forecast?.forecastday || []);

        const locationName = data.location.name;
        if (!city.includes(',')) {
          setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== locationName.toLowerCase());
            return [locationName, ...filtered].slice(0, 5);
          });
        }

        const isDay = data.current.is_day;
        const conditionText = data.current.condition.text.toLowerCase();

        if (isDay === 0) {
          setBackgroundClass("bg-gradient-to-br from-indigo-900 to-black");
        } else if (conditionText.includes("sunny") || conditionText.includes("clear")) {
          setBackgroundClass("bg-gradient-to-br from-yellow-400 to-orange-500");
        } else if (conditionText.includes("rain") || conditionText.includes("drizzle")) {
          setBackgroundClass("bg-gradient-to-br from-gray-700 to-blue-900");
        } else if (conditionText.includes("cloud") || conditionText.includes("overcast")) {
          setBackgroundClass("bg-gradient-to-br from-gray-400 to-gray-600");
        } else if (conditionText.includes("snow") || conditionText.includes("ice")) {
          setBackgroundClass("bg-gradient-to-br from-blue-100 to-blue-300");
        } else {
          setBackgroundClass("bg-gradient-to-br from-blue-900 to-blue-600");
        }

      } catch (err) {
        console.error(err);
        setError("Error fetching data");

      }
    }

    if (city) {
      fetchData();
    }

  }, [city])

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
      }
    );
  };

  const handleChange = (e) => {
    setCityInfo(e.target.value);
  }
  const getWeatherInsights = () => {
  const insights = [];

  if (weather.temperature >= 35) {
    insights.push({
      title: "Stay hydrated in high temperatures",
      description:
        `Temperatures above ${weather.temperature}°C — drink water regularly and avoid prolonged sun exposure.`,
      emoji: "🌡️",
      accent: "yellow",
    });
  }

  if (weather.uv >= 6) {
    insights.push({
      title: "High UV exposure today",
      description:
        `UV index is currently ${weather.uv}. Use sunscreen and avoid excessive sun exposure.`,
      emoji: "🧴",
      accent: "yellow",
    });
  }

  if (weather.windSpeed >= 25) {
    insights.push({
      title: "Strong winds expected outside",
      description:
        `Wind speeds at ${weather.windSpeed} KPH — be cautious while traveling outdoors.`,
      emoji: "💨",
      accent: "blue",
    });
  }

  if (weather.humidity >= 80) {
    insights.push({
      title: "High humidity levels today",
      description:
        `Humidity is currently ${weather.humidity}% which may make the weather feel warmer.`,
      emoji: "💧",
      accent: "cyan",
    });
  }

  if (
    weather.condition?.toLowerCase().includes("rain")
  ) {
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

  if (
    weather.condition?.toLowerCase().includes("thunder")
  ) {
    insights.push({
      title: "Thunderstorm conditions detected",
      description:
        "Take precautions and avoid open areas during thunderstorms.",
      emoji: "⛈️",
      accent: "purple",
    });
  }

  if (
    weather.condition?.toLowerCase().includes("snow")
  ) {
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

  const ErrorBox = () => {
    return (
      <div className="errorbox my-10 p-4 bg-red-100 rounded-lg text-center">
        <h1 className='text-2xl font-bold text-red-600'>{error}</h1>
      </div>
    );
  }

  const WeatherDetail = () => {
    if (!weatherData) return null;
    const { current, location } = weatherData;
    const temp = isCelsius ? current.temp_c : current.temp_f;
    const feelsLike = isCelsius ? current.feelslike_c : current.feelslike_f;
    const unit = isCelsius ? "℃" : "℉";
    const insights = getWeatherInsights();

    return (
      <div className="datas flex flex-col items-center justify-center gap-10">
        <div className="imp-datas flex flex-col md:flex-row gap-10">
          <div className="location-detail flex flex-col items-center gap-5 justify-center">
            <h1 className='text-4xl font-bold text-white'>{cityName}</h1>
            {region && <p className='text-white flex items-center gap-1'><span className='font-bold'>Region : </span> <span className='details region-detail'>{region}</span></p>}
            <div className="latt-long flex items-center gap-5">
              <p className='text-white'><span className='font-bold'>Latitude : </span> <span className='details'>{weather.latitude}</span></p>
              <p className='text-white'><span className='font-bold'>Longitude : </span><span className='details'>{weather.longitude}</span></p>
            </div>
          </div>
          <div className="condition flex flex-col items-center gap-4 mt-6 justify-center">
            {weather.icon && <img className='icon' src={weather.icon} alt="weather icon" width={100} />}
            {weather.condition && <p className='text-2xl font-semibold text-white'>{weather.condition}</p>}
          </div>
          <div className="temp flex flex-col items-center gap-4 justify-center">
            {weather.temperature !== null && <h1 className='text-6xl font-bold text-white'>{weather.temperature}&#8451;</h1>}
            {weather.feelsLike !== null && <p className='text-xl font-semibold text-white'>Feels Like : {weather.feelsLike}&#8451;</p>}
          </div>
        </div>
        <div className="less-imp-datas mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-10">
            {weather.moisture !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Dew Point : {weather.moisture}&#8451;
              </p>
            </div>}
            {weather.windSpeed !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Wind Speed : {weather.windSpeed} KPH
              </p>
            </div>}
            {weather.pressure !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Pressure : {weather.pressure} in
              </p>
            </div>}
            {weather.humidity !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Humidity : {weather.humidity} %
              </p>
            </div>}
            {weather.cloud !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Cloud : {weather.cloud} %
              </p>
            </div>}
            {weather.uv !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                UV Index : {weather.uv}
              </p>
            </div>}
          </div>

          {insights.length > 0 && (
            <div className="advisory-section">
              <div className="advisory-topline">
                <div className="line"></div>
                <p>WEATHER INSIGHTS</p>
                <div className="line"></div>
              </div>

              <div className="advisory-header text-center flex-col md:flex-row">
                <h2>🌤 Today's Advisory</h2>
                <p>Based on current weather conditions</p>
              </div>

              <div className="advisory-grid">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`advisory-card ${insight.accent}`}
                  >
                    <div className="advisory-icon text-white">
                      {insight.emoji}
                    </div>
                    <div className="advisory-content">
                      <h3>{insight.title}</h3>
                      <p>{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {forecastData && forecastData.length > 0 && (
          <div className="w-full mt-6 mb-20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-md">3-Day Forecast</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              {forecastData.map((day) => {
                const maxTemp = isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f;
                const minTemp = isCelsius ? day.day.mintemp_c : day.day.mintemp_f;
                return (
                  <div key={day.date} className="p-6 rounded-xl bg-white/20 shadow-lg flex flex-col items-center flex-1">
                    <span className="text-white font-semibold text-lg">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <img src={day.day.condition.icon} alt={day.day.condition.text} className="w-16 h-16 my-2 drop-shadow-md" />
                    <div className="flex gap-3 items-center">
                      <span className="text-xl font-bold text-white" title="High">{maxTemp}°</span>
                      <span className="text-lg font-medium text-gray-300" title="Low">{minTemp}°</span>
                    </div>
                    <span className="text-gray-200 text-sm text-center mt-1">{day.day.condition.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${backgroundClass}`}>
      <nav className='flex items-center justify-between p-4 shadow-md bg-black/20'>
        <img src={Logo} alt="Logo" width={150} />
        <button onClick={toggleUnit} className="bg-white/30 hover:bg-white/40 text-white px-4 py-2 rounded-lg font-semibold transition">
          Switch to {isCelsius ? "°F" : "°C"}
        </button>
      </nav>

      <main className='flex flex-col items-center justify-start pt-10 min-h-[calc(100vh-80px)]'>
        <div className="input-container flex flex-col items-center gap-4 w-full max-w-md px-4 mb-8">
          <div className="flex gap-2 w-full relative">
            <input
              type="text"
              placeholder='Enter City Name'
              value={cityInfo}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className='flex-1 border-2 border-white/40 bg-black/20 focus:bg-black/40 focus:border-white p-3 rounded-xl text-white outline-none placeholder-gray-300 transition'
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <button
              onClick={handleSearch}
              className='p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition'
            >
              Search
            </button>
            <button
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              className='px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg transition disabled:opacity-50 whitespace-nowrap'
              title="Use Current Location"
            >
              {loadingLocation ? "Detecting..." : "Use Current Location"}
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-50 text-left border border-white/20">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id || suggestion.url}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-200 last:border-b-0 transition"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="font-semibold text-blue-900">{suggestion.name}</span>
                    <span className="text-sm text-gray-600 ml-2">{suggestion.region ? `${suggestion.region}, ` : ''}{suggestion.country}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="text-white/80 text-sm py-1">Recent:</span>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => setCity(search)}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>

        {error ? <ErrorBox /> : <WeatherDetail />}
      </main>
    </div>
  )
}

export default App;
