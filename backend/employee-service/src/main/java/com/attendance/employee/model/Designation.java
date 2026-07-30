package com.attendance.employee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "designations")
//The compound indexes mean these combinations must be unique
@CompoundIndexes({
        @CompoundIndex(
                name = "department_designation_code_unique",
                def = "{'departmentId': 1, 'code': 1}",
                unique = true
        ),
        @CompoundIndex(
                name = "department_designation_name_unique",
                def = "{'departmentId': 1, 'normalizedName': 1}",
                unique = true
        )
})
public class Designation {

    @Id
    private String id;

    @Indexed
    private String departmentId;
    private String code;
    private String name;
    private String normalizedName;

    private boolean active = true;

    private Instant createdAt;
    private Instant updatedAt;
}
