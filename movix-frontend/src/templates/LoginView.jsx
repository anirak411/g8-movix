import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../css/global.css';

const LoginView = ({
                       email,
                       setEmail,
                       password,
                       setPassword,
                       showPassword,
                       setShowPassword,
                       error,
                       loading,
                       posterMovie,
                       handleSubmit,
                       navigate
                   }) => {
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-poster">
                    {posterMovie ? (
                        <>
                            <img src={posterMovie.poster} alt={posterMovie.moviename} />
                            <div className="poster-overlay">
                                <div className="poster-content">
                                    <span className="poster-badge">Now Showing</span>
                                    <h2>{posterMovie.moviename}</h2>
                                    <p>{posterMovie.description}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{width: '100%', height: '100%', backgroundColor: '#000'}}></div>
                    )}
                </div>

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

export default LoginView;