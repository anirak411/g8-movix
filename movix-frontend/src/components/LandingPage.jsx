import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LandingPageView from '../templates/LandingPageView';

const LandingPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail') || 'Guest User';

    const [activeNav, setActiveNav] = useState('Movies');
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const [selectedMovie, setSelectedMovie] = useState(null);

    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [continueWatching, setContinueWatching] = useState([]);
    const [nowShowing, setNowShowing] = useState([]);
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);

    const navItems = ['Movies', 'TV Shows', 'Events', 'Concerts'];

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const handleMovieClick = (movie) => {
        setSelectedMovie(movie);
    };

    const handleCloseModal = () => {
        setSelectedMovie(null);
    };

    const handleBookTicket = (movie) => {
        navigate('/seat-selection', { state: { movie } });
    };

    const handleNavigateSettings = () => {
        navigate('/settings');
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const { data, error } = await supabase
                    .from('movie')
                    .select('*');

                if (error) throw error;

                const formattedData = data.map((m) => ({
                    id: m.moviename,
                    title: m.moviename,
                    description: m.description,
                    image: m.poster,
                    portraitImage: m.poster_portrait || m.poster,
                    rating: m.rating,
                    duration: formatDuration(m.duration),
                    genre: m.genre,
                    year: '2025',
                    progress: Math.floor(Math.random() * 90) + 10,
                    is_featured: m.is_featured,
                    category: m.category
                }));

                if (formattedData.length > 0) {
                    const hero = formattedData.find(m => m.is_featured === true);
                    setFeaturedMovie(hero || formattedData[0]);

                    setContinueWatching(formattedData.filter(m => m.category === 'continue_watching'));
                    setPopular(formattedData.filter(m => m.category === 'popular'));
                    setNowShowing(formattedData.filter(m => m.category === 'now_showing'));
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <div className="app-container" style={{color:'white', padding:'20px'}}>Loading...</div>;

    return (
        <LandingPageView
            userEmail={userEmail}
            onLogout={logout}
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            userMenuOpen={userMenuOpen}
            setUserMenuOpen={setUserMenuOpen}
            featuredMovie={featuredMovie}
            continueWatching={continueWatching}
            nowShowing={nowShowing}
            popular={popular}
            onMovieClick={handleMovieClick}
            onNavigateSettings={handleNavigateSettings}
            selectedMovie={selectedMovie}
            onCloseModal={handleCloseModal}
            onBookTicket={handleBookTicket}
        />
    );
};

export default LandingPage;