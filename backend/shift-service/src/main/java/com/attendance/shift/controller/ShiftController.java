package com.attendance.shift.controller;

import com.attendance.shift.dto.request.CreateShiftRequest;
import com.attendance.shift.dto.request.UpdateShiftRequest;
import com.attendance.shift.dto.response.ShiftResponse;
import com.attendance.shift.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'SUPERVISOR')"
)
public class ShiftController {
    private final ShiftService shiftService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShiftResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateShiftRequest request){
        return shiftService.create(request, jwt.getSubject());
    }

    @GetMapping
    public List<ShiftResponse> getAll(@RequestParam(defaultValue = "false") boolean activeOnly){
        return shiftService.getAll(activeOnly);
    }

    @GetMapping("/{shiftId}")
    public ShiftResponse getById(@PathVariable String shiftId){
        return shiftService.getById(shiftId);
    }

    @PutMapping("/{shiftId}")
    public ShiftResponse update(@PathVariable String shiftId, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateShiftRequest request
    ) {
        return shiftService.update(shiftId, request, jwt.getSubject());
    }

    @PatchMapping("/{shiftId}/activate")
    public ShiftResponse activate(@PathVariable String shiftId, @AuthenticationPrincipal Jwt jwt
    ) {
        return shiftService.setActive(shiftId, true, jwt.getSubject());
    }

    @PatchMapping("/{shiftId}/deactivate")
    public ShiftResponse deactivate(@PathVariable String shiftId, @AuthenticationPrincipal Jwt jwt
    ) {
        return shiftService.setActive(shiftId, false, jwt.getSubject());
    }
}
