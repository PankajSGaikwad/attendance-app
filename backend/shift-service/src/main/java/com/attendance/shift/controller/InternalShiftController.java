package com.attendance.shift.controller;

import com.attendance.shift.dto.response.EffectiveShiftResponse;
import com.attendance.shift.service.ShiftResolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/internal/shifts")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole(" +
                "'INTERNAL_SERVICE'," +
                "'ADMIN'," +
                "'SUPERVISOR'," +
                "'KIOSK'" +
                ")"
)
public class InternalShiftController {
    private final ShiftResolutionService shiftResolutionService;

    @GetMapping("/effective")
    public EffectiveShiftResponse resolve(@RequestParam String employeeId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)Instant at) {
        return shiftResolutionService.resolveForEmployee(employeeId, at);
    }
}
