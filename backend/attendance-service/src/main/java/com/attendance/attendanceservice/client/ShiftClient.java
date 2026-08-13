package com.attendance.attendanceservice.client;

import com.attendance.attendanceservice.client.config.InternalFeignConfig;
import com.attendance.attendanceservice.dto.response.EffectiveShiftResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "shift-service",
        configuration = InternalFeignConfig.class
)
public interface ShiftClient {
    @GetMapping("/internal/shifts/effective")
    EffectiveShiftResponse resolveEffectiveShift(
            @RequestParam String employeeId,
            @RequestParam String at
    );
}
