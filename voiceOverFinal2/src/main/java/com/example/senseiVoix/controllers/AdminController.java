package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.admin.AdminRequest;
import com.example.senseiVoix.dtos.admin.AdminResponse;
import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Obtenir la liste de tous les administrateurs actifs (non supprimés).
     */
    @GetMapping
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        List<AdminResponse> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    /**
     * Obtenir un administrateur par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Obtenir un administrateur par son UUID.
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<AdminResponse> getAdminByUuid(@PathVariable String uuid) {
        AdminResponse adminResponse = adminService.getAdminByUuid(uuid);
        return ResponseEntity.ok(adminResponse);
    }

    /**
     * Obtenir un administrateur par son e-mail.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<AdminResponse> getAdminByEmail(@PathVariable String email) {
        AdminResponse adminResponse = adminService.getAdminByEmail(email);
        return ResponseEntity.ok(adminResponse);
    }

    /**
     * Obtenir la liste de tous les administrateurs supprimés (soft delete).
     */
    @GetMapping("/deleted")
    public ResponseEntity<List<AdminResponse>> getAdminsDeleted() {
        List<AdminResponse> adminsDeleted = adminService.getAdminsDeleted();
        return ResponseEntity.ok(adminsDeleted);
    }

    /**
     * Créer un nouvel administrateur.
     */
    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@RequestBody AdminRequest adminRequest) {
        AdminResponse newAdmin = adminService.createAdmin(adminRequest);
        return ResponseEntity.ok(newAdmin);
    }

    /**
     * Mettre à jour un administrateur existant via son UUID.
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<AdminResponse> updateAdmin(@PathVariable String uuid, @RequestBody AdminRequest adminRequest) {
        AdminResponse updatedAdmin = adminService.updateAdmin(uuid, adminRequest);
        if (updatedAdmin != null) {
            return ResponseEntity.ok(updatedAdmin);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer (soft delete) un administrateur via son UUID.
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String uuid) {
        try {
            adminService.deleteAdmin(uuid);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
