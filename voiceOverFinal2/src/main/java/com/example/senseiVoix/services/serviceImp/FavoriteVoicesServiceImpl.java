package com.example.senseiVoix.services.serviceImp;
import com.example.senseiVoix.dtos.favorite.FavoriteVoicesDto;
import com.example.senseiVoix.entities.FavoriteVoices;
import com.example.senseiVoix.repositories.FavoriteVoicesRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteVoicesServiceImpl {
    @Autowired
    private  FavoriteVoicesRepository favoriteVoicesRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository ;

    public FavoriteVoicesDto save(FavoriteVoicesDto dto) {
        FavoriteVoices entity = mapToEntity(dto);
        FavoriteVoices saved = favoriteVoicesRepository.save(entity);
        return mapToDto(saved);
    }

    public List<FavoriteVoicesDto> getAllFavorites() {
        return favoriteVoicesRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FavoriteVoicesDto getFavoriteById(Long id) {
        return favoriteVoicesRepository.findById(id)
                .map(this::mapToDto)
                .orElse(null);
    }

    public void deleteById(Long id) {
        favoriteVoicesRepository.deleteById(id);
    }

    // Mapping methods
    private FavoriteVoicesDto mapToDto(FavoriteVoices entity) {
        return new FavoriteVoicesDto(entity.getUser().getUuid(), entity.getVoiceUrl());
    }

    private FavoriteVoices mapToEntity(FavoriteVoicesDto dto) {
        FavoriteVoices entity = new FavoriteVoices();
        entity.setUser(utilisateurRepository.findByUuid(dto.getUserUuid()));
        entity.setVoiceUrl(dto.getVoiceUrl());
        return entity;
    }
}
