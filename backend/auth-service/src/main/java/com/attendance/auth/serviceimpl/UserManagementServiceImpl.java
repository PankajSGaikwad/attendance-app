package com.attendance.auth.serviceimpl;

import com.attendance.auth.dto.request.CreateUserRequest;
import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.exception.DuplicateResourceException;
import com.attendance.auth.exception.InvalidRequestException;
import com.attendance.auth.exception.ResourceNotFoundException;
import com.attendance.auth.mapper.AuthUserMapper;
import com.attendance.auth.model.AuthUser;
import com.attendance.auth.model.UserRole;
import com.attendance.auth.model.UserStatus;
import com.attendance.auth.repository.AuthUserRepository;
import com.attendance.auth.service.RefreshTokenService;
import com.attendance.auth.service.UserManagementService;
import com.attendance.auth.util.EmailNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl
        implements UserManagementService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService
            refreshTokenService;
    private final AuthUserMapper authUserMapper;

    @Override
    public UserResponse createUser(
            CreateUserRequest request
    ) {
        if (!request.password()
                .equals(request.confirmPassword())) {

            throw new InvalidRequestException(
                    "Password and confirmation do not match"
            );
        }

        String email =
                EmailNormalizer.normalize(
                        request.email()
                );

        if (authUserRepository.existsByEmail(email)) {
            throw new DuplicateResourceException(
                    "An account already exists with this email"
            );
        }

        if (request.roles() == null
                || request.roles().isEmpty()) {

            throw new InvalidRequestException(
                    "At least one role is required"
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
                new HashSet<>(request.roles())
        );
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return authUserMapper.toResponse(
                authUserRepository.save(user)
        );
    }

    @Override
    public UserResponse getById(String userId) {
        return authUserMapper.toResponse(
                findUser(userId)
        );
    }

    @Override
    public List<UserResponse> getAll() {
        return authUserRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(authUserMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse updateStatus(
            String userId,
            UserStatus status
    ) {
        AuthUser user = findUser(userId);

        user.setStatus(status);
        user.setUpdatedAt(Instant.now());

        if (status != UserStatus.ACTIVE) {
            refreshTokenService
                    .revokeAllForUser(userId);
        }

        return authUserMapper.toResponse(
                authUserRepository.save(user)
        );
    }

    @Override
    public UserResponse updateRoles(
            String userId,
            Set<UserRole> roles
    ) {
        if (roles == null || roles.isEmpty()) {
            throw new InvalidRequestException(
                    "At least one role is required"
            );
        }

        AuthUser user = findUser(userId);

        user.setRoles(new HashSet<>(roles));
        user.setUpdatedAt(Instant.now());

        /*
         * Force the user to log in again so future
         * access tokens contain the updated roles.
         */
        refreshTokenService
                .revokeAllForUser(userId);

        return authUserMapper.toResponse(
                authUserRepository.save(user)
        );
    }

    private AuthUser findUser(String userId) {
        return authUserRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with ID: "
                                        + userId
                        )
                );
    }
}