package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.speaker.SpeakerProfileResponse;
import com.example.senseiVoix.services.SpeakerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/speaker-profiles")
@CrossOrigin(origins = "*")
public class SpeakerProfileController {

    @Autowired
    private SpeakerProfileService speakerProfileService;

    /**
     * Get basic speaker profile by UUID.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker profile and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<SpeakerProfileResponse> getSpeakerProfile(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfile(uuid);
            return profile != null 
                ? new ResponseEntity<>(profile, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get detailed speaker profile with statistics by UUID.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker profile with statistics and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/detailed")
    public ResponseEntity<SpeakerProfileResponse> getSpeakerProfileWithStatistics(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfileWithStatistics(uuid);
            return profile != null 
                ? new ResponseEntity<>(profile, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Initialize a speaker with Darija Morocco language.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity with HTTP status OK (200) if successful, or NOT_FOUND (404) if speaker not found
     */
    @PostMapping("/{uuid}/initialize-darija")
    public ResponseEntity<String> initializeSpeakerWithDarijaLanguage(@PathVariable String uuid) {
        try {
            speakerProfileService.initializeSpeakerWithDarijaLanguage(uuid);
            return new ResponseEntity<>("Darija language successfully added to speaker profile", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to initialize speaker with Darija language", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get speaker profile completion status.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the completion status and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/completion-status")
    public ResponseEntity<String> getSpeakerProfileCompletionStatus(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfileWithStatistics(uuid);
            if (profile != null) {
                return new ResponseEntity<>(profile.getProfileCompletionStatus(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get speaker profile statistics only.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker statistics and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/statistics")
    public ResponseEntity<SpeakerStatisticsResponse> getSpeakerStatistics(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfileWithStatistics(uuid);
            if (profile != null) {
                SpeakerStatisticsResponse stats = new SpeakerStatisticsResponse();
                stats.setTotalAudios(profile.getTotalAudios());
                stats.setTotalVoices(profile.getTotalVoices());
                stats.setTotalLanguages(profile.getTotalLanguages());
                stats.setCompletedProjects(profile.getCompletedProjects());
                stats.setAverageRating(profile.getAverageRating());
                stats.setProfileCompletionStatus(profile.getProfileCompletionStatus());
                stats.setEarnings(profile.getEarnings());
                
                return new ResponseEntity<>(stats, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check if speaker profile is complete.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing boolean result and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/is-complete")
    public ResponseEntity<Boolean> isSpeakerProfileComplete(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfileWithStatistics(uuid);
            if (profile != null) {
                boolean isComplete = "COMPLETE".equals(profile.getProfileCompletionStatus()) || 
                                   "VERIFIED".equals(profile.getProfileCompletionStatus());
                return new ResponseEntity<>(isComplete, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get speaker languages only.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker languages and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/languages")
    public ResponseEntity<?> getSpeakerLanguages(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfile(uuid);
            if (profile != null && profile.getLanguages() != null) {
                return new ResponseEntity<>(profile.getLanguages(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get speaker audios only.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker audios and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/audios")
    public ResponseEntity<?> getSpeakerAudios(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfile(uuid);
            if (profile != null && profile.getAudios() != null) {
                return new ResponseEntity<>(profile.getAudios(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get speaker voices only.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker voices and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{uuid}/voices")
    public ResponseEntity<?> getSpeakerVoices(@PathVariable String uuid) {
        try {
            SpeakerProfileResponse profile = speakerProfileService.getSpeakerProfile(uuid);
            if (profile != null && profile.getVoix() != null) {
                return new ResponseEntity<>(profile.getVoix(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Inner class for statistics response
    public static class SpeakerStatisticsResponse {
        private Integer totalAudios;
        private Integer totalVoices;
        private Integer totalLanguages;
        private Integer completedProjects;
        private Double averageRating;
        private String profileCompletionStatus;
        private Double earnings;

        // Getters and Setters
        public Integer getTotalAudios() { return totalAudios; }
        public void setTotalAudios(Integer totalAudios) { this.totalAudios = totalAudios; }

        public Integer getTotalVoices() { return totalVoices; }
        public void setTotalVoices(Integer totalVoices) { this.totalVoices = totalVoices; }

        public Integer getTotalLanguages() { return totalLanguages; }
        public void setTotalLanguages(Integer totalLanguages) { this.totalLanguages = totalLanguages; }

        public Integer getCompletedProjects() { return completedProjects; }
        public void setCompletedProjects(Integer completedProjects) { this.completedProjects = completedProjects; }

        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

        public String getProfileCompletionStatus() { return profileCompletionStatus; }
        public void setProfileCompletionStatus(String profileCompletionStatus) { this.profileCompletionStatus = profileCompletionStatus; }

        public Double getEarnings() { return earnings; }
        public void setEarnings(Double earnings) { this.earnings = earnings; }
    }
}
