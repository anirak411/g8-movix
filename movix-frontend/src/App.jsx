import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import LandingPage from './components/LandingPage.jsx';
import SeatSelectionPage from './components/SeatSelectionPage.jsx';
import Settings from './components/Settings.jsx';
import MovieDetailsPage from './components/MovieDetailsPage';
import AdminMovieManagement from "./templates/AdminMovieManagement"; // <-- NEW: Import Admin Component
// General Protected Route (Requires login)
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Protected Route (Requires login AND admin status)
// NOTE: This relies on your AuthContext providing 'isAdmin' and is a basic client-side check.
const AdminProtectedRoute = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    if (!isAdmin) {
        // Redirect non-admins to the landing page or a 403 page
        return <Navigate to="/landing" replace />;
    }
    return children;
};


function App() {
  const { isLoggedIn } = useAuth();

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-black flex flex-col font-sans">
        <main className="flex flex-col flex-grow w-full bg-black">
          <div className="w-full h-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* User Protected Routes */}
              <Route
                path="/landing"
                element={<ProtectedRoute><LandingPage /></ProtectedRoute>}
              />
              <Route
                path="/seat-selection"
                element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute><Settings /></ProtectedRoute>}
              />
              <Route 
                path="/movie-details" 
                element={<ProtectedRoute><MovieDetailsPage /></ProtectedRoute>} 
              />


              {/* ------------------------------------- */}
              {/* NEW: ADMIN PROTECTED ROUTE */}
              {/* ------------------------------------- */}
              <Route
                path="/admin-dashboard"
                element={<AdminProtectedRoute><AdminMovieManagement /></AdminProtectedRoute>}
              />

              {/* Default/Catch-all Routes */}
              <Route
                path="/"
                element={<Navigate to={isLoggedIn ? "/landing" : "/login"} replace />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;