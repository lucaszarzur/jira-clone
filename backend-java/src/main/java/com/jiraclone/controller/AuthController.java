package com.jiraclone.controller;

import com.jiraclone.dto.request.ChangePasswordRequest;
import com.jiraclone.dto.request.LoginRequest;
import com.jiraclone.dto.request.RegisterRequest;
import com.jiraclone.dto.response.AuthResponse;
import com.jiraclone.dto.response.UserResponse;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = authService.getCurrentUser(currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }
}
