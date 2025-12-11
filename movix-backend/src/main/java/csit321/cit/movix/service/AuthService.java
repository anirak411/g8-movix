package csit321.cit.movix.service;

import csit321.cit.movix.service.UserDetailsServiceImpl; 
import csit321.cit.movix.service.UserDetailsImpl; 
import csit321.cit.movix.model.User;
import csit321.cit.movix.payload.request.LoginRequest;
import csit321.cit.movix.payload.request.RegisterRequest;
import csit321.cit.movix.payload.response.JwtResponse;
import csit321.cit.movix.payload.response.MessageResponse;
import csit321.cit.movix.repository.UserRepository;
import csit321.cit.movix.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Added for exception handling
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, 
                        PasswordEncoder encoder, JwtUtils jwtUtils) { 
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    public ResponseEntity<MessageResponse> registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // NOTE: If you need default roles, add them here. Assuming 'isAdmin' is false by default.
        User user = new User(
            signUpRequest.getEmail(),
            encoder.encode(signUpRequest.getPassword())
        );

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    public ResponseEntity<JwtResponse> authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); 
        
        // ***************************************************************
        // CRITICAL FIX: 1. Fetch the User entity to get the isAdmin status.
        // ***************************************************************
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + loginRequest.getEmail()));
            
        Boolean isAdminStatus = user.getIsAdmin();
        
        // ***************************************************************
        // CRITICAL FIX: 2. Call the JwtResponse constructor with all 4 arguments.
        // ***************************************************************
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                isAdminStatus // <--- NEW: This is the 4th argument, fixing the error.
        ));
    }
}