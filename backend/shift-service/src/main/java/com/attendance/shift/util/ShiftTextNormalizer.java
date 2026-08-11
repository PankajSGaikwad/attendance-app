package com.attendance.shift.util;

import java.util.Locale;

public final class ShiftTextNormalizer {
    private ShiftTextNormalizer(){
    }

    public static String code(String value){
        return value.trim().toUpperCase(Locale.ROOT);
    }

    public static String displayName(String value){
        return value.trim().replaceAll("\\s+", " ");
    }
}
