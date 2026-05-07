package csit321.cit.movix.controller;

import csit321.cit.movix.payload.request.LoginRequest;
import csit321.cit.movix.payload.request.RegisterRequest;
import csit321.cit.movix.payload.response.JwtResponse;
import csit321.cit.movix.payload.response.MessageResponse;
import csit321.cit.movix.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest request) {
        return authService.authenticateUser(request);
    }
}