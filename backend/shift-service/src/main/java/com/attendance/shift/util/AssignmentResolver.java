package com.attendance.shift.util;

import com.attendance.shift.model.DepartmentShiftAssignment;
import com.attendance.shift.repository.DepartmentShiftAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component //class level annotation used for mark the class as a Spring managed bean
@RequiredArgsConstructor
public class AssignmentResolver {
    private final DepartmentShiftAssignmentRepository assignmentRepository;

    public Optional<DepartmentShiftAssignment> findEffective(String departmentId, LocalDate date){
        return assignmentRepository.findByDepartmentIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(departmentId, date.toString())
                .stream().filter(assignment -> assignment.getEffectiveTo() == null || !LocalDate.parse(assignment.getEffectiveTo()).isBefore(date)).findFirst();

    }

}
