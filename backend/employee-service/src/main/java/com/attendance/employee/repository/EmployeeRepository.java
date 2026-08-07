package com.attendance.employee.repository;

import com.attendance.employee.model.Employee;
import com.attendance.employee.model.EmployeeStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends MongoRepository<Employee, String> {

    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByQrToken(String qrToken);

    List<Employee> findByStatus(EmployeeStatus status);

    Optional<Employee> findByUserId(String userId);

    Optional<Employee> findByQrToken(String qrToken);

    List<Employee> findAllByOrderByCreatedAtDesc();

    List<Employee> findByStatusOrderByCreatedAtDesc(EmployeeStatus status);

    boolean existsByDepartmentId(String departmentId);

    boolean existsByDesignationId(String designationId);
}
