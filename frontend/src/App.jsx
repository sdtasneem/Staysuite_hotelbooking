import React, { useEffect, useState } from 'react';

import {
  Building2,
  CalendarDays,
  BedDouble,
  Users,
  Server,
  RefreshCw,
  LogOut
} from 'lucide-react';

import { supabase } from './services/supabaseClient';

import AuthPage from './pages/AuthPage';
import BookingPage from './pages/BookingPage';
import RoomsPage from './pages/RoomsPage';
import GuestPortalPage from './pages/GuestPortalPage';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [backendHealth, setBackendHealth] = useState(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState('');

  const [activePage, setActivePage] = useState('bookings');

  // =========================================================
  // SUPABASE AUTHENTICATION
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Failed to get Supabase session:', error);
      }

      setSession(data?.session || null);
      setAuthLoading(false);
    };

    getSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // BACKEND HEALTH CHECK
  // =========================================================

  const checkHealth = async () => {
    setBackendLoading(true);
    setBackendError('');

    try {
      const response = await fetch('/api/health');

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      setBackendHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setBackendHealth(null);
      setBackendError(error.message || 'Backend API unavailable');
    } finally {
      setBackendLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      checkHealth();
    }
  }, [session]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout failed:', error);
      return;
    }

    setSession(null);
    setActivePage('bookings');
  };

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080c14',
          color: '#ffffff'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Loading StaySuite...</h2>
          <p style={{ color: '#94a3b8' }}>
            Checking your authentication session.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  if (!session) {
    return (
      <AuthPage
        onAuthSuccess={(newSession) => {
          setSession(newSession);
        }}
      />
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh'
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: 'rgba(11, 15, 23, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Logo */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0
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
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
              flexShrink: 0
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

        {/* Navigation */}

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={() => setActivePage('bookings')}
            style={{
              ...navButtonStyle,
              ...(activePage === 'bookings'
                ? activeNavButtonStyle
                : {})
            }}
          >
            <CalendarDays size={17} />
            Bookings
          </button>

          <button
            type="button"
            onClick={() => setActivePage('rooms')}
            style={{
              ...navButtonStyle,
              ...(activePage === 'rooms'
                ? activeNavButtonStyle
                : {})
            }}
          >
            <BedDouble size={17} />
            Rooms
          </button>

          <button
            type="button"
            onClick={() => setActivePage('guests')}
            style={{
              ...navButtonStyle,
              ...(activePage === 'guests'
                ? activeNavButtonStyle
                : {})
            }}
          >
            <Users size={17} />
            Guests
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              ...navButtonStyle,
              color: '#fca5a5',
              borderColor: 'rgba(239, 68, 68, 0.25)'
            }}
            title="Logout"
          >
            <LogOut size={17} />
            Logout
          </button>
        </nav>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        style={{
          padding: '22px 32px 40px'
        }}
      >
        {/* Backend API Status */}

        <div
          style={{
            marginBottom: '28px',
            padding: '18px 22px',
            borderRadius: '18px',
            border: '1px solid #263247',
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
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
              size={20}
              color="var(--color-text-secondary)"
            />

            <strong>Backend API</strong>

            {backendHealth && (
              <span
                style={{
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block'
                  }}
                />
                Connected
              </span>
            )}

            {backendError && (
              <span
                style={{
                  color: '#f87171'
                }}
              >
                Disconnected
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={checkHealth}
            disabled={backendLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 15px',
              borderRadius: '9px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#ffffff',
              cursor: backendLoading
                ? 'not-allowed'
                : 'pointer',
              opacity: backendLoading ? 0.7 : 1
            }}
          >
            <RefreshCw
              size={15}
              className={
                backendLoading ? 'animate-spin' : ''
              }
            />

            {backendLoading ? 'Checking...' : 'Check API'}
          </button>
        </div>

        {/* Logged-in user information */}

        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              fontSize: '0.85rem'
            }}
          >
            {session.user?.email}
          </div>
        </div>

        {/* =================================================
            PAGE ROUTING
        ================================================== */}

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
      ====================================================== */}

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          background: 'rgba(11, 15, 23, 0.5)'
        }}
      >
        StaySuite Hotel Booking & Guest Operations Portal
        &copy; 2026
      </footer>
    </div>
  );
}

// ===========================================================
// NAVIGATION STYLES
// ===========================================================

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '10px 15px',
  borderRadius: '9px',
  border: '1px solid transparent',
  background: 'transparent',
  color: '#94a3b8',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const activeNavButtonStyle = {
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.35)',
  color: '#fbbf24'
};

export default App;