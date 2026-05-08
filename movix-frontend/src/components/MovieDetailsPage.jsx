import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MovieDetailsPageView from '../templates/MovieDetailsPageView';

const MovieDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [movieDetails, setMovieDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const initialMovie = location.state?.movie;

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!initialMovie) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('movie')
                    .select('*')
                    .eq('moviename', initialMovie.title || initialMovie.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setMovieDetails({
                        id: data.id,
                        title: data.moviename,
                        image: data.poster_portrait || data.poster || 'https://via.placeholder.com/300x450',
                        description: data.description || 'No description available.',
                        rating: data.rating,
                        genre: data.genre,
                        director: data.director || 'Unknown Director',
                        cast: data.cast_members || [],
                        reviews: data.reviews || []
                    });
                }
            } catch (error) {
                console.error(error);
                setMovieDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [initialMovie]);

    const handleNavigateHome = () => {
        navigate('/landing');
    };

    const handleBack = () => {
        navigate(-1); // this goes back to exactly where you were in history
    };

    const handleBuyTickets = () => {
        if (movieDetails) {
            navigate('/seat-selection', { state: { movie: movieDetails } });
        }
    };

    return (
        <MovieDetailsPageView
            movie={movieDetails}
            loading={loading}
            onNavigateHome={handleNavigateHome}
            onBack={handleBack}  // Passed the new handler here
            onBuyTickets={handleBuyTickets}
        />
    );
};

export default MovieDetailsPage;