package com.attendance.media.security;

import com.attendance.media.config.InternalSecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InternalApiKeyAuthenticationFilter
        extends OncePerRequestFilter {

    public static final String HEADER =
            "X-Internal-Api-Key";

    private final InternalSecurityProperties properties;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        return !request
                .getRequestURI()
                .startsWith("/internal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String provided =
                request.getHeader(HEADER);

        if (StringUtils.hasText(provided)
                && isValid(provided)) {

            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            "internal-service",
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_INTERNAL_SERVICE"
                                    )
                            )
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private boolean isValid(String provided) {

        String expected =
                properties.getApiKey();

        if (!StringUtils.hasText(expected)) {
            return false;
        }

        return MessageDigest.isEqual(
                expected.getBytes(
                        StandardCharsets.UTF_8
                ),
                provided.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }
}