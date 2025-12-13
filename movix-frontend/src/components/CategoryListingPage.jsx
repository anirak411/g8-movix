// src/components/CategoryListingPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../css/landingpage.css';

// Helper function to format duration (copied for completeness)
const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

// Function to format the category slug for the display title
const formatCategoryTitle = (categorySlug) => {
    return categorySlug
        ? categorySlug.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'All Movies';
};

const CategoryListingPage = () => {
    const { category } = useParams(); // Gets the slug from the URL (e.g., 'now_showing')
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Calculate formatted title once per render/category change
    const formattedCategory = formatCategoryTitle(category);

    useEffect(() => {

        // Define the inner fetching logic
        const fetchMoviesByCategory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch movies and FILTER DIRECTLY by the URL category slug
                // This is the most reliable, non-hardcoded way to get category-specific data.
                const { data, error } = await supabase
                    .from('movie')
                    .select('*')
                    .eq('category', category) // <--- CRITICAL FILTER: ONLY fetch movies that match the URL category
                    .order('rating', { ascending: false });

                if (error) throw error;

                // Format the data for display
                const formattedData = data.map((m) => ({
                    id: m.id || m.moviename,
                    title: m.moviename,
                    genre: m.genre,
                    portraitImage: m.poster_portrait || m.poster,
                    rating: m.rating,
                    duration: formatDuration(m.duration),
                }));

                setMovies(formattedData);

            } catch (err) {
                console.error(`Error fetching movies for category ${category}:`, err);
                setError(`Failed to load movie list for ${formattedCategory}.`);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchMoviesByCategory();
        }
        // CRITICAL DEPENDENCY: Ensures data is refetched ONLY when the URL category changes
    }, [category]);

    if (loading) {
        return <div className="app-container" style={{padding: '3rem', color: 'var(--accent)', textAlign: 'center'}}>Loading {formattedCategory}...</div>;
    }

    return (
        <div className="app-container">
            <main className="main-content" style={{ paddingTop: '2rem' }}>

                {/* Header and Back Button */}
                <div className="section-header" style={{ marginBottom: '3rem', position: 'relative', display: 'flex', justifyContent: 'center' }}>

                    {/* Back button positioning */}
                    <button
                        onClick={() => navigate('/landing')}
                        className="btn-secondary"
                        style={{
                            position: 'absolute',
                            left: '3rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '0.6rem 1rem',
                            fontSize: '0.95rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)'
                        }}
                    >
                        <ArrowLeft size={16} style={{marginRight: '0.5rem'}} /> Back
                    </button>

                    <h1 style={{
                        color: 'var(--accent)',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        margin: '0',
                        textAlign: 'center'
                    }}>
                        {formattedCategory}
                    </h1>
                </div>

                {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                {movies.length === 0 && !error && (
                    <div className="no-results" style={{paddingTop: '0'}}>
                        <h3>No movies currently listed in the "{formattedCategory}" category.</h3>
                    </div>
                )}

                {/* Movie Grid/List Display */}
                <div className="movie-grid">
                    {movies.map((movie) => (
                        <div
                            key={movie.id}
                            className="movie-card"
                            onClick={() => navigate(`/movie-details/${movie.id}`)}
                            style={{ transform: 'none' }}
                        >
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

            </main>
        </div>
    );
};

export default CategoryListingPage;