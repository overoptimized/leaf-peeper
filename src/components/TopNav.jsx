import React from 'react';

const TopNav = () => {
  const navItems = [
    { label: 'Live Map', href: '/fall-foliage-map' },
    { 
      label: 'Popular Regions', 
      href: '/regions',
      dropdown: [
        { label: 'New England', href: '/regions/new-england' },
        { label: 'Blue Ridge Mountains', href: '/regions/blue-ridge-mountains' },
        { label: 'Colorado', href: '/co' },
        { label: 'Michigan', href: '/mi' },
        { label: 'Vermont', href: '/vt' },
        { label: 'The Northeast', href: '/regions/northeast' }
      ]
    },
    { label: 'Scenic Drives', href: '/scenic-drives' },
    { label: 'Scenic Hikes', href: '#' },
    { label: 'Resources', href: '#' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      width: '100%',
      height: '60px',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 2000,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '48px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, var(--accent-color), #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <a href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Leaf Peeper
        </a>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
        {navItems.map((item, i) => (
          <div key={i} className="nav-item-container">
            <a href={item.href} style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              height: '100%'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              {item.label}
              {item.dropdown && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </a>
            {item.dropdown && (
              <div className="nav-dropdown">
                {item.dropdown.map((dropItem, j) => (
                  <a key={j} href={dropItem.href}>
                    {dropItem.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default TopNav;
