package csit321.cit.movix.controller;

import csit321.cit.movix.model.User;
import csit321.cit.movix.model.Ticket;
import csit321.cit.movix.repository.TicketRepository;
import csit321.cit.movix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

class BookTicketRequest {
    public String userid;
    public String moviename;
    public String show_date;
    public String show_time;
    public List<String> seats;
    public Double total_price;
}

@RestController
@RequestMapping("/api/v1")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Autowired
    public TicketController(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // book ticket req
    @PostMapping("/book-ticket")
    public ResponseEntity<String> bookTicket(@RequestBody BookTicketRequest request) {

        // retrieve user info
        Long userId;
        try {
            userId = Long.valueOf(request.userid);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid User ID format. ID must be a number.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User with ID " + request.userid + " not found for booking."
                ));

        // record time and date
        LocalDate showDate;
        LocalTime showTime;
        try {
            showDate = LocalDate.parse(request.show_date);
            showTime = LocalTime.parse(request.show_time);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date or time format. Use ISO-8601 format (yyyy-MM-dd and HH:mm:ss).");
        }

        // prevent double booking -- ticjket count should initially be zero for booking to be successfully initiated
        for (String seatId : request.seats) {
            long count = ticketRepository.countExistingBookings(
                    request.moviename,
                    showDate,
                    showTime,
                    seatId
            );

            if (count > 0) {
                String errorMessage = "Seat " + seatId + " is already booked by another transaction. Please try again.";
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorMessage);
            }
        }

        // ticket mapping

        Ticket ticket = new Ticket();
        ticket.setMoviename(request.moviename);
        ticket.setUser(user);
        ticket.setShowDate(showDate);
        ticket.setShowTime(showTime);
        ticket.setSeats(request.seats.toArray(new String[0]));
        ticket.setTotalPrice(request.total_price);

        try {
            // save to database
            ticketRepository.save(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body("Booking successful!");
        } catch (Exception e) {
            System.err.println("Database save failed during ticket booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Booking could not be finalized due to a critical server error.");
        }
    }

    // record booked seats
    @GetMapping("/booked-seats")
    public ResponseEntity<List<String>> getBookedSeats(
            @RequestParam("moviename") String movieName,
            @RequestParam("showDate") String showDateStr,
            @RequestParam("showTime") String showTimeStr
    ) {
        try {
            LocalDate showDate = LocalDate.parse(showDateStr);
            LocalTime showTime = LocalTime.parse(showTimeStr);

            List<String> bookedSeats = ticketRepository.findBookedSeats(
                    movieName,
                    showDate,
                    showTime
            );

            return ResponseEntity.ok(bookedSeats);

        } catch (Exception e) {
            System.err.println("Error fetching booked seats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }
}