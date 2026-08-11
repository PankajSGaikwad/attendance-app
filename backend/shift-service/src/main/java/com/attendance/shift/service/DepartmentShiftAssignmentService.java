package com.attendance.shift.service;

import com.attendance.shift.dto.request.AssignDepartmentShiftRequest;
import com.attendance.shift.dto.response.DepartmentShiftAssignmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface DepartmentShiftAssignmentService {

    DepartmentShiftAssignmentResponse assign(String departmentId, AssignDepartmentShiftRequest request, String assignedBy);

    DepartmentShiftAssignmentResponse getEffective(String departmentId, LocalDate date);

    List<DepartmentShiftAssignmentResponse> getHistory(String departmentId);
}
