package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Project findByUuidAndDeletedFalse(String uuid);
    List<Project> findAllByDeletedFalse();

    @Query("SELECT c FROM Project  c WHERE c.user.uuid =:uuid AND c.deleted =false")
    List<Project> findBySpeaker(@Param("uuid") String uuid);

    Optional<Object> findByUuid(String uuid);
}