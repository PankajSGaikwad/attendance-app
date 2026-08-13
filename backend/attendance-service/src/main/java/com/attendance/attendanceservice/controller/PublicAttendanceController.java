package com.attendance.attendanceservice.controller;

import com.attendance.attendanceservice.dto.request.CompleteAttendanceScanRequest;
import com.attendance.attendanceservice.dto.request.StartAttendanceScanRequest;
import com.attendance.attendanceservice.dto.response.CompleteAttendanceScanResponse;
import com.attendance.attendanceservice.dto.response.StartAttendanceScanResponse;
import com.attendance.attendanceservice.service.AttendanceScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance/public")
@RequiredArgsConstructor
public class PublicAttendanceController {

    private final AttendanceScanService
            attendanceScanService;

    @GetMapping("/test")
    public String test() {
        return "PUBLIC ATTENDANCE WORKS";
    }

    @PostMapping("/scan/start")
    public StartAttendanceScanResponse start(
            @Valid
            @RequestBody
            StartAttendanceScanRequest request
    ) {
        return attendanceScanService
                .startPublicScan(request);
    }

    @PostMapping("/scan/complete")
    public CompleteAttendanceScanResponse complete(
            @Valid
            @RequestBody
            CompleteAttendanceScanRequest request
    ) {
        return attendanceScanService
                .completePublicScan(request);
    }
}