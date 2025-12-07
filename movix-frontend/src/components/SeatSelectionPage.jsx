import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ChevronLeft } from 'lucide-react';
import '../css/seatselection.css';
import { useAuth } from '../context/AuthContext';

const PRICE_PER_SEAT = 200;
const BASE_URL = 'http://localhost:8081/api/v1';
const FALLBACK_IMAGE_URL = '/images/default-poster.png';

const SeatSelectionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const movie = location.state?.movie || {
        title: 'Unknown Movie',
        portraitImage: FALLBACK_IMAGE_URL,
        image: FALLBACK_IMAGE_URL
    };

    const dates = useMemo(() => {
        const dateList = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const year = date.getFullYear();
            const monthNum = String(date.getMonth() + 1).padStart(2, '0');
            const dayNum = String(date.getDate()).padStart(2, '0');
            const fullDateStr = `${year}-${monthNum}-${dayNum}`;

            dateList.push({
                day: date.getDate(),
                month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
                fullDate: fullDateStr
            });
        }
        return dateList;
    }, []);

    const cinemas = ['CINEMA1', 'CINEMA2', 'CINEMA3'];
    const showTimes = ['10:00', '13:00', '16:00', '19:00'];
    const SEAT_ROWS = 6;
    const SEAT_COLS = 15;

    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedCinema, setSelectedCinema] = useState(cinemas[0]);
    const [selectedTime, setSelectedTime] = useState(showTimes[0]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seats, setSeats] = useState(Array(SEAT_ROWS).fill(0).map(() => Array(SEAT_COLS).fill(0)));
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);

    // FIX APPLIED HERE: Removed 'seats' and 'selectedSeats' from the dependency array
    // to prevent the infinite loop on state update, only relying on input changes.
    const fetchBookedSeats = useCallback(async () => {
        setIsLoadingSeats(true);
        const currentDateStr = dates[selectedDateIndex]?.fullDate;

        if (!currentDateStr) {
            setIsLoadingSeats(false);
            return;
        }

        try {
            const response = await axios.get(`${BASE_URL}/booked-seats`, {
                params: {
                    moviename: movie.title,
                    showDate: currentDateStr,
                    showTime: selectedTime
                },
            });

            const bookedSeats = response.data;
            let newlySelectedSeats = [];

            // IMPORTANT: Use the current state values inside the function,
            // but rely on functional updates (like setState) if needed for immediate consistency.
            // When setting newSeats, we check against the current selectedSeats in scope.

            setSeats(prevSeats => {
                const newSeats = prevSeats.map((row, rowIndex) =>
                    row.map((seatStatus, seatIndex) => {
                        const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
                        const isSelected = selectedSeats.includes(seatId);

                        if (bookedSeats.includes(seatId)) {
                            return 1; // Mark as booked (1)
                        }

                        if (isSelected) {
                            newlySelectedSeats.push(seatId);
                            return 2; // Mark as selected (2)
                        }

                        return 0; // Mark as available (0)
                    })
                );
                return newSeats;
            });

            // Sync state: Keep only seats that are still available
            setSelectedSeats(newlySelectedSeats);

        } catch (error) {
            console.error("Error fetching booked seats:", error);
            alert("Failed to load seat availability. Please check the server status.");
            setSeats(Array(SEAT_ROWS).fill(0).map(() => Array(SEAT_COLS).fill(0)));
        } finally {
            setIsLoadingSeats(false);
        }
    }, [selectedDateIndex, selectedTime, movie.title, dates]); // Dependency array simplified


    useEffect(() => {
        // This runs only when fetchBookedSeats is recreated (i.e., when date/time/movie changes)
        fetchBookedSeats();
    }, [fetchBookedSeats]);

    const handleSeatClick = (rowIndex, seatIndex) => {
        if (isLoadingSeats || seats[rowIndex][seatIndex] === 1) return;

        const newSeats = seats.map(row => [...row]);
        const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;

        let newSelectedSeats = [...selectedSeats];

        if (newSeats[rowIndex][seatIndex] === 2) {
            newSeats[rowIndex][seatIndex] = 0;
            newSelectedSeats = newSelectedSeats.filter(s => s !== seatId);
        } else {
            newSeats[rowIndex][seatIndex] = 2;
            newSelectedSeats = [...newSelectedSeats, seatId];
        }

        setSeats(newSeats);
        setSelectedSeats(newSelectedSeats);
    };

    const getSeatClass = (status) => {
        switch (status) {
            case 1: return 'seat booked';
            case 2: return 'seat selected';
            default: return 'seat available';
        }
    };

    const handleSelect = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to proceed.');
            return;
        }

        if (!user || !user.id) {
            alert('Authentication required. Please log in to book seats.');
            navigate('/login');
            return;
        }

        const payload = {
            moviename: movie.title,
            userid: String(user.id),
            show_date: dates[selectedDateIndex].fullDate,
            show_time: selectedTime,
            seats: selectedSeats,
            total_price: selectedSeats.length * PRICE_PER_SEAT
        };

        try {
            await axios.post(`${BASE_URL}/book-ticket`, payload);

            alert(`Booking successful! Seats: ${selectedSeats.join(', ')}. Total: ₱${payload.total_price}`);

            const newlyBookedSeats = seats.map((row) =>
                row.map((seat) => (seat === 2 ? 1 : seat))
            );

            setSeats(newlyBookedSeats);
            setSelectedSeats([]);

        } catch (err) {
            console.error('Booking failed:', err);

            if (err.response) {
                const status = err.response.status;
                const message = err.response.data || 'An unknown error occurred.';

                if (status === 409) {
                    alert('Booking Conflict: ' + message);
                } else if (status === 404) {
                    alert('Booking failed: User not found or invalid endpoint.');
                } else if (status >= 500) {
                    alert('Booking failed due to a critical server error. Please try again later.');
                } else {
                    alert('Booking failed: ' + message);
                }
            } else {
                alert('Could not connect to the booking service. Check your network or server status.');
            }

            fetchBookedSeats();
        }
    };

    const totalPrice = selectedSeats.length * PRICE_PER_SEAT;

    return (
        <div className="seat-page">
            <div className="seat-poster">
                <button className="back-btn" onClick={() => navigate('/landing')}>
                    <ChevronLeft size={24} />
                </button>
                <img
                    src={movie.portraitImage || movie.image || FALLBACK_IMAGE_URL}
                    alt={movie.title}
                />
                <div className="poster-gradient"></div>

                <div className="cinema-info">
                    <MapPin size={18} />
                    <div>
                        <p className="cinema-name">Movix Cinema</p>
                        <p className="cinema-address">123 Main St, Your City</p>
                    </div>
                </div>
            </div>

            <div className="seat-selection">
                <h1>MOVIX SEAT SELECTION</h1>

                <div className="movie-select">
                    <label>Choose your movie</label>
                    <div className="movie-dropdown">
                        {movie.title} ({new Date().getFullYear()})
                    </div>
                </div>

                <div className="date-picker">
                    {dates.map((date, index) => (
                        <button
                            key={index}
                            className={`date-btn ${selectedDateIndex === index ? 'active' : ''}`}
                            onClick={() => setSelectedDateIndex(index)}
                        >
                            <span className="date-day">{date.day}</span>
                            <span className="date-month">{date.month}</span>
                        </button>
                    ))}
                </div>

                <div className="cinema-select">
                    {cinemas.map((cinema) => (
                        <button
                            key={cinema}
                            className={`cinema-btn ${selectedCinema === cinema ? 'active' : ''}`}
                            onClick={() => setSelectedCinema(cinema)}
                        >
                            {cinema}
                        </button>
                    ))}
                </div>

                <div className="time-select">
                    {showTimes.map(time => (
                        <button
                            key={time}
                            className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                            onClick={() => setSelectedTime(time)}
                        >
                            {time}
                        </button>
                    ))}
                </div>

                <div className="seat-section">
                    <h3>Choose your seats</h3>
                    <div className="screen">SCREEN</div>
                    <div className="seat-grid">
                        {isLoadingSeats ? (
                            <div className="loading-message">Loading seat availability...</div>
                        ) : (
                            seats.map((row, rowIndex) => (
                                <div key={rowIndex} className="seat-row">
                                    <span className="row-label">{String.fromCharCode(65 + rowIndex)}</span>
                                    <div className="seats-container">
                                        {row.map((seat, seatIndex) => (
                                            <div
                                                key={seatIndex}
                                                className={getSeatClass(seat)}
                                                onClick={() => handleSeatClick(rowIndex, seatIndex)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="seat-legend">
                        <div className="legend-item">
                            <div className="seat available"></div>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat booked"></div>
                            <span>Booked</span>
                        </div>
                        <div className="legend-item">
                            <div className="seat selected"></div>
                            <span>Your Seat</span>
                        </div>
                    </div>
                </div>

                <button className="select-btn" onClick={handleSelect} disabled={selectedSeats.length === 0 || isLoadingSeats}>
                    {selectedSeats.length > 0
                        ? `SELECT (${selectedSeats.length}) | Total: ₱${totalPrice.toFixed(2)}`
                        : 'SELECT SEATS'}
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;