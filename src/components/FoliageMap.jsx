import { useState, useMemo, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLegend from './MapLegend';
import { bbox } from '@turf/turf';

const getSliderValueFromPeak = (peakString) => {
  if (!peakString) return 1;
  const s = peakString.toLowerCase();
  if (s.includes('early september')) return 6;
  if (s.includes('mid september') || s.includes('mid to late september')) return 16;
  if (s.includes('late september') || s.includes('late september to mid october')) return 26;
  if (s.includes('early october') || s.includes('early to mid october')) return 36;
  if (s.includes('mid october') || s.includes('mid to late october') || s.includes('mid october to early november')) return 45;
  if (s.includes('late october') || s.includes('late october to early november')) return 55;
  if (s.includes('early november')) return 67;
  if (s.includes('mid november')) return 75;
  if (s.includes('late november')) return 85;
  if (s.includes('october')) return 45; // generic october
  return 1;
};

const FoliageMap = ({ center = [39.8283, -98.5795], initialZoom = 4, routeGeoJSON = null, peakString = null, boundaryGeoJSON = null, markersGeoJSON = null, statesGeoJSON = null }) => {
  const [activeOverlay, setActiveOverlay] = useState('color');
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Calculate dynamic fitBounds padding to avoid the sidebar
  const fitPadding = windowSize.width <= 768 
    ? { top: 40, bottom: Math.min(windowSize.height * 0.5, 400) + 40, left: 40, right: 40 }
    : { top: 60, bottom: 60, left: 420, right: 60 };
  
  // Calculate bounding box for the boundaryGeoJSON
  const mapBounds = useMemo(() => {
    if (boundaryGeoJSON) {
      return bbox(boundaryGeoJSON);
    }
    return null;
  }, [boundaryGeoJSON]);
  
  // Initialize slider with useMemo to only calculate once on mount
  const defaultSlider = useMemo(() => getSliderValueFromPeak(peakString), [peakString]);
  const [sliderValue, setSliderValue] = useState(defaultSlider);
  const [selectedYear, setSelectedYear] = useState(2026);
  
  const [isSliderOpen, setIsSliderOpen] = useState(true);

  // Listen for year changes from other components (like HubSidebar or LocationDetails)
  useEffect(() => {
    const handleYearChange = (e) => {
      if (e.detail) setSelectedYear(e.detail);
    };
    window.addEventListener('yearChanged', handleYearChange);
    return () => window.removeEventListener('yearChanged', handleYearChange);
  }, []);

  // Free Esri topographic raster basemap
  const basemapStyle = {
    version: 8,
    sources: {
      'esri-topo': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'esri-topo-layer',
        type: 'raster',
        source: 'esri-topo',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  };

  // Calculate the current day of the year for the slider (Sept 1 is day 244)
  const currentDay = 244 + sliderValue;

  // Convert sliderValue (0 to 121) to YYYYMMDD date string (Sept 1 - Dec 31)
  const currentDate = new Date(selectedYear, 8, 1 + sliderValue);
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentDate.getDate()).padStart(2, '0');
  const dateString = `${yyyy}${mm}${dd}`;

  // Image Layer URL based on active overlay (fetching locally generated PNGs)
  const imageUrl = activeOverlay === 'peak' 
    ? `/maps/peakdate.png`
    : `/maps/${dateString}.png`;

  // ExploreFall static PNG bounds used for generation
  const imageCoordinates = [
    [-126, 52], // Top left (NW)
    [-65, 52],  // Top right (NE)
    [-65, 23],  // Bottom right (SE)
    [-126, 23]  // Bottom left (SW)
  ];

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <Map
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: initialZoom,
          ...(mapBounds ? { bounds: mapBounds, fitBoundsOptions: { padding: fitPadding, maxZoom: 8 } } : {})
        }}
        mapStyle={basemapStyle}
        attributionControl={false}
        interactiveLayerIds={statesGeoJSON ? ['states-layer-fill'] : []}
        onClick={async (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.layer.id === 'states-layer-fill') {
              const stateName = feature.properties.name;
              // Dynamically import states.json to avoid breaking other things
              const statesData = (await import('../data/states.json')).default;
              const stateData = statesData.find(s => s.stateName === stateName);
              if (stateData) {
                window.location.href = `/${stateData.stateSlug}`;
              }
            }
          }
        }}
        onMouseEnter={(e) => {
          if (statesGeoJSON && e.features && e.features.length > 0) {
            e.target.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseLeave={(e) => {
          if (statesGeoJSON) {
            e.target.getCanvas().style.cursor = '';
          }
        }}
      >
        {/* Dynamic Image Overlay Layer (Locally Generated) */}
        <Source 
          id="foliage-image" 
          type="image" 
          url={imageUrl} 
          coordinates={imageCoordinates}
        >
          <Layer 
            id="foliage-layer" 
            type="raster" 
            paint={{
              'raster-opacity': 0.7, // Lower opacity to let terrain shine through
              'raster-fade-duration': 0
            }} 
          />
        </Source>

        {/* Reference layer for Highways/Roads */}
        <Source id="esri-transportation" type="raster" tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}']} tileSize={256}>
          <Layer
            id="esri-transportation-layer"
            type="raster"
            paint={{
              'raster-opacity': 0.8
            }}
          />
        </Source>

        {/* Reference layer for Cities/Labels */}
        <Source id="esri-reference" type="raster" tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}']} tileSize={256}>
          <Layer id="esri-reference-layer" type="raster" paint={{ 'raster-opacity': 1.0 }} />
        </Source>

        {/* Route GeoJSON Highlight */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#ff6b00', // Vibrant bright orange
                'line-width': 6,
                'line-opacity': 0.9
              }}
            />
          </Source>
        )}

        {/* Boundary GeoJSON Highlight */}
        {boundaryGeoJSON && (
          <Source id="boundary-source" type="geojson" data={boundaryGeoJSON}>
            <Layer
              id="boundary-layer-fill"
              type="fill"
              paint={{
                'fill-color': '#ffffff',
                'fill-opacity': 0.05
              }}
            />
            <Layer
              id="boundary-layer-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#ffffff', // Distinct white boundary
                'line-width': 3,
                'line-dasharray': [2, 2],
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* US States Clickable Layer */}
        {statesGeoJSON && (
          <Source id="states-source" type="geojson" data={statesGeoJSON}>
            <Layer
              id="states-layer-fill"
              type="fill"
              paint={{
                'fill-color': '#000000',
                'fill-opacity': 0.001 // Nearly invisible but clickable
              }}
            />
          </Source>
        )}

        {/* Markers GeoJSON Highlight */}
        {markersGeoJSON && (
          <Source id="markers-source" type="geojson" data={markersGeoJSON}>
            <Layer
              id="markers-layer-circle"
              type="circle"
              paint={{
                'circle-radius': 6,
                'circle-color': '#F97316',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }}
            />
            <Layer
              id="markers-layer-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 14,
                'text-offset': [0, 1.2],
                'text-anchor': 'top'
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': 'rgba(0,0,0,0.8)',
                'text-halo-width': 2
              }}
            />
          </Source>
        )}

        <NavigationControl position="bottom-right" />
      </Map>

      {/* Overlay Toggles */}
      <div style={{ 
        position: 'absolute', top: '24px', right: '24px', zIndex: 1000, 
        display: 'flex', gap: '8px', padding: '6px', borderRadius: '12px',
        background: 'rgba(25, 30, 40, 0.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <button 
          onClick={() => setActiveOverlay('color')}
          style={{ 
            padding: '8px 20px', background: activeOverlay === 'color' ? '#F97316' : 'transparent',
            color: activeOverlay === 'color' ? 'white' : 'rgba(255,255,255,0.7)',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          Color Report
        </button>
        <button 
          onClick={() => setActiveOverlay('peak')}
          style={{ 
            padding: '8px 20px', background: activeOverlay === 'peak' ? '#F97316' : 'transparent',
            color: activeOverlay === 'peak' ? 'white' : 'rgba(255,255,255,0.7)',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s'
          }}
        >
          Peak Timing
        </button>
      </div>

      {/* Date Slider Overlay */}
      {!isSliderOpen ? (
        <button 
          onClick={() => setIsSliderOpen(true)}
          style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: 'rgba(25, 30, 40, 0.45)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: '8px', padding: '8px 16px', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Date Slider
        </button>
      ) : (
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '20px 28px', borderRadius: '16px', width: 'calc(100% - 48px)', maxWidth: '500px',
          background: 'rgba(25, 30, 40, 0.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 600, fontSize: '18px', color: '#fff' }}>
              {new Date(2026, 8, 1 + sliderValue).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '12px', fontSize: '14px', fontWeight: 400 }}>
                {selectedYear === 2026 ? '2026 (Estimate)' : `${selectedYear} (Historical)`}
              </span>
            </div>
            <button 
              onClick={() => setIsSliderOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                <span>Sep 1</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Day of Year</span>
                <span>Nov 20</span>
              </div>
              <input 
                type="range" min="0" max="80" value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#F97316' }} 
              />
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                <span>2015</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Historical Year</span>
                <span>2026 Avg</span>
              </div>
              <input 
                type="range" min="2015" max="2026" step="1" value={selectedYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  setSelectedYear(newYear);
                  window.dispatchEvent(new CustomEvent('yearChanged', { detail: newYear }));
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }} 
              />
            </div>
          </div>
        </div>
      )}

      <MapLegend activeOverlay={activeOverlay} />

      {/* Attribution Overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000, padding: '4px 8px',
        background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between',
        fontSize: '11px', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none'
      }}>
        <span>EPA, Esri, FAO, Garmin, NOAA, TomTom, USFWS, USGS</span>
        <span>Powered by Esri</span>
      </div>
    </div>
  );
};

export default FoliageMap;
