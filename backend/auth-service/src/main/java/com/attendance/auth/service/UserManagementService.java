package com.attendance.auth.service;

import com.attendance.auth.dto.request.CreateUserRequest;
import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.model.UserRole;
import com.attendance.auth.model.UserStatus;

import java.util.List;
import java.util.Set;

public interface UserManagementService {

    UserResponse createUser(CreateUserRequest request);

    UserResponse getById(String userId);

    List<UserResponse> getAll();

    UserResponse updateStatus(String userId, UserStatus status);

    UserResponse updateRoles(String userId, Set<UserRole> roles);
}
