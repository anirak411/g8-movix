package csit321.cit.movix.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "book_ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String moviename;

    /**
     * CRITICAL FIX: The @JoinColumn ensures Hibernate maps the 'user'
     * field to the 'user_id' column in the database.
     */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "show_date")
    private LocalDate showDate;

    @Column(name = "show_time")
    private LocalTime showTime;

    // Assumes your database column 'seats' is a PostgreSQL array (varchar[])
    @Column(columnDefinition = "varchar[]")
    private String[] seats;

    @Column(name = "total_price")
    private Double totalPrice;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMoviename() { return moviename; }
    public void setMoviename(String moviename) { this.moviename = moviename; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }

    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }

    public String[] getSeats() { return seats; }
    public void setSeats(String[] seats) { this.seats = seats; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}