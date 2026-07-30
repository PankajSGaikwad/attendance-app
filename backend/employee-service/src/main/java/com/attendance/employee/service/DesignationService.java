package com.attendance.employee.service;

import com.attendance.employee.dto.request.BulkCreateDesignationRequest;
import com.attendance.employee.dto.request.CreateDesignationRequest;
import com.attendance.employee.dto.request.UpdateDesignationRequest;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DesignationResponse;

import java.util.List;

public interface DesignationService {
    DesignationResponse create(String departmentId, CreateDesignationRequest request);

    List<DesignationResponse> createBulk(String departmentId, BulkCreateDesignationRequest request);

    DesignationResponse getById(String designationId);

    List<DesignationResponse> getByDepartment(String departmentId, boolean activeOnly);

    List<DepartmentOptionResponse> getOptions(String departmentId);

    DesignationResponse update(String designationId, UpdateDesignationRequest request);

    DesignationResponse setActive(String designationId, boolean active);
}
