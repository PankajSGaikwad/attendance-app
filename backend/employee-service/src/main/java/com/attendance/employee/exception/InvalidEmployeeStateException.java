package com.attendance.employee.exception;

public class InvalidEmployeeStateException extends RuntimeException{
    public InvalidEmployeeStateException(String message){
        super(message);
    }
}
