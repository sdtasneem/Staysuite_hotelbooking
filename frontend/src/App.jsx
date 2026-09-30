import React, { useState, useEffect } from 'react';
import { Building2, Server, Database, Globe, CloudSun, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(11, 15, 23, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
          }}>
            <Building2 size={24} color="#0b0f17" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              letterSpacing: '0.02em',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              StaySuite
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Hotel Booking & Guest Operations Portal
            </p>
          </div>
        </div>

        <div className="status-pill online">
          <span className="pulsing-dot"></span>
          React Frontend Active
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Hero Card */}
        <section className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <Layers size={14} /> Phase 1: Initial Architecture & Monorepo Scaffold
            </div>
            
            <h2 style={{
              fontSize: '2.4rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '16px',
              background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome to StaySuite
            </h2>
            
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              The client-side React + Vite architecture is initialized and running. This platform serves as the centralized foundation for room reservations, guest self-service operations, housekeeping workflows, and real-time destination context.
            </p>

            {/* Backend Verification Widget */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Server size={18} color="var(--color-text-secondary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Backend API Integration Status</span>
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
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Checking...' : 'Check /api/health'}
                </button>
              </div>

              {backendHealth && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#34d399',
                  fontSize: '0.9rem'
                }}>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{backendHealth.message}</strong> (Status: 200 OK)
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.88rem'
                }}>
                  Backend health check failed: {error} (Ensure Express server is running on port 5000)
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stack Overview Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Frontend Tier</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              React 18 + Vite SPA configured with modular directories: components, pages, context, hooks, and services.
            </p>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>● Initialized & Active</span>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Server size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Backend API</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Node.js + Express with centralized env config, error handling middleware, and <code>/api/health</code> endpoint.
            </p>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>● Configured & Ready</span>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Database size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Database Tier</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Supabase PostgreSQL foundation prepared with <code>schema.sql</code> and <code>seed.sql</code> structure.
            </p>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>○ Phase 2: Schema Migration</span>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
                <Globe size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>External Integrations</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Planned Open-Meteo weather intelligence and REST Countries destination metadata integrations.
            </p>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>○ Phase 4: Integration</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        background: 'rgba(11, 15, 23, 0.5)'
      }}>
        StaySuite Hotel Booking & Guest Operations Portal &copy; 2026. Architecture Phase Verified.
      </footer>
    </div>
  );
}

export default App;
