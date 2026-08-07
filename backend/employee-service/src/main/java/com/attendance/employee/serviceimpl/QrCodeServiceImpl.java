package com.attendance.employee.serviceimpl;

import com.attendance.employee.exception.QrCodeGenerationException;
import com.attendance.employee.service.QrCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class QrCodeServiceImpl
        implements QrCodeService {

    private static final int QR_WIDTH = 360;
    private static final int QR_HEIGHT = 360;

    @Override
    public byte[] generateEmployeeQr(
            String qrContent
    ) {
        Map<EncodeHintType, Object> hints =
                Map.of(
                        EncodeHintType.CHARACTER_SET,
                        StandardCharsets.UTF_8.name(),

                        EncodeHintType.ERROR_CORRECTION,
                        ErrorCorrectionLevel.M,

                        EncodeHintType.MARGIN,
                        1
                );

        try {
            BitMatrix matrix =
                    new QRCodeWriter().encode(
                            qrContent,
                            BarcodeFormat.QR_CODE,
                            QR_WIDTH,
                            QR_HEIGHT,
                            hints
                    );

            try (ByteArrayOutputStream output =
                         new ByteArrayOutputStream()) {

                MatrixToImageWriter.writeToStream(
                        matrix,
                        "PNG",
                        output
                );

                return output.toByteArray();
            }

        } catch (WriterException
                 | IOException exception) {

            throw new QrCodeGenerationException(
                    "Could not generate employee QR code",
                    exception
            );
        }
    }
}