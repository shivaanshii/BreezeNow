import { useEffect, useState } from 'react'
import './App.css'
import Logo from './assets/Logo.png'

function App() {
  const [city, setCity] = useState("London");
  const [cityInfo, setCityInfo] = useState("");
  const [cityName, setCityName] = useState("London");
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
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setError("City not found");
          return;
        }
        setError(null);
        const data = await response.json();
        console.log(data);
        setCityName(data.location.name);
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
        setError("Error fetching data"+ error);
      }
    }
    fetchData();

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

  if (temperature >= 35) {
    insights.push({
      title: "Stay hydrated in high temperatures",
      description:
        `Temperatures above ${temperature}°C — drink water regularly and avoid prolonged sun exposure.`,
      emoji: "🌡️",
      accent: "yellow",
    });
  }

  if (uv >= 6) {
    insights.push({
      title: "High UV exposure today",
      description:
        `UV index is currently ${uv}. Use sunscreen and avoid excessive sun exposure.`,
      emoji: "🧴",
      accent: "yellow",
    });
  }

  if (windSpeed >= 25) {
    insights.push({
      title: "Strong winds expected outside",
      description:
        `Wind speeds at ${windSpeed} KPH — be cautious while traveling outdoors.`,
      emoji: "💨",
      accent: "blue",
    });
  }

  if (humidity >= 80) {
    insights.push({
      title: "High humidity levels today",
      description:
        `Humidity is currently ${humidity}% which may make the weather feel warmer.`,
      emoji: "💧",
      accent: "cyan",
    });
  }

  if (
    condition?.toLowerCase().includes("rain")
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
    condition?.toLowerCase().includes("sunny") ||
    condition?.toLowerCase().includes("clear")
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
    condition?.toLowerCase().includes("overcast") ||
    condition?.toLowerCase().includes("cloudy")
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
    condition?.toLowerCase().includes("mist") ||
    condition?.toLowerCase().includes("fog") ||
    condition?.toLowerCase().includes("haze")
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
    condition?.toLowerCase().includes("thunder")
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
    condition?.toLowerCase().includes("snow")
  ) {
    insights.push({
      title: "Snowfall expected today",
      description:
        "Cold and snowy conditions may affect travel and outdoor activities.",
      emoji: "❄️",
      accent: "blue",
    });
  }

  if (temperature <= 10) {
    insights.push({
      title: "Cold weather detected",
      description:
        "Wear warm clothing and avoid prolonged exposure to cold weather.",
      emoji: "🧥",
      accent: "cyan",
    });
  }

  return insights.slice(0, 3);
};
  const ErrorBox = () => {
    return (
      <div className="errorbox">
        <h1 className='text-2xl font-bold text-red-600'>{error}</h1>
      </div>
    );
  }

  const WeatherDetail = () => {
    const insights = getWeatherInsights();
    return (
      <div className="datas flex flex-col items-center justify-center gap-10">
        <div className="imp-datas flex flex-col md:flex-row gap-10">
          <div className="location-detail flex flex-col items-center gap-5 justify-center">
            <h1 className='text-4xl font-bold text-white'>{cityName}</h1>
            {region && <p className='text-white flex items-center gap-1'><span className='font-bold'>Region : </span> <span className='details region-detail'>{region}</span></p>}
            <div className="latt-long flex items-center gap-5">
              <p className='text-white'><span className='font-bold'>Latitude : </span> <span className='details'>{latitude}</span></p>
              <p className='text-white'><span className='font-bold'>Longitude : </span><span className='details'>{longitude}</span></p>
            </div>
          </div>
          <div className="condition flex flex-col items-center gap-4 mt-6 justify-center">
            {icon && <img className='icon' src={icon} alt="weather icon" width={100} />}
            {condition && <p className='text-2xl font-semibold text-white'>{condition}</p>}
          </div>
          <div className="temp flex flex-col items-center gap-4 justify-center">
            {temperature !== null && <h1 className='text-6xl font-bold text-white'>{temperature}&#8451;</h1>}
            {feelsLike !== null && <p className='text-xl font-semibold text-white'>Feels Like : {feelsLike}&#8451;</p>}
          </div>
        </div>
        <div className="less-imp-datas mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-10">
            {moisture !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Dew Point : {moisture}&#8451;
              </p>
            </div>}
            {windSpeed !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Wind Speed : {windSpeed} KPH
              </p>
            </div>}
            {pressure !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Pressure : {pressure} in
              </p>
            </div>}
            {humidity !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Humidity : {humidity} %
              </p>
            </div>}
            {cloud !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                Cloud : {cloud} %
              </p>
            </div>}
            {uv !== null && <div className="card">
              <p className='text-lg font-semibold text-white'>
                UV Index : {uv}
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

            <div className="advisory-header">
              <h2>🌤 Today's Advisory</h2>
              <p>Based on current weather conditions</p>
            </div>

            <div className="advisory-grid">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`advisory-card ${insight.accent}`}
                >
                  <div className="advisory-icon">
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
      </div>
    );
  }
  return (
    <>
      <nav className='flex items-center justify-center p-4 shadow-md'>
        <img src={Logo} alt="" width={150} />
      </nav>
      <main className='flex flex-col items-center justify-center gap-6 mt-10'>
        <div className="input-container flex flex-wrap justify-center gap-4">
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
          <button
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            className='border-2 p-3 rounded-2xl bg-green-600 text-white submit-btn disabled:opacity-50'
          >
            {loadingLocation ? "Detecting..." : "Use Current Location"}
          </button>
        </div>
        {error ? <ErrorBox /> : <WeatherDetail />}
      </main>
    </>
  )

}

export default App;
