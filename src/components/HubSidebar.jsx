import React, { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';

function getReadableDateFromDayOfYear(day) {
  const date = new Date(2026, 0);
  date.setDate(day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper to determine if a location matches the selected timeframe
const matchesTimeframe = (historicalPeak, timeframe) => {
  if (timeframe === 'Anytime') return true;
  if (!historicalPeak) return false;
  
  const peak = historicalPeak.toLowerCase();
  
  if (timeframe === 'September') {
    return peak.includes('september');
  }
  if (timeframe === 'Early October') {
    return peak.includes('early october') || peak.includes('early to mid october') || peak.includes('late september to early october');
  }
  if (timeframe === 'Mid October') {
    return peak.includes('mid october') || peak.includes('early to mid october') || peak.includes('mid to late october');
  }
  if (timeframe === 'Late October') {
    return peak.includes('late october') || peak.includes('mid to late october') || peak.includes('late october to early november');
  }
  if (timeframe === 'November') {
    return peak.includes('november');
  }
  return true;
};

// Distance calculation
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2-lat1) * (Math.PI/180);
  const dLon = (lon2-lon1) * (Math.PI/180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

const HubSidebar = ({ 
  stateSlug, 
  stateName, 
  citySlug, 
  cityName, 
  stateLocations, 
  stateDrives, 
  centerLat, 
  centerLng,
  fullPhenologyData 
}) => {
  const [timeframe, setTimeframe] = useState('Anytime');
  const [selectedYear, setSelectedYear] = useState(2026);

  // If year changes, dispatch an event to tell FoliageMap
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('yearChanged', { detail: selectedYear }));
  }, [selectedYear]);
  
  // Filter by timeframe
  const filteredLocations = stateLocations.filter(loc => matchesTimeframe(loc.historicalPeak, timeframe));
  // Drives don't easily have a historical peak (they span long distances), but if they did we could filter them.
  // For now, let's keep all drives that are near, or we could just show locations if filtering.
  // We'll show all nearby drives for now as they are scenic routes.
  const filteredDrives = stateDrives; 

  // Group locations by travel time from center
  const groupedLocations = {
    "Less than an hour": [],
    "1-2 hours": [],
    "2-3 hours": [],
    "3-4 hours": [],
    "4-5 hours": [],
    "5+ hours": []
  };

  filteredLocations.forEach(loc => {
    const dist = getDistanceFromLatLonInMiles(centerLat, centerLng, loc.coordinates.lat, loc.coordinates.lng);
    const hours = dist / 50;
    
    if (hours < 1) groupedLocations["Less than an hour"].push(loc);
    else if (hours < 2) groupedLocations["1-2 hours"].push(loc);
    else if (hours < 3) groupedLocations["2-3 hours"].push(loc);
    else if (hours < 4) groupedLocations["3-4 hours"].push(loc);
    else if (hours < 5) groupedLocations["4-5 hours"].push(loc);
    else groupedLocations["5+ hours"].push(loc);
  });

  // Group drives by distance from center
  const groupedDrives = {
    "Less than an hour": [],
    "1-2 hours": [],
    "2-3 hours": [],
    "3-4 hours": [],
    "4-5 hours": [],
    "5+ hours": []
  };

  filteredDrives.forEach(drive => {
    const dist = getDistanceFromLatLonInMiles(centerLat, centerLng, drive.center[0], drive.center[1]);
    const hours = dist / 50;
    
    if (hours < 1) groupedDrives["Less than an hour"].push(drive);
    else if (hours < 2) groupedDrives["1-2 hours"].push(drive);
    else if (hours < 3) groupedDrives["2-3 hours"].push(drive);
    else if (hours < 4) groupedDrives["3-4 hours"].push(drive);
    else if (hours < 5) groupedDrives["4-5 hours"].push(drive);
    else groupedDrives["5+ hours"].push(drive);
  });

  const totalResults = filteredLocations.length;

  return (
    <div className="glass-panel state-sidebar" style={{
      position: 'absolute', top: '24px', left: '24px', width: '360px', 
      maxHeight: 'calc(100% - 48px)', overflowY: 'auto', zIndex: 1000, 
      padding: '24px', display: 'flex', flexDirection: 'column'
    }}>
      <Breadcrumbs stateSlug={stateSlug} stateName={stateName} citySlug={citySlug} cityName={cityName} />
      
      <h1 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>{cityName} Hub</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Explore locations and scenic byways near {cityName}, {stateName}.</p>

      {/* Timeframe Filter Dropdown */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
          When are you visiting?
        </label>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', 
            fontSize: '15px', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="Anytime" style={{ color: 'black' }}>Anytime</option>
          <option value="September" style={{ color: 'black' }}>September (Early)</option>
          <option value="Early October" style={{ color: 'black' }}>Early October</option>
          <option value="Mid October" style={{ color: 'black' }}>Mid October (Peak)</option>
          <option value="Late October" style={{ color: 'black' }}>Late October</option>
          <option value="November" style={{ color: 'black' }}>November (Late)</option>
        </select>
        {timeframe !== 'Anytime' && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-color)' }}>
            Showing {totalResults} locations peaking in {timeframe}
          </div>
        )}
      </div>
      
      {/* Historical Year Toggle */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Historical Data
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: selectedYear !== 'Average' ? '#38bdf8' : 'white' }}>
              {selectedYear === 'Average' ? 'Showing Baseline Averages' : `Showing ${selectedYear} Variance`}
            </div>
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: '4px', fontSize: '12px', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="Average" style={{ color: 'black' }}>Average</option>
            <option value="2023" style={{ color: 'black' }}>2023</option>
            <option value="2022" style={{ color: 'black' }}>2022</option>
            <option value="2021" style={{ color: 'black' }}>2021</option>
            <option value="2020" style={{ color: 'black' }}>2020</option>
            <option value="2015" style={{ color: 'black' }}>2015</option>
            <option value="2010" style={{ color: 'black' }}>2010</option>
            <option value="2005" style={{ color: 'black' }}>2005</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.keys(groupedLocations).map(groupName => {
          const locs = groupedLocations[groupName];
          const drvs = groupedDrives[groupName];
          if (locs.length === 0 && (drvs.length === 0 || timeframe !== 'Anytime')) return null;
          
          return (
            <div key={groupName}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{groupName}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Render Drives First (only if Anytime is selected, to avoid confusion if they don't match the timeframe) */}
                {timeframe === 'Anytime' && drvs.map(drive => (
                  <a 
                    key={drive.slug}
                    href={`/scenic-drives/${drive.slug}`}
                    style={{
                      padding: '12px', background: 'rgba(249, 115, 22, 0.15)', borderRadius: '8px',
                      textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid rgba(249, 115, 22, 0.3)',
                      transition: 'background 0.2s, border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '4px'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--accent-color)' }}>🛣️ {drive.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{drive.description}</div>
                  </a>
                ))}

                {/* Render Locations */}
                {locs.map(loc => {
                  let displayedPeak = loc.historicalPeak || 'Unknown';
                  if (fullPhenologyData && fullPhenologyData[loc.slug]) {
                    const phen = fullPhenologyData[loc.slug];
                    if (selectedYear === 'Average') {
                      displayedPeak = getReadableDateFromDayOfYear(phen.baselinePeakDay);
                    } else if (phen.yearlyPeaks[selectedYear]) {
                      displayedPeak = getReadableDateFromDayOfYear(phen.yearlyPeaks[selectedYear]);
                    }
                  }

                  return (
                    <a 
                      key={loc.slug}
                      href={`/${stateSlug}/${loc.slug}`}
                      style={{
                        padding: '12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px',
                        textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s, border-color 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{loc.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Peak: <span style={{ color: selectedYear !== 'Average' ? '#38bdf8' : 'inherit' }}>{displayedPeak}</span></div>
                      <div style={{ fontSize: '12px', color: 'var(--accent-color)' }}>Status: {loc.currentStatus}</div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
        {totalResults === 0 && timeframe !== 'Anytime' && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            No locations found that peak around {timeframe} near {cityName}. Try selecting a different time!
          </div>
        )}
      </div>
    </div>
  );
};

export default HubSidebar;
