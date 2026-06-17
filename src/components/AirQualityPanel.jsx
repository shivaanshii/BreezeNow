import {
  getAqiHealthActions,
  getAqiLevel,
  getAqiPollutantDetails,
} from "../utils/weatherUtils";

export function AirQualityPanel({ airQuality }) {
  const aqiLevel = getAqiLevel(airQuality);
  const healthActions = getAqiHealthActions(airQuality);
  const pollutants = getAqiPollutantDetails(airQuality);
  const hasData = Number.isFinite(aqiLevel.index);

  return (
    <section
      className={`aqi-panel ${hasData ? `aqi-panel-${aqiLevel.tone}` : "aqi-panel-neutral"}`}
      style={{ "--aqi-color": aqiLevel.color }}
      aria-label="Air quality index"
    >
      <div className="aqi-panel-header">
        <div>
          <p className="section-kicker">Air Quality</p>
          <h3>Pollution and health guidance</h3>
          <p>
            AQI uses WeatherAPI pollution data to summarize how the air may feel
            today.
          </p>
        </div>

        <div className="aqi-score" aria-live="polite">
          <span className="aqi-score-value">
            {hasData ? aqiLevel.index : "--"}
          </span>
          <span className="aqi-score-label">{aqiLevel.shortLabel}</span>
        </div>
      </div>

      <div className="aqi-meter" aria-hidden="true">
        <span
          className="aqi-meter-fill"
          style={{
            width: hasData
              ? `${(Math.min(aqiLevel.index, 6) / 6) * 100}%`
              : "0%",
          }}
        />
      </div>

      <div className="aqi-summary">
        <span className="aqi-pill" style={{ backgroundColor: aqiLevel.color }}>
          {aqiLevel.label}
        </span>
        <p>{aqiLevel.warning}</p>
      </div>

      <div className="aqi-details-grid">
        {pollutants.map((pollutant) => (
          <article key={pollutant.label} className="aqi-detail-card">
            <span>{pollutant.label}</span>
            <strong>
              {pollutant.value}
              {pollutant.value === "--" ? "" : ` ${pollutant.unit}`}
            </strong>
          </article>
        ))}
      </div>

      <div className="aqi-actions">
        <h4>Health suggestions</h4>
        <ul>
          {healthActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
