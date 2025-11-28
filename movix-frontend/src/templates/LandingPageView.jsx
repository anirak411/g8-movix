import React, { useState, useEffect } from 'react';
import { Search, Bell, Play, Star, Settings, LogOut } from 'lucide-react';
import '../css/landingpage.css';

const LandingPageView = ({
                             userEmail,
                             onLogout,
                             navItems,
                             activeNav,
                             setActiveNav,
                             searchOpen,
                             setSearchOpen,
                             userMenuOpen,
                             setUserMenuOpen,
                             featuredMovie,
                             continueWatching,
                             nowShowing,
                             popular,
                             onMovieClick,
                             onNavigateSettings,
                             selectedMovie,
                             onCloseModal,
                             onBookTicket
                         }) => {

    const [textColor, setTextColor] = useState('white');

    useEffect(() => {
        if (!featuredMovie?.image) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = featuredMovie.image;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1;
            canvas.height = 1;

            ctx.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            setTextColor(brightness > 150 ? 'black' : 'white');
        };
    }, [featuredMovie]);

    return (
        <div className="app-container">
            <header className="top-nav">
                <div className="nav-left">
                    <h1 className="logo">MOVIX</h1>
                    <nav className="main-nav">
                        {navItems.map((item) => (
                            <button
                                key={item}
                                className={`nav-item ${activeNav === item ? 'active' : ''}`}
                                onClick={() => setActiveNav(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
                        <Search size={20} />
                    </button>
                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>
                    <div className="user-menu">
                        <div className="user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        {userMenuOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <span className="dropdown-email">{userEmail}</span>
                                </div>
                                <button className="dropdown-item" onClick={onNavigateSettings}>
                                    <Settings size={16} /> Settings
                                </button>
                                <button className="dropdown-item logout" onClick={onLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {searchOpen && (
                <div className="search-bar-container">
                    <input type="text" placeholder="Search movies, shows, events..." className="search-input" />
                </div>
            )}

            <main className="main-content">
                {featuredMovie && (
                    <section className="hero-section" style={{
                        position: 'relative',
                        height: '100vh',
                        width: '100vw',
                        marginLeft: 'calc(-50vw + 50%)',
                        marginRight: 'calc(-50vw + 50%)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}>

                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, width: '100%', height: '100%',
                            backgroundImage: `url(${featuredMovie.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            zIndex: 1
                        }} />

                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, width: '100%', height: '100%',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)',
                            zIndex: 2
                        }} />

                        <div className="hero-content" style={{
                            position: 'relative',
                            zIndex: 10,
                            width: '100%',
                            maxWidth: '1400px',
                            margin: '0 auto',
                            padding: '0 80px 80px 80px',
                            color: textColor
                        }}>
                            <span className="hero-badge" style={{
                                backgroundColor: '#fbbf24',
                                color: 'black',
                                padding: '6px 16px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                marginBottom: '20px',
                                display: 'inline-block'
                            }}>
                                FEATURED
                            </span>
                            <h2 className="hero-title" style={{
                                fontSize: '5rem',
                                lineHeight: '1',
                                marginBottom: '20px',
                                fontWeight: '800',
                                color: textColor,
                                textShadow: textColor === 'white' ? '0 4px 20px rgba(0,0,0,0.8)' : 'none'
                            }}>
                                {featuredMovie.title}
                            </h2>
                            <div className="hero-meta" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                marginBottom: '25px',
                                fontSize: '1.2rem',
                                color: textColor,
                                textShadow: textColor === 'white' ? '0 2px 10px rgba(0,0,0,0.8)' : 'none'
                            }}>
                                <span className="hero-rating" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontWeight:'bold' }}>
                                    <Star size={20} fill="#fbbf24" stroke="#fbbf24" /> {featuredMovie.rating}
                                </span>
                                <span>{featuredMovie.year}</span>
                                <span>{featuredMovie.duration}</span>
                                <span style={{
                                    border: `1px solid ${textColor === 'white' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`,
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    backgroundColor: textColor === 'white' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'
                                }}>
                                    {featuredMovie.genre}
                                </span>
                            </div>
                            <p className="hero-description" style={{
                                fontSize: '1.25rem',
                                lineHeight: '1.6',
                                marginBottom: '30px',
                                color: textColor,
                                maxWidth: '600px',
                                textShadow: textColor === 'white' ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
                            }}>
                                {featuredMovie.description}
                            </p>
                            <div className="hero-actions" style={{ display: 'flex', gap: '20px' }}>
                                <button className="btn-primary" onClick={() => onMovieClick(featuredMovie)} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '16px 40px', backgroundColor: '#fbbf24',
                                    color: 'black', border: 'none', borderRadius: '12px',
                                    fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer'
                                }}>
                                    <Play size={24} fill="black" /> Watch Now
                                </button>
                                <button className="btn-secondary" style={{
                                    padding: '16px 40px', backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '12px',
                                    fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    + Add to List
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>

                    <section className="movie-section" style={{ position: 'relative', zIndex: 10, marginTop: '40px' }}>
                        <div className="section-header">
                            <h3>Continue Watching</h3>
                            <button className="see-all">See all →</button>
                        </div>
                        <div className="movie-row continue-row">
                            {continueWatching.map((movie) => (
                                <div key={movie.id} className="continue-card" onClick={() => onMovieClick(movie)}>
                                    <div className="continue-image">
                                        <img src={movie.image} alt={movie.title} />
                                        <div className="play-overlay">
                                            <Play size={32} fill="white" />
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${movie.progress}%` }}></div>
                                    </div>
                                    <div className="continue-info">
                                        <p className="continue-title">{movie.title}</p>
                                        <span className="continue-duration">{movie.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="movie-section">
                        <div className="section-header">
                            <h3>Now Showing</h3>
                            <button className="see-all">See all →</button>
                        </div>
                        <div className="movie-row">
                            {nowShowing.map((movie) => (
                                <div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)}>
                                    <div className="card-image" style={{ aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden' }}>
                                        <img
                                            src={movie.portraitImage}
                                            alt={movie.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="card-overlay">
                                            <Play size={40} fill="white" />
                                        </div>
                                        <div className="card-rating">
                                            <Star size={12} fill="#fbbf24" stroke="#fbbf24" /> {movie.rating}
                                        </div>
                                    </div>
                                    <div className="card-info">
                                        <p className="card-title">{movie.title}</p>
                                        <span className="card-genre">{movie.genre}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="movie-section">
                        <div className="section-header">
                            <h3>Popular This Week</h3>
                            <button className="see-all">See all →</button>
                        </div>
                        <div className="movie-row">
                            {popular.map((movie) => (
                                <div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)}>
                                    <div className="card-image" style={{ aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden' }}>
                                        <img
                                            src={movie.portraitImage}
                                            alt={movie.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="card-overlay">
                                            <Play size={40} fill="white" />
                                        </div>
                                        <div className="card-rating">
                                            <Star size={12} fill="#fbbf24" stroke="#fbbf24" /> {movie.rating}
                                        </div>
                                    </div>
                                    <div className="card-info">
                                        <p className="card-title">{movie.title}</p>
                                        <span className="card-genre">{movie.genre}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {selectedMovie && (
                <div className="modal-overlay" onClick={onCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={onCloseModal}>&times;</button>
                        <div className="modal-body">
                            <img
                                src={selectedMovie.portraitImage || selectedMovie.image}
                                alt={selectedMovie.title}
                                className="modal-img"
                            />
                            <div className="modal-info">
                                <h2>{selectedMovie.title}</h2>
                                <p className="modal-meta">{selectedMovie.year} • {selectedMovie.duration} • {selectedMovie.genre}</p>
                                <p className="modal-desc">{selectedMovie.description}</p>
                                <button
                                    className="book-now-btn"
                                    onClick={() => onBookTicket(selectedMovie)}
                                >
                                    Book Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageView;