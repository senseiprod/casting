package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.TypeQualityVoix;
import com.example.senseiVoix.enumeration.TypeVoice;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "voix")
public class Voix extends BaseModel{
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "speaker_id")
    private Speaker speaker;




    private Double nombrePoint ;
    @Enumerated(EnumType.STRING)
    private TypeQualityVoix type;

    public TypeVoice getTypeVoice() {
        return typeVoice;
    }

    public void setTypeVoice(TypeVoice typeVoice) {
        this.typeVoice = typeVoice;
    }
    @Enumerated(EnumType.STRING)
    private TypeVoice typeVoice ;

    public TypeQualityVoix getType() {
        return type;
    }

    public void setType(TypeQualityVoix type) {
        this.type = type;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Speaker getSpeaker() {
        return speaker;
    }

    public void setSpeaker(Speaker speaker) {
        this.speaker = speaker;
    }

    public Double getNombrePoint() {
        return nombrePoint;
    }

    public void setNombrePoint(Double nombrePoint) {
        this.nombrePoint = nombrePoint;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    private String url ;
    private String gender;
    private String language;
    private String name;
    private Double price;

}
