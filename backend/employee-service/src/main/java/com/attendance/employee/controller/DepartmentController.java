package com.attendance.employee.controller;

import com.attendance.employee.dto.request.CreateDepartmentRequest;
import com.attendance.employee.dto.request.UpdateDepartmentRequest;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DepartmentResponse;
import com.attendance.employee.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DepartmentResponse create(@Valid @RequestBody CreateDepartmentRequest request){
        return departmentService.create(request);
    }

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public List<DepartmentResponse> gateAll(@RequestParam(defaultValue = "false") boolean activeOnly){
        return departmentService.getAll(activeOnly);
    }

    @GetMapping("/options")
    @PreAuthorize("isAuthenticated()")//This allows employees to load the department dropdown.
    public List<DepartmentOptionResponse> getOptions(){
        return departmentService.getOptions();
    }

    @GetMapping("/{departmentId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DepartmentResponse getById(@PathVariable String departmentId){
        return departmentService.getById(departmentId);
    }

    @PutMapping("/departmentId")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DepartmentResponse update(@PathVariable String departmentId, @Valid @RequestBody UpdateDepartmentRequest request){
        return departmentService.update(departmentId,request);
    }

    @PatchMapping("/{departmentId}/activate")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DepartmentResponse active(@PathVariable String departmentId){
        return departmentService.setActive(departmentId,true);
    }

    @PatchMapping("/{departmentId}/deactivate")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DepartmentResponse deactivate(@PathVariable String departmentId){
        return departmentService.setActive(departmentId,false);
    }
}
