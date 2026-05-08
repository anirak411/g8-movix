// src/services/AuthService.js

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

// --- Register Function (POST /api/auth/register) ---
export const register = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    // Check for success status (200 OK)
    if (!response.ok) {
        const errorData = await response.text();
        // The backend should return "Error: Email is already in use!" or similar text
        throw new Error(errorData || 'Registration failed');
    }

    return response.text(); // Returns "User registered successfully!"
};

// --- Login Function (POST /api/auth/login) ---
export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Handle failed login (e.g., 401 Unauthorized from the server)
        throw new Error('Login failed. Check your email and password.');
    }

    const data = await response.json();
    
    // CRITICAL: Store the JWT and user info upon successful login
    localStorage.setItem('userToken', data.token); 
    localStorage.setItem('userEmail', data.email);
    
    return data; // Returns the JwtResponse object { token, id, email }
};

// --- Logout Function ---
export const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
};

// --- Get Token Function ---
export const getToken = () => {
    return localStorage.getItem('userToken');
};