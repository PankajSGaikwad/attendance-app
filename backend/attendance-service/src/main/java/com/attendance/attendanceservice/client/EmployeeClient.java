package com.attendance.attendanceservice.client;

import com.attendance.attendanceservice.client.config.InternalFeignConfig;
import com.attendance.attendanceservice.dto.response.EmployeeQrContextResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "employee-service",
        configuration = InternalFeignConfig.class
)
public interface EmployeeClient {
    @GetMapping(
            "/internal/employees/by-qr/{qrToken}"
    )
    EmployeeQrContextResponse getByQrToken(
            @PathVariable String qrToken
    );
}
