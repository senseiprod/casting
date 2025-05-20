package com.example.senseiVoix.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("SPEAKER")
public class Speaker extends Utilisateur {
    private double earnings = 0.0; // Gains accumulés en points

    private String paymentemail;

    public double getEarnings() {
        return earnings;
    }

    public void setEarnings(double earnings) {
        this.earnings = earnings;
    }
    @JsonIgnore
    @OneToMany(mappedBy = "speaker", cascade = CascadeType.ALL)
    private List<Voix> voix;

    public Boolean getActiveTextValidation() {
        return activeTextValidation;
    }

    public void setActiveTextValidation(Boolean activeTextValidation) {
        this.activeTextValidation = activeTextValidation;
    }

    private Boolean activeTextValidation ;
    @JsonIgnore
    @OneToMany(mappedBy = "speaker", cascade = CascadeType.ALL)
    private List<Audio> audios;
    @JsonIgnore
    @OneToMany(mappedBy = "preferedVoice", cascade = CascadeType.ALL)
    private List<Project> projects;
    private String banckRib ;

    public String getBanckRib() {
        return banckRib;
    }

    public void setBanckRib(String banckRib) {
        this.banckRib = banckRib;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    private Integer age ;
    private String gender ;

    @JsonIgnore
    @OneToMany(mappedBy = "speaker", cascade = CascadeType.ALL)
    private List<ReservationSpeaker> reservationSpeakers;
}
