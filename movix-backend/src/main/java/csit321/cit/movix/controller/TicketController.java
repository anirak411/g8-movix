package csit321.cit.movix.controller;

import csit321.cit.movix.model.User;
import csit321.cit.movix.model.Ticket;
import csit321.cit.movix.repository.TicketRepository;
import csit321.cit.movix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// --- DTO to receive the JSON payload ---
class BookTicketRequest {
    public String moviename;
    public String userid; 
    public String show_date;
    public String show_time;
    public List<String> seats; 
    public Double total_price;
}
// ---------------------------------------

@RestController
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // --- 1. POST: Book Ticket Endpoint ---
    @PostMapping("/book-ticket")
    public ResponseEntity<?> bookTicket(@RequestBody BookTicketRequest request) {
        
        // 1. Validate and retrieve the User
        Long userId;
        try {
            userId = Long.valueOf(request.userid);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid User ID format.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for booking."));

        // Parse date and time outside of the loop
        LocalDate showDate = LocalDate.parse(request.show_date);
        LocalTime showTime = LocalTime.parse(request.show_time);
        
        // 2. DOUBLE BOOKING PREVENTION
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
        
        // 3. Map the DTO data to the Ticket Entity
        Ticket ticket = new Ticket();
        ticket.setMoviename(request.moviename);
        ticket.setUser(user); 
        ticket.setShowDate(showDate);
        ticket.setShowTime(showTime);
        
        // Set all seats requested
        ticket.setSeats(request.seats.toArray(new String[0]));
        ticket.setTotalPrice(request.total_price);

        try {
            // 4. Save to the database
            ticketRepository.save(ticket);
            return ResponseEntity.ok("Booking successful!");
        } catch (Exception e) {
            System.err.println("Database save failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Booking could not be finalized due to a server error.");
        }
    }
    
    // --- 2. GET: Fetch Booked Seats Endpoint ---
    @GetMapping("/booked-seats")
    public ResponseEntity<List<String>> getBookedSeats(
        @RequestParam("moviename") String movieName,
        @RequestParam("showDate") String showDateStr,
        @RequestParam("showTime") String showTimeStr
    ) {
        try {
            // Parse query parameters from String to appropriate types
            LocalDate showDate = LocalDate.parse(showDateStr);
            LocalTime showTime = LocalTime.parse(showTimeStr);

            // Call the repository method to fetch the list of booked seats
            List<String> bookedSeats = ticketRepository.findBookedSeats(
                movieName, 
                showDate, 
                showTime
            );

            return ResponseEntity.ok(bookedSeats);
            
        } catch (Exception e) {
            System.err.println("Error fetching booked seats: " + e.getMessage());
            // Return an empty list on error to prevent the frontend from crashing
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of()); 
        }
    }
}