package com.attendance.employee.repository;

import com.attendance.employee.model.Designation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DesignationRepository extends MongoRepository<Designation, String> {

    boolean existsByDepartmentIdAndCode(String departmentId, String code);

    boolean existsByDepartmentIdAndNormalizedName(String departmentId, String normalizedName);

    boolean existsByDepartmentIdAndNormalizedNameAndIdNot(String departmentId, String normalizedName, String id);

    Optional<Designation> findByIdAndActiveTrue(String id);

    List<Designation> findByDepartmentIdOrderByNameAsc(String departmentId);

    List<Designation> findByDepartmentIdAndActiveTrueOrderByNameAsc(String departmentId);
}
