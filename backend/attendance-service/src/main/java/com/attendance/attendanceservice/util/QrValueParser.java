package com.attendance.attendanceservice.util;

import com.attendance.attendanceservice.exception.InvalidQrCodeException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class QrValueParser {

    private static final String PREFIX =
            "attendance://employee/";

    public String extractToken(String qrValue) {
        if (!StringUtils.hasText(qrValue)) {
            throw new InvalidQrCodeException(
                    "QR value is missing"
            );
        }

        String value = qrValue.trim();

        if (value.startsWith(PREFIX)) {
            String token =
                    value.substring(PREFIX.length());

            if (!StringUtils.hasText(token)) {
                throw new InvalidQrCodeException(
                        "QR token is missing"
                );
            }

            return token;
        }

        /*
         * Raw token support is useful for Postman tests.
         */
        return value;
    }
}