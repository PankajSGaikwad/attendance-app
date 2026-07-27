package com.attendance.employee.util;

import java.util.Locale;

public final class TextNormalizer {
    //using for text normalize for user Java Developer for backend java developer
    private TextNormalizer(){
    }

    public static String displayName(String value){
        return value.trim().replaceAll("\\s+", " ");
    }

    public static String normalizedKey(String value){
        return displayName(value).toLowerCase(Locale.ROOT);
    }

    public static String code(String value){
        return value.trim().toUpperCase(Locale.ROOT);
    }

    public static String email(String value){
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
