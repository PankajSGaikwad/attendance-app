package com.attendance.employee.controller;

import com.attendance.employee.dto.request.RejectEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.model.EmployeeStatus;
import com.attendance.employee.service.EmployeeQrImage;
import com.attendance.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'SUPERVISOR')"
)
public class EmployeeManagementController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeResponse> getEmployees(
            @RequestParam(required = false)
            EmployeeStatus status
    ) {
        return employeeService.getAll(status);
    }

    @GetMapping("/{employeeId}")
    public EmployeeResponse getEmployee(
            @PathVariable String employeeId
    ) {
        return employeeService.getById(
                employeeId
        );
    }

    @PatchMapping("/{employeeId}/approve")
    public EmployeeResponse approve(
            @PathVariable String employeeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return employeeService.approve(
                employeeId,
                jwt.getSubject()
        );
    }

    @PatchMapping("/{employeeId}/reject")
    public EmployeeResponse reject(
            @PathVariable String employeeId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            RejectEmployeeRequest request
    ) {
        return employeeService.reject(
                employeeId,
                jwt.getSubject(),
                request.reason()
        );
    }

    @GetMapping(
            value = "/{employeeId}/qr",
            produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> getEmployeeQr(
            @PathVariable String employeeId
    ) {
        EmployeeQrImage qr =
                employeeService
                        .getQrForManagement(
                                employeeId
                        );

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.noStore())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\""
                                + qr.fileName()
                                + "\""
                )
                .body(qr.content());
    }
}