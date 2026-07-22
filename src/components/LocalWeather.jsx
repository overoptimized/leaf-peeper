import React, { useEffect, useState } from 'react';

const LocalWeather = ({ lat, lng, weatherStats }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Step 1: Get forecast URL from coordinates
        const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lng}`);
        if (!pointRes.ok) throw new Error('Weather data unavailable');
        const pointData = await pointRes.json();
        const forecastUrl = pointData.properties.forecast;

        // Step 2: Get actual forecast
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error('Forecast unavailable');
        const forecastData = await forecastRes.json();
        
        // Grab the first period (current/today)
        const currentPeriod = forecastData.properties.periods[0];
        setWeather(currentPeriod);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  return (
    <div style={{
      padding: '16px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>
        Conditions & Forecast
      </h3>
      
      {/* Static Astronomical Data */}
      {weatherStats && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sunrise</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{weatherStats.sunrise || '--'}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sunset</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{weatherStats.sunset || '--'}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daylight</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{weatherStats.daylightDuration || '--'}</div>
          </div>
        </div>
      )}

      {/* Live Forecast Data */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fetching live forecast...</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>
      ) : weather ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 700 }}>
            {weather.temperature}&deg;{weather.temperatureUnit}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{weather.shortForecast}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Wind: {weather.windSpeed} {weather.windDirection}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LocalWeather;
