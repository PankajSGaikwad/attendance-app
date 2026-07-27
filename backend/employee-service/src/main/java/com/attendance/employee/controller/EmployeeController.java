package com.attendance.employee.controller;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.model.EmployeeStatus;
import com.attendance.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(
            @Valid @RequestBody CreateEmployeeRequest request
            )
    {
        EmployeeResponse response =
                employeeService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{employeeId}")
    public EmployeeResponse getById(
            @PathVariable String employeeId
    ){
        return employeeService.getById(employeeId);
    }

    @GetMapping("/User-id/{userId}")
    public EmployeeResponse getByUserId(
            @PathVariable String userId
    ){
        return employeeService.getUserById(userId);
    }

    @GetMapping
    public  List<EmployeeResponse> getAll(
            @RequestParam(required = false)
            EmployeeStatus status
    ){
        return employeeService.getAll(status);
    }

    @PutMapping("/{employeeId}")
    public EmployeeResponse update(
            @PathVariable String employeeId,
            @Valid @RequestBody UpdateEmployeeRequest request
            ){
        return employeeService.update(
                employeeId,
                request
        );
    }

    @PatchMapping("/{employeeId}/submit")
    public EmployeeResponse submit(
            @PathVariable String employeeId
    ){
        return employeeService.submit(employeeId);
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> delete(
            @PathVariable String employeeId
    ){
        employeeService.delete(employeeId);

        return ResponseEntity.noContent().build();
    }
}
