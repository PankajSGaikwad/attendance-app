package com.attendance.employee.controller;

import com.attendance.employee.dto.request.UpdateDesignationRequest;
import com.attendance.employee.dto.response.DesignationResponse;
import com.attendance.employee.service.DesignationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
public class DesignationController {
    private final DesignationService designationService;

    @GetMapping("/{designationId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DesignationResponse getById(@PathVariable String designationId){
        return designationService.getById(designationId);
    }

    @PutMapping("/{designationId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DesignationResponse update(@PathVariable String designationId, @Valid @RequestBody UpdateDesignationRequest request){
        return designationService.update(designationId, request);
    }

    @PatchMapping("/{designationId}/activate")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DesignationResponse activate(@PathVariable String designationId){
        return designationService.setActive(designationId, true);
    }

    @PatchMapping("/{designationId}/deactivate")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPERVISOR')"
    )
    public DesignationResponse deactivate(@PathVariable String designationId){
        return designationService.setActive(designationId, false);
    }
}
