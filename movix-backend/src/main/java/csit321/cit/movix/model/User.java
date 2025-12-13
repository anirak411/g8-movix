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

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin = false;

    // keep only this custom constructor
    public User(String email, String password) {
        this.email = email;
        this.password = password;
        this.enabled = true;
        this.isAdmin = false;
    }
}