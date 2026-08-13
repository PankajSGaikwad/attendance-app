package com.attendance.attendanceservice.client;

import com.attendance.attendanceservice.dto.response.EmployeeQrContextResponse;
import com.attendance.attendanceservice.exception.DownstreamServiceException;
import com.attendance.attendanceservice.exception.InvalidQrCodeException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmployeeDirectoryGateway {

    private final EmployeeClient employeeClient;

    public EmployeeQrContextResponse resolveQr(
            String qrToken
    ) {
        try {
            EmployeeQrContextResponse employee =
                    employeeClient.getByQrToken(
                            qrToken
                    );

            if (!employee.active()
                    || !"APPROVED".equals(
                    employee.status()
            )) {

                throw new InvalidQrCodeException(
                        "Employee is not approved and active"
                );
            }

            return employee;

        } catch (FeignException.NotFound exception) {
            throw new InvalidQrCodeException(
                    "Employee QR is invalid"
            );

        } catch (InvalidQrCodeException exception) {
            throw exception;

        } catch (FeignException exception) {
            throw new DownstreamServiceException(
                    "Employee Service could not validate QR",
                    exception
            );
        }
    }
}