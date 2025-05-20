package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.FavoriteVoices;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteVoicesRepository extends JpaRepository<FavoriteVoices, Long> {
}