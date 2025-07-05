package com.example.senseiVoix.entities;



import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "speakersInfo")
public class SpeakerInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nom complet is required")
    @Size(max = 100)
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Size(max = 100)
    @Column(name = "artist_name")
    private String artistName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    @Column(name = "phone", nullable = false)
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
}

