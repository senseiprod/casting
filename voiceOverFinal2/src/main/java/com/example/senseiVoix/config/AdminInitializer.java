package com.example.senseiVoix.config;

import com.example.senseiVoix.controllers.auth.AuthenticationService;
import com.example.senseiVoix.controllers.auth.RegisterRequest;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.ClientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AdminInitializer implements ApplicationRunner {

    @Autowired
    private ClientRepository repository;

    @Autowired
    private AuthenticationService authService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createDefaultAdminIfNotExists();
    }

    private void createDefaultAdminIfNotExists() {
        // Check if any admin user already exists
        boolean adminExists = repository.existsByRole(RoleUtilisateur.ADMIN);

        if (!adminExists) {
            log.info("No admin user found. Creating default admin...");

            RegisterRequest adminRequest = new RegisterRequest();
            adminRequest.setFirstname("Admin");
            adminRequest.setLastname("Casting");
            adminRequest.setEmail("sensei.castingvoixoff@gmail.com");
            adminRequest.setCompanyName("Senseiprod");
            adminRequest.setPhone("0520-093990");
            adminRequest.setPassword("EHjN£28M63j+");

            try {
                authService.registerAdmin(adminRequest);
                log.info("Default admin user created successfully with email: admin@company.com");
            } catch (Exception e) {
                log.error("Failed to create default admin user", e);
            }
        } else {
            log.info("Admin user already exists. Skipping admin creation.");
        }
    }
}
