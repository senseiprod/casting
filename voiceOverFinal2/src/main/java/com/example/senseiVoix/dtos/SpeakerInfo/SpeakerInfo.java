package com.example.senseiVoix.dtos.SpeakerInfo;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SpeakerInfo {

    @NotBlank(message = "Nom complet is required")
    @Size(max = 100)
    private String fullName;

    @Size(max = 100)
    private String artistName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    private String phone;

    // Constructors
    public SpeakerInfo() {}

    public SpeakerInfo(String fullName, String artistName, String email, String phone) {
        this.fullName = fullName;
        this.artistName = artistName;
        this.email = email;
        this.phone = phone;
    }

    // Getters and setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getArtistName() { return artistName; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
