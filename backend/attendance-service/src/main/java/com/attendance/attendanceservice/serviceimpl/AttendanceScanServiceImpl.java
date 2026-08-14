package com.attendance.attendanceservice.serviceimpl;

import com.attendance.attendanceservice.client.EmployeeDirectoryGateway;
import com.attendance.attendanceservice.client.ShiftDirectoryGateway;
import com.attendance.attendanceservice.client.config.MediaDirectoryGateway;
import com.attendance.attendanceservice.dto.response.EffectiveShiftResponse;
import com.attendance.attendanceservice.dto.response.EmployeeQrContextResponse;
import com.attendance.attendanceservice.config.AttendanceProperties;
import com.attendance.attendanceservice.dto.request.CompleteAttendanceScanRequest;
import com.attendance.attendanceservice.dto.request.StartAttendanceScanRequest;
import com.attendance.attendanceservice.dto.response.CompleteAttendanceScanResponse;
import com.attendance.attendanceservice.dto.response.StartAttendanceScanResponse;
import com.attendance.attendanceservice.exception.AttendanceAttemptExpiredException;
import com.attendance.attendanceservice.exception.ForbiddenAttendanceException;
import com.attendance.attendanceservice.exception.InvalidAttendanceStateException;
import com.attendance.attendanceservice.exception.ResourceNotFoundException;
import com.attendance.attendanceservice.model.*;
import com.attendance.attendanceservice.repository.AttendanceAttemptRepository;
import com.attendance.attendanceservice.repository.AttendanceRecordRepository;
import com.attendance.attendanceservice.service.AttendanceScanService;
import com.attendance.attendanceservice.util.AttendanceCalculator;
import com.attendance.attendanceservice.util.AttemptTokenService;
import com.attendance.attendanceservice.util.QrValueParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceScanServiceImpl
        implements AttendanceScanService {

    private final AttendanceRecordRepository
            attendanceRecordRepository;

    private final AttendanceAttemptRepository
            attendanceAttemptRepository;

    private final EmployeeDirectoryGateway
            employeeDirectoryGateway;

    private final ShiftDirectoryGateway
            shiftDirectoryGateway;

    private final MediaDirectoryGateway
            mediaDirectoryGateway;

    private final QrValueParser qrValueParser;
    private final AttemptTokenService attemptTokenService;
    private final AttendanceCalculator attendanceCalculator;
    private final AttendanceProperties attendanceProperties;

    @Override
    public StartAttendanceScanResponse startPublicScan(
            StartAttendanceScanRequest request
    ) {
        return startScan(
                request,
                AttendanceSource.PUBLIC_SCAN,
                null
        );
    }

    @Override
    public StartAttendanceScanResponse
    startAuthenticatedScan(
            String authenticatedUserId,
            StartAttendanceScanRequest request
    ) {
        return startScan(
                request,
                AttendanceSource.AUTHENTICATED_SCAN,
                authenticatedUserId
        );
    }

    @Override
    public CompleteAttendanceScanResponse
    completePublicScan(
            CompleteAttendanceScanRequest request
    ) {
        return completeScan(
                request,
                AttendanceSource.PUBLIC_SCAN,
                null
        );
    }

    @Override
    public CompleteAttendanceScanResponse
    completeAuthenticatedScan(
            String authenticatedUserId,
            CompleteAttendanceScanRequest request
    ) {
        return completeScan(
                request,
                AttendanceSource.AUTHENTICATED_SCAN,
                authenticatedUserId
        );
    }

    private StartAttendanceScanResponse startScan(
            StartAttendanceScanRequest request,
            AttendanceSource source,
            String authenticatedUserId
    ) {
        Instant now = Instant.now();

        String qrToken =
                qrValueParser.extractToken(
                        request.qrValue()
                );

        EmployeeQrContextResponse employee =
                employeeDirectoryGateway.resolveQr(
                        qrToken
                );

        if (source
                == AttendanceSource.AUTHENTICATED_SCAN
                && !employee.userId().equals(
                authenticatedUserId
        )) {

            throw new ForbiddenAttendanceException(
                    "The scanned QR does not belong to the logged-in employee"
            );
        }

        Optional<AttendanceRecord> activeRecord =
                attendanceRecordRepository
                        .findFirstByEmployeeIdAndStatusOrderByCreatedAtDesc(
                                employee.employeeId(),
                                AttendanceRecordStatus.ACTIVE
                        );

        AttendanceAction action;
        AttendanceRecord existingAttendance = null;
        ShiftSnapshot shiftSnapshot;

        if (activeRecord.isPresent()) {
            AttendanceRecord attendance =
                    activeRecord.get();

            boolean openInterval =
                    findOpenInterval(attendance)
                            .isPresent();

            if (now.isAfter(
                    attendance
                            .getShift()
                            .getPunchOutDeadlineAt()
            )) {

                if (openInterval) {
                    attendance.setStatus(
                            AttendanceRecordStatus
                                    .MISSED_PUNCH_OUT
                    );

                    attendance.setUpdatedAt(now);

                    attendanceRecordRepository.save(
                            attendance
                    );

                    throw new InvalidAttendanceStateException(
                            "Previous attendance has an open session beyond the punch-out deadline. Contact supervisor."
                    );
                }

                attendance.setStatus(
                        AttendanceRecordStatus.FINALIZED
                );

                attendance.setFinalizedAt(now);
                attendance.setUpdatedAt(now);

                attendanceRecordRepository.save(
                        attendance
                );

            } else if (openInterval) {

                action = AttendanceAction.PUNCH_OUT;
                existingAttendance = attendance;
                shiftSnapshot = attendance.getShift();

                return createAttempt(
                        employee,
                        action,
                        source,
                        authenticatedUserId,
                        existingAttendance,
                        shiftSnapshot,
                        now
                );

            } else if (!now.isAfter(
                    attendance
                            .getShift()
                            .getScheduledEndAt()
            )) {

                action = AttendanceAction.PUNCH_IN;
                existingAttendance = attendance;
                shiftSnapshot = attendance.getShift();

                return createAttempt(
                        employee,
                        action,
                        source,
                        authenticatedUserId,
                        existingAttendance,
                        shiftSnapshot,
                        now
                );

            } else {
                attendance.setStatus(
                        AttendanceRecordStatus.FINALIZED
                );

                attendance.setFinalizedAt(now);
                attendance.setUpdatedAt(now);

                attendanceRecordRepository.save(
                        attendance
                );
            }
        }

        EffectiveShiftResponse effectiveShift =
                shiftDirectoryGateway.resolve(
                        employee.employeeId(),
                        now
                );

        action = AttendanceAction.PUNCH_IN;

        shiftSnapshot =
                toShiftSnapshot(effectiveShift);

        return createAttempt(
                employee,
                action,
                source,
                authenticatedUserId,
                null,
                shiftSnapshot,
                now
        );
    }

    private StartAttendanceScanResponse createAttempt(
            EmployeeQrContextResponse employee,
            AttendanceAction action,
            AttendanceSource source,
            String authenticatedUserId,
            AttendanceRecord existingAttendance,
            ShiftSnapshot shiftSnapshot,
            Instant now
    ) {
        String rawToken =
                attemptTokenService.generateRawToken();

        AttendanceAttempt attempt =
                new AttendanceAttempt();

        attempt.setTokenHash(
                attemptTokenService.hash(rawToken)
        );

        attempt.setAction(action);
        attempt.setSource(source);

        attempt.setStatus(
                AttendanceAttemptStatus.PENDING
        );

        if (existingAttendance != null) {
            attempt.setAttendanceRecordId(
                    existingAttendance.getId()
            );
        }

        attempt.setEmployeeId(
                employee.employeeId()
        );

        attempt.setUserId(
                employee.userId()
        );

        attempt.setEmployeeCode(
                employee.employeeCode()
        );

        attempt.setEmployeeName(
                employee.fullName()
        );

        attempt.setDepartmentId(
                employee.departmentId()
        );

        attempt.setDesignationId(
                employee.designationId()
        );

        attempt.setShift(shiftSnapshot);

        attempt.setAuthenticatedUserId(
                authenticatedUserId
        );

        attempt.setCreatedAt(now);

        attempt.setExpiresAt(
                now.plus(
                        attendanceProperties
                                .getAttemptTtl()
                )
        );

        AttendanceAttempt saved =
                attendanceAttemptRepository.save(
                        attempt
                );

        return new StartAttendanceScanResponse(
                saved.getId(),
                rawToken,

                action,

                saved.getExpiresAt(),

                attendanceProperties
                        .getAttemptTtl()
                        .toSeconds(),

                employee.employeeCode(),
                employee.fullName(),

                shiftSnapshot.getShiftDate(),
                shiftSnapshot.getShiftName(),

                shiftSnapshot.isOvernight(),

                true,
                true
        );
    }

    private CompleteAttendanceScanResponse completeScan(
            CompleteAttendanceScanRequest request,
            AttendanceSource expectedSource,
            String authenticatedUserId
    ) {
        String tokenHash =
                attemptTokenService.hash(
                        request.completionToken()
                );

        AttendanceAttempt attempt =
                attendanceAttemptRepository
                        .findByIdAndTokenHash(
                                request.attemptId(),
                                tokenHash
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance attempt is invalid"
                                )
                        );

        /*
         * Validate that the attempt belongs to
         * the expected attendance flow.
         */
        if (attempt.getSource() != expectedSource) {
            throw new ForbiddenAttendanceException(
                    "Attendance attempt source does not match"
            );
        }

        /*
         * For authenticated scanning, make sure
         * the attempt belongs to the logged-in user.
         */
        if (expectedSource
                == AttendanceSource.AUTHENTICATED_SCAN
                && !authenticatedUserId.equals(
                attempt.getAuthenticatedUserId()
        )) {

            throw new ForbiddenAttendanceException(
                    "Attendance attempt belongs to another user"
            );
        }

        /*
         * Idempotency:
         *
         * If this attempt was already completed,
         * return the existing result instead of
         * creating another punch.
         */
        if (attempt.getStatus()
                == AttendanceAttemptStatus.COMPLETED) {

            AttendanceRecord existing =
                    attendanceRecordRepository
                            .findById(
                                    attempt.getAttendanceRecordId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Attendance record no longer exists"
                                    )
                            );

            return buildCompletionResponse(
                    existing,
                    attempt.getAction(),
                    attempt.getCompletedAt()
            );
        }

        Instant now = Instant.now();

        /*
         * Validate attempt expiry.
         *
         * Employee must upload and submit the
         * attendance photo within 60 seconds.
         */
        if (now.isAfter(
                attempt.getExpiresAt()
        )) {

            attempt.setStatus(
                    AttendanceAttemptStatus.EXPIRED
            );

            attendanceAttemptRepository.save(
                    attempt
            );

            throw new AttendanceAttemptExpiredException(
                    "Attendance photo was not submitted within 60 seconds"
            );
        }

        /*
         * ---------------------------------------------------------
         * MEDIA SERVICE VALIDATION
         * ---------------------------------------------------------
         *
         * Verify that:
         *
         * 1. photoId actually exists in Media Service
         * 2. photo belongs to this attendance attempt
         * 3. photo belongs to this employee
         * 4. photo was uploaded for the correct scan source
         *
         * Do this BEFORE creating the punch or changing
         * the attendance record.
         */
        mediaDirectoryGateway
                .requireAttendancePhoto(
                        request.photoId(),
                        attempt.getId(),
                        attempt.getEmployeeId(),
                        attempt.getSource().name()
                );


        PunchSnapshot punch =
                createPunchSnapshot(
                        attempt,
                        request,
                        now
                );

        AttendanceRecord attendance;

        if (attempt.getAction()
                == AttendanceAction.PUNCH_IN) {

            attendance =
                    applyPunchIn(
                            attempt,
                            punch,
                            now
                    );

        } else {

            attendance =
                    applyPunchOut(
                            attempt,
                            punch,
                            now
                    );
        }

        attempt.setAttendanceRecordId(
                attendance.getId()
        );

        attempt.setStatus(
                AttendanceAttemptStatus.COMPLETED
        );

        attempt.setCompletedAt(
                now
        );

        attendanceAttemptRepository.save(
                attempt
        );

        return buildCompletionResponse(
                attendance,
                attempt.getAction(),
                now
        );
    }

    private AttendanceRecord applyPunchIn(
            AttendanceAttempt attempt,
            PunchSnapshot punch,
            Instant now
    ) {
        AttendanceRecord attendance;

        if (attempt.getAttendanceRecordId() != null) {

            attendance = attendanceRecordRepository
                    .findById(
                            attempt.getAttendanceRecordId()
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Attendance record does not exist"
                            )
                    );

        } else {

            attendance =
                    attendanceRecordRepository
                            .findByEmployeeIdAndAttendanceDate(
                                    attempt.getEmployeeId(),
                                    attempt
                                            .getShift()
                                            .getShiftDate()
                            )
                            .orElseGet(() ->
                                    createAttendanceRecord(
                                            attempt,
                                            now
                                    )
                            );
        }

        if (wasAttemptAlreadyApplied(
                attendance,
                attempt.getId()
        )) {
            return attendance;
        }

        if (findOpenInterval(attendance)
                .isPresent()) {

            throw new InvalidAttendanceStateException(
                    "Employee already has an open work session"
            );
        }

        WorkInterval interval =
                new WorkInterval();

        interval.setId(
                UUID.randomUUID().toString()
        );

        interval.setPunchIn(punch);

        attendance
                .getIntervals()
                .add(interval);

        if (attendance.getFirstPunchInAt()
                == null) {

            attendance.setFirstPunchInAt(
                    punch.getRecordedAt()
            );

            attendance.setLate(
                    punch
                            .getRecordedAt()
                            .isAfter(
                                    attendance
                                            .getShift()
                                            .getLateAfterAt()
                            )
            );
        }

        attendance.setStatus(
                AttendanceRecordStatus.ACTIVE
        );

        attendance.setUpdatedAt(now);

        attendanceCalculator.recalculate(
                attendance
        );

        return attendanceRecordRepository.save(
                attendance
        );
    }

    private AttendanceRecord applyPunchOut(
            AttendanceAttempt attempt,
            PunchSnapshot punch,
            Instant now
    ) {
        if (attempt.getAttendanceRecordId() == null) {
            throw new InvalidAttendanceStateException(
                    "Punch-out attempt has no attendance record"
            );
        }

        AttendanceRecord attendance =
                attendanceRecordRepository
                        .findById(
                                attempt.getAttendanceRecordId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance record does not exist"
                                )
                        );

        if (wasAttemptAlreadyApplied(
                attendance,
                attempt.getId()
        )) {
            return attendance;
        }

        if (attempt.getCreatedAt().isAfter(
                attendance
                        .getShift()
                        .getPunchOutDeadlineAt()
        )) {

            attendance.setStatus(
                    AttendanceRecordStatus
                            .MISSED_PUNCH_OUT
            );

            attendance.setUpdatedAt(now);

            attendanceRecordRepository.save(
                    attendance
            );

            throw new InvalidAttendanceStateException(
                    "Punch-out deadline has been exceeded"
            );
        }

        WorkInterval openInterval =
                findOpenInterval(attendance)
                        .orElseThrow(() ->
                                new InvalidAttendanceStateException(
                                        "No open work session exists"
                                )
                        );

        openInterval.setPunchOut(punch);

        attendance.setLastPunchOutAt(
                punch.getRecordedAt()
        );

        attendance.setUpdatedAt(now);

        attendanceCalculator.recalculate(
                attendance
        );

        return attendanceRecordRepository.save(
                attendance
        );
    }

    private AttendanceRecord createAttendanceRecord(
            AttendanceAttempt attempt,
            Instant now
    ) {
        AttendanceRecord attendance =
                new AttendanceRecord();

        attendance.setEmployeeId(
                attempt.getEmployeeId()
        );

        attendance.setUserId(
                attempt.getUserId()
        );

        attendance.setEmployeeCode(
                attempt.getEmployeeCode()
        );

        attendance.setEmployeeName(
                attempt.getEmployeeName()
        );

        attendance.setDepartmentId(
                attempt.getDepartmentId()
        );

        attendance.setDesignationId(
                attempt.getDesignationId()
        );

        attendance.setAttendanceDate(
                attempt
                        .getShift()
                        .getShiftDate()
        );

        attendance.setShift(
                attempt.getShift()
        );

        attendance.setStatus(
                AttendanceRecordStatus.ACTIVE
        );

        attendance.setCreatedAt(now);
        attendance.setUpdatedAt(now);

        return attendance;
    }

    private PunchSnapshot createPunchSnapshot(
            AttendanceAttempt attempt,
            CompleteAttendanceScanRequest request,
            Instant now
    ) {
        LocationSnapshot location =
                new LocationSnapshot();

        location.setLatitude(
                request.latitude()
        );

        location.setLongitude(
                request.longitude()
        );

        location.setAccuracyMeters(
                request.accuracyMeters()
        );

        location.setLowAccuracy(
                request.accuracyMeters()
                        > attendanceProperties
                        .getMaximumLocationAccuracyMeters()
        );

        PunchSnapshot punch =
                new PunchSnapshot();

        punch.setRecordedAt(now);

        punch.setPhotoId(
                request.photoId()
        );

        punch.setLocation(location);

        punch.setSource(
                attempt.getSource()
        );

        punch.setAttemptId(
                attempt.getId()
        );

        punch.setAuthenticatedUserId(
                attempt.getAuthenticatedUserId()
        );

        return punch;
    }

    private Optional<WorkInterval> findOpenInterval(
            AttendanceRecord attendance
    ) {
        return attendance
                .getIntervals()
                .stream()
                .filter(interval ->
                        interval.getPunchIn() != null
                                && interval
                                .getPunchOut()
                                == null
                )
                .findFirst();
    }

    private boolean wasAttemptAlreadyApplied(
            AttendanceRecord attendance,
            String attemptId
    ) {
        return attendance
                .getIntervals()
                .stream()
                .anyMatch(interval ->
                        interval.getPunchIn() != null
                                && attemptId.equals(
                                interval
                                        .getPunchIn()
                                        .getAttemptId()
                        )
                                ||
                                interval.getPunchOut() != null
                                        && attemptId.equals(
                                        interval
                                                .getPunchOut()
                                                .getAttemptId()
                                )
                );
    }

    private ShiftSnapshot toShiftSnapshot(
            EffectiveShiftResponse shift
    ) {
        ShiftSnapshot snapshot =
                new ShiftSnapshot();

        snapshot.setAssignmentId(
                shift.assignmentId()
        );

        snapshot.setShiftId(
                shift.shiftId()
        );

        snapshot.setShiftCode(
                shift.shiftCode()
        );

        snapshot.setShiftName(
                shift.shiftName()
        );

        snapshot.setShiftDate(
                shift.shiftDate()
        );

        snapshot.setZoneId(
                shift.zoneId()
        );

        snapshot.setStartTime(
                shift.startTime()
        );

        snapshot.setEndTime(
                shift.endTime()
        );

        snapshot.setOvernight(
                shift.overnight()
        );

        snapshot.setScheduledDurationMinutes(
                shift.scheduledDurationMinutes()
        );

        snapshot.setScheduledStartAt(
                shift.scheduledStartAt()
        );

        snapshot.setScheduledEndAt(
                shift.scheduledEndAt()
        );

        snapshot.setEarliestPunchInAt(
                shift.earliestPunchInAt()
        );

        snapshot.setLateAfterAt(
                shift.lateAfterAt()
        );

        snapshot.setPunchOutDeadlineAt(
                shift.punchOutDeadlineAt()
        );

        return snapshot;
    }

    private CompleteAttendanceScanResponse
    buildCompletionResponse(
            AttendanceRecord attendance,
            AttendanceAction recordedAction,
            Instant recordedAt
    ) {
        AttendanceAction nextAction;

        if (recordedAction
                == AttendanceAction.PUNCH_IN) {

            nextAction =
                    AttendanceAction.PUNCH_OUT;

        } else if (recordedAt.isBefore(
                attendance
                        .getShift()
                        .getScheduledEndAt()
        )) {

            nextAction =
                    AttendanceAction.PUNCH_IN;

        } else {
            nextAction = null;
        }

        return new CompleteAttendanceScanResponse(
                attendance.getId(),

                recordedAction,
                nextAction,

                attendance.getAttendanceDate(),

                attendance.getStatus(),

                attendance
                        .getIntervals()
                        .size(),

                attendance.getWorkedMinutes(),
                attendance.getBreakMinutes(),

                recordedAt
        );
    }
}