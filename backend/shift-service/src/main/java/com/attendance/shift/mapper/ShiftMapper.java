package com.attendance.shift.mapper;

import com.attendance.shift.dto.response.ShiftResponse;
import com.attendance.shift.model.ShiftTemplate;
import com.attendance.shift.util.ShiftDefinition;
import com.attendance.shift.util.ShiftWindowFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShiftMapper {

    private final ShiftWindowFactory shiftWindowFactory;

    public ShiftResponse toResponse(ShiftTemplate shift){
        ShiftDefinition definition = shiftWindowFactory.validateDefinition(shift.getStartTime(),shift.getEndTime(),shift.getZoneId());

        return new ShiftResponse(
                shift.getId(),
                shift.getCode(),
                shift.getName(),

                shift.getStartTime(),
                shift.getEndTime(),
                shift.getZoneId(),

                definition.overnight(),
                definition.nominalDurationMinutes(),

                shift.getEarlyPunchInMinutes(),
                shift.getLateGraceMinutes(),
                shift.getMaxPunchOutAfterMinutes(),

                shift.isActive(),

                shift.getCreatedBy(),
                shift.getUpdatedBy(),

                shift.getCreatedAt(),
                shift.getUpdatedAt()
        );
    }
}
