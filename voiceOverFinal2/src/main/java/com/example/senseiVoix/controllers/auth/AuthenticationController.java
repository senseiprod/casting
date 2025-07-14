package com.example.senseiVoix.controllers.auth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @Value("${app.verification.redirect.success-url}")
    private String successRedirectUrl;

    @Value("${app.verification.redirect.failure-url}")
    private String failureRedirectUrl;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {
        try {
            service.register(request);
            return ResponseEntity.ok("Registration successful. Please check your email to verify your account.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/registerSpeaker")
    public ResponseEntity<String> registerSpeaker(
            @RequestBody RegisterRequest request) {
        try {
            service.registerSpeaker(request);
            return ResponseEntity.ok("Registration successful. Please check your email to verify your account.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/registerAdmin")
    public ResponseEntity<String> registerAdmin(
            @RequestBody RegisterRequest request) {
        try {
            service.registerAdmin(request);
            return ResponseEntity.ok("Registration successful. Please check your email to verify your account.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
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

    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam("token") String token, HttpServletResponse httpServletResponse) throws IOException {
        try {
            service.verifyUser(token);
            httpServletResponse.sendRedirect(successRedirectUrl);
        } catch (IllegalArgumentException e) {
            // Log the error for debugging purposes if you have a logger
            // log.error("Invalid token verification attempt: {}", e.getMessage());
            httpServletResponse.sendRedirect(failureRedirectUrl);
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
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
}
