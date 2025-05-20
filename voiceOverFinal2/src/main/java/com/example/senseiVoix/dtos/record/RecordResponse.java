package com.example.senseiVoix.dtos.record;

import com.example.senseiVoix.entities.Record;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link Record}
 */
@Data
@NoArgsConstructor
public class RecordResponse implements Serializable {
    String uuid;
    String code;
    String utilisateurUuid;

    public RecordResponse(String uuid, String code, String utilisateurUuid, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        this.uuid = uuid;
        this.code = code;
        this.utilisateurUuid = utilisateurUuid;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    LocalDateTime startDateTime ;
    LocalDateTime endDateTime ;
}
