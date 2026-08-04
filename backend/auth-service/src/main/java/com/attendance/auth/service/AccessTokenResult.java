package com.attendance.auth.service;

import java.time.Instant;

public record AccessTokenResult(
        String value,
        Instant expiresAt
) {
}
