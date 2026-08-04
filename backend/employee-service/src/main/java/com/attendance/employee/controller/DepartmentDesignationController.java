package com.attendance.employee.controller;

import com.attendance.employee.dto.request.BulkCreateDesignationRequest;
import com.attendance.employee.dto.request.CreateDesignationRequest;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DesignationOptionResponse;
import com.attendance.employee.dto.response.DesignationResponse;
import com.attendance.employee.service.DesignationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments/{departmentId}/designations")
@RequiredArgsConstructor
public class DepartmentDesignationController {
    private final DesignationService designationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DesignationResponse create(@PathVariable String departmentId, @Valid @RequestBody CreateDesignationRequest request){
        return designationService.create(departmentId, request);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public List<DesignationResponse> createBulk(@PathVariable String departmentId, @Valid @RequestBody BulkCreateDesignationRequest request){
        return designationService.createBulk(departmentId, request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<DesignationResponse> getAll(@PathVariable String departmentId, @RequestParam(defaultValue = "false") boolean activeOnly){
        return designationService.getByDepartment(departmentId, activeOnly);
    }

    @GetMapping("/options")
    @PreAuthorize("isAuthenticated()")
    public List<DesignationOptionResponse> getOptions(@PathVariable String departmentId){
        return designationService.getOptions(departmentId);
    }
}
