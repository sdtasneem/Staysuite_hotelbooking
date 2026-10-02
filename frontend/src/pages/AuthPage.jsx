import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthPage = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage('');
        setError('');

        try {
            if (mode === 'register') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });

                if (signUpError) {
                    throw signUpError;
                }

                if (data.session) {
                    onAuthSuccess?.(data.session);
                } else {
                    setMessage(
                        'Registration successful. Please check your email to confirm your account.'
                    );
                }
            } else {
                const { data, error: signInError } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                if (signInError) {
                    throw signInError;
                }

                onAuthSuccess?.(data.session);
            }
        } catch (authError) {
            setError(authError.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: '#080c14'
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '460px',
                    padding: '32px',
                    borderRadius: '18px',
                    border: '1px solid #263247',
                    background: '#111827',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h1
                        style={{
                            margin: 0,
                            color: '#ffffff',
                            fontSize: '32px'
                        }}
                    >
                        StaySuite
                    </h1>

                    <p
                        style={{
                            marginTop: '8px',
                            color: '#8fa4c2'
                        }}
                    >
                        Hotel Booking & Guest Operations Portal
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '24px'
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setMode('login');
                            setMessage('');
                            setError('');
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: mode === 'login' ? '#f59e0b' : '#172033',
                            color: mode === 'login' ? '#111827' : '#dbeafe',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode('register');
                            setMessage('');
                            setError('');
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: mode === 'register' ? '#f59e0b' : '#172033',
                            color: mode === 'register' ? '#111827' : '#dbeafe',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div style={{ marginBottom: '18px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#dbeafe',
                                    fontWeight: 600
                                }}
                            >
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="Enter your full name"
                                required
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '13px',
                                    borderRadius: '8px',
                                    border: '1px solid #334155',
                                    background: '#0f172a',
                                    color: '#ffffff'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '18px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#dbeafe',
                                fontWeight: 600
                            }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '13px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                background: '#0f172a',
                                color: '#ffffff'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#dbeafe',
                                fontWeight: 600
                            }}
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            minLength={6}
                            required
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '13px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                background: '#0f172a',
                                color: '#ffffff'
                            }}
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#3f1724',
                                border: '1px solid #7f1d1d',
                                color: '#fca5a5'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#06352d',
                                border: '1px solid #065f46',
                                color: '#6ee7b7'
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: 'none',
                            borderRadius: '8px',
                            background: loading ? '#64748b' : '#f59e0b',
                            color: '#111827',
                            fontWeight: 800,
                            fontSize: '15px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading
                            ? 'Please wait...'
                            : mode === 'login'
                                ? 'Login'
                                : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;