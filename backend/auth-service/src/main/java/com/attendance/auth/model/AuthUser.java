package com.attendance.auth.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "users")
public class AuthUser {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private Set<UserRole> roles= new HashSet<>();
    private UserStatus status = UserStatus.ACTIVE;

    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;
}
