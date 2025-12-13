package csit321.cit.movix.dto;
import lombok.Data; 

// pass data for authentication during login

@Data 
public class AuthRequest {
    private String email;
    private String password;
}