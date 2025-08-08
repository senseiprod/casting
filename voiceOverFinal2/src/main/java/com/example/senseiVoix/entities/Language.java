package com.example.senseiVoix.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "languages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Language {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code; // e.g., "en", "fr", "ar", "ary" for Darija
    
    @Column(nullable = false)
    private String name; // e.g., "English", "French", "Arabic", "Darija Morocco"
    
    @Column(nullable = false)
    private String nativeName; // e.g., "English", "Français", "العربية", "الدارجة المغربية"
    
    private String region; // e.g., "Morocco" for Darija
    
    private Boolean isActive = true;
    
    @JsonIgnore
    @ManyToMany(mappedBy = "languages")
    private List<Speaker> speakers;
    
    // Constructor for easy initialization
    public Language(String code, String name, String nativeName, String region) {
        this.code = code;
        this.name = name;
        this.nativeName = nativeName;
        this.region = region;
        this.isActive = true;
    }
}
