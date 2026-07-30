package com.attendance.employee.controller;

import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/employees")
@RequiredArgsConstructor
public class InternalEmployeeController {
    private final EmployeeService employeeService;

    @GetMapping("/{employeeId}/work-context")
    public EmployeeWorkContextResponse getWorkContext(@PathVariable String employeeId){
        return employeeService.getWorkContext(employeeId);
    }
}
