package com.attendance.employee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "employees") //its required for mongoDB
public class Employee {
    @Id
    private String id;

    @Indexed(unique = true)
    private  String userId;

    @Indexed(unique = true)
    private  String email;

    private String firstName;
    private String lastName;
    private String phone;

    @Indexed
    private String departmentId;

    @Indexed
    private String designationId;

    private EmployeeStatus status = EmployeeStatus.DRAFT;

    //False until the administrator/supervisor approves the profile.
    private boolean active;

    private String profilePhotoId;

    @Indexed(unique = true, sparse = true)
    private String employeeCode;

    @Indexed(unique = true, sparse = true)
    private String qrToken;
    private Instant qrIssuedAt;
    private String rejectionReason;

    private Instant submittedAt;
    private Instant approvedAt;
    private String approvedBy;

    private Instant createdAt;
    private Instant updatedAt;

    private Instant rejectedAt;
    private String rejectedBy;
}
