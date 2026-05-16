import { useEffect, useState } from 'react'
import './App.css'
import Logo from './assets/Logo.png'

function App() {
  const [city, setCity] = useState("");
  const [cityInfo, setCityInfo] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [moisture, setMoisture] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [cloud, setCloud] = useState(null);
  const [condition, setCondition] = useState(null);
  const [icon, setIcon] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [uv, setUv] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;   
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setError("City not found");
        }
        setError(null);
        const data = await response.json();
        console.log(data);
        setTemperature(data.current.temp_c);
        setLatitude(data.location.lat);
        setLongitude(data.location.lon);
        setMoisture(data.current.dewpoint_c);
        setWindSpeed(data.current.wind_kph);
        setPressure(data.current.pressure_in);
        setHumidity(data.current.humidity);
        setCloud(data.current.cloud);
        setCondition(data.current.condition.text);
        setIcon(data.current.condition.icon);
        setFeelsLike(data.current.feelslike_c);
        setUv(data.current.uv);
        setRegion(data.location.region);
      } catch (error) {
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
    setShowSuggestions(true);
  }

  const ErrorBox = () => {
    return (
      <div className="errorbox my-10 p-4 bg-red-100 rounded-lg">
        <h1 className='text-2xl font-bold text-red-600'>{error}</h1>
      </div>
    );
  }

  const WeatherDetail = () => {
    return (
      <div className="datas flex flex-col items-center justify-center gap-10">
        <div className="imp-datas flex flex-col md:flex-row gap-10">
          <div className="location-detail flex flex-col items-center gap-5 justify-center">
            <h1 className='text-4xl font-bold text-white'>{city}</h1>
            {region && <p className='text-white flex items-center gap-1'><span className='font-bold'>Region : </span> <span className='details region-detail'>{region}</span></p>}
            <div className="latt-long flex items-center gap-5">
              <p className='text-white'><span className='font-bold'>Latitude : </span> <span className='details'>{latitude}</span></p>
              <p className='text-white'><span className='font-bold'>Longitude : </span><span className='details'>{longitude}</span></p>
            </div>
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
      <main className='flex flex-col items-center justify-center gap-6 mt-10'>
        <div className="input-container flex gap-4">
          <input type="text" placeholder='Enter City Name' value={cityInfo} onChange={handleChange} className='border-2 p-3 rounded-xl md:w-xl text-white' onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCity(cityInfo);
              setCityInfo("");
            }
          }} />
          <button onClick={() => {
            setCity(cityInfo)
            setCityInfo("");
          }} className='border-2 p-3 rounded-2xl bg-blue-700 text-white submit-btn'>Search</button>
        </div>
        
        {error ? <ErrorBox /> : <WeatherDetail />}
      </main>
    </div>
  )

}

export default App;
