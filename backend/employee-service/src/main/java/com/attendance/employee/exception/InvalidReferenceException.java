package com.attendance.employee.exception;

public class InvalidReferenceException extends RuntimeException{
    public InvalidReferenceException(String message){
        super(message);
    }
}
