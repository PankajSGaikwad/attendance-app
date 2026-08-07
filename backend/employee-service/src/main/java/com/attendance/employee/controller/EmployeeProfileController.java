package com.attendance.employee.controller;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.service.EmployeeQrImage;
import com.attendance.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeProfileController {

    private final EmployeeService employeeService;

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            CreateEmployeeRequest request
    ) {
        return employeeService.createMyProfile(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                request
        );
    }

    @GetMapping("/me")
    public EmployeeResponse getMyProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return employeeService.getMyProfile(
                jwt.getSubject()
        );
    }

    @PutMapping("/me")
    public EmployeeResponse updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid
            @RequestBody
            UpdateEmployeeRequest request
    ) {
        return employeeService.updateMyProfile(
                jwt.getSubject(),
                request
        );
    }

    @PatchMapping("/me/submit")
    public EmployeeResponse submitMyProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return employeeService.submitMyProfile(
                jwt.getSubject()
        );
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        employeeService.deleteMyProfile(
                jwt.getSubject()
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping(
            value = "/me/qr",
            produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> getMyQr(
            @AuthenticationPrincipal Jwt jwt
    ) {
        EmployeeQrImage qr =
                employeeService.getMyQr(
                        jwt.getSubject()
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