import React from 'react';
import statesData from '../data/states.json';

const StateDropdown = ({ currentStateSlug }) => {
  const handleChange = (e) => {
    const slug = e.target.value;
    if (slug) {
      window.location.href = `/${slug}`;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '24px',
      right: '24px',
      zIndex: 1000,
      background: 'rgba(25, 30, 40, 0.65)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#fff'
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <select 
        value={currentStateSlug} 
        onChange={handleChange}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          paddingRight: '16px'
        }}
      >
        <option value="" disabled style={{ color: '#000' }}>Select a state...</option>
        {statesData.map((state) => (
          <option key={state.stateSlug} value={state.stateSlug} style={{ color: '#000' }}>
            {state.stateName}
          </option>
        ))}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '12px', pointerEvents: 'none', opacity: 0.5 }}>
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  );
};

export default StateDropdown;
