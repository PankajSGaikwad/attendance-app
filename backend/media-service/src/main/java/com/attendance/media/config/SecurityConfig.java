package com.attendance.media.config;

import com.attendance.media.security.InternalApiKeyAuthenticationFilter;
import com.attendance.media.security.RestAccessDeniedHandler;
import com.attendance.media.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProperties jwtProperties;

    private final InternalApiKeyAuthenticationFilter
            internalApiKeyAuthenticationFilter;

    private final RestAuthenticationEntryPoint
            authenticationEntryPoint;

    private final RestAccessDeniedHandler
            accessDeniedHandler;

    @Bean
    public SecretKey jwtSecretKey() {

        String encoded =
                jwtProperties.getSecretBase64();

        if (!StringUtils.hasText(encoded)) {
            throw new IllegalStateException(
                    "JWT_SECRET_BASE64 is required"
            );
        }

        byte[] bytes =
                Base64.getDecoder()
                        .decode(encoded.trim());

        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 bytes"
            );
        }

        return new SecretKeySpec(
                bytes,
                "HmacSHA256"
        );
    }

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey secretKey
    ) {

        NimbusJwtDecoder decoder =
                NimbusJwtDecoder
                        .withSecretKey(secretKey)
                        .macAlgorithm(
                                MacAlgorithm.HS256
                        )
                        .build();

        OAuth2TokenValidator<Jwt> issuer =
                JwtValidators
                        .createDefaultWithIssuer(
                                jwtProperties.getIssuer()
                        );

        OAuth2TokenValidator<Jwt> audience =
                jwt -> {

                    List<String> audiences =
                            jwt.getAudience();

                    if (audiences != null
                            && audiences.contains(
                            jwtProperties.getAudience()
                    )) {
                        return OAuth2TokenValidatorResult
                                .success();
                    }

                    return OAuth2TokenValidatorResult
                            .failure(
                                    new OAuth2Error(
                                            "invalid_token",
                                            "Required JWT audience is missing",
                                            null
                                    )
                            );
                };

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(
                        issuer,
                        audience
                )
        );

        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter
    jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter roles =
                new JwtGrantedAuthoritiesConverter();

        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                roles
        );

        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter converter
    ) throws Exception {

        return http

                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/error"
                        )
                        .permitAll()

                        // Public attendance photo upload
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/media/public/attendance-photo"
                        )
                        .permitAll()

                        // Only internal services
                        .requestMatchers(
                                "/internal/**"
                        )
                        .hasRole("INTERNAL_SERVICE")

                        .requestMatchers(
                                "/api/admin/media/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SUPERVISOR"
                        )

                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        converter
                                )
                        )
                )

                .addFilterBefore(
                        internalApiKeyAuthenticationFilter,
                        BearerTokenAuthenticationFilter.class
                )

                .exceptionHandling(exceptions ->
                        exceptions
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler
                                )
                )

                .build();
    }
}