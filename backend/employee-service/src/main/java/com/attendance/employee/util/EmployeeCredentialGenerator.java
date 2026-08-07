package com.attendance.employee.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class EmployeeCredentialGenerator {

    private static final char[] CODE_CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
                    .toCharArray();

    private static final int EMPLOYEE_CODE_LENGTH = 8;

    private static final int QR_TOKEN_BYTES = 32;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public String generateEmployeeCode() {
        StringBuilder builder =
                new StringBuilder("EMP-");

        for (int index = 0;
             index < EMPLOYEE_CODE_LENGTH;
             index++) {

            int randomIndex =
                    secureRandom.nextInt(
                            CODE_CHARACTERS.length
                    );

            builder.append(
                    CODE_CHARACTERS[randomIndex]
            );
        }

        return builder.toString();
    }

    public String generateQrToken() {
        byte[] bytes =
                new byte[QR_TOKEN_BYTES];

        secureRandom.nextBytes(bytes);

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }
}

/*
Employee code:
EMP-7KQ3DF9P

QR token:
Z6qz7omhdwzRjM3PZ...*/
