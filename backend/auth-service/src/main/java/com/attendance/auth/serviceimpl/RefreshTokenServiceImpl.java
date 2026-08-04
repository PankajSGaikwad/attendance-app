package com.attendance.auth.serviceimpl;

import com.attendance.auth.config.AuthProperties;
import com.attendance.auth.exception.InvalidRefreshTokenException;
import com.attendance.auth.model.RefreshToken;
import com.attendance.auth.repository.RefreshTokenRepository;
import com.attendance.auth.service.IssuedRefreshToken;
import com.attendance.auth.service.RefreshTokenService;
import com.attendance.auth.service.RotatedRefreshToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private static final int TOKEN_BYTES = 32;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final AuthProperties authProperties;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Override
    public IssuedRefreshToken issue(String userId) {
        String rawToken = generateRawToken();
        String tokenHash = hash(rawToken);

        Instant now = Instant.now();

        Instant expiresAt = now.plus(
                authProperties
                        .getRefresh()
                        .getTokenTtl()
        );

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(expiresAt);

        refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(
                rawToken,
                expiresAt
        );
    }

    @Override
    public RotatedRefreshToken rotate(
            String rawRefreshToken
    ) {
        validateRawToken(rawRefreshToken);

        String currentHash =
                hash(rawRefreshToken);

        RefreshToken currentToken =
                refreshTokenRepository
                        .findByTokenHash(currentHash)
                        .orElseThrow(() ->
                                new InvalidRefreshTokenException(
                                        "Refresh token is invalid"
                                )
                        );

        Instant now = Instant.now();

        if (currentToken.getRevokedAt() != null) {
            throw new InvalidRefreshTokenException(
                    "Refresh token has already been used or revoked"
            );
        }

        if (!currentToken.getExpiresAt().isAfter(now)) {
            throw new InvalidRefreshTokenException(
                    "Refresh token has expired"
            );
        }

        String newRawToken = generateRawToken();
        String newHash = hash(newRawToken);

        Instant newExpiresAt = now.plus(
                authProperties
                        .getRefresh()
                        .getTokenTtl()
        );

        currentToken.setRevokedAt(now);
        currentToken.setReplacedByTokenHash(
                newHash
        );

        RefreshToken replacement =
                new RefreshToken();

        replacement.setUserId(
                currentToken.getUserId()
        );
        replacement.setTokenHash(newHash);
        replacement.setCreatedAt(now);
        replacement.setExpiresAt(newExpiresAt);

        refreshTokenRepository.save(currentToken);
        refreshTokenRepository.save(replacement);

        return new RotatedRefreshToken(
                currentToken.getUserId(),
                newRawToken,
                newExpiresAt
        );
    }

    @Override
    public void revoke(String rawRefreshToken) {
        if (!StringUtils.hasText(rawRefreshToken)) {
            return;
        }

        String tokenHash = hash(rawRefreshToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    if (token.getRevokedAt() == null) {
                        token.setRevokedAt(
                                Instant.now()
                        );

                        refreshTokenRepository.save(
                                token
                        );
                    }
                });
    }

    @Override
    public void revokeAllForUser(String userId) {
        List<RefreshToken> activeTokens =
                refreshTokenRepository
                        .findByUserIdAndRevokedAtIsNull(
                                userId
                        );

        if (activeTokens.isEmpty()) {
            return;
        }

        Instant now = Instant.now();

        activeTokens.forEach(token ->
                token.setRevokedAt(now)
        );

        refreshTokenRepository.saveAll(
                activeTokens
        );
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];

        secureRandom.nextBytes(bytes);

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash = digest.digest(
                    value.getBytes(
                            StandardCharsets.UTF_8
                    )
            );

            return HexFormat
                    .of()
                    .formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    exception
            );
        }
    }

    private void validateRawToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new InvalidRefreshTokenException(
                    "Refresh token is required"
            );
        }
    }
}