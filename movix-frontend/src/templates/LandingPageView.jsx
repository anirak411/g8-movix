import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Play, Star, Settings, LogOut, X, Ticket } from 'lucide-react';
import '../css/landingpage.css';

const LandingPageView = ({
                             userEmail,
                             onLogout,
                             isAdmin,
                             navItems = [],
                             activeNav,
                             setActiveNav,
                             searchOpen,
                             setSearchOpen,
                             searchQuery,
                             onSearchChange,
                             userMenuOpen,
                             setUserMenuOpen,
                             featuredMovie,
                             continueWatching = [],
                             nowShowing = [],
                             popular = [],
                             onMovieClick,
                             selectedMovie,
                             onCloseModal,
                             onBookTicket

                         }) => {

    const navigate = useNavigate();
    const [textColor, setTextColor] = useState('white');

    useEffect(() => {
        if (!featuredMovie?.image) return;
        setTextColor('white');
    }, [featuredMovie]);

    const handleSettingsClick = () => {
        setUserMenuOpen(false);
        navigate('/settings');
    };

    const handleAdminDashboardClick = () => {
        setUserMenuOpen(false);
        navigate('/admin-dashboard');
    };

    const clearSearch = () => {
        onSearchChange({ target: { value: '' } });
        setSearchOpen(false);
    };

    // Check if there are any results
    const hasResults = continueWatching.length > 0 || nowShowing.length > 0 || popular.length > 0;

    // Shared shadow style for maximum visibility without backgrounds
    const heavyShadow = { textShadow: '2px 2px 8px rgba(0, 0, 0, 1), 0 0 2px rgba(0,0,0,0.5)' };

    return (
        <div className="app-container">
            {/* --- Navbar --- */}
            <header className="top-nav">
                <div className="nav-left">
                    <img
                        src="/src/assets/covers/logo.png"
                        alt="MOVIX"
                        className="logo-image"
                        style={{ cursor: 'pointer' }}
                    />
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
                    <div className={`search-wrapper ${searchOpen ? 'open' : ''}`}>
                        <Search
                            size={20}
                            className="search-icon"
                            onClick={() => setSearchOpen(!searchOpen)}
                        />
                        {searchOpen && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    className="nav-search-input"
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        className="clear-search-icon"
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="user-menu">
                        <div className="user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {userMenuOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <span className="dropdown-email">{userEmail}</span>
                                </div>

                                {isAdmin && (
                                    <button className="dropdown-item admin-btn" onClick={handleAdminDashboardClick}>
                                        <Settings size={16} /> Admin Dashboard
                                    </button>
                                )}

                                <button className="dropdown-item" onClick={handleSettingsClick}>
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

            {/* Search Results Banner - MOVED INSIDE MAIN CONTENT */}
            <main className={`main-content ${searchQuery ? 'search-active' : ''}`}>
                {searchQuery && (
                    <div className="search-results-banner">
                        <p>
                            Searching for: <strong>"{searchQuery}"</strong>
                        </p>
                        <button onClick={clearSearch} className="clear-filter-btn">
                            <X size={14} /> Clear Search
                        </button>
                    </div>
                )}

                {/* --- Hero Section (hide when searching) --- */}
                {featuredMovie && !searchQuery && (
                    <section className="hero-section" style={{
                        backgroundImage: `url(${featuredMovie.image})`,
                        height: '85vh',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        paddingBottom: '60px'
                    }}>

                        <div className="hero-content" style={{
                            color: textColor,
                            zIndex: 2,
                            paddingLeft: '60px',
                            maxWidth: '800px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <span className="hero-badge" style={{ alignSelf: 'flex-start', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                                FEATURED
                            </span>

                            <h2 className="hero-title" style={{ ...heavyShadow, fontSize: '4.5rem', lineHeight: '1', margin: 0 }}>
                                {featuredMovie.title}
                            </h2>

                            <div className="hero-meta" style={{ ...heavyShadow, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span className="hero-rating" style={{display:'flex', alignItems:'center', gap:'5px', background:'rgba(0,0,0,0.6)', padding:'4px 8px', borderRadius:'4px'}}>
                                    <Star size={18} fill="#fbbf24" stroke="#fbbf24" /> {featuredMovie.rating}
                                </span>
                                <span style={{ fontWeight: 'bold' }}>{featuredMovie.year}</span>
                                <span style={{ fontWeight: 'bold' }}>{featuredMovie.duration}</span>
                                <span className="genre-tag" style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{featuredMovie.genre}</span>
                            </div>

                            <p className="hero-description" style={{
                                fontSize: '1.2rem',
                                lineHeight: '1.6',
                                margin: '10px 0 30px 0',
                                color: '#fff',
                                maxWidth: '700px',
                                fontWeight: '500',
                                ...heavyShadow
                            }}>
                                {featuredMovie.description}
                            </p>

                            <div className="hero-actions">
                                <button className="btn-primary" onClick={() => onBookTicket(featuredMovie)} style={{ boxShadow: '0 4px 15px rgba(250, 204, 21, 0.4)' }}>
                                    <Play size={24} fill="black" /> Watch Now
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <div className="content-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 10 }}>

                    {/* --- No Results Message --- */}
                    {searchQuery && !hasResults && (
                        <div className="no-results">
                            <h3>No movies found for "{searchQuery}"</h3>
                            <p>Try searching with different keywords or browse our collection</p>
                            <button className="btn-primary" onClick={clearSearch}>
                                <X size={16} /> Clear Search
                            </button>
                        </div>
                    )}



                    {/* --- Now Showing --- */}
                    {nowShowing.length > 0 && (
                        <section className="movie-section">
                            <div className="section-header">
                                <h3>Now Showing</h3>
                            </div>
                            <div className="movie-row">
                                {nowShowing.map((movie) => (
                                    <div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)}>
                                        <div className="card-image-wrapper">
                                            <img
                                                src={movie.portraitImage}
                                                alt={movie.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div className="card-rating-badge">
                                                <Star size={10} fill="#fbbf24" stroke="none" /> {movie.rating}
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
                    )}

                    {/* --- Popular --- */}
                    {popular.length > 0 && (
                        <section className="movie-section">
                            <div className="section-header">
                                <h3>Popular This Week</h3>
                            </div>
                            <div className="movie-row">
                                {popular.map((movie) => (
                                    <div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)}>
                                        <div className="card-image-wrapper">
                                            <img src={movie.portraitImage} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div className="card-info">
                                            <p className="card-title">{movie.title}</p>
                                            <span className="card-genre">{movie.genre}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* --- Modal --- */}
            {selectedMovie && (
                <div
                    className="modal-overlay"
                    onClick={onCloseModal}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
                        zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#111', color: 'white', width: '100%', maxWidth: '900px',
                            borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'row',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #333',
                            position: 'relative',
                            height: '650px', // Fixed height for consistent sizing
                            maxHeight: '90vh'
                        }}
                    >
                        <button
                            onClick={onCloseModal}
                            style={{
                                position: 'absolute', top: '15px', right: '15px',
                                background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                                borderRadius: '50%', width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 10,
                                transition: 'background 0.2s'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '40%',
                            minWidth: '300px',
                            backgroundColor: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={selectedMovie.portraitImage || selectedMovie.image}
                                alt={selectedMovie.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover', // Ensures the image fills the container
                                    display: 'block'
                                }}
                            />
                        </div>

                        <div style={{ padding: '40px', width: '60%', overflowY: 'auto', height: '100%' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1' }}>
                                {selectedMovie.title}
                            </h2>
                            <div style={{ display: 'flex', gap: '15px', color: '#9ca3af', fontSize: '0.9rem', marginBottom: '25px', fontWeight: '500' }}>
                                <span>{selectedMovie.year}</span>
                                <span>•</span>
                                <span>{selectedMovie.duration}</span>
                                <span>•</span>
                                <span>{selectedMovie.genre}</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#d1d5db', marginBottom: '20px' }}>
                                {selectedMovie.description}
                            </p>

                            {/* --- DIRECTOR FIELD (Shows if selectedMovie.director is a truthy value) --- */}
                            {selectedMovie.director && (
                                <div style={{ marginBottom: '10px', fontSize: '1rem', color: '#fff' }}>
                                    <strong style={{ color: '#facc15' }}>Director: </strong>
                                    {selectedMovie.director}
                                </div>
                            )}

                            {/* --- CAST FIELD (Shows if selectedMovie.cast exists and has length > 0) --- */}
                            {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                                <div style={{ marginBottom: '30px', fontSize: '1rem', color: '#fff' }}>
                                    <strong style={{ color: '#facc15' }}>Cast: </strong>
                                    {/* Joins the array of names into a comma-separated string */}
                                    {Array.isArray(selectedMovie.cast) ? selectedMovie.cast.join(', ') : selectedMovie.cast}
                                </div>
                            )}

                            <button
                                onClick={() => onBookTicket(selectedMovie)}
                                style={{
                                    backgroundColor: '#facc15', color: 'black', border: 'none',
                                    padding: '16px 32px', fontSize: '1.1rem', fontWeight: '700',
                                    borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <Ticket size={20} />
                                Book Tickets
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageView;