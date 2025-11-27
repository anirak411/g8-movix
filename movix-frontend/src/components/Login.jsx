import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import '../css/global.css';
import wicked from '../assets/movies/wicked.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // *** 🎯 THIS IS THE CRITICAL FIX 🎯 ***
                const { token, id } = data; 
                // We use the email state, and extract token and ID from response data.
                
                login(token, email, id); // <-- NOW CORRECTLY PASSING THE ID
                // ****************************************
                
                navigate('/landing');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Left Side - Movie Poster */}
                <div className="auth-poster">
                    <img src={wicked} alt="Featured Movie" />
                    <div className="poster-overlay">
                        <div className="poster-content">
                            <span className="poster-badge">Now Showing</span>
                            <h2>Wicked for Good</h2>
                            <p>Elphaba, the future Wicked Witch of the West and her relationship with Glinda, the Good Witch of the North. The second of a two-part feature film adaptation of the Broadway musical.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <h1>Welcome back,</h1>
                        <p className="auth-subtitle">Sign in to your account</p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Signing in...' : 'Login'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account? <a onClick={() => navigate('/register')}>Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;