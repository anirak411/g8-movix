import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, ChevronLeft } from 'lucide-react';
import '../css/seatselection.css';
import { useAuth } from '../context/AuthContext'; 

const SeatSelectionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth(); // get logged-in user info. Now 'user' should have the 'id' property.
    const movie = location.state?.movie || { title: 'Unknown Movie', image: '' };

    const dates = [
        { day: 9, month: 'NOV', fullDate: '2025-11-09' },
        { day: 10, month: 'NOV', fullDate: '2025-11-10' },
        { day: 11, month: 'NOV', fullDate: '2025-11-11' },
        { day: 12, month: 'NOV', fullDate: '2025-11-12' },
        { day: 13, month: 'NOV', fullDate: '2025-11-13' },
        { day: 14, month: 'NOV', fullDate: '2025-11-14' },
    ];

    const cinemas = ['CINEMA1', 'CINEMA2', 'CINEMA3'];
    const showTimes = ['10:00', '13:00', '16:00', '19:00'];

    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedCinema, setSelectedCinema] = useState(cinemas[0]);
    const [selectedTime, setSelectedTime] = useState(showTimes[0]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seats, setSeats] = useState(Array(6).fill(0).map(() => Array(15).fill(0)));

    // Fetch booked seats whenever movie/date/time changes
    useEffect(() => {
        const fetchBookedSeats = async () => {
            try {
                const response = await axios.get('http://localhost:8081/booked-seats', {
                    params: {
                        moviename: movie.title,
                        showDate: dates[selectedDate].fullDate,
                        showTime: selectedTime
                    },
                });

                const bookedSeats = response.data; // e.g., ["A1", "B3"]

                const newSeats = seats.map((row, rowIndex) =>
                    row.map((seat, seatIndex) => {
                        const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
                        return bookedSeats.includes(seatId) ? 1 : 0; // 1 = booked
                    })
                );

                setSeats(newSeats);
                setSelectedSeats([]);
            } catch (error) {
                console.error('Error fetching booked seats', error);
            }
        };

        fetchBookedSeats();
    }, [selectedDate, selectedCinema, selectedTime, movie.title]);

    const handleSeatClick = (rowIndex, seatIndex) => {
        if (seats[rowIndex][seatIndex] === 1) return; // can't select booked seats

        const newSeats = [...seats];
        const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;

        if (newSeats[rowIndex][seatIndex] === 2) {
            newSeats[rowIndex][seatIndex] = 0;
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            newSeats[rowIndex][seatIndex] = 2;
            setSelectedSeats([...selectedSeats, seatId]);
        }

        setSeats(newSeats);
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
            alert('Please select at least one seat');
            return;
        }

        if (!user) {
            alert('You must be logged in to book seats.');
            navigate('/login');
            return;
        }

        try {
            // Send fields as simple scalars/arrays matching your DB columns
            const payload = {
                moviename: movie.title,         
                userid: user.id, // <<<--- THE CRITICAL FIX: Sending the database ID, not the email
                show_date: dates[selectedDate].fullDate,
                show_time: selectedTime,
                seats: selectedSeats,          
                total_price: selectedSeats.length * 200
            };

            await axios.post('http://localhost:8081/book-ticket', payload);

            alert(`Successfully booked seats: ${selectedSeats.join(', ')}`);
            setSelectedSeats([]);

            // Refresh seats after booking
            const response = await axios.get('http://localhost:8081/booked-seats', {
                params: {
                    moviename: movie.title,
                    showDate: dates[selectedDate].fullDate,
                    showTime: selectedTime
                },
            });

            const bookedSeats = response.data;
            const newSeats = seats.map((row, rowIndex) =>
                row.map((seat, seatIndex) => {
                    const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
                    return bookedSeats.includes(seatId) ? 1 : 0;
                })
            );

            setSeats(newSeats);
        } catch (err) {
            console.error(err);
            // This alert remains the same, but the error should no longer be triggered by FK violation
            alert('Some seats may have been taken. Refresh and try again.'); 
        }
    };

    // ... (The rest of the component remains unchanged)
    return (
        <div className="seat-page">
            <div className="seat-poster">
                <button className="back-btn" onClick={() => navigate('/landing')}>
                    <ChevronLeft size={24} />
                </button>
                <img src={movie.image} alt={movie.title} />
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
                            className={`date-btn ${selectedDate === index ? 'active' : ''}`}
                            onClick={() => setSelectedDate(index)}
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
                        {seats.map((row, rowIndex) => (
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
                        ))}
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

                <button className="select-btn" onClick={handleSelect}>
                    SELECT {selectedSeats.length > 0 && `(${selectedSeats.length})`}
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;