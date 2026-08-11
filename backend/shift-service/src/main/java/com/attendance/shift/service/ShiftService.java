package com.attendance.shift.service;

import com.attendance.shift.dto.request.CreateShiftRequest;
import com.attendance.shift.dto.request.UpdateShiftRequest;
import com.attendance.shift.dto.response.ShiftResponse;

import java.util.List;

public interface ShiftService {
    ShiftResponse create(CreateShiftRequest request, String createdBy);

    ShiftResponse getById(String shiftId);

    List<ShiftResponse> getAll(boolean activeOnly);

    ShiftResponse update(String shiftId, UpdateShiftRequest request, String updatedBy);

    ShiftResponse setActive(String shiftId, boolean active, String updatedBy);
}
