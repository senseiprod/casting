package com.example.senseiVoix.dtos.language;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LanguageResponse {
    private Long id;
    private String code;
    private String name;
    private String nativeName;
    private String region;
    private Boolean isActive;
}
