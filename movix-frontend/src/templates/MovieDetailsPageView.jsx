import React from 'react';
import { User, Home, Film, ChevronLeft } from 'lucide-react'; // Added ChevronLeft
import '../css/moviedetails.css';

const MovieDetailsPageView = ({
                                  movie,
                                  loading,
                                  onNavigateHome,
                                  onBack, // Receive the new prop
                                  onBuyTickets
                              }) => {
    if (loading) {
        return <div className="movie-details-page" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Loading...</div>;
    }

    if (!movie) {
        return <div className="movie-details-page">Movie not found.</div>;
    }

    return (
        <div className="movie-details-page">
            <header className="details-header">
                <div className="header-left">
                    {/* --- NEW: BACK BUTTON --- */}
                    <button className="header-icon" onClick={onBack} style={{ marginRight: '10px' }}>
                        <ChevronLeft size={24} />
                    </button>

                    <button className="header-icon" onClick={onNavigateHome}>
                        <Home size={24} />
                    </button>
                </div>
                <h1 className="header-title">
                    NOW SHOWING <Film size={28} />
                </h1>
                <div className="header-right">
                    <button className="header-icon" onClick={onNavigateHome}>
                        <User size={24} />
                    </button>
                </div>
            </header>

            <main className="details-content">
                <div className="details-poster">
                    <img
                        src={movie.image}
                        alt={movie.title}
                        style={{
                            width: '100%',
                            height: 'auto',
                            aspectRatio: '2/3',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>

                <div className="details-info">
                    <h2 className="movie-title">
                        {movie.title.toUpperCase()}
                        <span className="director" style={{ display: 'block', fontSize: '1rem', marginTop: '10px', color: '#888', fontWeight: '400' }}>
                            directed by {movie.director.toUpperCase()}
                        </span>
                    </h2>

                    <p className="movie-description">{movie.description}</p>

                    <div className="cast-section">
                        <h3>CAST</h3>
                        <div className="cast-list">
                            {movie.cast.map((member, index) => (
                                <p key={index}>
                                    <strong>{member.actor}</strong> as {member.role}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="details-reviews">
                    <h3>Reviews</h3>
                    {movie.reviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <p className="review-text">"{review.text}"</p>
                            <p className="review-author">-{review.reviewer}</p>
                        </div>
                    ))}

                    <button className="buy-tickets-btn" onClick={onBuyTickets}>
                        Buy Tickets
                    </button>
                </div>
            </main>
        </div>
    );
};

export default MovieDetailsPageView;