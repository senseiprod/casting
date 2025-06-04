package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.project.ProjectRequest;
import com.example.senseiVoix.entities.Project;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.ProjectRepository;
import com.example.senseiVoix.repositories.SpeakerRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final SpeakerRepository speakerRepository;

    public ProjectService(ProjectRepository projectRepository, UtilisateurRepository utilisateurRepository, SpeakerRepository speakerRepository) {
        this.projectRepository = projectRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.speakerRepository = speakerRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAllByDeletedFalse();
    }

    public Project getProjectByUuid(String uuid) {
        return projectRepository.findByUuidAndDeletedFalse(uuid);
    }

    public Project createProject(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setDateCreation(request.getDateCreation());

        // Set user and speaker
        Utilisateur user = utilisateurRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Speaker speaker = speakerRepository.findById(request.getSpeakerId())
                .orElseThrow(() -> new RuntimeException("Speaker not found"));

        project.setUser(user);
        project.setPreferedVoice(speaker);

        return projectRepository.save(project);
    }

       public List<Project> findBySpeaker(String uuid) {
        List<Project> projects = projectRepository.findBySpeaker(uuid);
        return projects;
    }

    @Transactional
    public Project softDeleteProject(String uuid) {
        Project projectOpt = projectRepository.findByUuidAndDeletedFalse(uuid);
        projectOpt.setDeleted(true);
        projectRepository.save(projectOpt);

        return projectOpt;
    }

    public Project updateProject(String uuid, Project updatedData) {
        Project  project = projectRepository.findByUuidAndDeletedFalse(uuid);
                    project.setName(updatedData.getName());
                    return projectRepository.save(project);
    }
}
