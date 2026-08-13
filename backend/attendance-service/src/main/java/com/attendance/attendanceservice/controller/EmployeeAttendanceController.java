package com.attendance.attendanceservice.controller;

import com.attendance.attendanceservice.dto.request.CompleteAttendanceScanRequest;
import com.attendance.attendanceservice.dto.request.StartAttendanceScanRequest;
import com.attendance.attendanceservice.dto.response.AttendanceResponse;
import com.attendance.attendanceservice.dto.response.CompleteAttendanceScanResponse;
import com.attendance.attendanceservice.dto.response.StartAttendanceScanResponse;
import com.attendance.attendanceservice.service.AttendanceQueryService;
import com.attendance.attendanceservice.service.AttendanceScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeAttendanceController {

    private final AttendanceScanService
            attendanceScanService;

    private final AttendanceQueryService
            attendanceQueryService;

    @PostMapping("/scan/start")
    public StartAttendanceScanResponse start(
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            StartAttendanceScanRequest request
    ) {
        return attendanceScanService
                .startAuthenticatedScan(
                        jwt.getSubject(),
                        request
                );
    }

    @PostMapping("/scan/complete")
    public CompleteAttendanceScanResponse complete(
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            CompleteAttendanceScanRequest request
    ) {
        return attendanceScanService
                .completeAuthenticatedScan(
                        jwt.getSubject(),
                        request
                );
    }

    @GetMapping("/me")
    public List<AttendanceResponse> getMyHistory(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return attendanceQueryService
                .getMyHistory(
                        jwt.getSubject()
                );
    }
}