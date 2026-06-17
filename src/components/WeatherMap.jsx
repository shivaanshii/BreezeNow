import { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./WeatherMap.css";

export default function WeatherMap({ weatherData, isCelsius, apiKey, theme, onSelectLocation }) {
  const [mapLocations, setMapLocations] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [viewMode, setViewMode] = useState("temperature"); // temperature, wind, rain, clouds

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayerGroup = useRef(null);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Default to center on Patna coords if no weatherData is loaded yet
      const initialLat = weatherData?.location?.lat || 25.5941;
      const initialLon = weatherData?.location?.lon || 85.1376;

      mapInstance.current = L.map(mapRef.current, {
        center: [initialLat, initialLon],
        zoom: 9,
        zoomControl: false,
        attributionControl: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60
      });

      // Position standard Zoom control nicely on the bottom right
      L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);

      // Create Layer Group for weather markers
      markersLayerGroup.current = L.layerGroup().addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Map Tile Layer based on theme (Light vs Dark Maps)
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing tile layers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Sleek premium cartography tiles
    const tileUrl = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
      subdomains: "abcd",
      detectRetina: true
    }).addTo(mapInstance.current);
  }, [theme]);

  // Dynamic Offset Regional Fetching
  const fetchMapWeatherData = useCallback(async (lat, lon) => {
    const points = [
      { type: "central", lat, lon },
      { type: "north", lat: lat + 0.32, lon },
      { type: "south", lat: lat - 0.32, lon },
      { type: "east", lat, lon: lon + 0.42 },
      { type: "west", lat, lon: lon - 0.42 }
    ];

    try {
      const fetchPromises = points.map(async (pt) => {
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${pt.lat},${pt.lon}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error fetching offset coordinate");
        const data = await res.json();
        
        return {
          ...pt,
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          temp_c: data.current.temp_c,
          temp_f: data.current.temp_f,
          condition: data.current.condition.text,
          icon: data.current.condition.icon.startsWith("//") 
            ? `https:${data.current.condition.icon}` 
            : data.current.condition.icon,
          wind_kph: data.current.wind_kph,
          wind_degree: data.current.wind_degree,
          humidity: data.current.humidity,
          cloud: data.current.cloud,
          precip_mm: data.current.precip_mm,
          feelslike_c: data.current.feelslike_c,
          feelslike_f: data.current.feelslike_f,
          pressure_mb: data.current.pressure_mb
        };
      });

      const results = await Promise.all(fetchPromises);
      setMapLocations(results);
      setMapError(null);
    } catch (err) {
      console.error("Error fetching regional map weather details:", err);
      setMapError("Failed to fetch surrounding regional weather. Please verify your API connection.");
    } finally {
      setMapLoading(false);
    }
  }, [apiKey]);

  // Trigger data fetch when central coordinates change
  useEffect(() => {
    if (weatherData && weatherData.location) {
      const { lat, lon } = weatherData.location;
      setMapLoading(true);
      fetchMapWeatherData(lat, lon);

      if (mapInstance.current) {
        mapInstance.current.setView([lat, lon], 9);
      }
    }
  }, [weatherData, fetchMapWeatherData]);

  // Create popup HTML
  const createPopupHtml = (loc, isCelsius) => {
    const temp = isCelsius ? loc.temp_c : loc.temp_f;
    const feelsLike = isCelsius ? loc.feelslike_c : loc.feelslike_f;
    const unit = isCelsius ? "°C" : "°F";
    const windUnit = isCelsius ? "KPH" : "MPH";
    const windSpeed = isCelsius 
      ? loc.wind_kph 
      : Math.round((loc.wind_kph / 1.60934) * 10) / 10;

    return `
      <div class="popup-weather-content">
        <div class="popup-header">
          <h4 class="popup-title">${loc.name}</h4>
          <p class="popup-subtitle">${loc.region ? loc.region + ", " : ""}${loc.country}</p>
        </div>
        <div class="popup-main">
          <div class="popup-main-left">
            <img class="popup-icon" src="${loc.icon}" alt="${loc.condition}" />
            <div class="popup-condition">
              <strong>${loc.condition}</strong>
              <span>Rain: ${loc.precip_mm} mm</span>
            </div>
          </div>
          <div class="popup-temp">${Math.round(temp)}${unit}</div>
        </div>
        <div class="popup-stats-grid">
          <div class="popup-stat-item">
            <span class="popup-stat-label">Wind</span>
            <span class="popup-stat-val">${Math.round(windSpeed)} ${windUnit} <span style="display:inline-block; transform: rotate(${loc.wind_degree}deg);">➔</span></span>
          </div>
          <div class="popup-stat-item">
            <span class="popup-stat-label">Humidity</span>
            <span class="popup-stat-val">${loc.humidity}%</span>
          </div>
          <div class="popup-stat-item">
            <span class="popup-stat-label">Feels Like</span>
            <span class="popup-stat-val">${Math.round(feelsLike)}${unit}</span>
          </div>
          <div class="popup-stat-item">
            <span class="popup-stat-label">Clouds</span>
            <span class="popup-stat-val">${loc.cloud}%</span>
          </div>
        </div>
      </div>
    `;
  };

  // Custom marker visual generator
  const createCustomIcon = (loc, viewMode, isCelsius) => {
    let innerHtml = "";
    let markerClass = "";

    if (viewMode === "temperature") {
      const temp = isCelsius ? loc.temp_c : loc.temp_f;
      // Normalize to Celsius for styling classes
      const tempC = isCelsius ? temp : ((temp - 32) * 5) / 9;

      if (tempC < 12) {
        markerClass = "marker-temp-cold";
      } else if (tempC >= 12 && tempC < 25) {
        markerClass = "marker-temp-mild";
      } else if (tempC >= 25 && tempC < 34) {
        markerClass = "marker-temp-warm";
      } else {
        markerClass = "marker-temp-hot";
      }

      innerHtml = `
        <div class="weather-pulse-dot ${markerClass}">${Math.round(temp)}°</div>
        <div class="weather-pulse-ring"></div>
      `;
    } else if (viewMode === "wind") {
      const windSpeed = isCelsius 
        ? loc.wind_kph 
        : Math.round((loc.wind_kph / 1.60934) * 10) / 10;
      const windUnit = isCelsius ? "KPH" : "MPH";

      innerHtml = `
        <div class="wind-arrow-marker" style="transform: rotate(${loc.wind_degree}deg);">
          <span class="wind-arrow-inner">➔</span>
        </div>
        <div class="wind-speed-label">${Math.round(windSpeed)} ${windUnit}</div>
      `;
    } else if (viewMode === "rain") {
      markerClass = "humidity-bubble";
      innerHtml = `
        <div class="weather-pulse-dot ${markerClass}">${loc.humidity}%</div>
        <div class="weather-pulse-ring"></div>
        <div class="wind-speed-label" style="bottom: -18px;">${loc.precip_mm} mm</div>
      `;
    } else if (viewMode === "clouds") {
      markerClass = "cloud-bubble";
      innerHtml = `
        <div class="weather-pulse-dot ${markerClass}">${loc.cloud}%</div>
        <div class="weather-pulse-ring"></div>
      `;
    }

    // Embed spinning dashed compass on Central City
    if (loc.type === "central") {
      innerHtml += `<div class="central-city-ring"></div>`;
    }

    return L.divIcon({
      html: `<div class="marker-content-wrapper">${innerHtml}</div>`,
      className: "weather-div-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -22]
    });
  };

  // Re-draw Markers on Layer Mode or Data Changes
  useEffect(() => {
    if (!mapInstance.current || !markersLayerGroup.current || mapLocations.length === 0) return;

    markersLayerGroup.current.clearLayers();

    mapLocations.forEach((loc) => {
      const icon = createCustomIcon(loc, viewMode, isCelsius);
      const marker = L.marker([loc.lat, loc.lon], { icon }).addTo(markersLayerGroup.current);

      const popupHtml = createPopupHtml(loc, isCelsius);
      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: "weather-map-popup"
      });

      // Bind Action Button inside Leaflet Popup
      marker.on("popupopen", () => {
        const btnId = `cta-btn-${loc.lat.toFixed(4).replace(".", "-")}-${loc.lon.toFixed(4).replace(".", "-")}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.onclick = () => {
            onSelectLocation(loc.name);
          };
        }
      });
    });

    // Auto-fit to bounds to encompass surrounding offsets nicely
    try {
      const group = L.featureGroup(mapLocations.map((l) => L.marker([l.lat, l.lon])));
      mapInstance.current.fitBounds(group.getBounds().pad(0.18));
    } catch (e) {
      console.warn("Bounds mapping warning:", e);
    }
  }, [mapLocations, viewMode, isCelsius, onSelectLocation]);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Lookup weather of position coordinates to fetch human-readable city name
        fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.location && data.location.name) {
              onSelectLocation(data.location.name);
            } else {
              onSelectLocation(`${latitude},${longitude}`);
            }
          })
          .catch((err) => {
            console.error("Locate lookup error:", err);
            onSelectLocation(`${latitude},${longitude}`);
          });
      },
      (err) => {
        setMapLoading(false);
        console.error("Geolocation error:", err);
        alert(`Could not retrieve location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="weather-map-container">
      <div className="weather-map-header">
        <div className="weather-map-title-block">
          <h2>Interactive Weather Map</h2>
          <p>
            Explore real-time weather metrics across{" "}
            <strong>{weatherData?.location?.name || "the region"}</strong> using visual radar layers.
          </p>
        </div>
      </div>

      <div className="weather-map-wrapper">
        {/* Loading Spinner */}
        {mapLoading && (
          <div className="map-loading-overlay">
            <div className="map-spinner" />
            <p>Scanning Regional Radar...</p>
          </div>
        )}

        {/* Error Alert */}
        {mapError && !mapLoading && (
          <div className="map-loading-overlay">
            <div className="text-red-500 font-bold">⚠️ {mapError}</div>
            <button
              onClick={() => fetchMapWeatherData(weatherData.location.lat, weatherData.location.lon)}
              className="primary-button mt-4"
            >
              Retry Load
            </button>
          </div>
        )}

        {/* Map Frame Div */}
        <div ref={mapRef} className="weather-map-frame" />

        {/* Dynamic Glass Overlay Layer Selector */}
        <div className="map-controls-panel">
          <div className="map-controls-title">Map Layer</div>
          <div className="map-control-options">
            <button
              className={`map-control-btn ${viewMode === "temperature" ? "active" : ""}`}
              onClick={() => setViewMode("temperature")}
              title="Temperature Marker Layer"
            >
              <span className="icon">🌡️</span>
              <span className="label">Temperature</span>
            </button>
            <button
              className={`map-control-btn ${viewMode === "wind" ? "active" : ""}`}
              onClick={() => setViewMode("wind")}
              title="Wind Direction Vectors"
            >
              <span className="icon">💨</span>
              <span className="label">Wind Speed</span>
            </button>
            <button
              className={`map-control-btn ${viewMode === "rain" ? "active" : ""}`}
              onClick={() => setViewMode("rain")}
              title="Humidity & Precipitation Levels"
            >
              <span className="icon">💧</span>
              <span className="label">Rain & Humidity</span>
            </button>
            <button
              className={`map-control-btn ${viewMode === "clouds" ? "active" : ""}`}
              onClick={() => setViewMode("clouds")}
              title="Cloud Cover Percentages"
            >
              <span className="icon">☁️</span>
              <span className="label">Cloud Cover</span>
            </button>
          </div>
        </div>

        {/* Geolocation Button */}
        <button
          className="map-locate-btn"
          onClick={handleLocateMe}
          title="Center on My Live Location"
        >
          📍 Locate Me
        </button>
      </div>
    </div>
  );
}
