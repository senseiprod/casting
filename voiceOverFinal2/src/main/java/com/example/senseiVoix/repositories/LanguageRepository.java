package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    
    Optional<Language> findByCode(String code);
    
    List<Language> findByIsActiveTrue();
    
    @Query("SELECT l FROM Language l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(l.nativeName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Language> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT l FROM Language l WHERE l.region = :region AND l.isActive = true")
    List<Language> findByRegionAndIsActiveTrue(@Param("region") String region);
}
