package com.attendance.employee.service;

import com.attendance.employee.dto.request.CreateDepartmentRequest;
import com.attendance.employee.dto.request.UpdateDepartmentRequest;
import com.attendance.employee.dto.response.DepartmentContextResponse;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse create(CreateDepartmentRequest request);

    DepartmentResponse getById(String departmentId);

    List<DepartmentResponse> getAll(boolean activeOnly);

    List<DepartmentOptionResponse> getOptions();

    DepartmentResponse update(String departmentId, UpdateDepartmentRequest request);

    DepartmentResponse setActive(String departmentId, boolean active);

    DepartmentContextResponse getContext(String departmentId);
}
