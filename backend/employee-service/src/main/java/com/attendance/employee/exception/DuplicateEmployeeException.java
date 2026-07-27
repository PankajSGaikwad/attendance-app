package com.attendance.employee.exception;

public class DuplicateEmployeeException extends RuntimeException{
    public DuplicateEmployeeException(String message){
        super(message);
    }
}
