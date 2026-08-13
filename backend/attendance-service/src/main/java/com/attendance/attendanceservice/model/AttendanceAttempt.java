package com.attendance.attendanceservice.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "attendance_attempts")
public class AttendanceAttempt {

    @Id
    private String id;

    @Indexed(unique = true)
    private String tokenHash;

    private AttendanceAction action;
    private AttendanceSource source;
    private AttendanceAttemptStatus status;

    private String attendanceRecordId;

    private String employeeId;
    private String userId;

    private String employeeCode;
    private String employeeName;

    private String departmentId;
    private String designationId;

    private ShiftSnapshot shift;

    //null if scan from public
    private String authenticatedUserId;

    private Instant createdAt;
    //MongoDB TTL index removes expired attempts.
    @Indexed(expireAfter = "0s")
    private Instant expiresAt;

    private Instant completedAt;

    @Version
    private Long version;
}
