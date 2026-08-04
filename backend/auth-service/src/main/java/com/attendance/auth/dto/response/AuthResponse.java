package com.attendance.auth.dto.response;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        UserResponse response
) {
}
