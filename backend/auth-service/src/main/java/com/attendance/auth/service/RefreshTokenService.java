package com.attendance.auth.service;

public interface RefreshTokenService {
    IssuedRefreshToken issue(String userId);

    RotatedRefreshToken rotate(String rawRefreshToken);

    void revoke(String rawRefreshToken);

    void revokeAllForUser(String userId);
}
