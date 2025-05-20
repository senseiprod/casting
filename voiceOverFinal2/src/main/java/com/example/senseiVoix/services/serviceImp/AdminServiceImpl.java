package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.IMapClassWithDto;
import com.example.senseiVoix.dtos.admin.AdminRequest;
import com.example.senseiVoix.dtos.admin.AdminResponse;
import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.repositories.AdminRepository;
import com.example.senseiVoix.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private IMapClassWithDto<Admin, AdminRequest> requestMapper;


    @Override
    public List<AdminResponse> getAllAdmins() {
        List<Admin> admins = adminRepository.findAllNotDeleted();
        List<AdminResponse> listAdmins = new ArrayList<>();
        for(Admin admin : admins){
            AdminResponse adminResponse = new AdminResponse(admin.getUuid(), admin.getCode(), admin.getNom(), admin.getPrenom(),admin.getEmail(), admin.getMotDePasse(), admin.getPhone(), admin.getUsername(), admin.getRole(), admin.getRoleAdmin());
            listAdmins.add(adminResponse);
        }
        return listAdmins;
    }

    @Override
    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    @Override
    public AdminResponse getAdminByUuid(String uuid) {
        Admin admin = adminRepository.findByUuid(uuid);
        AdminResponse adminResponse = new AdminResponse(admin.getUuid(), admin.getCode(), admin.getNom(), admin.getPrenom(),admin.getEmail(), admin.getMotDePasse(), admin.getPhone(), admin.getUsername(), admin.getRole(), admin.getRoleAdmin());
        return adminResponse ;
    }

    @Override
    public AdminResponse getAdminByEmail(String email) {
        Admin admin = adminRepository.findByEmail(email);
        AdminResponse adminResponse = new AdminResponse(admin.getUuid(), admin.getCode(), admin.getNom(), admin.getPrenom(),admin.getEmail(), admin.getMotDePasse(), admin.getPhone(), admin.getUsername(), admin.getRole(), admin.getRoleAdmin());
        return adminResponse ;    }

    @Override
    public List<AdminResponse> getAdminsDeleted() {
        List<Admin> admins = adminRepository.findAllDeleted();
        List<AdminResponse> listAdmins = new ArrayList<>();
        for(Admin admin : admins){
            AdminResponse adminResponse = new AdminResponse(admin.getUuid(), admin.getCode(), admin.getNom(), admin.getPrenom(),admin.getEmail(), admin.getMotDePasse(), admin.getPhone(), admin.getUsername(), admin.getRole(), admin.getRoleAdmin());
            listAdmins.add(adminResponse);
        }
        return listAdmins;    }

    @Override
    public AdminResponse createAdmin(AdminRequest adminRequest) {
        if (adminRequest != null) {
            Admin adminbeSaved = requestMapper.convertToEntity(adminRequest, Admin.class);
            adminbeSaved.setRoleAdmin(adminRequest.getRoleAdmin());
            Admin admin = adminRepository.save(adminbeSaved);
            AdminResponse adminResponse = new AdminResponse(admin.getUuid(), admin.getCode(), admin.getNom(), admin.getPrenom(),admin.getEmail(), admin.getMotDePasse(), admin.getPhone(), admin.getUsername(), admin.getRole(), admin.getRoleAdmin());
            return adminResponse ;
                }
        return null;
    }

    @Override
    public AdminResponse updateAdmin(String uuid, AdminRequest adminRequest) {
        Admin admin = adminRepository.findByUuid(uuid);
        if (admin != null) {
            admin.setEmail(adminRequest.getEmail());
            admin.setNom(adminRequest.getNom());
            Admin updatedAdmin = adminRepository.save(admin);
            AdminResponse adminResponse = new AdminResponse(updatedAdmin.getUuid(), updatedAdmin.getCode(), updatedAdmin.getNom(), updatedAdmin.getPrenom(),updatedAdmin.getEmail(), updatedAdmin.getMotDePasse(), updatedAdmin.getPhone(), updatedAdmin.getUsername(), updatedAdmin.getRole(), updatedAdmin.getRoleAdmin());
            return adminResponse ;        }
        return null;
    }

    @Override
    public void deleteAdmin(String uuid) {
        Admin admin = adminRepository.findByUuid(uuid);
        if (admin != null) {
            admin.setDeleted(true);
            adminRepository.save(admin);
        } else {
            throw new RuntimeException("Admin not found with uuid: " + uuid);
        }
    }
}
