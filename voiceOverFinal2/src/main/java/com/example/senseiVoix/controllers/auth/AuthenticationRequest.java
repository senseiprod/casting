package com.example.senseiVoix.controllers.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }

  private String email;
  String password;
}
