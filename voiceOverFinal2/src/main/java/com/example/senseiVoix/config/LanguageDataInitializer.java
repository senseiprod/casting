package com.example.senseiVoix.config;

import com.example.senseiVoix.entities.Language;
import com.example.senseiVoix.repositories.LanguageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class LanguageDataInitializer implements CommandLineRunner {

    @Autowired
    private LanguageRepository languageRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if languages are already initialized
        if (languageRepository.count() == 0) {
            initializeLanguages();
        }
    }

    private void initializeLanguages() {
        List<Language> languages = Arrays.asList(
            new Language("ary", "Darija Morocco", "الدارجة المغربية", "Morocco"),
            new Language("ar", "Arabic", "العربية", "Middle East"),
            new Language("en", "English", "English", "International"),
            new Language("fr", "French", "Français", "France"),
            new Language("es", "Spanish", "Español", "Spain"),
            new Language("de", "German", "Deutsch", "Germany"),
            new Language("it", "Italian", "Italiano", "Italy"),
            new Language("pt", "Portuguese", "Português", "Portugal"),
            new Language("ru", "Russian", "Русский", "Russia"),
            new Language("zh", "Chinese", "中文", "China"),
            new Language("ja", "Japanese", "日本語", "Japan"),
            new Language("ko", "Korean", "한국어", "Korea"),
            new Language("hi", "Hindi", "हिन्दी", "India"),
            new Language("tr", "Turkish", "Türkçe", "Turkey"),
            new Language("nl", "Dutch", "Nederlands", "Netherlands")
        );

        languageRepository.saveAll(languages);
        System.out.println("Languages initialized successfully with Darija Morocco as the first language!");
    }
}
