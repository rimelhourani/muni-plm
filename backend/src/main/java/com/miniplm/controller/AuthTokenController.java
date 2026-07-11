package com.miniplm.controller;

import com.miniplm.dto.LoginRequestDto;
import com.miniplm.dto.LoginResponseDto;
import com.miniplm.dto.RegisterRequestDto;
import com.miniplm.dto.UserResponseDto;
import com.miniplm.model.User;
import com.miniplm.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthTokenController {

    private final AuthService authService;

    public AuthTokenController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        return ResponseEntity.ok(authService.registerUser(registerRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(new UserResponseDto(user));
    }
}
