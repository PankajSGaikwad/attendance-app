package com.attendance.employee.service;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.model.EmployeeStatus;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse create(CreateEmployeeRequest create);

    EmployeeResponse getById(String employeeId);

    List<EmployeeResponse> getAll(EmployeeStatus status);

    EmployeeResponse getUserById(String userId);

    EmployeeResponse update(String employeeId, UpdateEmployeeRequest request);

    EmployeeResponse submit(String employeeId);

    void delete(String employeeId);

    EmployeeWorkContextResponse getWorkContext(String employeeId);
}
