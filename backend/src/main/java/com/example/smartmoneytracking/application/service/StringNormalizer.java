package com.example.smartmoneytracking.application.service;

import org.springframework.stereotype.Service;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
public class StringNormalizer {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    /**
     * Normalizes a string: removes accents, converts to lowercase, trims whitespace.
     * Example: "Mì Cay Sasin" -> "mi cay sasin"
     */
    public String normalize(String input) {
        if (input == null) return null;
        
        // 1. Remove accents (Decomposition)
        String nfdNormalizedString = Normalizer.normalize(input, Normalizer.Form.NFD);
        String unaccentedString = DIACRITICS_PATTERN.matcher(nfdNormalizedString).replaceAll("");
        
        // 2. Handle specific Vietnamese characters like 'đ' which NFD doesn't fully decompose
        unaccentedString = unaccentedString.replace("đ", "d").replace("Đ", "D");
        
        // 3. To Lowercase & Trim
        return unaccentedString.toLowerCase().trim();
    }
}
