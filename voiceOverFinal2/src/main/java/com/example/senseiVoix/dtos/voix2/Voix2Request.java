package com.example.senseiVoix.dtos.voix2;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link com.example.senseiVoix.entities.Voix2}
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Voix2Request implements Serializable {
    String speakerUuid;
    Double nombrePoint;
    String gender;
    String language;
    String type ;
    String typeVoice;


    public String getType() {
        return type;
    }

    public String getTypeVoice() {
        return typeVoice;
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


    public String getSpeakerUuid() {
        return speakerUuid;
    }

    public Double getNombrePoint() {
        return nombrePoint;
    }



    String elevenlabsid;


}
