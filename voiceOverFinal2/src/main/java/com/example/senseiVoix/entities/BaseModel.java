package com.example.senseiVoix.entities;

import com.example.senseiVoix.helpers.Utils;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@MappedSuperclass
public class BaseModel {
    private String uuid ;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    private String code ;
    private boolean deleted;

    @PrePersist
    public void prePersist() {
        this.deleted = false;
        this.code = Utils.generateHash();
        this.uuid = Utils.getHashedUuid(LocalDateTime.now(),1254L);
    }
}
