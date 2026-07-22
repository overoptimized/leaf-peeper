import React from 'react';
import USAMap from 'react-usa-map';

const stateToSlug = {
  "AL": "alabama", "AK": "alaska", "AZ": "arizona", "AR": "arkansas", "CA": "california",
  "CO": "colorado", "CT": "connecticut", "DE": "delaware", "FL": "florida", "GA": "georgia",
  "HI": "hawaii", "ID": "idaho", "IL": "illinois", "IN": "indiana", "IA": "iowa",
  "KS": "kansas", "KY": "kentucky", "LA": "louisiana", "ME": "maine", "MD": "maryland",
  "MA": "massachusetts", "MI": "michigan", "MN": "minnesota", "MS": "mississippi", "MO": "missouri",
  "MT": "montana", "NE": "nebraska", "NV": "nevada", "NH": "new-hampshire", "NJ": "new-jersey",
  "NM": "new-mexico", "NY": "new-york", "NC": "north-carolina", "ND": "north-dakota", "OH": "ohio",
  "OK": "oklahoma", "OR": "oregon", "PA": "pennsylvania", "RI": "rhode-island", "SC": "south-carolina",
  "SD": "south-dakota", "TN": "tennessee", "TX": "texas", "UT": "utah", "VT": "vermont",
  "VA": "virginia", "WA": "washington", "WV": "west-virginia", "WI": "wisconsin", "WY": "wyoming"
};

const InteractiveMap = () => {
  const mapHandler = (event) => {
    const abbrev = event.target.dataset.name;
    if (abbrev) {
      window.location.href = `/${abbrev.toLowerCase()}`;
    }
  };

  const statesCustomConfig = {};
  Object.keys(stateToSlug).forEach(abbrev => {
    statesCustomConfig[abbrev] = {
      fill: "#e09a3f", // Default fall color
      clickHandler: mapHandler
    };
  });

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}>
      <style>
        {`
          .us-state-map {
            width: 100%;
            height: auto;
          }
          .us-state-map path {
            transition: fill 0.2s ease, opacity 0.2s ease;
            cursor: pointer;
            stroke: #fff;
            stroke-width: 1px;
          }
          .us-state-map path:hover {
            fill: #972b21 !important; /* Peak Red on hover */
            opacity: 0.9;
          }
          /* Add abbreviations */
          text.state-label {
            font-size: 12px;
            fill: #fff;
            font-weight: 600;
            pointer-events: none;
            font-family: system-ui, -apple-system, sans-serif;
          }
        `}
      </style>
      {React.createElement(USAMap.default || USAMap, { customize: statesCustomConfig })}
    </div>
  );
};

export default InteractiveMap;
