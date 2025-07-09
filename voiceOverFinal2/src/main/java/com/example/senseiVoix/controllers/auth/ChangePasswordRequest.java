package com.example.senseiVoix.controllers.auth;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChangePasswordRequest {
    private String email;
    private String oldPassword;
    private String newPassword;

    // Getters and Setters
}