import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Save, PlusCircle, XCircle } from 'lucide-react';
import '../css/admin.css';

const initialMovieState = {
    moviename: '',
    description: '',
    rating: 0,
    duration: 0,
    genre: '',
    poster: '',
    poster_portrait: '',
    category: 'now_showing',
    is_featured: false,
    director: '',
    cast_members: '',
    reviews: '',
};

const AdminMovieManagement = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMovie, setCurrentMovie] = useState(initialMovieState);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('movie')
                .select('*')
                .order('moviename', { ascending: false });

            if (error) throw error;

            // No more JSON formatting
            setMovies(data);
        } catch (err) {
            console.error('Error fetching movies:', err.message);
            setError('Failed to load movies.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMovie = (movie) => {
        setCurrentMovie(movie);
        setIsEditing(true);
        setIsModalOpen(true);
        setError('');
    };

    const handleAddMovie = () => {
        setCurrentMovie(initialMovieState);
        setIsEditing(false);
        setIsModalOpen(true);
        setError('');
    };

    const handleSaveMovie = async (e) => {
        e.preventDefault();
        setError('');

        let movieToSave = { ...currentMovie };

        // Ensure numeric fields are correct
        movieToSave.rating = parseFloat(movieToSave.rating);
        movieToSave.duration = parseInt(movieToSave.duration, 10);

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('movie')
                    .update(movieToSave)
                    .eq('moviename', movieToSave.moviename);

                if (error) throw error;
            } else {
                const { id, ...newMovie } = movieToSave;
                const { error } = await supabase
                    .from('movie')
                    .insert([newMovie]);

                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchMovies();
        } catch (err) {
            setError(`Failed to save movie: ${err.message}`);
        }
    };

    const handleDeleteMovie = async (moviename) => {
        if (!window.confirm(`Delete movie: ${moviename}?`)) return;

        try {
            const { error } = await supabase
                .from('movie')
                .delete()
                .eq('moviename', moviename);

            if (error) throw error;

            fetchMovies();
        } catch (err) {
            console.error('Delete error:', err.message);
            alert('Failed to delete movie.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentMovie(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    if (loading) return <div className="admin-loading">Loading Movie Data...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h2>🎬 Movie Management Dashboard</h2>
                <div className="admin-actions">
                    <button className="btn-primary" onClick={handleAddMovie}>
                        <PlusCircle size={20} /> Add New Movie
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/landing')}>
                        Back to Landing Page
                    </button>
                </div>
            </header>

            <div className="movie-list-table">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Director</th>
                            <th>Rating</th>
                            <th>Genre</th>
                            <th>Category</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map((movie) => (
                            <tr key={movie.moviename}>
                                <td>{movie.moviename}</td>
                                <td>{movie.director || 'N/A'}</td>
                                <td>{movie.rating}</td>
                                <td>{movie.genre}</td>
                                <td>{movie.category}</td>
                                <td>{movie.is_featured ? 'Yes' : 'No'}</td>
                                <td>
                                    <button className="icon-btn edit-btn" onClick={() => handleEditMovie(movie)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="icon-btn delete-btn" onClick={() => handleDeleteMovie(movie.moviename)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <form className="admin-modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveMovie}>
                        <h3>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h3>
                        {error && <p className="error-message">{error}</p>}

                        <label>
                            Title:
                            <input name="moviename" value={currentMovie.moviename} onChange={handleChange} required />
                        </label>

                        <label>
                            Description:
                            <textarea name="description" value={currentMovie.description} onChange={handleChange} required />
                        </label>

                        <label>
                            Rating (0–10):
                            <input name="rating" type="number" step="0.1" min="0" max="10" value={currentMovie.rating} onChange={handleChange} required />
                        </label>

                        <label>
                            Duration (minutes):
                            <input name="duration" type="number" min="1" value={currentMovie.duration} onChange={handleChange} required />
                        </label>

                        <label>
                            Genre:
                            <input name="genre" value={currentMovie.genre} onChange={handleChange} />
                        </label>

                        <label>
                            Director:
                            <input name="director" value={currentMovie.director} onChange={handleChange} />
                        </label>

                        <label>
                            Cast Members (Text):
                            <textarea name="cast_members" value={currentMovie.cast_members} onChange={handleChange} rows="4" />
                        </label>

                        <label>
                            Reviews (Text):
                            <textarea name="reviews" value={currentMovie.reviews} onChange={handleChange} rows="4" />
                        </label>

                        <label>
                            Hero Banner Image URL:
                            <input name="poster" value={currentMovie.poster} onChange={handleChange} required />
                        </label>

                        <label>
                            Portrait Card Image URL:
                            <input name="poster_portrait" value={currentMovie.poster_portrait} onChange={handleChange} required />
                        </label>

                        <label>
                            Category:
                            <select name="category" value={currentMovie.category} onChange={handleChange}>
                                <option value="now_showing">Now Showing</option>
                                <option value="popular">Popular</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="continue_watching">Continue Watching (Mock)</option>
                            </select>
                        </label>

                        <label className="checkbox-label">
                            <input name="is_featured" type="checkbox" checked={currentMovie.is_featured} onChange={handleChange} />
                            Set as Featured Movie
                        </label>

                        <div className="modal-actions">
                            <button type="submit" className="btn-save">
                                <Save size={20} /> {isEditing ? 'Update Movie' : 'Create Movie'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                <XCircle size={20} /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminMovieManagement;

