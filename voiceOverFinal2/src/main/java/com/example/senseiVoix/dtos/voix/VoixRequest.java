package com.example.senseiVoix.dtos.voix;

import com.example.senseiVoix.entities.Voix;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link Voix}
 */
@NoArgsConstructor
@AllArgsConstructor
public class VoixRequest implements Serializable {
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

    public String getUrl() {
        return url;
    }

    String url;


}
