package csit321.cit.movix.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "book_ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @Column(name = "moviename")
    private String moviename;
    
    // Links the 'userid' column in book_ticket to the 'id' column in the 'users' table.
    @ManyToOne 
    @JoinColumn(name = "userid", referencedColumnName = "id", nullable = false) 
    private User user; 

    @Column(name = "show_date")
    private LocalDate showDate; 

    @Column(name = "show_time")
    private LocalTime showTime; 

    @Column(name = "seats")
    private String[] seats; 

    @Column(name = "total_price")
    private Double totalPrice;
}