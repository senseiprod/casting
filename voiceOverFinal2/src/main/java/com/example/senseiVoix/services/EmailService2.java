package com.example.senseiVoix.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService2 {

    private static final Logger log = LoggerFactory.getLogger(EmailService2.class);

    @Autowired
    private JavaMailSender mailSender;

    // Inject the base URL from application.properties
    @Value("${app.api.base-url}")
    private String apiBaseUrl;

    public void sendVerificationEmail(String email, String token) {
        // MODIFICATION: Construct the full, correct URL including "/v1"
        String verificationUrl = apiBaseUrl + "/api/v1/auth/verify-email?token=" + token;

        String subject = "Email Verification";
        String body = "Click the link to verify your email: " + verificationUrl;

        // --- For Local Testing ---
        log.info("--- EMAIL VERIFICATION LINK ---");
        log.info("To: {}", email);
        log.info("Full Link: {}", verificationUrl);
        log.info("-------------------------------");

        // --- For Production ---
        // This will now send the correct link in the real email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // It's good practice to set a 'From' address
            message.setFrom("noreply@castingvoixoff.ma");
            message.setTo(email);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
        }
    }

    public void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        helper.setFrom("noreply@example.com");

        mailSender.send(message);
    }
}