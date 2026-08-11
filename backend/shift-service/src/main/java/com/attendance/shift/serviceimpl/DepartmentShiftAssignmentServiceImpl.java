package com.attendance.shift.serviceimpl;

import com.attendance.shift.client.EmployeeDirectoryService;
import com.attendance.shift.dto.request.AssignDepartmentShiftRequest;
import com.attendance.shift.dto.response.DepartmentShiftAssignmentResponse;
import com.attendance.shift.exception.InvalidAssignmentException;
import com.attendance.shift.exception.ResourceNotFoundException;
import com.attendance.shift.mapper.ShiftMapper;
import com.attendance.shift.model.DepartmentShiftAssignment;
import com.attendance.shift.model.ShiftTemplate;
import com.attendance.shift.repository.DepartmentShiftAssignmentRepository;
import com.attendance.shift.repository.ShiftTemplateRepository;
import com.attendance.shift.service.DepartmentShiftAssignmentService;
import com.attendance.shift.util.AssignmentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DepartmentShiftAssignmentServiceImpl implements DepartmentShiftAssignmentService {
    private final DepartmentShiftAssignmentRepository assignmentRepository;

    private final ShiftTemplateRepository shiftRepository;

    private final EmployeeDirectoryService employeeDirectoryService;

    private final AssignmentResolver assignmentResolver;

    private final ShiftMapper shiftMapper;

    @Override
    public DepartmentShiftAssignmentResponse assign(String departmentId, AssignDepartmentShiftRequest request, String assignedBy){
        employeeDirectoryService.requireActiveDepartment(departmentId);

        ShiftTemplate shift= shiftRepository.findById(request.shiftId()).orElseThrow(()-> new ResourceNotFoundException("Shift not found with ID: "
                + request.shiftId()));

        if (!shift.isActive()){
            throw new InvalidAssignmentException("Inactive shift cannot receive a new assignment");
        }

        LocalDate effectiveFrom= parseDate(request.effectiveFrom());
        LocalDate today= LocalDate.now(ZoneId.of(shift.getZoneId()));

        if (effectiveFrom.isBefore(today)){
            throw new InvalidAssignmentException("Effective-from date cannot be in the past");
        }

        Optional<DepartmentShiftAssignment> sameStartAssignment= assignmentRepository.findByDepartmentIdAndEffectiveFrom(departmentId, effectiveFrom.toString());

        //If an assignment already starts on the same date we will replace the selected shift.

        if (sameStartAssignment.isPresent()){
            DepartmentShiftAssignment assignment = sameStartAssignment.get();

            assignment.setShiftId(shift.getId());

            assignment.setAssignedBy(assignedBy);

            assignment.setUpdatedAt(Instant.now());

            return toResponse(assignmentRepository.save(assignment));
        }

        Optional<DepartmentShiftAssignment> currentAssignment = assignmentResolver.findEffective(departmentId, effectiveFrom);

        if (currentAssignment.isPresent() && currentAssignment.get().getShiftId().equals(shift.getId())){
            throw new InvalidAssignmentException("This shift is already effective " + "for the department on " + effectiveFrom);
        }

        //Closing the currently effective assignment one day before the new assignment starts.

        currentAssignment.ifPresent(current -> {
            current.setEffectiveTo(effectiveFrom.minusDays(1).toString());

            current.setUpdatedAt(Instant.now());
            assignmentRepository.save(current);
        });

        Optional<DepartmentShiftAssignment> nextAssignment = assignmentRepository.findFirstByDepartmentIdAndEffectiveFromGreaterThanOrderByEffectiveFromAsc(departmentId, effectiveFrom.toString());

        String effectiveTo= nextAssignment.map(assignment -> LocalDate.parse(assignment.getEffectiveFrom()).minusDays(1).toString()).orElse(null);

        Instant now = Instant.now();

        DepartmentShiftAssignment assignment = new DepartmentShiftAssignment();

        assignment.setDepartmentId(departmentId);

        assignment.setShiftId(shift.getId());

        assignment.setEffectiveFrom(effectiveFrom.toString());

        assignment.setEffectiveTo(effectiveTo);

        assignment.setAssignedBy(assignedBy);

        assignment.setCreatedAt(now);
        assignment.setUpdatedAt(now);

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public DepartmentShiftAssignmentResponse getEffective(String departmentId, LocalDate date){
        employeeDirectoryService.requireActiveDepartment(departmentId);

        DepartmentShiftAssignment assignment = assignmentResolver.findEffective(departmentId, date).orElseThrow(()-> new ResourceNotFoundException("No shift is assigned " + "to department " + departmentId + " for date " + date));

        return toResponse(assignment);
    }

    @Override
    public List<DepartmentShiftAssignmentResponse> getHistory(String departmentId) {
        employeeDirectoryService.requireActiveDepartment(departmentId);

        return assignmentRepository.findByDepartmentIdOrderByEffectiveFromDesc(departmentId).stream().map(this::toResponse).toList();
    }

    private DepartmentShiftAssignmentResponse toResponse(DepartmentShiftAssignment assignment){
        ShiftTemplate shift = shiftRepository.findById(assignment.getShiftId()).orElseThrow(()-> new ResourceNotFoundException("Assigned shift no longer exists: "
                + assignment.getShiftId()));

        return new DepartmentShiftAssignmentResponse(
                assignment.getId(),
                assignment.getDepartmentId(),

                assignment.getEffectiveFrom(),
                assignment.getEffectiveTo(),

                assignment.getAssignedBy(),

                shiftMapper.toResponse(shift),

                assignment.getCreatedAt(),
                assignment.getUpdatedAt()
        );
    }

    private LocalDate parseDate(String value){
        try {
            return LocalDate.parse(value);
        }catch (DateTimeException exception){
            throw new InvalidAssignmentException("Invalid effective-from date: " + value);
        }
    }
}
