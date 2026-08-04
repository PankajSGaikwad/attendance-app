package com.attendance.auth.bootstrap;

import com.attendance.auth.config.AuthProperties;
import com.attendance.auth.model.AuthUser;
import com.attendance.auth.model.UserRole;
import com.attendance.auth.model.UserStatus;
import com.attendance.auth.repository.AuthUserRepository;
import com.attendance.auth.util.EmailNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner
        implements ApplicationRunner {

    private final AuthProperties authProperties;
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(
            ApplicationArguments arguments
    ) {
        String configuredEmail =
                authProperties
                        .getBootstrapAdmin()
                        .getEmail();

        String configuredPassword =
                authProperties
                        .getBootstrapAdmin()
                        .getPassword();

        if (!StringUtils.hasText(configuredEmail)
                || !StringUtils.hasText(
                configuredPassword
        )) {

            log.warn(
                    "Bootstrap administrator was not configured"
            );

            return;
        }

        String email =
                EmailNormalizer.normalize(
                        configuredEmail
                );

        if (authUserRepository
                .existsByEmail(email)) {

            log.info(
                    "Bootstrap administrator account already exists"
            );

            return;
        }

        if (configuredPassword.length() < 8) {
            throw new IllegalStateException(
                    "Bootstrap administrator password must contain at least 8 characters"
            );
        }

        Instant now = Instant.now();

        AuthUser administrator =
                new AuthUser();

        administrator.setEmail(email);

        administrator.setPasswordHash(
                passwordEncoder.encode(
                        configuredPassword
                )
        );

        administrator.setRoles(
                new HashSet<>(
                        Set.of(UserRole.ADMIN)
                )
        );

        administrator.setStatus(
                UserStatus.ACTIVE
        );

        administrator.setCreatedAt(now);
        administrator.setUpdatedAt(now);

        authUserRepository.save(
                administrator
        );

        log.info(
                "Bootstrap administrator account created for {}",
                email
        );
    }
}