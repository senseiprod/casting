package com.example.senseiVoix.dtos.record;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class RecordRequest {
    String utilisateurUuid;

    public String getUtilisateurUuid() {
        return utilisateurUuid;
    }

    public void setUtilisateurUuid(String utilisateurUuid) {
        this.utilisateurUuid = utilisateurUuid;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    LocalDateTime startDateTime ;
    LocalDateTime endDateTime ;
}
