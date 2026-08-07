package com.attendance.employee.service;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeQrContextResponse;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.model.EmployeeStatus;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createMyProfile(
            String userId,
            String email,
            CreateEmployeeRequest request
    );

    EmployeeResponse getMyProfile(
            String userId
    );

    EmployeeResponse updateMyProfile(
            String userId,
            UpdateEmployeeRequest request
    );

    EmployeeResponse submitMyProfile(
            String userId
    );

    void deleteMyProfile(
            String userId
    );

    EmployeeResponse getById(
            String employeeId
    );

    List<EmployeeResponse> getAll(
            EmployeeStatus status
    );

    EmployeeResponse approve(
            String employeeId,
            String approvedBy
    );

    EmployeeResponse reject(
            String employeeId,
            String rejectedBy,
            String reason
    );

    EmployeeQrImage getMyQr(
            String userId
    );

    EmployeeQrImage getQrForManagement(
            String employeeId
    );

    EmployeeWorkContextResponse getWorkContext(
            String employeeId
    );

    EmployeeQrContextResponse getByQrToken(
            String qrToken
    );
}