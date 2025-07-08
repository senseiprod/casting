package com.example.senseiVoix.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "speakersInfo")
public class SpeakerInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Personal Information ---
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "artist_name", length = 100)
    private String artistName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "birthdate")
    private LocalDate birthdate;

    @Column(name = "location")
    private String location;

    // --- Professional Information ---
    @Column(name = "current_job")
    private String currentJob;

    @Column(name = "experience_years")
    private Integer experienceYears;

    // --- Languages ---
    @Column(name = "lang_arabic_classical")
    private boolean langArabicClassical;
    @Column(name = "lang_darija")
    private boolean langDarija;
    @Column(name = "lang_french")
    private boolean langFrench;
    @Column(name = "lang_english")
    private boolean langEnglish;
    @Column(name = "lang_spanish")
    private boolean langSpanish;
    @Column(name = "other_languages")
    private String otherLanguages;

    // --- Voice Types ---
    @Column(name = "voice_female")
    private boolean voiceFemale;
    @Column(name = "voice_male")
    private boolean voiceMale;
    @Column(name = "voice_teen_child")
    private boolean voiceTeenChild;
    @Column(name = "voice_senior")
    private boolean voiceSenior;
    @Column(name = "voice_neutral")
    private boolean voiceNeutral;
    @Column(name = "voice_deep")
    private boolean voiceDeep;
    @Column(name = "voice_dynamic")
    private boolean voiceDynamic;
    @Column(name = "voice_other")
    private String voiceOther;

    // --- Demo ---
    @Column(name = "demo_link")
    private String demoLink;

    @Column(name = "demo_audio", columnDefinition="bytea")
    private byte[] demoAudio;

    @Column(name = "demo_audio_type")
    private String demoAudioType;

    // --- Studio ---
    @Column(name = "has_studio")
    private boolean hasStudio;
    @Column(name = "studio_description", columnDefinition = "TEXT")
    private String studioDescription;

    // --- Experience ---
    @Column(name = "professional_experience", columnDefinition = "TEXT")
    private String professionalExperience;

    // --- Social ---
    @Column(name = "social_links")
    private String socialLinks;

    // --- Consent & Legal ---
    @Column(name = "voice_cloning_consent")
    private boolean voiceCloningConsent;
    @Column(name = "agree_terms")
    private boolean agreeTerms;
    @Column(name = "digital_signature")
    private String digitalSignature;
    @Column(name = "signature_date")
    private LocalDate signatureDate;

    // Constructors
    public SpeakerInfo() {}

    // Getters and Setters for all fields

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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



    public boolean isHasStudio() { return hasStudio; }
    public void setHasStudio(boolean hasStudio) { this.hasStudio = hasStudio; }

    public String getStudioDescription() { return studioDescription; }
    public void setStudioDescription(String studioDescription) { this.studioDescription = studioDescription; }

    public String getProfessionalExperience() { return professionalExperience; }
    public void setProfessionalExperience(String professionalExperience) { this.professionalExperience = professionalExperience; }

    public String getSocialLinks() { return socialLinks; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }

    public boolean isVoiceCloningConsent() { return voiceCloningConsent; }
    public void setVoiceCloningConsent(boolean voiceCloningConsent) { this.voiceCloningConsent = voiceCloningConsent; }

    public boolean isAgreeTerms() { return agreeTerms; }
    public void setAgreeTerms(boolean agreeTerms) { this.agreeTerms = agreeTerms; }

    public String getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(String digitalSignature) { this.digitalSignature = digitalSignature; }

    public LocalDate getSignatureDate() { return signatureDate; }
    public void setSignatureDate(LocalDate signatureDate) { this.signatureDate = signatureDate; }
}