package com.attendance.attendanceservice.repository;
import com.attendance.attendanceservice.model.AttendanceAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AttendanceAttemptRepository
        extends MongoRepository<AttendanceAttempt, String> {

    Optional<AttendanceAttempt>
    findByIdAndTokenHash(
            String id,
            String tokenHash
    );
}