package com.example.senseiVoix.enumeration;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.example.senseiVoix.enumeration.Permission.*;
import static com.example.senseiVoix.enumeration.Permission.CLIENT_CREATE;

public enum RoleUtilisateur {

    ADMIN(
            Set.of(
            ADMIN_READ,
            ADMIN_UPDATE,
            ADMIN_DELETE,
            ADMIN_CREATE,
                    SPEAKER_READ,
                    SPEAKER_UPDATE,
                    SPEAKER_DELETE,
                    SPEAKER_CREATE
            )
  ),
    SPEAKER(
            Set.of(
                    SPEAKER_READ,
                    SPEAKER_UPDATE,
                    SPEAKER_DELETE,
                    SPEAKER_CREATE
            )
  ),
    CLIENT(
            Set.of(
                    CLIENT_READ,
                    CLIENT_UPDATE,
                    CLIENT_DELETE,
                    CLIENT_CREATE
            )
    )

    ;

    RoleUtilisateur(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    @Getter
    private final Set<Permission> permissions;

    public List<SimpleGrantedAuthority> getAuthorities() {
        var authorities = getPermissions()
                .stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toList());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}
