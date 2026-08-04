package com.attendance.auth.service;

import java.time.Instant;

public record RotatedRefreshToken(

        String userId,
        String value,
        Instant expiresAt
) {
}
