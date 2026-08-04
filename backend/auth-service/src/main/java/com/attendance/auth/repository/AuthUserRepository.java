package com.attendance.auth.repository;

import com.attendance.auth.model.AuthUser;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AuthUserRepository extends MongoRepository<AuthUser, String> {
    boolean existsByEmail(String email);

    Optional<AuthUser> findByEmail(String email);

    List<AuthUser> findAllByOrderByCreatedAtDesc();
}
