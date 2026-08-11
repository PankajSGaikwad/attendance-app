package com.attendance.shift.service;

import com.attendance.shift.dto.response.EffectiveShiftResponse;

import java.time.Instant;

public interface ShiftResolutionService {
    EffectiveShiftResponse resolveForEmployee(String employeeId, Instant requestedAt);
}
