package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.admin.AdminRequest;
import com.example.senseiVoix.dtos.admin.AdminResponse;
import com.example.senseiVoix.entities.Admin;

import java.util.List;
import java.util.Optional;

public interface AdminService {
    List<AdminResponse> getAllAdmins();
    Optional<Admin> getAdminById(Long id);
    AdminResponse getAdminByUuid(String uuid);
    AdminResponse getAdminByEmail(String email);
    List<AdminResponse> getAdminsDeleted();
    AdminResponse createAdmin(AdminRequest adminRequest);
    AdminResponse updateAdmin(String uuid, AdminRequest adminRequest);
    void deleteAdmin(String uuid);
}

