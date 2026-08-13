package com.attendance.attendanceservice.dto.response;

import com.attendance.attendanceservice.model.AttendanceRecordStatus;

import java.time.Instant;
import java.util.List;

public record AttendanceResponse(

        String id,

        String employeeId,
        String employeeCode,
        String employeeName,

        String departmentId,
        String designationId,

        String attendanceDate,

        String shiftId,
        String shiftCode,
        String shiftName,

        String zoneId,

        String scheduledStartTime,
        String scheduledEndTime,

        Instant scheduledStartAt,
        Instant scheduledEndAt,

        boolean overnight,
        boolean late,

        AttendanceRecordStatus status,

        long workedMinutes,
        long breakMinutes,

        List<WorkIntervalResponse> intervals,

        Instant createdAt,
        Instant updatedAt,
        Instant finalizedAt
) {
}