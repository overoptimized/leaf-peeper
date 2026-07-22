import React, { useState, useEffect } from 'react';
import LocalWeather from './LocalWeather';
import Breadcrumbs from './Breadcrumbs';

function getReadableDateFromDayOfYear(day) {
  const date = new Date(2026, 0);
  date.setDate(day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LocationDetails = ({ location, historicalPhenology }) => {
  const { name, description, historicalPeak, currentStatus, nearbyCities, coordinates } = location;
  const { lat, lng } = coordinates;

  const [selectedYear, setSelectedYear] = useState('Average');

  // If year changes, dispatch an event to tell FoliageMap
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('yearChanged', { detail: selectedYear === 'Average' ? 2026 : selectedYear }));
  }, [selectedYear]);

  // Calculate current week and day of the year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekOfYear = Math.ceil(dayOfYear / 7);

  const handleDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${lng}`, '_blank');
        },
        () => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  // Determine what peak to display based on the selected year
  let displayedPeak = historicalPeak; // Default to string "Mid October"
  if (historicalPhenology) {
    if (selectedYear === 'Average') {
      displayedPeak = getReadableDateFromDayOfYear(historicalPhenology.baselinePeakDay);
    } else {
      const yearPeak = historicalPhenology.yearlyPeaks[selectedYear];
      if (yearPeak) {
        displayedPeak = getReadableDateFromDayOfYear(yearPeak);
      }
    }
  }

  // Get available years from historical phenology
  const availableYears = historicalPhenology && historicalPhenology.yearlyPeaks 
    ? Object.keys(historicalPhenology.yearlyPeaks).sort((a,b) => b - a) 
    : [];

  return (
    <div 
      className="glass-panel" 
      style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '340px',
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
        zIndex: 1000,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <Breadcrumbs 
        stateSlug={location.stateSlug} 
        stateName={location.stateName} 
        citySlug={location.citySlug} 
        cityName={location.cityName}
        locationName={name} 
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', marginTop: '-8px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          {name}
        </h1>
      </div>

      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Day of Year</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-color)' }}>{dayOfYear}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Week</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-color)' }}>{weekOfYear}</div>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedYear === 'Average' ? 'Average Peak' : `${selectedYear} Peak`}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: selectedYear !== 'Average' ? '#38bdf8' : 'white' }}>
              {displayedPeak}
            </div>
          </div>
          {availableYears.length > 0 && (
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', borderRadius: '4px', fontSize: '12px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="Average" style={{ color: 'black' }}>Average</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr} style={{ color: 'black' }}>{yr}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Status</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-color)' }}>{currentStatus}</div>
        </div>
      </div>

      <LocalWeather lat={lat} lng={lng} weatherStats={location.weatherStats} />

      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>
          Driving Estimates
        </h3>
        {nearbyCities.map((city, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: i !== nearbyCities.length - 1 ? '8px' : 0 }}>
            <span>{city.name}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{city.distanceEstimate}</span>
          </div>
        ))}
      </div>

      {(location.popularRoads || location.scenicHikes || location.fallPOI) && (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>
            Fall Highlights
          </h3>
          
          {location.popularRoads && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Scenic Drives</div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                {location.popularRoads.map((road, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    {road.slug ? (
                      <a href={`/scenic-drives/${road.slug}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                        {road.name}
                      </a>
                    ) : (
                      <span>{road.name || road}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {location.scenicHikes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hikes</div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                {location.scenicHikes.map((hike, i) => <li key={i} style={{ marginBottom: '4px' }}>{hike}</li>)}
              </ul>
            </div>
          )}

          {location.fallPOI && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Points of Interest</div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                {location.fallPOI.map((poi, i) => <li key={i} style={{ marginBottom: '4px' }}>{poi}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={handleDirections}
        style={{
          width: '100%',
          padding: '14px',
          background: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '8px',
          transition: 'all 0.2s',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        Get Directions
      </button>
    </div>
  );
};

export default LocationDetails;
