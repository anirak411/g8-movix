package csit321.cit.movix.model;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Boolean enabled = true;

    // ***************************************************************
    // CRITICAL FIX: Add the isAdmin field and map it to the DB column.
    // ***************************************************************
    @Column(name = "is_admin", nullable = false) // Maps to the 'is_admin' column in your DB
    private Boolean isAdmin = false;             // Default value should be false

    // Updated Constructor (to ensure isAdmin is included in full constructor)
    public User(Long id, String email, String password, Boolean enabled, Boolean isAdmin) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.isAdmin = isAdmin;
    }
    
    // Existing simplified constructor (isAdmin defaults to false)
    public User(String email, String password) {
        this.email = email;
        this.password = password;
        this.enabled = true;
        this.isAdmin = false; // Explicitly set default for new users
    }
}