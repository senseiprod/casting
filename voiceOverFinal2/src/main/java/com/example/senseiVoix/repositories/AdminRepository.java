package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    @Query("SELECT c FROM Admin  c WHERE c.uuid =:uuid AND c.deleted =false")
    Admin findByUuid(@Param("uuid") String clientId);
    @Query("SELECT c FROM Admin  c WHERE c.email =:email AND c.deleted =false")
    Admin findByEmail(@Param("email") String clientEmail);
    @Query("SELECT c FROM Admin  c WHERE c.deleted =false ")
    List<Admin> findAllNotDeleted();
    @Query("SELECT c FROM Admin  c WHERE c.deleted =true ")
    List<Admin> findAllDeleted();
}
