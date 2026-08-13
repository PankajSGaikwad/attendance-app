package com.attendance.attendanceservice.dto.response;

import com.attendance.attendanceservice.model.AttendanceAction;
import com.attendance.attendanceservice.model.AttendanceRecordStatus;

import java.time.Instant;

public record CompleteAttendanceScanResponse(

        String attendanceId,

        AttendanceAction actionRecorded,
        AttendanceAction nextAction,

        String attendanceDate,

        AttendanceRecordStatus status,

        int sessionCount,

        long workedMinutes,
        long breakMinutes,

        Instant recordedAt
) {
}