import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// The supabase import is no longer needed in this optimized version
// import { supabase } from '../supabaseClient'; 

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // 1. Initialize state by checking local storage for all fields, including isAdmin
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('userToken');
        const email = localStorage.getItem('userEmail');
        const id = localStorage.getItem('userId');
        const isAdmin = localStorage.getItem('isAdmin') === 'true'; // <<<--- Load isAdmin

        // Return the full user object with isAdmin status
        return token && email && id
            ? { token, email, id, isAdmin } 
            : null;
    });

    // -------------------------------------------------------------
    // Core Functions
    // -------------------------------------------------------------
    // 2. CRITICAL CHANGE: login function now accepts isAdmin and is NOT async
    const login = (token, email, id, isAdmin) => { // <<<--- CHANGED: ACCEPTS isAdmin
        localStorage.setItem('userToken', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', id);
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false'); // <<<--- NEW: Store isAdmin

        // Set state immediately with all data
        setUser({ token, email, id, isAdmin }); 
    };

    const logout = () => {
        // Clear all session data
        localStorage.clear(); 
        setUser(null);
        navigate('/login', { replace: true });
    };

    // -------------------------------------------------------------
    // Exports (useMemo)
    // -------------------------------------------------------------
    const value = useMemo(() => ({
        user,
        login, // <<<--- This is the function Login.jsx will call
        logout,
        isLoggedIn: !!user,
        // CRITICAL: Export isAdmin status for protection checks
        isAdmin: user?.isAdmin || false 
    }), [user]);

    // -------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------

    // Sync with localStorage (handles other tabs/windows)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('userToken');
            const email = localStorage.getItem('userEmail');
            const id = localStorage.getItem('userId');
            const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
            
            setUser(token && email && id ? { token, email, id, isAdmin } : null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};