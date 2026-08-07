package com.attendance.employee.service;

public interface QrCodeService {

    byte[] generateEmployeeQr(
            String qrContent
    );
}