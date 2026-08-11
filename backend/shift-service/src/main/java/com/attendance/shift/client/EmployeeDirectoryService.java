package com.attendance.shift.client;

import com.attendance.shift.dto.response.DepartmentContextResponse;
import com.attendance.shift.dto.response.EmployeeWorkContextResponse;
import com.attendance.shift.exception.DownstreamServiceException;
import com.attendance.shift.exception.ResourceNotFoundException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeDirectoryService {
    private final EmployeeClient employeeClient;

    public DepartmentContextResponse requireActiveDepartment(String departmentId){
        try {
            DepartmentContextResponse department=employeeClient.getDepartment(departmentId);

            if (!department.active()){
                throw new ResourceNotFoundException("Department is inactive: " +departmentId);
            }
            return department;
        }catch (FeignException.NotFound exception){
            throw new ResourceNotFoundException("Department not found with ID: " +departmentId);

        }catch (FeignException exception){
            throw new DownstreamServiceException("Employee Service could not validate department", exception);
        }
    }

    public EmployeeWorkContextResponse getEmployeeWorkContext(String employeeId){
        try {
            return employeeClient.getEmployeeWorkContext(employeeId);
        }catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Employee not found with ID: " + employeeId);
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Employee Service could not provide employee work context", exception);
        }
    }
}
