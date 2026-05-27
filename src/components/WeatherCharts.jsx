import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function WeatherCharts({ forecastData }) {
  const [mode, setMode] = useState("daily");

  let labels = [];
  let temperatures = [];
  let winds = [];
  let precipitation = [];

  if (mode === "daily") {
    labels = forecastData.map((day) => {
    const date = new Date(day.date);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
    });

    temperatures = forecastData.map(
      (day) => day.day.avgtemp_c
    );

    winds = forecastData.map(
      (day) => day.day.maxwind_kph
    );

    precipitation = forecastData.map(
      (day) => day.day.totalprecip_mm
    );
  } else {
        const todayHours = forecastData[0].hour;

        labels = todayHours.map((hour) =>
            hour.time.split(" ")[1]
        );

        temperatures = todayHours.map(
            (hour) => hour.temp_c
        );

        winds = todayHours.map(
            (hour) => hour.wind_kph
        );

        precipitation = todayHours.map(
            (hour) => hour.precip_mm
        );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
    legend: {
      display: false,
    },
  },
  };

  const createDataset = (label, data, color) => ({
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
      },
    ],
  });

  return (
        <div className="weather-trends">
    <div className="charts-header">
        <div>
        <h2 className="text-3xl font-black tracking-tight m-0 text-current">
              Temperature, Winds and Precipitation 
            </h2>
        <p>Explore hourly and daily trends for better planning.</p>
        </div>

        <div className="toggle-buttons">
        <button
            className={mode === "daily" ? "active" : ""}
            onClick={() => setMode("daily")}
        >
            Daily
        </button>

        <button
            className={mode === "hourly" ? "active" : ""}
            onClick={() => setMode("hourly")}
        >
            Hourly
        </button>
        </div>
    </div>

    <div className="charts-grid">
        <div className="chart-card">
  <h3>🌡 Temperature (°C)</h3>
  <div style={{ height: "280px" }}>
    <Line
      data={createDataset(
        "Temperature (°C)",
        temperatures,
        "#ff7a45"
      )}
      options={chartOptions}
    />
  </div>
</div>

<div className="chart-card">
  <h3>💨 Wind Speed (km/h)</h3>
  <div style={{ height: "280px" }}>
    <Line
      data={createDataset(
        "Wind Speed",
        winds,
        "#4f8cff"
      )}
      options={chartOptions}
    />
  </div>
</div>

<div className="chart-card">
  <h3>🌧 Precipitation (mm)</h3>
  <div style={{ height: "280px" }}>
    <Line
      data={createDataset(
        "Precipitation",
        precipitation,
        "#4CAF50"
      )}
      options={chartOptions}
    />
  </div>
</div>
    </div>
    </div>
  );
}