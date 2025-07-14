package com.example.senseiVoix.controllers.auth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
  @Autowired
  private AuthenticationService service;

  @PostMapping("/register")
  public ResponseEntity<AuthenticationResponse> register(
      @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(service.register(request));
  }

  @PostMapping("/registerSpeaker")
  public ResponseEntity<AuthenticationResponse> registerSpeaker(
      @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(service.registerSpeaker(request));
  }

  @PostMapping("/registerAdmin")
  public ResponseEntity<AuthenticationResponse> registerAdmin(
      @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(service.registerAdmin(request));
  }

  @PostMapping("/authenticate")
  public ResponseEntity<AuthenticationResponse> authenticate(
      @RequestBody AuthenticationRequest request) {
    return ResponseEntity.ok(service.authenticate(request));
  }

  @PostMapping("/refresh-token")
  public void refreshToken(
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    service.refreshToken(request, response);
  }

  @PutMapping("/change-password")
  public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
      try {
        service.changePassword(request.getEmail(), request.getOldPassword(), request.getNewPassword());
          return ResponseEntity.ok("Password changed successfully.");
      } catch (UsernameNotFoundException e) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
      } catch (IllegalArgumentException e) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
      }
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
      try {
          service.forgotPassword(request.getEmail());
          return ResponseEntity.ok("If the email exists, a password reset link has been sent.");
      } catch (Exception e) {
          // Don't reveal if email exists or not for security reasons
          return ResponseEntity.ok("If the email exists, a password reset link has been sent.");
      }
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
      try {
          service.resetPassword(request.getToken(), request.getNewPassword());
          return ResponseEntity.ok("Password has been reset successfully.");
      } catch (IllegalArgumentException e) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
      } catch (Exception e) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while resetting password.");
      }
  }
}
