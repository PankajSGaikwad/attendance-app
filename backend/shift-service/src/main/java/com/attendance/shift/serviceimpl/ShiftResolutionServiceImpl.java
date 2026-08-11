package com.attendance.shift.serviceimpl;

import com.attendance.shift.client.EmployeeDirectoryService;
import com.attendance.shift.dto.response.EffectiveShiftResponse;
import com.attendance.shift.dto.response.EmployeeWorkContextResponse;
import com.attendance.shift.exception.ResourceNotFoundException;
import com.attendance.shift.exception.ShiftNotApplicableException;
import com.attendance.shift.model.DepartmentShiftAssignment;
import com.attendance.shift.model.ShiftTemplate;
import com.attendance.shift.repository.ShiftTemplateRepository;
import com.attendance.shift.service.ShiftResolutionService;
import com.attendance.shift.util.AssignmentResolver;
import com.attendance.shift.util.ShiftWindow;
import com.attendance.shift.util.ShiftWindowFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShiftResolutionServiceImpl implements ShiftResolutionService {

    private final EmployeeDirectoryService employeeDirectoryService;

    private final AssignmentResolver assignmentResolver;

    private final ShiftTemplateRepository shiftRepository;

    private final ShiftWindowFactory shiftWindowFactory;

    @Override
    public EffectiveShiftResponse resolveForEmployee(String employeeId, Instant requestedAt) {
        EmployeeWorkContextResponse employee= employeeDirectoryService.getEmployeeWorkContext(employeeId);

        if (!employee.active() || !"APPROVED".equals(employee.status())){
            throw new ShiftNotApplicableException("Employee must be approved and active");
        }

        LocalDate utcDate= requestedAt.atZone(ZoneOffset.UTC).toLocalDate();

        //Checking three dates makes the logic work across time zones and overnight shifts.

        List<LocalDate> candidateDates= List.of(utcDate.minusDays(1), utcDate, utcDate.plusDays(1));

        Optional<MatchedShift> bestMatch= candidateDates.stream().map(date -> attemptMatch(employee, date, requestedAt)).flatMap(Optional::stream).min(Comparator.comparingLong(MatchedShift::distanceFromStartSeconds));

        return bestMatch.map(MatchedShift::response).orElseThrow(()-> new ShiftNotApplicableException("No department shift is available " + "for this employee at " + requestedAt));
    }

    private Optional<MatchedShift> attemptMatch(EmployeeWorkContextResponse employee, LocalDate candidateShiftDate, Instant requestedAt){
        Optional<DepartmentShiftAssignment> assignmentOptional= assignmentResolver.findEffective(employee.departmentId(), candidateShiftDate);

        if (assignmentOptional.isEmpty()){
            return Optional.empty();
        }

        DepartmentShiftAssignment assignment = assignmentOptional.get();

        ShiftTemplate shift= shiftRepository.findById(assignment.getShiftId()).orElseThrow(()-> new ResourceNotFoundException("Assigned shift does not exist: " + assignment.getShiftId()));

        ShiftWindow window= shiftWindowFactory.create(candidateShiftDate, shift);
        Instant allowedFrom= window.earliestPunchIn().toInstant();

        //This resolver is used for a new punch-in.Punch-out will use the employee's already-open attendance record and its saved shift snapshot.
        Instant allowedUntil= window.scheduledEnd().toInstant();

        boolean insidePunchInWindow= !requestedAt.isBefore(allowedFrom) && !requestedAt.isAfter(allowedUntil);

        if (!insidePunchInWindow){
            return Optional.empty();
        }

        boolean late = requestedAt.isAfter(window.lateAfter().toInstant());

        EffectiveShiftResponse response = new EffectiveShiftResponse(
                employee.employeeId(),
                employee.departmentId(),

                assignment.getId(),
                shift.getId(),
                shift.getCode(),
                shift.getName(),

                candidateShiftDate.toString(),

                shift.getZoneId(),
                shift.getStartTime(),
                shift.getEndTime(),

                window.overnight(),
                window.scheduledDurationMinutes(),

                window.scheduledStart()
                        .toInstant(),

                window.scheduledEnd()
                        .toInstant(),

                window.earliestPunchIn()
                        .toInstant(),

                window.lateAfter()
                        .toInstant(),

                window.punchOutDeadline()
                        .toInstant(),

                requestedAt,
                late
        );

        long distanceSeconds= Math.abs(Duration.between(window.scheduledStart().toInstant(), requestedAt).toSeconds());

        return Optional.of(new MatchedShift(response, distanceSeconds));
    }

    private record MatchedShift(
            EffectiveShiftResponse response,
            long distanceFromStartSeconds
    ){
    }
}
