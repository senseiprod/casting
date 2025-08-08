package com.example.senseiVoix.dtos.speaker;

import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.language.LanguageResponse;
import com.example.senseiVoix.dtos.voix.VoixResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerProfileResponse {
    
    // Basic speaker information
    private String uuid;
    private String nom;
    private String prenom;
    private String username;
    private String email;
    private String phone;
    private String code;
    private String role;
    
    // Speaker specific details
    private Integer age;
    private String gender;
    private double earnings;
    private String banckRib;
    private String paymentemail;
    private Boolean activeTextValidation;
    
    // Related entities
    private List<LanguageResponse> languages;
    private List<VoixResponse> voix;
    private List<AudioResponse> audios;
    
    // Statistics and additional info
    private Integer totalAudios;
    private Integer totalVoices;
    private Integer totalLanguages;
    private Double averageRating;
    private Integer completedProjects;
    
    // Profile status
    private Boolean isActive;
    private Boolean isDeleted;
    private String profileCompletionStatus; // "INCOMPLETE", "BASIC", "COMPLETE", "VERIFIED"
    
    // Availability and preferences
    private Boolean isAvailableForNewProjects;
    private String preferredWorkingHours;
    private List<String> specializations; // e.g., "Narration", "Commercial", "Educational"
}
