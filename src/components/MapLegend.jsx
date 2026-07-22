import React, { useState } from 'react';

const MapLegend = ({ activeOverlay }) => {
  const [isOpen, setIsOpen] = useState(true);

  const colorReportItems = [
    { label: 'No Color', color: '#759a54' },
    { label: 'Low Color', color: '#e8e66f' },
    { label: 'Moderate', color: '#e09a3f' },
    { label: 'High Color', color: '#b9652a' },
    { label: 'Peak Color', color: '#972b21' },
    { label: 'Past Peak', color: '#553621' }
  ];
  
  const peakTimingItems = [
    { label: 'Early Sept', color: '#1f2a40' },
    { label: 'Mid Sept', color: '#2a3a55' },
    { label: 'Late Sept', color: '#38435d' },
    { label: 'Early Oct', color: '#3d5c3b' },
    { label: 'Mid Oct', color: '#679060' },
    { label: 'Late Oct', color: '#a2b37c' },
    { label: 'Early Nov', color: '#dcc67e' },
    { label: 'Mid Nov', color: '#ae8c53' },
    { label: 'Late Nov', color: '#734d31' },
    { label: 'December', color: '#e0e0e0' }
  ];

  const items = activeOverlay === 'peak' ? peakTimingItems : colorReportItems;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', bottom: '80px', right: '24px', zIndex: 1000,
          background: 'rgba(25, 30, 40, 0.45)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: '8px', padding: '8px 12px', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        Legend
      </button>
    );
  }

  return (
    <>
      <style>
        {`
          .map-legend {
            position: absolute;
            bottom: 80px;
            right: 24px;
            z-index: 1000;
            padding: 16px;
            width: 180px;
            background: rgba(25, 30, 40, 0.45);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border-radius: 16px;
            color: #fff;
          }
          @media (max-width: 768px) {
            .map-legend {
              bottom: auto;
              top: 80px;
              right: 16px;
            }
          }
        `}
      </style>
      <div className="map-legend">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            {activeOverlay === 'peak' ? 'Peak Timing' : 'Foliage Status'}
          </h4>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: item.color,
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MapLegend;
