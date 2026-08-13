package com.attendance.attendanceservice.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "attendance_records")
@CompoundIndexes({
        @CompoundIndex(
                name = "employee_attendance_date_unique",
                def = "{'employeeId': 1, 'attendanceDate': 1}",
                unique = true
        ),
        @CompoundIndex(
                name = "user_attendance_date_idx",
                def = "{'userId': 1, 'attendanceDate': -1}"
        ),
        @CompoundIndex(
                name = "status_deadline_idx",
                def = "{'status': 1, 'shift.punchOutDeadlineAt': 1}"
        )
})
public class AttendanceRecord {

    @Id
    private String id;

    @Indexed
    private String employeeId;

    @Indexed
    private String userId;

    private String employeeCode;
    private String employeeName;

    private String departmentId;
    private String designationId;

    private String attendanceDate;

    private ShiftSnapshot shift;

    private List<WorkInterval> intervals =
            new ArrayList<>();

    private long workedMinutes;
    private long breakMinutes;

    private boolean late;

    private AttendanceRecordStatus status;

    private Instant firstPunchInAt;
    private Instant lastPunchOutAt;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant finalizedAt;

    @Version
    private Long version;
}
