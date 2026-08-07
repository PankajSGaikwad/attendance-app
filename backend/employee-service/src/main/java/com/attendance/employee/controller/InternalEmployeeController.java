package com.attendance.employee.controller;

import com.attendance.employee.dto.response.EmployeeQrContextResponse;
import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/employees")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'SUPERVISOR', 'KIOSK')"
)
public class InternalEmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/{employeeId}/work-context")
    public EmployeeWorkContextResponse getWorkContext(
            @PathVariable String employeeId
    ) {
        return employeeService.getWorkContext(
                employeeId
        );
    }

    @GetMapping("/by-qr/{qrToken}")
    public EmployeeQrContextResponse getByQrToken(
            @PathVariable String qrToken
    ) {
        return employeeService.getByQrToken(
                qrToken
        );
    }
}