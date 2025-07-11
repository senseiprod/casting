package com.example.senseiVoix.dtos.favorite;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link com.example.senseiVoix.entities.FavoriteVoices}
 */
@NoArgsConstructor
@Data
@AllArgsConstructor
public class FavoriteVoicesDto implements Serializable {
    String userUuid;
    String voiceUrl;

    public String getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(String userUuid) {
        this.userUuid = userUuid;
    }

    public String getVoiceUrl() {
        return voiceUrl;
    }

    public void setVoiceUrl(String voiceUrl) {
        this.voiceUrl = voiceUrl;
    }
}
