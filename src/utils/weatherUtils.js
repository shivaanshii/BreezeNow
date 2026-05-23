/**
 * Weather utility functions for unit conversions and formatting
 */

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {boolean} toCelsius - If true, converts F to C; if false, converts C to F
 * @returns {number} Converted temperature
 */
export const convertTemperature = (temp, toCelsius = true) => {
  if (!Number.isFinite(temp)) return temp;
  
  if (toCelsius) {
    // Fahrenheit to Celsius: (F - 32) × 5/9
    return Math.round(((temp - 32) * 5) / 9 * 10) / 10;
  } else {
    // Celsius to Fahrenheit: (C × 9/5) + 32
    return Math.round((temp * 9) / 5 + 32 * 10) / 10;
  }
};

/**
 * Convert wind speed between KPH and MPH
 * @param {number} speed - Wind speed in KPH
 * @param {boolean} toMph - If true, converts to MPH; if false, stays in KPH
 * @returns {number} Converted wind speed
 */
export const convertWindSpeed = (speed, toMph = false) => {
  if (!Number.isFinite(speed)) return speed;
  
  if (toMph) {
    // KPH to MPH: divide by 1.60934
    return Math.round(speed / 1.60934 * 10) / 10;
  }
  return speed;
};

/**
 * Convert pressure between Millibars and Inches of Mercury
 * @param {number} pressure - Pressure in MB
 * @param {boolean} toInHg - If true, converts to inHg; if false, stays in MB
 * @returns {number} Converted pressure
 */
export const convertPressure = (pressure, toInHg = false) => {
  if (!Number.isFinite(pressure)) return pressure;
  
  if (toInHg) {
    // MB to inHg: divide by 33.8639
    return Math.round(pressure / 33.8639 * 100) / 100;
  }
  return pressure;
};

/**
 * Format temperature display with unit
 * @param {number} temp - Temperature value
 * @param {boolean} isCelsius - If true, uses Celsius; if false, uses Fahrenheit
 * @returns {string} Formatted temperature string (e.g., "25°C")
 */
export const formatTemperature = (temp, isCelsius = true) => {
  if (!Number.isFinite(temp)) return "--";
  const unit = isCelsius ? "°C" : "°F";
  return `${Math.round(temp * 10) / 10}${unit}`;
};

/**
 * Format wind speed display with unit
 * @param {number} speed - Wind speed value in KPH
 * @param {boolean} isCelsius - If true, uses KPH; if false, uses MPH
 * @returns {string} Formatted wind speed string (e.g., "15 KPH")
 */
export const formatWindSpeed = (speed, isCelsius = true) => {
  if (!Number.isFinite(speed)) return "--";
  const unit = isCelsius ? "KPH" : "MPH";
  const displaySpeed = isCelsius ? speed : convertWindSpeed(speed, true);
  return `${Math.round(displaySpeed * 10) / 10} ${unit}`;
};

/**
 * Format pressure display with unit
 * @param {number} pressure - Pressure value in MB
 * @param {boolean} isCelsius - If true, uses MB; if false, uses inHg
 * @returns {string} Formatted pressure string (e.g., "1013 mb")
 */
export const formatPressure = (pressure, isCelsius = true) => {
  if (!Number.isFinite(pressure)) return "--";
  
  if (isCelsius) {
    return `${Math.round(pressure)} mb`;
  } else {
    const inHg = convertPressure(pressure, true);
    return `${Math.round(inHg * 100) / 100} inHg`;
  }
};

/**
 * Validate weather data structure
 * @param {object} data - Weather data to validate
 * @returns {boolean} True if data is valid
 */
export const validateWeatherData = (data) => {
  if (!data || typeof data !== "object") return false;
  
  const { current, location, forecast } = data;
  
  return (
    current &&
    typeof current === "object" &&
    location &&
    typeof location === "object" &&
    Array.isArray(forecast?.forecastday)
  );
};

/**
 * Get weather unit suffix
 * @param {string} metricType - Type of metric (temperature, speed, pressure)
 * @param {boolean} isCelsius - Unit preference
 * @returns {string} Unit suffix
 */
export const getUnitSuffix = (metricType, isCelsius = true) => {
  const unitMap = {
    temperature: isCelsius ? "°C" : "°F",
    speed: isCelsius ? "KPH" : "MPH",
    pressure: isCelsius ? "mb" : "inHg",
    distance: "km",
    percentage: "%",
  };
  
  return unitMap[metricType] || "";
};
