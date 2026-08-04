package com.attendance.auth.serviceimpl;

import com.attendance.auth.dto.request.LoginRequest;
import com.attendance.auth.dto.request.RegisterRequest;
import com.attendance.auth.dto.response.AuthResponse;
import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.exception.DuplicateResourceException;
import com.attendance.auth.exception.InvalidRefreshTokenException;
import com.attendance.auth.exception.InvalidRequestException;
import com.attendance.auth.exception.ResourceNotFoundException;
import com.attendance.auth.mapper.AuthUserMapper;
import com.attendance.auth.model.AuthUser;
import com.attendance.auth.model.UserRole;
import com.attendance.auth.model.UserStatus;
import com.attendance.auth.repository.AuthUserRepository;
import com.attendance.auth.service.*;
import com.attendance.auth.util.EmailNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl
        implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager
            authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService
            refreshTokenService;
    private final AuthUserMapper authUserMapper;

    @Override
    public UserResponse register(
            RegisterRequest request
    ) {
        validatePasswordConfirmation(
                request.password(),
                request.confirmPassword()
        );

        String email =
                EmailNormalizer.normalize(
                        request.email()
                );

        if (authUserRepository.existsByEmail(email)) {
            throw new DuplicateResourceException(
                    "An account already exists with this email"
            );
        }

        Instant now = Instant.now();

        AuthUser user = new AuthUser();
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.password()
                )
        );
        user.setRoles(
                new HashSet<>(
                        Set.of(UserRole.EMPLOYEE)
                )
        );
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return authUserMapper.toResponse(
                authUserRepository.save(user)
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email =
                EmailNormalizer.normalize(
                        request.email()
                );

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        AuthUser user = authUserRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User account not found"
                        )
                );

        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        authUserRepository.save(user);

        AccessTokenResult accessToken =
                jwtService.createAccessToken(user);

        IssuedRefreshToken refreshToken =
                refreshTokenService.issue(
                        user.getId()
                );

        return buildAuthResponse(
                user,
                accessToken,
                refreshToken.value(),
                refreshToken.expiresAt()
        );
    }

    @Override
    public AuthResponse refresh(
            String refreshToken
    ) {
        RotatedRefreshToken rotatedToken =
                refreshTokenService.rotate(
                        refreshToken
                );

        AuthUser user = authUserRepository
                .findById(rotatedToken.userId())
                .orElseThrow(() ->
                        new InvalidRefreshTokenException(
                                "Refresh token user no longer exists"
                        )
                );

        if (user.getStatus()
                != UserStatus.ACTIVE) {

            refreshTokenService
                    .revokeAllForUser(
                            user.getId()
                    );

            throw new InvalidRefreshTokenException(
                    "Account is not active"
            );
        }

        AccessTokenResult accessToken =
                jwtService.createAccessToken(user);

        return buildAuthResponse(
                user,
                accessToken,
                rotatedToken.value(),
                rotatedToken.expiresAt()
        );
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revoke(
                refreshToken
        );
    }

    @Override
    public UserResponse getCurrentUser(
            String userId
    ) {
        AuthUser user = authUserRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User account not found"
                        )
                );

        return authUserMapper.toResponse(user);
    }

    private AuthResponse buildAuthResponse(
            AuthUser user,
            AccessTokenResult accessToken,
            String refreshToken,
            Instant refreshTokenExpiresAt
    ) {
        long expiresInSeconds = Math.max(
                0,
                Duration.between(
                        Instant.now(),
                        accessToken.expiresAt()
                ).toSeconds()
        );

        return new AuthResponse(
                accessToken.value(),
                refreshToken,
                "Bearer",
                expiresInSeconds,
                accessToken.expiresAt(),
                refreshTokenExpiresAt,
                authUserMapper.toResponse(user)
        );
    }

    private void validatePasswordConfirmation(
            String password,
            String confirmPassword
    ) {
        if (!password.equals(confirmPassword)) {
            throw new InvalidRequestException(
                    "Password and confirmation do not match"
            );
        }
    }
}