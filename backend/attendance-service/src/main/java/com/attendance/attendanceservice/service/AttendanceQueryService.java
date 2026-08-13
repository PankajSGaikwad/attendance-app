package com.attendance.attendanceservice.service;
import com.attendance.attendanceservice.dto.response.AttendanceResponse;

import java.util.List;

public interface AttendanceQueryService {

    List<AttendanceResponse> getMyHistory(
            String userId
    );

    AttendanceResponse getById(
            String attendanceId
    );

    List<AttendanceResponse> getEmployeeHistory(
            String employeeId
    );
}