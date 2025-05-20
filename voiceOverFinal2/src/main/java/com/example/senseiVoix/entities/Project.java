package com.example.senseiVoix.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "description", nullable = false)
    private String description;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;
    @ManyToOne
    @JoinColumn(name = "speaker_id", nullable = false)
    private Speaker preferedVoice;
    private LocalDate dateCreation ;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Action> actions;
}
