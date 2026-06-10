import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    color: 'var(--purple-600)',
    fontStyle: 'italic',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    transition: 'color 0.15s',
    fontWeight: 500,
  },
  activeLink: {
    color: 'var(--purple-600)',
  }
};

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    ...styles.link,
    ...(pathname === path ? styles.activeLink : {}),
  });

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>InterviewAI</Link>
      <div style={styles.links}>
        <Link to="/" style={linkStyle('/')}>Practice</Link>
        <Link to="/history" style={linkStyle('/history')}>History</Link>
      </div>
    </nav>
  );
}
