package com.attendance.auth.service;

import com.attendance.auth.model.AuthUser;

public interface JwtService {
    AccessTokenResult createAccessToken(AuthUser user);
}
