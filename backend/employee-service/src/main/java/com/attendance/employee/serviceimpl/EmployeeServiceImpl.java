package com.attendance.employee.serviceimpl;

import com.attendance.employee.dto.request.CreateEmployeeRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.EmployeeResponse;
import com.attendance.employee.dto.response.EmployeeWorkContextResponse;
import com.attendance.employee.exception.*;
import com.attendance.employee.model.Department;
import com.attendance.employee.model.Designation;
import com.attendance.employee.model.Employee;
import com.attendance.employee.model.EmployeeStatus;
import com.attendance.employee.repository.DepartmentRepository;
import com.attendance.employee.repository.DesignationRepository;
import com.attendance.employee.repository.EmployeeRepository;
import com.attendance.employee.service.EmployeeService;
import com.attendance.employee.util.TextNormalizer;
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
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    @Override
    public EmployeeResponse create(CreateEmployeeRequest request) {

        String userId= request.userId().trim();
        String email= TextNormalizer.email(request.email());

        if (employeeRepository.existsByUserId(userId)){
            throw new DuplicateEmployeeException(
                    "An Employee Profile For this user already exists"
            );
        }

        if (employeeRepository.existsByEmail(email)){
            throw new DuplicateEmployeeException(
                    "An Employee Profile For this EmailID already exists"
            );
        }

        ProfileReferences references = validateReferences(request.departmentId(), request.designationId());


        Instant now=Instant.now();

        Employee employee = new Employee();
        employee.setUserId(userId);
        employee.setFirstName(TextNormalizer.displayName(request.firstName()));
        employee.setLastName(TextNormalizer.displayName(request.lastName()));
        employee.setEmail(email);
        employee.setPhone(request.phone().trim());
        employee.setDepartmentId(references.department.getId());
        employee.setDesignationId(references.designation.getId());
        employee.setStatus(EmployeeStatus.DRAFT);
        employee.setActive(false);
        employee.setCreatedAt(now);
        employee.setUpdatedAt(now);

        Employee savedEmployee = employeeRepository.save(employee);

        return toResponse(savedEmployee, references.department(), references.designation());
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

        ProfileReferences references = validateReferences(request.departmentId(), request.designationId());

        employee.setFirstName(TextNormalizer.displayName(request.firstName()));
        employee.setLastName(TextNormalizer.displayName(request.lastName()));
        employee.setPhone(request.phone().trim());
        employee.setDepartmentId(references.department.getId());
        employee.setDesignationId(references.designation.getId());
        employee.setUpdatedAt(Instant.now());

         //A rejected profile returns to DRAFT when edited The employee must submit it again afterward.
        if (employee.getStatus() == EmployeeStatus.REJECTED){
            employee.setStatus(EmployeeStatus.DRAFT);
            employee.setRejectionReason(null);
        }

        Employee savedEmployee = employeeRepository.save(employee);


        return  toResponse(savedEmployee, references.department(), references.designation());

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

    @Override
    public EmployeeWorkContextResponse getWorkContext(String employeeId) {
        Employee employee = findEmployee(employeeId);

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

    private ProfileReferences validateReferences(String departmentId, String designationId){

        Department department = departmentRepository.findById(departmentId).orElseThrow(() ->
                new ResourceNotFoundException("Department Not Found With Id: "+ departmentId));
        if (!department.isActive()){
            throw new InvalidReferenceException("Selected Department Is InActive");
        }

        Designation designation = designationRepository.findById(designationId).orElseThrow(()->
                new ResourceNotFoundException("Designation Not Found With ID: " + designationId));
        if(!designation.isActive()){
            throw new InvalidReferenceException("Selected Designation is InActive");
        }

        if (!designation.getDepartmentId().equals(department.getId())){
            throw new InvalidReferenceException("Selected designation does not belong to selected department");
        }

        return new ProfileReferences(
                department,designation
        );
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

    private EmployeeResponse toResponse(Employee employee){
        Department department = departmentRepository.findById(employee.getDepartmentId()).orElse(null);

        Designation designation = designationRepository.findById(employee.getDesignationId()).orElse(null);

        return toResponse(employee, department, designation);
    }

    private EmployeeResponse toResponse(
            Employee employee, Department department, Designation designation
            ){
        return new EmployeeResponse(
                employee.getId(),
                employee.getUserId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),

                employee.getDepartmentId(),
                department == null ? null : department.getName(),

                employee.getDesignationId(),
                designation == null ? null : designation.getName(),

                employee.getStatus(),
                employee.isActive(),

                employee.getProfilePhotoId(),
                employee.getEmployeeCode(),
                employee.getRejectionReason(),
                employee.getSubmittedAt(),
                employee.getApprovedAt(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }

    private record ProfileReferences(
            Department department,
            Designation designation
    ){
    }
}
