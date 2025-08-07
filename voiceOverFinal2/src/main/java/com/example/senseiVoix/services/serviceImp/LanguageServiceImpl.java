package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.language.LanguageResponse;
import com.example.senseiVoix.entities.Language;
import com.example.senseiVoix.repositories.LanguageRepository;
import com.example.senseiVoix.services.LanguageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LanguageServiceImpl implements LanguageService {

    @Autowired
    private LanguageRepository languageRepository;

    @Override
    public List<LanguageResponse> getAllActiveLanguages() {
        List<Language> languages = languageRepository.findByIsActiveTrue();
        return languages.stream()
                .map(this::mapToLanguageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LanguageResponse getLanguageByCode(String code) {
        Language language = languageRepository.findByCode(code).orElse(null);
        return language != null ? mapToLanguageResponse(language) : null;
    }

    @Override
    public List<LanguageResponse> searchLanguagesByName(String name) {
        List<Language> languages = languageRepository.findByNameContainingIgnoreCase(name);
        return languages.stream()
                .map(this::mapToLanguageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LanguageResponse> getLanguagesByRegion(String region) {
        List<Language> languages = languageRepository.findByRegionAndIsActiveTrue(region);
        return languages.stream()
                .map(this::mapToLanguageResponse)
                .collect(Collectors.toList());
    }

    private LanguageResponse mapToLanguageResponse(Language language) {
        LanguageResponse response = new LanguageResponse();
        response.setId(language.getId());
        response.setCode(language.getCode());
        response.setName(language.getName());
        response.setNativeName(language.getNativeName());
        response.setRegion(language.getRegion());
        response.setIsActive(language.getIsActive());
        return response;
    }
}
