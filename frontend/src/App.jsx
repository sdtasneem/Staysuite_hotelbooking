import React, { useState, useEffect } from 'react';

import {
  Building2,
  Server,
  Database,
  Globe,
  CheckCircle2,
  RefreshCw,
  Layers
} from 'lucide-react';

import BookingPage from './pages/BookingPage';

function App() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(11, 15, 23, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
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

        <div className="status-pill online">
          <span className="pulsing-dot"></span>
          React Frontend Active
        </div>
      </header>

      {/* Backend Status */}
      <section
        style={{
          padding: '20px 32px 0'
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '20px'
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
                Backend API Integration Status
              </span>
            </div>

            <button
              onClick={checkHealth}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw
                size={14}
                className={loading ? 'animate-spin' : ''}
              />

              {loading
                ? 'Checking...'
                : 'Check /api/health'}
            </button>
          </div>

          {/* Successful health check */}
          {backendHealth && (
            <div
              style={{
                marginTop: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border:
                  '1px solid rgba(16, 185, 129, 0.25)',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#34d399',
                fontSize: '0.9rem'
              }}
            >
              <CheckCircle2 size={18} />

              <div>
                <strong>{backendHealth.message}</strong>{' '}
                (Status: 200 OK)
              </div>
            </div>
          )}

          {/* Health check error */}
          {error && (
            <div
              style={{
                marginTop: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border:
                  '1px solid rgba(239, 68, 68, 0.25)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.88rem'
              }}
            >
              Backend health check failed: {error}
              <br />
              Ensure the Express server is running on
              port 5000.
            </div>
          )}
        </div>
      </section>

      {/* Booking Page */}
      <main>
        <BookingPage />
      </main>

      {/* Footer */}
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
        &copy; 2026. Architecture Phase Verified.
      </footer>
    </div>
  );
}

export default App;