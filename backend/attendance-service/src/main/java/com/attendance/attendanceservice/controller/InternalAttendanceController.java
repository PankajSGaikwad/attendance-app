package com.attendance.attendanceservice.controller;

import com.attendance.attendanceservice.dto.request.AttendanceMediaValidationRequest;
import com.attendance.attendanceservice.dto.response.AttendanceMediaValidationResponse;
import com.attendance.attendanceservice.exception.AttendanceAttemptExpiredException;
import com.attendance.attendanceservice.exception.InvalidAttendanceStateException;
import com.attendance.attendanceservice.exception.ResourceNotFoundException;
import com.attendance.attendanceservice.model.AttendanceAttemptStatus;
import com.attendance.attendanceservice.repository.AttendanceAttemptRepository;
import com.attendance.attendanceservice.util.AttemptTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/internal/attendance/attempts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL_SERVICE')")
public class InternalAttendanceController {

    private final AttendanceAttemptRepository
            attendanceAttemptRepository;

    private final AttemptTokenService
            attemptTokenService;

    @PostMapping("/media-validation")
    public AttendanceMediaValidationResponse validate(
            @Valid
            @RequestBody
            AttendanceMediaValidationRequest request
    ) {

        String hash =
                attemptTokenService.hash(
                        request.completionToken()
                );

        var attempt =
                attendanceAttemptRepository
                        .findByIdAndTokenHash(
                                request.attemptId(),
                                hash
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance attempt does not exist"
                                )
                        );

        if (attempt.getStatus()
                != AttendanceAttemptStatus.PENDING) {

            throw new InvalidAttendanceStateException(
                    "Attendance attempt is no longer pending"
            );
        }

        if (Instant.now()
                .isAfter(
                        attempt.getExpiresAt()
                )) {

            throw new AttendanceAttemptExpiredException(
                    "Attendance attempt expired"
            );
        }

        return new AttendanceMediaValidationResponse(
                attempt.getId(),

                attempt.getEmployeeId(),

                attempt.getUserId(),

                attempt.getAction().name(),

                attempt.getSource().name(),

                attempt.getAuthenticatedUserId(),

                attempt.getExpiresAt()
        );
    }
}