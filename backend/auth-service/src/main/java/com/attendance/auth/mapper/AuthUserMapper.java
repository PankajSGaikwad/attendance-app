package com.attendance.auth.mapper;

import com.attendance.auth.dto.response.UserResponse;
import com.attendance.auth.model.AuthUser;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AuthUserMapper {

    public UserResponse toResponse(AuthUser user){
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                Set.copyOf(user.getRoles()),
                user.getStatus(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
