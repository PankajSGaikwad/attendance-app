package com.attendance.auth.controller;

import com.attendance.auth.dto.request.CreateUserRequest;
import com.attendance.auth.dto.request.UpdateUserRolesRequest;
import com.attendance.auth.dto.request.UpdateUserStatusRequest;
import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserManagementService
            userManagementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid
            @RequestBody
            CreateUserRequest request
    ) {
        return userManagementService
                .createUser(request);
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userManagementService.getAll();
    }

    @GetMapping("/{userId}")
    public UserResponse getById(
            @PathVariable String userId
    ) {
        return userManagementService
                .getById(userId);
    }

    @PatchMapping("/{userId}/status")
    public UserResponse updateStatus(
            @PathVariable String userId,
            @Valid
            @RequestBody
            UpdateUserStatusRequest request
    ) {
        return userManagementService
                .updateStatus(
                        userId,
                        request.status()
                );
    }

    @PutMapping("/{userId}/roles")
    public UserResponse updateRoles(
            @PathVariable String userId,
            @Valid
            @RequestBody
            UpdateUserRolesRequest request
    ) {
        return userManagementService
                .updateRoles(
                        userId,
                        request.roles()
                );
    }
}