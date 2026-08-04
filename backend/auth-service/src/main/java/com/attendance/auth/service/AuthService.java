package com.attendance.auth.service;

import com.attendance.auth.dto.request.LoginRequest;
import com.attendance.auth.dto.request.RegisterRequest;
import com.attendance.auth.dto.response.AuthResponse;
import com.attendance.auth.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);

    UserResponse getCurrentUser(String userId);
}
