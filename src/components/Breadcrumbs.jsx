import React from 'react';

const Breadcrumbs = ({ stateSlug, stateName, citySlug, cityName, locationName }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      marginBottom: '16px'
    }}>
      <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</a>
      <span>/</span>
      <a href="/fall-foliage-map" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>US</a>
      <span>/</span>
      {stateName ? (
        <>
          <a href={`/${stateSlug}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{stateName}</a>
          <span>/</span>
        </>
      ) : null}
      
      {cityName ? (
        <>
          <a href={`/${stateSlug}/${citySlug}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{cityName}</a>
          <span>/</span>
        </>
      ) : null}

      {locationName ? (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{locationName}</span>
      ) : null}
    </div>
  );
};

export default Breadcrumbs;
