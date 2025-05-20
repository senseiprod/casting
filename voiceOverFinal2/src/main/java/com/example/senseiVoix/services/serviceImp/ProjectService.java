package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.entities.Project;
import com.example.senseiVoix.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAllByDeletedFalse();
    }

    public Project getProjectByUuid(String uuid) {
        return projectRepository.findByUuidAndDeletedFalse(uuid);
    }

    public Project createProject(Project project) {
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
