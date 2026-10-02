import React, { useState, useEffect } from 'react';

import {
  Building2,
  Server,
  CheckCircle2,
  RefreshCw,
  CalendarDays,
  BedDouble,
  Users
} from 'lucide-react';

import BookingPage from './pages/BookingPage';
import RoomsPage from './pages/RoomsPage';
import GuestPortalPage from './pages/GuestPortalPage';

function App() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activePage, setActivePage] = useState('bookings');

  const checkHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health');

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      setBackendHealth(data);
    } catch (err) {
      console.error('Health check failed:', err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="app-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 15, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >

        {/* Logo / Brand */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >

          <div
            style={{
              background:
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 4px 12px rgba(245, 158, 11, 0.25)'
            }}
          >
            <Building2
              size={24}
              color="#0b0f17"
              strokeWidth={2.5}
            />
          </div>

          <div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                letterSpacing: '0.02em',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0
              }}
            >
              StaySuite
            </h1>

            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              Hotel Booking & Guest Operations Portal
            </p>

          </div>

        </div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >

          {/* Bookings */}

          <button
            onClick={() => setActivePage('bookings')}
            style={{
              ...styles.navButton,
              ...(activePage === 'bookings'
                ? styles.activeNavButton
                : {})
            }}
          >
            <CalendarDays size={16} />

            Bookings
          </button>


          {/* Rooms */}

          <button
            onClick={() => setActivePage('rooms')}
            style={{
              ...styles.navButton,
              ...(activePage === 'rooms'
                ? styles.activeNavButton
                : {})
            }}
          >
            <BedDouble size={16} />

            Rooms
          </button>


          {/* Guests */}

          <button
            onClick={() => setActivePage('guests')}
            style={{
              ...styles.navButton,
              ...(activePage === 'guests'
                ? styles.activeNavButton
                : {})
            }}
          >
            <Users size={16} />

            Guests
          </button>

        </nav>

      </header>


      {/* =====================================================
          BACKEND API STATUS
      ===================================================== */}

      <section
        style={{
          padding: '20px 32px 0'
        }}
      >

        <div
          className="glass-panel"
          style={{
            padding: '16px 20px'
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >

              <Server
                size={18}
                color="var(--color-text-secondary)"
              />

              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Backend API
              </span>


              {/* Connected */}

              {backendHealth && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#34d399',
                    fontSize: '0.82rem'
                  }}
                >
                  <CheckCircle2 size={14} />

                  Connected
                </span>
              )}


              {/* Disconnected */}

              {error && (
                <span
                  style={{
                    color: '#f87171',
                    fontSize: '0.82rem'
                  }}
                >
                  Disconnected
                </span>
              )}

            </div>


            {/* Check API button */}

            <button
              onClick={checkHealth}
              disabled={loading}
              style={styles.healthButton}
            >

              <RefreshCw
                size={14}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />

              {loading
                ? 'Checking...'
                : 'Check API'}

            </button>

          </div>


          {/* Error message */}

          {error && (
            <div style={styles.errorMessage}>
              Backend health check failed: {error}
            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main>

        {activePage === 'bookings' && (
          <BookingPage />
        )}

        {activePage === 'rooms' && (
          <RoomsPage />
        )}

        {activePage === 'guests' && (
          <GuestPortalPage />
        )}

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          background: 'rgba(11, 15, 23, 0.5)',
          marginTop: '32px'
        }}
      >
        StaySuite Hotel Booking & Guest Operations Portal
        &copy; 2026
      </footer>

    </div>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = {

  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid transparent',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },

  activeNavButton: {
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#fbbf24'
  },

  healthButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--color-surface-hover)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    transition: 'all 0.2s ease'
  },

  errorMessage: {
    marginTop: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    fontSize: '0.85rem'
  }

};

export default App;