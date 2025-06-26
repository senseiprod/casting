package com.example.senseiVoix.controllers;

import com.example.senseiVoix.services.EmailService2;
import jakarta.mail.MessagingException;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailController {
    private final EmailService2 emailService2;

    public EmailController(EmailService2 emailService2) {
        this.emailService2 = emailService2;
    }

    @GetMapping("/send-test-email")
    public String sendTestEmail(@RequestParam String to) {
        try {
            emailService2.sendEmail(to, "Test Email", "<h1>This is a test email</h1>");
            return "Email sent successfully!";
        } catch (MessagingException e) {
            return "Error sending email: " + e.getMessage();
        }
    }
}
