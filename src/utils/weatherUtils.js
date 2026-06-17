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
    return Math.round((((temp - 32) * 5) / 9) * 10) / 10;
  } else {
    // Celsius to Fahrenheit: (C × 9/5) + 32
    const fahrenheit = (temp * 9) / 5 + 32;
    return Math.round(fahrenheit * 10) / 10;
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
    return Math.round((speed / 1.60934) * 10) / 10;
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
    return Math.round((pressure / 33.8639) * 100) / 100;
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

const AQI_LEVELS = [
  {
    max: 1,
    label: "Good",
    shortLabel: "Good",
    color: "#22c55e",
    tone: "good",
    warning:
      "Air quality is healthy for most people. Keep normal outdoor activity levels.",
  },
  {
    max: 2,
    label: "Moderate",
    shortLabel: "Moderate",
    color: "#eab308",
    tone: "moderate",
    warning:
      "Air quality is acceptable, though unusually sensitive people may want to reduce heavy outdoor exertion.",
  },
  {
    max: 3,
    label: "Unhealthy for sensitive groups",
    shortLabel: "Sensitive groups",
    color: "#f97316",
    tone: "warning",
    warning:
      "Sensitive groups should reduce prolonged or heavy outdoor activity and watch for symptoms.",
  },
  {
    max: 4,
    label: "Unhealthy",
    shortLabel: "Unhealthy",
    color: "#ef4444",
    tone: "unhealthy",
    warning:
      "Everyone should reduce outdoor exertion, especially people with heart or lung conditions.",
  },
  {
    max: 5,
    label: "Very Unhealthy",
    shortLabel: "Very unhealthy",
    color: "#a855f7",
    tone: "very-unhealthy",
    warning:
      "Avoid outdoor activity when possible and keep indoor air cleaner if you can.",
  },
  {
    max: 6,
    label: "Hazardous",
    shortLabel: "Hazardous",
    color: "#7f1d1d",
    tone: "hazardous",
    warning:
      "Air quality is hazardous. Stay indoors, limit exposure, and follow local health guidance.",
  },
];

export const getAqiIndex = (airQuality) => {
  if (!airQuality || typeof airQuality !== "object") return null;

  const epaIndex = airQuality["us-epa-index"];
  const defraIndex = airQuality["gb-defra-index"];

  if (Number.isFinite(epaIndex)) return Math.round(epaIndex);
  if (Number.isFinite(defraIndex))
    return Math.min(Math.max(Math.round(defraIndex / 2), 1), 6);

  return null;
};

export const getAqiLevel = (airQuality) => {
  const index = getAqiIndex(airQuality);

  if (!index) {
    return {
      index: null,
      label: "No AQI data",
      shortLabel: "Unavailable",
      color: "#64748b",
      tone: "neutral",
      warning: "AQI data is unavailable for this location right now.",
    };
  }

  const level = AQI_LEVELS[Math.min(index, AQI_LEVELS.length) - 1];

  return {
    index,
    ...level,
  };
};

export const getAqiHealthActions = (airQuality) => {
  const { tone } = getAqiLevel(airQuality);

  const actions = {
    good: [
      "You can keep normal outdoor routines.",
      "No special precautions are usually needed.",
    ],
    moderate: [
      "Sensitive people should watch for irritation during longer outings.",
      "Consider reducing intense outdoor exercise if you notice symptoms.",
    ],
    warning: [
      "Limit prolonged outdoor exertion if you are sensitive to pollution.",
      "Keep windows closed during heavier traffic or smoke exposure.",
    ],
    unhealthy: [
      "Reduce time outdoors and avoid vigorous activity outside.",
      "People with asthma or heart conditions should take extra precautions.",
    ],
    "very-unhealthy": [
      "Stay indoors when possible and use filtered air if available.",
      "Avoid outdoor exercise until conditions improve.",
    ],
    hazardous: [
      "Stay indoors and follow local emergency or health advisories.",
      "Use a properly fitted mask if you must go outside.",
    ],
    neutral: [
      "AQI guidance will appear when weather data includes pollution data.",
    ],
  };

  return actions[tone] || actions.neutral;
};

export const formatAirQualityMetric = (value) => {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value * 10) / 10;
};

export const getAqiPollutantDetails = (airQuality) => {
  if (!airQuality || typeof airQuality !== "object") return [];

  return [
    {
      label: "PM2.5",
      value: formatAirQualityMetric(airQuality.pm2_5),
      unit: "µg/m³",
    },
    {
      label: "PM10",
      value: formatAirQualityMetric(airQuality.pm10),
      unit: "µg/m³",
    },
    {
      label: "CO",
      value: formatAirQualityMetric(airQuality.co),
      unit: "µg/m³",
    },
    {
      label: "NO₂",
      value: formatAirQualityMetric(airQuality.no2),
      unit: "µg/m³",
    },
    {
      label: "O₃",
      value: formatAirQualityMetric(airQuality.o3),
      unit: "µg/m³",
    },
    {
      label: "SO₂",
      value: formatAirQualityMetric(airQuality.so2),
      unit: "µg/m³",
    },
  ];
};
