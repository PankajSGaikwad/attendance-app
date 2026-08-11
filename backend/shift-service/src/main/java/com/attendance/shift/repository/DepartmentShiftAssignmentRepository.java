package com.attendance.shift.repository;

import com.attendance.shift.model.DepartmentShiftAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentShiftAssignmentRepository extends MongoRepository<DepartmentShiftAssignment, String> {
    boolean existsByShiftId(String shiftId);

    Optional<DepartmentShiftAssignment> findByDepartmentIdAndEffectiveFrom(String departmentId, String effectiveFrom);

    List<DepartmentShiftAssignment>
    findByDepartmentIdOrderByEffectiveFromDesc(
            String departmentId
    );

    List<DepartmentShiftAssignment>
    findByDepartmentIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            String departmentId,
            String date
    );

    Optional<DepartmentShiftAssignment>
    findFirstByDepartmentIdAndEffectiveFromGreaterThanOrderByEffectiveFromAsc(
            String departmentId,
            String date
    );
}
