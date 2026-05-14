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
    // Upgraded endpoint to forecast.json
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
        
        // Save to recent searches if it's a named city (not coordinates)
        const locationName = data.location.name;
        if (!city.includes(',')) {
          setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== locationName.toLowerCase());
            return [locationName, ...filtered].slice(0, 5);
          });
        }
        
        // Determine dynamic background
        const isDay = data.current.is_day; // 1 = yes, 0 = no
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

  const handleChange = (e) => {
    setCityInfo(e.target.value);
    setShowSuggestions(true);
  }

  const handleSearch = () => {
    if(cityInfo.trim() !== "") {
        setCity(cityInfo);
        setCityInfo("");
        setShowSuggestions(false);
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.url);
    setCityInfo("");
    setShowSuggestions(false);
  }

  const toggleUnit = () => setIsCelsius(!isCelsius);

  const ErrorBox = () => {
    return (
      <div className="errorbox my-10 p-4 bg-red-100 rounded-lg">
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

    return (
      <div className="datas flex flex-col items-center justify-center gap-10 w-full max-w-4xl px-4">
        <div className="imp-datas flex flex-col md:flex-row gap-10 w-full justify-around items-center">
          <div className="location-detail flex flex-col items-center gap-2 justify-center text-center">
            <h1 className='text-4xl font-bold text-white drop-shadow-md'>{location.name}</h1>
            {location.region && <p className='text-white text-lg'>{location.region}, {location.country}</p>}
            <p className='text-sm text-gray-200 mt-2'>Lat: {location.lat} | Lon: {location.lon}</p>
          </div>
          
          <div className="condition flex flex-col items-center gap-2 justify-center">
            {current.condition.icon && <img className='w-24 h-24 drop-shadow-lg' src={current.condition.icon} alt="weather icon" />}
            {current.condition.text && <p className='text-2xl font-semibold text-white drop-shadow-md'>{current.condition.text}</p>}
          </div>

          <div className="temp flex flex-col items-center gap-2 justify-center">
            <h1 className='text-6xl font-bold text-white drop-shadow-lg'>{temp}{unit}</h1>
            <p className='text-xl font-medium text-white drop-shadow-md'>Feels Like: {feelsLike}{unit}</p>
          </div>
        </div>

        <div className="less-imp-datas w-full mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">Humidity</span>
              <span className="text-2xl font-bold text-white">{current.humidity}%</span>
            </div>
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">Wind Speed</span>
              <span className="text-2xl font-bold text-white">{current.wind_kph} KPH</span>
            </div>
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">Pressure</span>
              <span className="text-2xl font-bold text-white">{current.pressure_in} in</span>
            </div>
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">Cloud Cover</span>
              <span className="text-2xl font-bold text-white">{current.cloud}%</span>
            </div>
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">UV Index</span>
              <span className="text-2xl font-bold text-white">{current.uv}</span>
            </div>
            <div className="p-4 rounded-xl bg-white/20 shadow-lg flex flex-col items-center">
              <span className="text-gray-200 text-sm">Air Quality (US EPA)</span>
              <span className="text-2xl font-bold text-white">{current.air_quality?.["us-epa-index"] || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Forecast Section */}
        {forecastData && forecastData.length > 0 && (
          <div className="w-full mt-6 mb-20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-md">3-Day Forecast</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              {forecastData.map((day) => {
                const maxTemp = isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f;
                const minTemp = isCelsius ? day.day.mintemp_c : day.day.mintemp_f;
                return (
                  <div key={day.date} className="p-6 rounded-xl bg-white/20 shadow-lg flex flex-col items-center flex-1">
                    <span className="text-white font-semibold text-lg">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</span>
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

            {/* Suggestions Dropdown */}
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
