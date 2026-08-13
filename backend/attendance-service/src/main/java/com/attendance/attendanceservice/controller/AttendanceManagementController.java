package com.attendance.attendanceservice.controller;

import com.attendance.attendanceservice.dto.response.AttendanceResponse;
import com.attendance.attendanceservice.service.AttendanceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'SUPERVISOR')"
)
public class AttendanceManagementController {

    private final AttendanceQueryService
            attendanceQueryService;

    @GetMapping("/{attendanceId}")
    public AttendanceResponse getById(
            @PathVariable String attendanceId
    ) {
        return attendanceQueryService
                .getById(attendanceId);
    }

    @GetMapping("/employees/{employeeId}")
    public List<AttendanceResponse>
    getEmployeeHistory(
            @PathVariable String employeeId
    ) {
        return attendanceQueryService
                .getEmployeeHistory(
                        employeeId
                );
    }
}