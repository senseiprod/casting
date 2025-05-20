package com.example.senseiVoix.enumeration;
import lombok.Getter;


public enum Permission {
    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete"),
    SPEAKER_READ("management:read"),
    SPEAKER_UPDATE("management:update"),
    SPEAKER_CREATE("management:create"),
    SPEAKER_DELETE("management:delete"),
    CLIENT_READ("client:read"),
    CLIENT_UPDATE("client:update"),
    CLIENT_CREATE("client:create"),
    CLIENT_DELETE("client:delete")

    ;

    public String getPermission() {
        return permission;
    }

    Permission(String permission) {
        this.permission = permission;
    }

    @Getter
    private final String permission;
}
