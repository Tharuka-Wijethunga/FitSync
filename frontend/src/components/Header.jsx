import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>FitSync Pro</div>
      <nav style={styles.nav}>
        
        {user?.role === 'coach' ? (
          <NavLink 
            to="/coach-dashboard" 
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? activeLinkStyle : {}) })}
          >
            Coach Dashboard
          </NavLink>
        ) : (
          <>
            <NavLink 
              to="/dashboard" 
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? activeLinkStyle : {}) })}
            >
              My Dashboard
            </NavLink>
            <NavLink 
              to="/profile" 
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? activeLinkStyle : {}) })}
            >
              My Profile
            </NavLink>
          </>
        )}
      </nav>
      <div style={styles.userInfo}>
        <span>{user?.email}</span>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
    </header>
  );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#333',
        color: 'white',
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
    },
    nav: {
        display: 'flex',
        gap: '1.5rem',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    logoutButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};

export default Header;