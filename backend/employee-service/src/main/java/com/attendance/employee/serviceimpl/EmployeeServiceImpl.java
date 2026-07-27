package com.attendance.employee.serviceimpl;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.exception.DuplicateEmployeeException;
import com.attendance.employee.exception.EmployeeNotFoundException;
import com.attendance.employee.exception.InvalidEmployeeStateException;
import com.attendance.employee.model.Employee;
import com.attendance.employee.model.EmployeeStatus;
import com.attendance.employee.repository.EmployeeRepository;
import com.attendance.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public EmployeeResponse create(CreateEmployeeRequest request) {

        String userId= request.userId().trim();
        String normalizedEmail= normalizedEmail(request.email());

        if (employeeRepository.existsByUserId(userId)){
            throw new DuplicateEmployeeException(
                    "An Employee Profile For this user already exists"
            );
        }

        if (employeeRepository.existsByEmail(normalizedEmail)){
            throw new DuplicateEmployeeException(
                    "An Employee Profile For this EmailID already exists"
            );
        }

        Instant now=Instant.now();

        Employee employee = new Employee();
        employee.setUserId(userId);
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(normalizedEmail);
        employee.setPhone(request.phone());
        employee.setDepartment(request.department());
        employee.setDesignation(request.designation());
        employee.setStatus(EmployeeStatus.DRAFT);
        employee.setCreatedAt(now);
        employee.setUpdatedAt(now);

        Employee savedEmployee = employeeRepository.save(employee);

        return toResponse(savedEmployee);
    }

    private String normalizedEmail(String email){
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    public EmployeeResponse getById(String employeeId) {
        return toResponse(findEmployee(employeeId));
    }

    private Employee findEmployee(String employeeId){
        return employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not Found With ID: " + employeeId
                        )

                );
    }

    @Override
    public List<EmployeeResponse> getAll(EmployeeStatus status) {
        List<Employee> employees;

        if (status == null){
            employees=employeeRepository.findAll();
        }
        else{
            employees=employeeRepository.findByStatus(status);
        }

        return employees.stream()
                .map(this::toResponse).toList();
    }

    @Override
    public EmployeeResponse getUserById(String userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee Not Found For This User ID "+ userId
                        )
                );
        return toResponse(employee);
    }

    @Override
    public EmployeeResponse update(String employeeId, UpdateEmployeeRequest request) {
        Employee employee=findEmployee(employeeId);

        ensureProfileCanBeEdited(employee);

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setPhone(request.phone());
        employee.setDesignation(request.designation());
        employee.setDepartment(request.department());
        employee.setUpdatedAt(Instant.now());


         //A rejected profile returns to DRAFT when edited The employee must submit it again afterward.
        if (employee.getStatus() == EmployeeStatus.REJECTED){
            employee.setStatus(EmployeeStatus.DRAFT);
            employee.setRejectionReason(null);
        }

        return toResponse(employeeRepository.save(employee));

    }

    @Override
    public EmployeeResponse submit(String employeeId) {
        Employee employee = findEmployee(employeeId);

        if (employee.getStatus() != EmployeeStatus.DRAFT && employee.getStatus() != EmployeeStatus.REJECTED){
            throw  new InvalidEmployeeStateException(
                    "Only DRAFT and REJECTED Profiles are Submitted"
            );
        }

        Instant now= Instant.now();
        employee.setStatus(EmployeeStatus.PENDING);
        employee.setSubmittedAt(now);
        employee.setUpdatedAt(now);
        employee.setRejectionReason(null);

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public void delete(String employeeId) {
        Employee employee = findEmployee(employeeId);

        if (employee.getStatus() != EmployeeStatus.DRAFT && employee.getStatus() != EmployeeStatus.REJECTED){
            throw new InvalidEmployeeStateException(
                    "Only DRAFT and REJECTED Profiles are Submitted"
            );
        }

        employeeRepository.delete(employee);
    }

    private void ensureProfileCanBeEdited(Employee employee) {
        EmployeeStatus status = employee.getStatus();
        if (status != EmployeeStatus.DRAFT && status != EmployeeStatus.REJECTED) {
            throw new InvalidEmployeeStateException(
                    "Profile With Status "
                    +status+
                    " Cannot Edited"
            );
        }
    }



    private EmployeeResponse toResponse(
            Employee employee
    ){
        return new EmployeeResponse(
                employee.getId(),
                employee.getUserId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getStatus(),
                employee.getProfilePhotoId(),
                employee.getEmployeeCode(),
                employee.getRejectionReason(),
                employee.getSubmittedAt(),
                employee.getApprovedAt(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
