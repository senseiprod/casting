package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.language.LanguageResponse;
import com.example.senseiVoix.entities.Language;
import com.example.senseiVoix.services.LanguageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
@CrossOrigin(origins = "*")
public class LanguageController {

    @Autowired
    private LanguageService languageService;

    /**
     * Get all active languages.
     *
     * @return a ResponseEntity containing a list of all active languages and HTTP status OK (200)
     */
    @GetMapping
    public ResponseEntity<List<LanguageResponse>> getAllActiveLanguages() {
        try {
            List<LanguageResponse> languages = languageService.getAllActiveLanguages();
            return new ResponseEntity<>(languages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get language by code.
     *
     * @param code the language code
     * @return a ResponseEntity containing the language and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<LanguageResponse> getLanguageByCode(@PathVariable String code) {
        try {
            LanguageResponse language = languageService.getLanguageByCode(code);
            return language != null 
                ? new ResponseEntity<>(language, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search languages by name.
     *
     * @param name the search term
     * @return a ResponseEntity containing matching languages and HTTP status OK (200)
     */
    @GetMapping("/search")
    public ResponseEntity<List<LanguageResponse>> searchLanguages(@RequestParam String name) {
        try {
            List<LanguageResponse> languages = languageService.searchLanguagesByName(name);
            return new ResponseEntity<>(languages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get languages by region.
     *
     * @param region the region name
     * @return a ResponseEntity containing languages from the specified region and HTTP status OK (200)
     */
    @GetMapping("/region/{region}")
    public ResponseEntity<List<LanguageResponse>> getLanguagesByRegion(@PathVariable String region) {
        try {
            List<LanguageResponse> languages = languageService.getLanguagesByRegion(region);
            return new ResponseEntity<>(languages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
