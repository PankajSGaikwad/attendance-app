package com.attendance.employee.serviceimpl;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeQrContextResponse;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.exception.DuplicateResourceException;
import com.attendance.employee.exception.InvalidEmployeeStateException;
import com.attendance.employee.exception.InvalidReferenceException;
import com.attendance.employee.exception.ResourceNotFoundException;
import com.attendance.employee.model.Department;
import com.attendance.employee.model.Designation;
import com.attendance.employee.model.Employee;
import com.attendance.employee.model.EmployeeStatus;
import com.attendance.employee.repository.DepartmentRepository;
import com.attendance.employee.repository.DesignationRepository;
import com.attendance.employee.repository.EmployeeRepository;
import com.attendance.employee.service.EmployeeQrImage;
import com.attendance.employee.service.EmployeeService;
import com.attendance.employee.service.QrCodeService;
import com.attendance.employee.util.EmployeeCredentialGenerator;
import com.attendance.employee.util.TextNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl
        implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    private final EmployeeCredentialGenerator
            credentialGenerator;

    private final QrCodeService qrCodeService;

    @Override
    public EmployeeResponse createMyProfile(
            String userId,
            String email,
            CreateEmployeeRequest request
    ) {
        if (!StringUtils.hasText(userId)) {
            throw new InvalidReferenceException(
                    "JWT subject is missing"
            );
        }

        if (!StringUtils.hasText(email)) {
            throw new InvalidReferenceException(
                    "JWT email claim is missing"
            );
        }

        String normalizedEmail =
                TextNormalizer.email(email);

        if (employeeRepository
                .existsByUserId(userId)) {

            throw new DuplicateResourceException(
                    "An employee profile already exists for this account"
            );
        }

        if (employeeRepository
                .existsByEmail(normalizedEmail)) {

            throw new DuplicateResourceException(
                    "An employee profile already exists with this email"
            );
        }

        ProfileReferences references =
                validateReferences(
                        request.departmentId(),
                        request.designationId()
                );

        Instant now = Instant.now();

        Employee employee = new Employee();

        employee.setUserId(userId);

        employee.setEmail(normalizedEmail);

        employee.setFirstName(
                TextNormalizer.displayName(
                        request.firstName()
                )
        );

        employee.setLastName(
                TextNormalizer.displayName(
                        request.lastName()
                )
        );

        employee.setPhone(
                request.phone().trim()
        );

        employee.setDepartmentId(
                references.department().getId()
        );

        employee.setDesignationId(
                references.designation().getId()
        );

        employee.setStatus(
                EmployeeStatus.DRAFT
        );

        employee.setActive(false);
        employee.setCreatedAt(now);
        employee.setUpdatedAt(now);

        Employee saved =
                employeeRepository.save(employee);

        return toResponse(
                saved,
                references.department(),
                references.designation()
        );
    }

    @Override
    public EmployeeResponse getMyProfile(
            String userId
    ) {
        return toResponse(
                findEmployeeByUserId(userId)
        );
    }

    @Override
    public EmployeeResponse updateMyProfile(
            String userId,
            UpdateEmployeeRequest request
    ) {
        Employee employee =
                findEmployeeByUserId(userId);

        ensureEditable(employee);

        ProfileReferences references =
                validateReferences(
                        request.departmentId(),
                        request.designationId()
                );

        employee.setFirstName(
                TextNormalizer.displayName(
                        request.firstName()
                )
        );

        employee.setLastName(
                TextNormalizer.displayName(
                        request.lastName()
                )
        );

        employee.setPhone(
                request.phone().trim()
        );

        employee.setDepartmentId(
                references.department().getId()
        );

        employee.setDesignationId(
                references.designation().getId()
        );

        if (employee.getStatus()
                == EmployeeStatus.REJECTED) {

            employee.setStatus(
                    EmployeeStatus.DRAFT
            );

            employee.setRejectionReason(null);
            employee.setRejectedAt(null);
            employee.setRejectedBy(null);
        }

        employee.setUpdatedAt(Instant.now());

        Employee saved =
                employeeRepository.save(employee);

        return toResponse(
                saved,
                references.department(),
                references.designation()
        );
    }

    @Override
    public EmployeeResponse submitMyProfile(
            String userId
    ) {
        Employee employee =
                findEmployeeByUserId(userId);

        if (employee.getStatus()
                != EmployeeStatus.DRAFT
                && employee.getStatus()
                != EmployeeStatus.REJECTED) {

            throw new InvalidEmployeeStateException(
                    "Only DRAFT or REJECTED profiles can be submitted"
            );
        }

        ProfileReferences references =
                validateReferences(
                        employee.getDepartmentId(),
                        employee.getDesignationId()
                );

        Instant now = Instant.now();

        employee.setStatus(
                EmployeeStatus.PENDING
        );

        employee.setActive(false);
        employee.setSubmittedAt(now);
        employee.setUpdatedAt(now);

        employee.setRejectionReason(null);
        employee.setRejectedAt(null);
        employee.setRejectedBy(null);

        Employee saved =
                employeeRepository.save(employee);

        return toResponse(
                saved,
                references.department(),
                references.designation()
        );
    }

    @Override
    public void deleteMyProfile(
            String userId
    ) {
        Employee employee =
                findEmployeeByUserId(userId);

        if (employee.getStatus()
                != EmployeeStatus.DRAFT
                && employee.getStatus()
                != EmployeeStatus.REJECTED) {

            throw new InvalidEmployeeStateException(
                    "Only DRAFT or REJECTED profiles can be deleted"
            );
        }

        employeeRepository.delete(employee);
    }

    @Override
    public EmployeeResponse getById(
            String employeeId
    ) {
        return toResponse(
                findEmployee(employeeId)
        );
    }

    @Override
    public List<EmployeeResponse> getAll(
            EmployeeStatus status
    ) {
        List<Employee> employees =
                status == null
                        ? employeeRepository
                        .findAllByOrderByCreatedAtDesc()
                        : employeeRepository
                        .findByStatusOrderByCreatedAtDesc(
                                status
                        );

        return employees.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EmployeeResponse approve(
            String employeeId,
            String approvedBy
    ) {
        Employee employee =
                findEmployee(employeeId);

        if (employee.getStatus()
                != EmployeeStatus.PENDING) {

            throw new InvalidEmployeeStateException(
                    "Only PENDING profiles can be approved"
            );
        }

        ProfileReferences references =
                validateReferences(
                        employee.getDepartmentId(),
                        employee.getDesignationId()
                );

        Instant now = Instant.now();

        if (!StringUtils.hasText(
                employee.getEmployeeCode()
        )) {
            employee.setEmployeeCode(
                    generateUniqueEmployeeCode()
            );
        }

        if (!StringUtils.hasText(
                employee.getQrToken()
        )) {
            employee.setQrToken(
                    generateUniqueQrToken()
            );

            employee.setQrIssuedAt(now);
        }

        employee.setStatus(
                EmployeeStatus.APPROVED
        );

        employee.setActive(true);

        employee.setApprovedAt(now);
        employee.setApprovedBy(approvedBy);

        employee.setRejectionReason(null);
        employee.setRejectedAt(null);
        employee.setRejectedBy(null);

        employee.setUpdatedAt(now);

        Employee saved =
                employeeRepository.save(employee);

        return toResponse(
                saved,
                references.department(),
                references.designation()
        );
    }

    @Override
    public EmployeeResponse reject(
            String employeeId,
            String rejectedBy,
            String reason
    ) {
        Employee employee =
                findEmployee(employeeId);

        if (employee.getStatus()
                != EmployeeStatus.PENDING) {

            throw new InvalidEmployeeStateException(
                    "Only PENDING profiles can be rejected"
            );
        }

        Instant now = Instant.now();

        employee.setStatus(
                EmployeeStatus.REJECTED
        );

        employee.setActive(false);

        employee.setRejectionReason(
                TextNormalizer.displayName(reason)
        );

        employee.setRejectedBy(rejectedBy);
        employee.setRejectedAt(now);
        employee.setUpdatedAt(now);

        return toResponse(
                employeeRepository.save(employee)
        );
    }

    @Override
    public EmployeeQrImage getMyQr(
            String userId
    ) {
        return createQrImage(
                findEmployeeByUserId(userId)
        );
    }

    @Override
    public EmployeeQrImage getQrForManagement(
            String employeeId
    ) {
        return createQrImage(
                findEmployee(employeeId)
        );
    }

    @Override
    public EmployeeWorkContextResponse getWorkContext(
            String employeeId
    ) {
        Employee employee =
                findEmployee(employeeId);

        return new EmployeeWorkContextResponse(
                employee.getId(),
                employee.getUserId(),
                employee.getEmployeeCode(),
                employee.getDepartmentId(),
                employee.getDesignationId(),
                employee.getStatus(),
                employee.isActive()
        );
    }

    @Override
    public EmployeeQrContextResponse getByQrToken(
            String qrToken
    ) {
        Employee employee =
                employeeRepository
                        .findByQrToken(qrToken)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee QR is invalid"
                                )
                        );

        ensureApprovedAndActive(employee);

        return new EmployeeQrContextResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName()
                        + " "
                        + employee.getLastName(),
                employee.getDepartmentId(),
                employee.getDesignationId(),
                employee.getStatus(),
                employee.isActive()
        );
    }

    private EmployeeQrImage createQrImage(
            Employee employee
    ) {
        ensureApprovedAndActive(employee);

        if (!StringUtils.hasText(
                employee.getQrToken()
        )) {
            throw new InvalidEmployeeStateException(
                    "QR has not been issued"
            );
        }

        String qrContent =
                "attendance://employee/"
                        + employee.getQrToken();

        byte[] image =
                qrCodeService.generateEmployeeQr(
                        qrContent
                );

        return new EmployeeQrImage(
                "employee-qr-"
                        + employee.getEmployeeCode()
                        + ".png",
                image
        );
    }

    private String generateUniqueEmployeeCode() {
        for (int attempt = 0;
             attempt < 10;
             attempt++) {

            String code =
                    credentialGenerator
                            .generateEmployeeCode();

            if (!employeeRepository
                    .existsByEmployeeCode(code)) {

                return code;
            }
        }

        throw new IllegalStateException(
                "Could not generate a unique employee code"
        );
    }

    private String generateUniqueQrToken() {
        for (int attempt = 0;
             attempt < 10;
             attempt++) {

            String token =
                    credentialGenerator
                            .generateQrToken();

            if (!employeeRepository
                    .existsByQrToken(token)) {

                return token;
            }
        }

        throw new IllegalStateException(
                "Could not generate a unique QR token"
        );
    }

    private ProfileReferences validateReferences(
            String departmentId,
            String designationId
    ) {
        Department department =
                departmentRepository
                        .findById(departmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Department not found with ID: "
                                                + departmentId
                                )
                        );

        if (!department.isActive()) {
            throw new InvalidReferenceException(
                    "Selected department is inactive"
            );
        }

        Designation designation =
                designationRepository
                        .findById(designationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Designation not found with ID: "
                                                + designationId
                                )
                        );

        if (!designation.isActive()) {
            throw new InvalidReferenceException(
                    "Selected designation is inactive"
            );
        }

        if (!designation.getDepartmentId()
                .equals(department.getId())) {

            throw new InvalidReferenceException(
                    "Selected designation does not belong "
                            + "to the selected department"
            );
        }

        return new ProfileReferences(
                department,
                designation
        );
    }

    private Employee findEmployee(
            String employeeId
    ) {
        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with ID: "
                                        + employeeId
                        )
                );
    }

    private Employee findEmployeeByUserId(
            String userId
    ) {
        return employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile does not exist"
                        )
                );
    }

    private void ensureEditable(
            Employee employee
    ) {
        if (employee.getStatus()
                != EmployeeStatus.DRAFT
                && employee.getStatus()
                != EmployeeStatus.REJECTED) {

            throw new InvalidEmployeeStateException(
                    "A profile with status "
                            + employee.getStatus()
                            + " cannot be edited"
            );
        }
    }

    private void ensureApprovedAndActive(
            Employee employee
    ) {
        if (employee.getStatus()
                != EmployeeStatus.APPROVED
                || !employee.isActive()) {

            throw new InvalidEmployeeStateException(
                    "Employee must be approved and active"
            );
        }
    }

    private EmployeeResponse toResponse(
            Employee employee
    ) {
        Department department =
                departmentRepository
                        .findById(
                                employee.getDepartmentId()
                        )
                        .orElse(null);

        Designation designation =
                designationRepository
                        .findById(
                                employee.getDesignationId()
                        )
                        .orElse(null);

        return toResponse(
                employee,
                department,
                designation
        );
    }

    private EmployeeResponse toResponse(
            Employee employee,
            Department department,
            Designation designation
    ) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getUserId(),

                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),

                employee.getDepartmentId(),
                department == null
                        ? null
                        : department.getName(),

                employee.getDesignationId(),
                designation == null
                        ? null
                        : designation.getName(),

                employee.getStatus(),
                employee.isActive(),

                employee.getProfilePhotoId(),

                employee.getEmployeeCode(),

                StringUtils.hasText(
                        employee.getQrToken()
                ),

                employee.getRejectionReason(),

                employee.getSubmittedAt(),

                employee.getApprovedAt(),
                employee.getApprovedBy(),

                employee.getRejectedAt(),
                employee.getRejectedBy(),

                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }

    private record ProfileReferences(
            Department department,
            Designation designation
    ) {
    }
}