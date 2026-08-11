package com.attendance.shift.controller;

import com.attendance.shift.dto.request.AssignDepartmentShiftRequest;
import com.attendance.shift.dto.response.DepartmentShiftAssignmentResponse;
import com.attendance.shift.service.DepartmentShiftAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shift-assignments/departments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class DepartmentShiftAssignmentController {
    private final DepartmentShiftAssignmentService assignmentService;

    @PutMapping("/{departmentId}")
    public DepartmentShiftAssignmentResponse assign(@PathVariable String departmentId, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AssignDepartmentShiftRequest request){
        return assignmentService.assign(departmentId,request,jwt.getSubject());
    }

    @GetMapping("/{departmentId}/effective")
    public DepartmentShiftAssignmentResponse getEffective(@PathVariable String departmentId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        return assignmentService.getEffective(departmentId, date);
    }

    @GetMapping("/{departmentId}/history")
    public List<DepartmentShiftAssignmentResponse> getHistory(@PathVariable String departmentId) {
        return assignmentService.getHistory(departmentId);
    }
}
