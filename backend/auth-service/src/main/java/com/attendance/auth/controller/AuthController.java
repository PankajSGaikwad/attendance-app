package com.attendance.auth.controller;

import com.attendance.auth.dto.request.LoginRequest;
import com.attendance.auth.dto.request.LogoutRequest;
import com.attendance.auth.dto.request.RefreshTokenRequest;
import com.attendance.auth.dto.request.RegisterRequest;
import com.attendance.auth.dto.response.AuthResponse;
import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid
            @RequestBody
            RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid
            @RequestBody
            LoginRequest request
    ) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @Valid
            @RequestBody
            RefreshTokenRequest request
    ) {
        return authService.refresh(
                request.refreshToken()
        );
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @Valid
            @RequestBody
            LogoutRequest request
    ) {
        authService.logout(
                request.refreshToken()
        );
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return authService.getCurrentUser(
                jwt.getSubject()
        );
    }
}