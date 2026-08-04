package com.attendance.auth.serviceimpl;

import com.attendance.auth.config.AuthProperties;
import com.attendance.auth.model.AuthUser;
import com.attendance.auth.service.AccessTokenResult;
import com.attendance.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {
    private final JwtEncoder jwtEncoder;
    private final AuthProperties authProperties;

    @Override
    public AccessTokenResult createAccessToken(AuthUser user) {

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(authProperties.getJwt().getAccessTokenTtl());

        List<String> roles=user.getRoles().stream().map(Enum::name).sorted().toList();

        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(authProperties.getJwt().getIssuer())
                .subject(user.getId()).audience(List.of(authProperties.getJwt().getAudience()))
                .issuedAt(issuedAt).expiresAt(expiresAt).id(UUID.randomUUID().toString())
                .claim("email", user.getEmail()).claim("roles", roles).claim("token_type", "access").build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        return new AccessTokenResult(token, expiresAt);
    }
}
