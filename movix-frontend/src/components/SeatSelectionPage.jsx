import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ChevronLeft, CreditCard, X } from 'lucide-react';
import '../css/seatselection.css';
import { useAuth } from '../context/AuthContext';

const PRICE_PER_SEAT = 200;
const BASE_URL = 'http://localhost:8081/api/v1';
const FALLBACK_IMAGE_URL = '/images/default-poster.png';

// =========================================================================
// 1. PAYMENT MODAL COMPONENT (The Centered Pop-up)
// =========================================================================

/**
 * A centered modal component for handling payment details and confirmation.
 */
const PaymentModal = ({ onClose, onConfirm, totalPrice, movieTitle }) => {
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Validation: Ensures all fields meet the minimum expected length.
    const isFormValid =
        cardDetails.number.length === 19 && // 16 digits + 3 spaces
        cardDetails.expiry.length === 5 &&  // MM/YY
        cardDetails.cvc.length >= 3;

    // Auto-format card number with spaces (XXXX XXXX XXXX XXXX)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        if (value.length <= 19) {
            setCardDetails({ ...cardDetails, number: value });
        }
    };

    // Auto-format expiry date (MM/YY) and insert '/'
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\//g, '');

        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }

        if (value.length <= 5) { // Limit length to 5 (MM/YY)
            setCardDetails({ ...cardDetails, expiry: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            setIsProcessing(true);
            // Simulate payment processing delay (1 second)
            setTimeout(() => {
                onConfirm(); // Triggers the parent's final booking logic
            }, 1000);
        } else {
            alert("Please check your payment details.");
        }
    };

    return (
        // The overlay element ensures the full-screen pop-up effect (requires specific CSS)
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Complete Booking: {movieTitle}</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <p className="total-due">
                        Total Amount Due: <span style={{fontWeight: 'bold', color: 'var(--accent)'}}>₱{totalPrice.toFixed(2)}</span>
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><CreditCard size={14} style={{verticalAlign: 'middle', marginRight: '5px'}}/> Card Number</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="0000 0000 0000 0000"
                                value={cardDetails.number}
                                onChange={handleCardNumberChange}
                                inputMode="numeric"
                                disabled={isProcessing}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group" style={{flex: 1}}>
                                <label>Expiry (MM/YY)</label>
                                <input
                                    className="form-input"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                    inputMode="numeric"
                                    maxLength={5}
                                    disabled={isProcessing}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                                <label>CVC</label>
                                <input
                                    className="form-input"
                                    placeholder="123"
                                    type="password"
                                    value={cardDetails.cvc}
                                    onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})}
                                    inputMode="numeric"
                                    maxLength={4}
                                    disabled={isProcessing}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="primary-modal-btn" disabled={!isFormValid || isProcessing}>
                            {isProcessing ? 'Processing Payment...' : `Pay ₱${totalPrice.toFixed(2)} & Confirm Booking`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


// =========================================================================
// 2. SEAT SELECTION PAGE COMPONENT
// =========================================================================

const SeatSelectionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const movie = location.state?.movie || {
        title: 'Unknown Movie',
        portraitImage: FALLBACK_IMAGE_URL,
        image: FALLBACK_IMAGE_URL
    };

    // --- Date Generation Memo ---
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

    // --- State Variables ---
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedCinema, setSelectedCinema] = useState(cinemas[0]);
    const [selectedTime, setSelectedTime] = useState(showTimes[0]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seats, setSeats] = useState(Array(SEAT_ROWS).fill(0).map(() => Array(SEAT_COLS).fill(0)));
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Controls the modal visibility

    // --- Refs for Stability ---
    const selectedSeatsRef = useRef(selectedSeats);

    // Keep the ref updated on every render
    useEffect(() => {
        selectedSeatsRef.current = selectedSeats;
    });

    // --- Seat Fetching Logic ---
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

            const currentSelectedSeats = selectedSeatsRef.current;

            setSeats(prevSeats => {
                const newSeats = prevSeats.map((row, rowIndex) =>
                    row.map((seatStatus, seatIndex) => {
                        const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
                        const isSelected = currentSelectedSeats.includes(seatId);

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

            setSelectedSeats(newlySelectedSeats);

        } catch (error) {
            console.error("Error fetching booked seats:", error);
            alert("Failed to load seat availability. Please check the server status.");
            setSeats(Array(SEAT_ROWS).fill(0).map(() => Array(SEAT_COLS).fill(0)));
        } finally {
            setIsLoadingSeats(false);
        }
    }, [selectedDateIndex, selectedTime, movie.title, dates]);

    useEffect(() => {
        fetchBookedSeats();
    }, [fetchBookedSeats]);

    // --- Seat Interaction Logic ---
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

    // --- Payment Flow Handlers ---

    // 1. Opens the Payment Modal Pop-up
    const handleOpenPayment = () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to proceed.');
            return;
        }

        if (!user || !user.id) {
            alert('Authentication required. Please log in to book seats.');
            navigate('/login');
            return;
        }

        setIsPaymentModalOpen(true);
    };

    // 2. Finalizes Booking (called by PaymentModal after successful simulation)
    const handleFinalizeBooking = async () => {
        setIsPaymentModalOpen(false);

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

            // Mark selected seats (2) as permanently booked (1) in local state
            const newlyBookedSeats = seats.map((row) =>
                row.map((seat) => (seat === 2 ? 1 : seat))
            );

            setSeats(newlyBookedSeats);
            setSelectedSeats([]);

        } catch (err) {
            console.error('Booking failed:', err);

            if (err.response) {
                const message = err.response.data?.message || 'An unexpected error occurred.';
                alert('Booking failed: ' + message);
            } else {
                alert('Could not connect to the booking service. Check your network or server status.');
            }

            // Refetch data after failure to sync with the database
            setTimeout(() => {
                fetchBookedSeats();
            }, 100);
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

                <button className="select-btn" onClick={handleOpenPayment} disabled={selectedSeats.length === 0 || isLoadingSeats}>
                    {selectedSeats.length > 0
                        ? `SELECT (${selectedSeats.length}) | Total: ₱${totalPrice.toFixed(2)}`
                        : 'SELECT SEATS'}
                </button>
            </div>

            {/* --- Render the Payment Modal Pop-up --- */}
            {isPaymentModalOpen && (
                <PaymentModal
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleFinalizeBooking}
                    totalPrice={totalPrice}
                    movieTitle={movie.title}
                />
            )}
        </div>
    );
};

export default SeatSelectionPage;