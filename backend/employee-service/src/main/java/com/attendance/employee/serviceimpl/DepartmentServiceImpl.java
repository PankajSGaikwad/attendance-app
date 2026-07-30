package com.attendance.employee.serviceimpl;

import com.attendance.employee.dto.request.CreateDepartmentRequest;
import com.attendance.employee.dto.request.UpdateDepartmentRequest;
import com.attendance.employee.dto.request.UpdateEmployeeRequest;
import com.attendance.employee.dto.response.DepartmentContextResponse;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DepartmentResponse;
import com.attendance.employee.exception.DuplicateResourceException;
import com.attendance.employee.exception.ResourceNotFoundException;
import com.attendance.employee.model.Department;
import com.attendance.employee.repository.DepartmentRepository;
import com.attendance.employee.service.DepartmentService;
import com.attendance.employee.util.TextNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public DepartmentResponse create(CreateDepartmentRequest request) {
        String code = TextNormalizer.code(request.code());
        String name = TextNormalizer.displayName(request.name());
        String normalizedName = TextNormalizer.normalizedKey(request.name());

        if (departmentRepository.existsByCode(code)){
            throw new DuplicateResourceException("Department Code Already Exists: "+code);
        }

        if (departmentRepository.existsByNormalizedName(normalizedName)){
            throw new DuplicateResourceException("Department Name Already Exists: "+normalizedName);
        }

        Instant now = Instant.now();

        Department department = new Department();
        department.setCode(code);
        department.setName(name);
        department.setNormalizedName(normalizedName);
        department.setActive(true);
        department.setCreatedAt(now);
        department.setUpdatedAt(now);

        return toResponse(departmentRepository.save(department));
    }

    @Override
    public DepartmentResponse getById(String departmentId) {
        return toResponse(findDepartment(departmentId));
    }

    @Override
    public List<DepartmentResponse> getAll(boolean activeOnly) {
        List<Department> departments = activeOnly ? departmentRepository.findByActiveTrueOrderByNameAsc() : departmentRepository.findAllByOrderByNameAsc(); //used ternary expression to reduce code
        return departments.stream().map(this::toResponse).toList();
    }

    @Override
    public List<DepartmentOptionResponse> getOptions() {
        return departmentRepository.findByActiveTrueOrderByNameAsc().stream().map(department -> new DepartmentOptionResponse(
                department.getId(),
                department.getCode(),
                department.getName()

        )).toList();
    }

    @Override
    public DepartmentResponse update(String departmentId, UpdateDepartmentRequest request) {
        Department department = findDepartment(departmentId);
        String name = TextNormalizer.displayName(request.name());
        String normalizedName = TextNormalizer.normalizedKey(request.name());
        if (departmentRepository.existsByNormalizedNameAndIdNot(normalizedName, departmentId)){
            throw new DuplicateResourceException("Department Name Already Exists: " +name);
        }
        department.setName(name);
        department.setNormalizedName(normalizedName);
        department.setUpdatedAt(Instant.now());

        return toResponse(departmentRepository.save(department));
    }

    @Override
    public DepartmentResponse setActive(String departmentId, boolean active) {
        Department department = findDepartment(departmentId);
        department.setActive(active);
        department.setUpdatedAt(Instant.now());

        return toResponse(departmentRepository.save(department));
    }

    @Override
    public DepartmentContextResponse getContext(String departmentId) {
        Department department = findDepartment(departmentId);
        return new DepartmentContextResponse(
                department.getId(),
                department.getCode(),
                department.getName(),
                department.isActive()
        );
    }

    private Department findDepartment(String departmentId){
        return departmentRepository.findById(departmentId).orElseThrow(() -> new ResourceNotFoundException("Department not found eith ID: " +departmentId));
    }
    private DepartmentResponse toResponse(Department department){
        return new DepartmentResponse(
                department.getId(),
                department.getCode(),
                department.getName(),
                department.isActive(),
                department.getCreatedAt(),
                department.getCreatedAt()
        );
    }
}
