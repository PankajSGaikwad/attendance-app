package com.attendance.employee.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeTestController {

    @GetMapping("/test")
    public Map<String, Object> test(){
        return Map.of(
                "service","employee-service",
                "status", "running",
                "timestamp", Instant.now().toString()
        );

    }

}