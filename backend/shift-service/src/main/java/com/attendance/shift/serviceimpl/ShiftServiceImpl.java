package com.attendance.shift.serviceimpl;

import com.attendance.shift.dto.request.CreateShiftRequest;
import com.attendance.shift.dto.request.UpdateShiftRequest;
import com.attendance.shift.dto.response.ShiftResponse;
import com.attendance.shift.exception.DuplicateResourceException;
import com.attendance.shift.exception.InvalidShiftException;
import com.attendance.shift.exception.ResourceNotFoundException;
import com.attendance.shift.mapper.ShiftMapper;
import com.attendance.shift.model.ShiftTemplate;
import com.attendance.shift.repository.DepartmentShiftAssignmentRepository;
import com.attendance.shift.repository.ShiftTemplateRepository;
import com.attendance.shift.service.ShiftService;
import com.attendance.shift.util.ShiftTextNormalizer;
import com.attendance.shift.util.ShiftWindowFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {
    private final ShiftTemplateRepository shiftRepository;
    private final DepartmentShiftAssignmentRepository assignmentRepository;
    private final ShiftWindowFactory shiftWindowFactory;
    private final ShiftMapper shiftMapper;

    @Override
    public ShiftResponse create(CreateShiftRequest request, String createdBy) {

        String code= ShiftTextNormalizer.code(request.code());
        String name= ShiftTextNormalizer.displayName(request.name());

        if (shiftRepository.existsByCode(code)){
            throw new DuplicateResourceException("Shift code already exists: " + code);
        }

        shiftWindowFactory.validateDefinition(request.startTime(), request.endTime(), request.zoneId());

        Instant now= Instant.now();
        ShiftTemplate shift= new ShiftTemplate();

        shift.setCode(code);
        shift.setName(name);

        shift.setStartTime(
                request.startTime()
        );

        shift.setEndTime(
                request.endTime()
        );

        shift.setZoneId(
                request.zoneId().trim()
        );

        shift.setEarlyPunchInMinutes(
                request.earlyPunchInMinutes()
        );

        shift.setLateGraceMinutes(
                request.lateGraceMinutes()
        );

        shift.setMaxPunchOutAfterMinutes(
                request.maxPunchOutAfterMinutes()
        );

        shift.setActive(true);

        shift.setCreatedBy(createdBy);
        shift.setUpdatedBy(createdBy);

        shift.setCreatedAt(now);
        shift.setUpdatedAt(now);
        return shiftMapper.toResponse(shiftRepository.save(shift));
    }

    @Override
    public ShiftResponse getById(String shiftId) {
        return shiftMapper.toResponse(findShift(shiftId));
    }

    @Override
    public List<ShiftResponse> getAll(boolean activeOnly) {
        List<ShiftTemplate> shifts= activeOnly ? shiftRepository.findByActiveTrueOrderByNameAsc() : shiftRepository.findAllByOrderByNameAsc();

        return shifts.stream().map(shiftMapper::toResponse).toList();
    }

    @Override
    public ShiftResponse update(String shiftId, UpdateShiftRequest request, String updatedBy) {

        ShiftTemplate shift = findShift(shiftId);

        //Once Shift created and assigned we cannot update it because it will overlap past working our so for update we will create new shift with new time and date but show update
        if (assignmentRepository.existsByShiftId(shiftId)){
            throw new InvalidShiftException( "An assigned shift cannot be edited. " + "Create a new shift and assign it " + "with a new effective date.");
        }

        shiftWindowFactory.validateDefinition(request.startTime(),request.endTime(),request.zoneId());

        shift.setName(
                ShiftTextNormalizer.displayName(
                        request.name()
                )
        );

        shift.setStartTime(
                request.startTime()
        );

        shift.setEndTime(
                request.endTime()
        );

        shift.setZoneId(
                request.zoneId().trim()
        );

        shift.setEarlyPunchInMinutes(
                request.earlyPunchInMinutes()
        );

        shift.setLateGraceMinutes(
                request.lateGraceMinutes()
        );

        shift.setMaxPunchOutAfterMinutes(
                request.maxPunchOutAfterMinutes()
        );

        shift.setUpdatedBy(updatedBy);
        shift.setUpdatedAt(Instant.now());

        return shiftMapper.toResponse(
                shiftRepository.save(shift)
        );
    }

    @Override
    public ShiftResponse setActive(String shiftId, boolean active, String updatedBy) {

        ShiftTemplate shift=findShift(shiftId);

        shift.setActive(active);
        shift.setUpdatedBy(updatedBy);
        shift.setUpdatedAt(Instant.now());
        return shiftMapper.toResponse(shift);
    }

    private ShiftTemplate findShift(String shiftId){
        return shiftRepository.findById(shiftId).orElseThrow(()-> new ResourceNotFoundException("Shift not found with ID: "
                + shiftId));
    }
}
