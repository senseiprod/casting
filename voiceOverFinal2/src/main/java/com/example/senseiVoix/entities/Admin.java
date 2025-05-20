package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.RoleAdmin;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("ADMIN")
public class Admin extends Utilisateur{

  @Enumerated(EnumType.STRING)
  @Column(name = "role_admin", columnDefinition = "VARCHAR")
  private RoleAdmin roleAdmin;

  public RoleAdmin getRoleAdmin() {
    return roleAdmin;
  }

  public void setRoleAdmin(RoleAdmin roleAdmin) {
    this.roleAdmin = roleAdmin;
  }
}
