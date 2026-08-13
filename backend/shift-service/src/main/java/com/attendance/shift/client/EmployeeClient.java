package com.attendance.shift.client;

import com.attendance.shift.client.config.FeignAuthorizationConfig;
import com.attendance.shift.client.config.InternalFeignConfig;
import com.attendance.shift.dto.response.DepartmentContextResponse;
import com.attendance.shift.dto.response.EmployeeWorkContextResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "employee-service",
        configuration = InternalFeignConfig.class
)
public interface EmployeeClient {

    @GetMapping("/internal/departments/{departmentId}")
    DepartmentContextResponse getDepartment(@PathVariable String departmentId);

    @GetMapping("/internal/employees/{employeeId}/work-context")
    EmployeeWorkContextResponse getEmployeeWorkContext(@PathVariable String employeeId);
}
