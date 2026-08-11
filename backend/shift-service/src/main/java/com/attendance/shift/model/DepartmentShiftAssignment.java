package com.attendance.shift.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Setter
@Getter
@NoArgsConstructor
@Document(collection = "department_shift_assignment")
@CompoundIndexes({ //It allows build multi-field indexes to speed up database searches
        @CompoundIndex(
                name = "department_effective_from_unique",
                def = "{'departmentId': 1, 'effectiveFrom': 1}",
                unique = true
        ),
        @CompoundIndex(
                name = "department_effective_lookup",
                def = "{'departmentId': 1, 'effectiveFrom': -1, 'effectiveTo': 1}"
        )
})
public class DepartmentShiftAssignment {

    @Id
    private String id;

    @Indexed
    private String departmentId;

    @Indexed
    private String shiftId;

    private String effectiveFrom;
    //null means no end date format: YYYY-MM-DD
    private String effectiveTo;

    private String assignedBy;

    private Instant createdAt;
    private Instant updatedAt;
}
