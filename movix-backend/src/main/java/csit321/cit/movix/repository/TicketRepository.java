package csit321.cit.movix.repository;

import csit321.cit.movix.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Checks if a specific seat is already booked for a particular showtime using a Native PostgreSQL Query.
     */
    @Query(value = "SELECT COUNT(*) FROM book_ticket " +
                   "WHERE moviename = :movieName " +
                   "AND show_date = :showDate " +
                   "AND show_time = :showTime " +
                   "AND :seatId = ANY(seats)", 
           nativeQuery = true) 
    long countExistingBookings(
        @Param("movieName") String movieName, 
        @Param("showDate") LocalDate showDate, 
        @Param("showTime") LocalTime showTime,
        @Param("seatId") String seatId
    );

    /**
     * Retrieves a list of all unique seat IDs booked for a specific showing (Movie, Date, Time).
     * Uses PostgreSQL's unnest to extract all seats from the array column.
     * @param movieName The name of the movie.
     * @param showDate The date of the show.
     * @param showTime The time of the show.
     * @return A List<String> of all booked seat IDs (e.g., ["A1", "B5", "C2"]).
     */
    @Query(value = 
        "SELECT DISTINCT s.seat_id " +
        "FROM book_ticket t, unnest(t.seats) AS s(seat_id) " + 
        "WHERE t.moviename = :movieName " +
        "AND t.show_date = :showDate " + 
        "AND t.show_time = :showTime", 
        nativeQuery = true)
    List<String> findBookedSeats(
        @Param("movieName") String movieName, 
        @Param("showDate") LocalDate showDate, 
        @Param("showTime") LocalTime showTime
    );
}