package com.example.senseiVoix.dtos.project;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    private String name;
    private String description;
    private LocalDate dateCreation;
    private Long userId;
    private Long speakerId;

    // Getters and setters
}
