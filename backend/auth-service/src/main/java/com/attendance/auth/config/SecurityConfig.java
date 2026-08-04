package com.attendance.auth.config;

import com.attendance.auth.security.MongoUserDetailsService;
import com.attendance.auth.security.RestAccessDeniedHandler;
import com.attendance.auth.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthProperties authProperties;

    private final RestAuthenticationEntryPoint
            authenticationEntryPoint;

    private final RestAccessDeniedHandler
            accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider
    daoAuthenticationProvider(
            MongoUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder
        );

        return provider;
    }

    @Bean
    public AuthenticationManager
    authenticationManager(
            DaoAuthenticationProvider provider
    ) {
        return new ProviderManager(
                List.of(provider)
        );
    }

    @Bean
    public SecretKey jwtSecretKey() {
        String encodedSecret = authProperties
                .getJwt()
                .getSecretBase64();

        if (!StringUtils.hasText(encodedSecret)) {
            throw new IllegalStateException(
                    "JWT_SECRET_BASE64 is required"
            );
        }

        byte[] keyBytes;

        try {
            keyBytes = Base64
                    .getDecoder()
                    .decode(encodedSecret.trim());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "JWT_SECRET_BASE64 must contain valid Base64",
                    exception
            );
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 random bytes for HS256"
            );
        }

        return new SecretKeySpec(
                keyBytes,
                "HmacSHA256"
        );
    }

    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey secretKey
    ) {
        return NimbusJwtEncoder
                .withSecretKey(secretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
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

        OAuth2TokenValidator<Jwt>
                defaultValidator =
                JwtValidators
                        .createDefaultWithIssuer(
                                authProperties
                                        .getJwt()
                                        .getIssuer()
                        );

        OAuth2TokenValidator<Jwt>
                audienceValidator = jwt -> {

            boolean validAudience =
                    jwt.getAudience().contains(
                            authProperties
                                    .getJwt()
                                    .getAudience()
                    );

            if (validAudience) {
                return OAuth2TokenValidatorResult
                        .success();
            }

            OAuth2Error error =
                    new OAuth2Error(
                            "invalid_token",
                            "Required JWT audience is missing",
                            null
                    );

            return OAuth2TokenValidatorResult
                    .failure(error);
        };

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(
                        defaultValidator,
                        audienceValidator
                )
        );

        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter
    jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter
                roleConverter =
                new JwtGrantedAuthoritiesConverter();

        roleConverter.setAuthoritiesClaimName(
                "roles"
        );

        roleConverter.setAuthorityPrefix(
                "ROLE_"
        );

        JwtAuthenticationConverter
                authenticationConverter =
                new JwtAuthenticationConverter();

        authenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        roleConverter
                );

        return authenticationConverter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider provider,
            JwtAuthenticationConverter
                    jwtAuthenticationConverter
    ) throws Exception {

        return http
                .csrf(
                        AbstractHttpConfigurer::disable
                )
                .formLogin(
                        AbstractHttpConfigurer::disable
                )
                .httpBasic(
                        AbstractHttpConfigurer::disable
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .authenticationProvider(provider)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/error"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                )
                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
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