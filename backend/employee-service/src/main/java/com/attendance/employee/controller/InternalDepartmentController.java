package com.attendance.employee.controller;

import com.attendance.employee.dto.response.DepartmentContextResponse;
import com.attendance.employee.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/departments")
@RequiredArgsConstructor
public class InternalDepartmentController {
    private final DepartmentService departmentService;

    @GetMapping("/{departmentId}")
    public DepartmentContextResponse getContext(@PathVariable String departmentId){
        return departmentService.getContext(departmentId);
    }
}
