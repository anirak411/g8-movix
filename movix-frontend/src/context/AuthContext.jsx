import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // The user state now includes the 'id' retrieved from local storage
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('userToken');
        const email = localStorage.getItem('userEmail');
        const id = localStorage.getItem('userId'); // <<<--- NEW: Get the ID
        
        // Return null unless ALL three essential parts are present
        return token && email && id ? { token, email, id } : null; 
    });

    // The login function now takes 'id' and stores it
    const login = (token, email, id) => { // <<<--- CHANGED: Accepts ID
        localStorage.setItem('userToken', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', id); // <<<--- NEW: Store the ID
        
        setUser({ token, email, id }); // <<<--- CHANGED: Store ID in state
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId'); // <<<--- NEW: Remove the ID
        setUser(null);
        navigate('/login', { replace: true });
    };

    const value = useMemo(() => ({
        user,
        login,
        logout,
        isLoggedIn: !!user
    }), [user]);

    // Sync with localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('userToken');
            const email = localStorage.getItem('userEmail');
            const id = localStorage.getItem('userId'); // <<<--- NEW: Get the ID
            setUser(token && email && id ? { token, email, id } : null); // <<<--- Check and set ID
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