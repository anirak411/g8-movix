import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoginView from '../templates/LoginView';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [posterMovie, setPosterMovie] = useState(null);

    const navigate = useNavigate();
    // Destructure the login function from the updated AuthContext
    const { login } = useAuth(); 

    useEffect(() => {
        // ... (Supabase fetchPosterMovie logic remains the same)
        const fetchPosterMovie = async () => {
            try {
                const { data } = await supabase
                    .from('movie')
                    .select('*');

                if (data && data.length > 0) {
                    const featured = data.find(m => m.is_featured === true);
                    setPosterMovie(featured || data[0]);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchPosterMovie();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Destructure ALL fields from the backend response
                // Remember: 'email' is already available from component state.
                const { token, id, isAdmin } = data; 
                
                // 2. CRITICAL FIX: Call the context's login function to save 
                //    the user session and the isAdmin status.
                login(token, email, id, isAdmin);
                
                // 3. Conditional Redirection
                if (isAdmin === true) {
                    // User is an admin, redirect to the admin page
                    navigate('/admin-dashboard'); 
                } else {
                    // User is a normal user, redirect to the normal page
                    navigate('/landing');
                }
                
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
        <LoginView
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            loading={loading}
            posterMovie={posterMovie}
            handleSubmit={handleSubmit}
            navigate={navigate}
        />
    );
};

export default Login;