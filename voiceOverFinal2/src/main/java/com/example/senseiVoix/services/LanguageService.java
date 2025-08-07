package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.language.LanguageResponse;

import java.util.List;

public interface LanguageService {
    List<LanguageResponse> getAllActiveLanguages();
    LanguageResponse getLanguageByCode(String code);
    List<LanguageResponse> searchLanguagesByName(String name);
    List<LanguageResponse> getLanguagesByRegion(String region);
}
