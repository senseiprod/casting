package com.example.senseiVoix.dtos.voix2;


import com.example.senseiVoix.enumeration.TypeQualityVoix;

import com.example.senseiVoix.enumeration.TypeVoice;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for {@link com.example.senseiVoix.entities.Voix2}
 */
@NoArgsConstructor
@Setter
@Getter
@Data
public class Voix2Response implements Serializable {
    String uuid;
    String code;
    String speakerUuid;

    public Voix2Response(String uuid, String code, String speakerUuid, Double nombrePoint, String gender, String language, TypeQualityVoix type, TypeVoice typeVoice, String name, Double price, String elevenlabs_id) {
        this.uuid = uuid;
        this.code = code;
        this.speakerUuid = speakerUuid;
        this.nombrePoint = nombrePoint;
        this.gender = gender;
        this.language = language;
        this.type = type;
        this.typeVoice = typeVoice;
        this.name = name;
        this.price = price;
        this.elevenlabs_id = elevenlabs_id ;
    }

    Double nombrePoint;
    String gender;
    String language;
    TypeQualityVoix type ;
    TypeVoice typeVoice ;

    public TypeVoice getTypeVoice() {
        return typeVoice;
    }

    public TypeQualityVoix getType() {
        return type;
    }

    public String getGender() {
        return gender;
    }

    public String getLanguage() {
        return language;
    }

    public String getName() {
        return name;
    }

    public Double getPrice() {
        return price;
    }

    String name;
    Double price;

    public String getUuid() {
        return uuid;
    }

    public String getCode() {
        return code;
    }

    public String getSpeakerUuid() {
        return speakerUuid;
    }

    public Double getNombrePoint() {
        return nombrePoint;
    }



    String elevenlabs_id;
}
