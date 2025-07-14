package com.example.senseiVoix.schedulers;

import com.example.senseiVoix.controllers.auth.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetCleanupScheduler {
    
    @Autowired
    private AuthenticationService authenticationService;
    
    // Run every hour to cleanup expired tokens
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredTokens() {
        authenticationService.cleanupExpiredPasswordResetTokens();
    }
}
