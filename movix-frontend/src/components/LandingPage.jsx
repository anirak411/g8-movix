import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LandingPageView from '../templates/LandingPageView';

const LandingPage = () => {
    // 1. Get isAdmin from AuthContext
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail') || 'Guest User';

    const [activeNav, setActiveNav] = useState('Movies');
    const [searchOpen, setSearchOpen] = useState(false);    
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const [selectedMovie, setSelectedMovie] = useState(null);
    const [featuredMovie, setFeaturedMovie] = useState(null);

    const [continueWatching, setContinueWatching] = useState([]);
    const [nowShowing, setNowShowing] = useState([]);
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);

    const navItems = ['Movies'];

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getYearFromDate = (dateString) => {
        if (!dateString) return new Date().getFullYear();
        // Handle cases where release_date might be null or invalid
        const date = new Date(dateString);
        return isNaN(date) ? new Date().getFullYear() : date.getFullYear();
    };

    const handleMovieClick = (movie) => setSelectedMovie(movie);
    const handleCloseModal = () => setSelectedMovie(null);
    const handleBookTicket = (movie) => navigate('/seat-selection', { state: { movie } });
    const handleNavigateSettings = () => navigate('/settings');
    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    // NEW FUNCTION: Handles "See All" button clicks
    const handleSeeAllClick = (category) => {
        // Navigates to a new route, passing the category name as state/URL parameter.
        // You will need to create a new component and route for '/category-list/:category'
        navigate(`/category-list/${category}`);
    };

useEffect(() => {
    const fetchMovies = async () => {
        try {
            // Fetch movies from the 'movie' table
            const { data, error } = await supabase.from('movie').select('*');
            if (error) throw error;

            const formattedData = data.map((m) => ({
                id: m.id || m.moviename,
                title: m.moviename,
                description: m.description,
                image: m.poster,
                portraitImage: m.poster_portrait || m.poster,
                rating: m.rating,
                duration: formatDuration(m.duration),
                genre: m.genre,
                year: getYearFromDate(m.release_date),
                progress: Math.floor(Math.random() * 90) + 10, // Mock progress
                is_featured: m.is_featured,
                category: m.category
            }));

            const hero = formattedData.find(m => m.is_featured === true);
            setFeaturedMovie(hero || formattedData[0]);

            // ENHANCED SEARCH LOGIC - searches title, genre, AND description
            let filteredData = formattedData;
            if (searchQuery) {
                const query = searchQuery.toLowerCase().trim();
                filteredData = formattedData.filter(m => {
                    const title = (m.title || '').toLowerCase();
                    const genre = (m.genre || '').toLowerCase();
                    const description = (m.description || '').toLowerCase();
                    
                    // Returns true if query matches title, genre, OR description
                    return title.includes(query) || 
                           genre.includes(query) || 
                           description.includes(query);
                });
            }

            // Filter by category
            setContinueWatching(filteredData.filter(m => m.category === 'continue_watching'));
            setNowShowing(filteredData.filter(m => m.category === 'now_showing'));
            setPopular(filteredData.filter(m => m.category === 'popular'));

            setLoading(false);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setLoading(false);
        }
    };

    fetchMovies();
}, [searchQuery]); // Re-run when searchQuery changes

    if (loading) return <div style={{height:'100vh', background:'#000', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

    return (
        <LandingPageView
            userEmail={userEmail}
            onLogout={logout}
            isAdmin={isAdmin} // <-- NEW: Pass isAdmin to the view component
            navItems={navItems}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
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
            onSeeAllClick={handleSeeAllClick}
        />
    );
};

export default LandingPage;