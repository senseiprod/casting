package com.example.senseiVoix.dtos.SpeakerInfo;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.Column;
import java.time.LocalDate;


@Data
public class SpeakerInfo {

    // --- Personal Information ---
    @NotBlank(message = "Nom complet is required")
    @Size(max = 100)
    private String fullName;

    @Size(max = 100)
    private String artistName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    private String email;




    private String phone;

    @NotNull(message = "Birthdate is required")
    private LocalDate birthdate;

    @NotBlank(message = "Location is required")
    private String location;

    // --- Professional Information ---
    @NotBlank(message = "Current job is required")
    private String currentJob;

    @NotNull(message = "Experience years are required")
    private Integer experienceYears;

    // --- Languages ---
    private boolean langArabicClassical;
    private boolean langDarija;
    private boolean langFrench;
    private boolean langEnglish;
    private boolean langSpanish;
    private String otherLanguages;

    // --- Voice Type ---
    private boolean voiceFemale;
    private boolean voiceMale;
    private boolean voiceTeenChild;
    private boolean voiceSenior;
    private boolean voiceNeutral;
    private boolean voiceDeep;
    private boolean voiceDynamic;
    private String voiceOther;

    // --- Demo ---
    private String demoLink;
    private byte[] demoFile; // Will store the filename for now

    // --- Studio ---
    private String hasStudio; // "yes" or "no" from the form
    private String studioDescription;

    // --- Experience ---
    private String professionalExperience;

    // --- Social ---
    private String socialLinks;

    // --- Consent & Legal ---
    private String voiceCloningConsent; // "yes" or "no"
    @NotNull(message = "You must agree to the terms")
    private boolean agreeTerms;
    @NotBlank(message = "Digital signature is required")
    private String digitalSignature;
    @NotNull(message = "Signature date is required")
    private LocalDate signatureDate;

    // Add Getters and Setters for all new fields...
    // Example:
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getBirthdate() { return birthdate; }
    public void setBirthdate(LocalDate birthdate) { this.birthdate = birthdate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCurrentJob() { return currentJob; }
    public void setCurrentJob(String currentJob) { this.currentJob = currentJob; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public boolean isLangArabicClassical() { return langArabicClassical; }
    public void setLangArabicClassical(boolean langArabicClassical) { this.langArabicClassical = langArabicClassical; }

    public boolean isLangDarija() { return langDarija; }
    public void setLangDarija(boolean langDarija) { this.langDarija = langDarija; }

    public boolean isLangFrench() { return langFrench; }
    public void setLangFrench(boolean langFrench) { this.langFrench = langFrench; }

    public boolean isLangEnglish() { return langEnglish; }
    public void setLangEnglish(boolean langEnglish) { this.langEnglish = langEnglish; }

    public boolean isLangSpanish() { return langSpanish; }
    public void setLangSpanish(boolean langSpanish) { this.langSpanish = langSpanish; }

    public String getOtherLanguages() { return otherLanguages; }
    public void setOtherLanguages(String otherLanguages) { this.otherLanguages = otherLanguages; }

    public boolean isVoiceFemale() { return voiceFemale; }
    public void setVoiceFemale(boolean voiceFemale) { this.voiceFemale = voiceFemale; }

    public boolean isVoiceMale() { return voiceMale; }
    public void setVoiceMale(boolean voiceMale) { this.voiceMale = voiceMale; }

    public boolean isVoiceTeenChild() { return voiceTeenChild; }
    public void setVoiceTeenChild(boolean voiceTeenChild) { this.voiceTeenChild = voiceTeenChild; }

    public boolean isVoiceSenior() { return voiceSenior; }
    public void setVoiceSenior(boolean voiceSenior) { this.voiceSenior = voiceSenior; }

    public boolean isVoiceNeutral() { return voiceNeutral; }
    public void setVoiceNeutral(boolean voiceNeutral) { this.voiceNeutral = voiceNeutral; }

    public boolean isVoiceDeep() { return voiceDeep; }
    public void setVoiceDeep(boolean voiceDeep) { this.voiceDeep = voiceDeep; }

    public boolean isVoiceDynamic() { return voiceDynamic; }
    public void setVoiceDynamic(boolean voiceDynamic) { this.voiceDynamic = voiceDynamic; }

    public String getVoiceOther() { return voiceOther; }
    public void setVoiceOther(String voiceOther) { this.voiceOther = voiceOther; }

    public String getDemoLink() { return demoLink; }
    public void setDemoLink(String demoLink) { this.demoLink = demoLink; }



    public String getHasStudio() { return hasStudio; }
    public void setHasStudio(String hasStudio) { this.hasStudio = hasStudio; }

    public String getStudioDescription() { return studioDescription; }
    public void setStudioDescription(String studioDescription) { this.studioDescription = studioDescription; }

    public String getProfessionalExperience() { return professionalExperience; }
    public void setProfessionalExperience(String professionalExperience) { this.professionalExperience = professionalExperience; }

    public String getSocialLinks() { return socialLinks; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }

    public String getVoiceCloningConsent() { return voiceCloningConsent; }
    public void setVoiceCloningConsent(String voiceCloningConsent) { this.voiceCloningConsent = voiceCloningConsent; }

    public boolean isAgreeTerms() { return agreeTerms; }
    public void setAgreeTerms(boolean agreeTerms) { this.agreeTerms = agreeTerms; }

    public String getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(String digitalSignature) { this.digitalSignature = digitalSignature; }

    public LocalDate getSignatureDate() { return signatureDate; }
    public void setSignatureDate(LocalDate signatureDate) { this.signatureDate = signatureDate; }
}
