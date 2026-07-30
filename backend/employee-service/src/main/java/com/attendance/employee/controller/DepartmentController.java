package com.attendance.employee.controller;

import com.attendance.employee.dto.request.CreateDepartmentRequest;
import com.attendance.employee.dto.request.UpdateDepartmentRequest;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DepartmentResponse;
import com.attendance.employee.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse create(@Valid @RequestBody CreateDepartmentRequest request){
        return departmentService.create(request);
    }

    @GetMapping
    public List<DepartmentResponse> gateAll(@RequestParam(defaultValue = "false") boolean activeOnly){
        return departmentService.getAll(activeOnly);
    }

    @GetMapping("/options")
    public List<DepartmentOptionResponse> getOptions(){
        return departmentService.getOptions();
    }

    @GetMapping("/{departmentId}")
    public DepartmentResponse getById(@PathVariable String departmentId){
        return departmentService.getById(departmentId);
    }

    @PutMapping("/departmentId")
    public DepartmentResponse update(@PathVariable String departmentId, @Valid @RequestBody UpdateDepartmentRequest request){
        return departmentService.update(departmentId,request);
    }

    @PatchMapping("/{departmentId}/activate")
    public DepartmentResponse active(@PathVariable String departmentId){
        return departmentService.setActive(departmentId,true);
    }

    @PatchMapping("/{departmentId}/deactivate")
    public DepartmentResponse deactivate(@PathVariable String departmentId){
        return departmentService.setActive(departmentId,false);
    }
}
