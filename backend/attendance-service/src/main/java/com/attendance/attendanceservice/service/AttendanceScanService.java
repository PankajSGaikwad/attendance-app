package com.attendance.attendanceservice.service;

import com.attendance.attendanceservice.dto.request.CompleteAttendanceScanRequest;
import com.attendance.attendanceservice.dto.request.StartAttendanceScanRequest;
import com.attendance.attendanceservice.dto.response.CompleteAttendanceScanResponse;
import com.attendance.attendanceservice.dto.response.StartAttendanceScanResponse;

public interface AttendanceScanService {

    StartAttendanceScanResponse startPublicScan(
            StartAttendanceScanRequest request
    );

    StartAttendanceScanResponse startAuthenticatedScan(
            String authenticatedUserId,
            StartAttendanceScanRequest request
    );

    CompleteAttendanceScanResponse completePublicScan(
            CompleteAttendanceScanRequest request
    );

    CompleteAttendanceScanResponse
    completeAuthenticatedScan(
            String authenticatedUserId,
            CompleteAttendanceScanRequest request
    );
}