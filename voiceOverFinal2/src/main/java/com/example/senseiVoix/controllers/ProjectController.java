package com.example.senseiVoix.controllers;
import com.example.senseiVoix.entities.Project;
import com.example.senseiVoix.services.serviceImp.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*") // à adapter selon le front
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // GET all active projects
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // GET project by UUID
    @GetMapping("/{uuid}")
    public ResponseEntity<Project> getProjectByUuid(@PathVariable String uuid) {
        Project project = projectService.getProjectByUuid(uuid);
        if (project != null) {
            return ResponseEntity.ok(project);
        }
        return ResponseEntity.notFound().build();
    }

    // POST create new project
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @GetMapping("/speaker/{uuid}")
    public ResponseEntity<List<Project>> getBySpeaker(@PathVariable String uuid) {
        return ResponseEntity.ok(projectService.findBySpeaker(uuid));
    }

    // PUT update project
    @PutMapping("/{uuid}")
    public ResponseEntity<Project> updateProject(@PathVariable String uuid, @RequestBody Project updatedProject) {
        Project project = projectService.updateProject(uuid, updatedProject);
        return ResponseEntity.ok(project);
    }

    // DELETE (soft delete)
    @DeleteMapping("/{uuid}")
    public ResponseEntity<?> deleteProject(@PathVariable String uuid) {
        Project deleted = projectService.softDeleteProject(uuid);
        return ResponseEntity.ok(deleted);
    }
}

