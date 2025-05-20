package com.example.senseiVoix.controllers.auth;

import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

  private String firstname;

  public String getFirstname() {
    return firstname;
  }

  public String getLastname() {
    return lastname;
  }

  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }

  public RoleUtilisateur getRole() {
    return role;
  }

  private String lastname;
  private String email;

  public String getPhone() {
    return phone;
  }

  private String password;
  private RoleUtilisateur role;
  private String phone;
  private String companyName;

  public String getCompanyName() {
    return companyName;
  }
}
