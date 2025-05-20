package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.favorite.FavoriteVoicesDto;
import com.example.senseiVoix.services.serviceImp.FavoriteVoicesServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteVoicesController {

    private final FavoriteVoicesServiceImpl favoriteVoicesService;

    @PostMapping
    public ResponseEntity<FavoriteVoicesDto> createFavorite(@RequestBody FavoriteVoicesDto dto) {
        FavoriteVoicesDto saved = favoriteVoicesService.save(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<FavoriteVoicesDto>> getAllFavorites() {
        return ResponseEntity.ok(favoriteVoicesService.getAllFavorites());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FavoriteVoicesDto> getFavoriteById(@PathVariable Long id) {
        FavoriteVoicesDto dto = favoriteVoicesService.getFavoriteById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable Long id) {
        favoriteVoicesService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

