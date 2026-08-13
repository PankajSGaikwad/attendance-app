package com.attendance.attendanceservice.repository;

import com.attendance.attendanceservice.model.AttendanceRecord;
import com.attendance.attendanceservice.model.AttendanceRecordStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository
        extends MongoRepository<AttendanceRecord, String> {

    Optional<AttendanceRecord>
    findFirstByEmployeeIdAndStatusOrderByCreatedAtDesc(
            String employeeId,
            AttendanceRecordStatus status
    );

    Optional<AttendanceRecord>
    findByEmployeeIdAndAttendanceDate(
            String employeeId,
            String attendanceDate
    );

    List<AttendanceRecord>
    findByUserIdOrderByAttendanceDateDesc(
            String userId
    );

    List<AttendanceRecord>
    findByEmployeeIdOrderByAttendanceDateDesc(
            String employeeId
    );

    @Query("""
            {
              'status': ?0,
              'shift.punchOutDeadlineAt': {
                '$lt': ?1
              }
            }
            """)
    List<AttendanceRecord> findPastDeadline(
            AttendanceRecordStatus status,
            Instant now
    );
}