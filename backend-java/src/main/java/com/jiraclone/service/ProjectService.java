package com.jiraclone.service;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.Permission;
import com.jiraclone.domain.entity.Project;
import com.jiraclone.domain.enums.ProjectRole;
import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.domain.repository.IssueRepository;
import com.jiraclone.domain.repository.PermissionRepository;
import com.jiraclone.domain.repository.ProjectRepository;
import com.jiraclone.dto.request.ProjectRequest;
import com.jiraclone.dto.response.ProjectDetailResponse;
import com.jiraclone.dto.response.ProjectResponse;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.exception.ResourceNotFoundException;
import com.jiraclone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final PermissionRepository permissionRepository;
    private final IssueRepository issueRepository;

    public List<ProjectResponse> getAllProjects(UserPrincipal currentUser) {
        List<Project> projects;

        if (currentUser == null) {
            // Unauthenticated: only public projects
            projects = projectRepository.findByIsPublicTrue();
        } else {
            // Authenticated: public + user's projects
            projects = projectRepository.findAllAccessibleByUser(currentUser.getId());
        }

        return projects.stream()
            .map(ProjectResponse::from)
            .collect(Collectors.toList());
    }

    public Page<ProjectResponse> getAllProjects(UserPrincipal currentUser, Pageable pageable) {
        if (currentUser == null) {
            return projectRepository.findByIsPublicTrue(pageable)
                .map(ProjectResponse::from);
        } else {
            return projectRepository.findAllAccessibleByUser(currentUser.getId(), pageable)
                .map(ProjectResponse::from);
        }
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectById(String id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        // Check access permission
        boolean hasAccess = project.getIsPublic();

        ProjectRole userRole = null;

        if (!hasAccess && currentUser != null) {
            Permission permission = permissionRepository
                .findByUserIdAndProjectId(currentUser.getId(), id)
                .orElse(null);

            hasAccess = permission != null || currentUser.getRole() == UserRole.ADMIN;

            if (permission != null) {
                userRole = permission.getRole();
            }
        }

        if (!hasAccess) {
            throw new ForbiddenException("Você não tem permissão para acessar este projeto");
        }

        // Get user's role in project
        if (currentUser != null && userRole == null) {
            Permission permission = permissionRepository
                .findByUserIdAndProjectId(currentUser.getId(), id)
                .orElse(null);
            userRole = permission != null ? permission.getRole() :
                      (project.getIsPublic() ? ProjectRole.VIEWER : null);
        }

        // Get project issues with relationships (reporter, assignees, comments)
        List<Issue> issues = issueRepository.findByProjectIdWithRelationships(id);

        // Get project users (all users with permissions on this project)
        List<Permission> permissions = permissionRepository.findByProjectId(id);

        return ProjectDetailResponse.from(project, userRole, issues, permissions);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, UserPrincipal currentUser) {
        // Generate unique project key
        String projectKey = generateUniqueProjectKey(request.getName());

        Project project = Project.builder()
            .name(request.getName())
            .key(projectKey)
            .issueCounter(0)
            .url(request.getUrl())
            .description(request.getDescription())
            .category(request.getCategory())
            .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
            .build();

        project = projectRepository.save(project);

        // Add creator as admin
        Permission permission = Permission.builder()
            .userId(currentUser.getId())
            .projectId(project.getId())
            .role(ProjectRole.ADMIN)
            .build();

        permissionRepository.save(permission);

        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(String id, ProjectRequest request,
                                        UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        // Check admin permission
        checkProjectAdminPermission(id, currentUser);

        project.setName(request.getName());
        project.setUrl(request.getUrl());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory());
        if (request.getIsPublic() != null) {
            project.setIsPublic(request.getIsPublic());
        }

        project = projectRepository.save(project);

        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(String id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        // Check admin permission
        checkProjectAdminPermission(id, currentUser);

        projectRepository.delete(project);
    }

    private void checkProjectAdminPermission(String projectId, UserPrincipal currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return; // System admin can do anything
        }

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(currentUser.getId(), projectId)
            .orElseThrow(() -> new ForbiddenException(
                "Você não tem permissão para acessar este projeto"));

        if (permission.getRole() != ProjectRole.ADMIN) {
            throw new ForbiddenException(
                "Acesso negado. Requer permissão de admin ou superior.");
        }
    }

    /**
     * Generate a unique project key from project name
     * Examples: "TaskFlow Project" -> "TFP", "My App" -> "MA", "X" -> "X01"
     */
    private String generateUniqueProjectKey(String projectName) {
        // Extract initials from project name (uppercase letters and first letter of words)
        String baseKey = projectName
            .replaceAll("[^a-zA-Z\\s]", "") // Remove special chars and numbers
            .trim()
            .toUpperCase()
            .replaceAll("\\s+", " "); // Normalize spaces

        // Get initials from words
        String[] words = baseKey.split(" ");
        StringBuilder keyBuilder = new StringBuilder();

        if (words.length == 1) {
            // Single word: take first 3 chars (e.g., "PROJECT" -> "PRO")
            keyBuilder.append(words[0].substring(0, Math.min(3, words[0].length())));
        } else {
            // Multiple words: take first letter of each word up to 4 letters
            for (int i = 0; i < Math.min(words.length, 4); i++) {
                if (!words[i].isEmpty()) {
                    keyBuilder.append(words[i].charAt(0));
                }
            }
        }

        String candidateKey = keyBuilder.toString();

        // If key is too short, pad or use default
        if (candidateKey.length() < 2) {
            candidateKey = candidateKey + "01";
        }

        // Ensure key is max 10 chars
        candidateKey = candidateKey.substring(0, Math.min(10, candidateKey.length()));

        // Check if key exists, add numbers if needed
        String finalKey = candidateKey;
        int counter = 1;
        while (projectRepository.existsByKey(finalKey)) {
            finalKey = candidateKey + counter;
            counter++;
            // Prevent infinite loop
            if (counter > 999) {
                finalKey = candidateKey + System.currentTimeMillis() % 1000;
                break;
            }
        }

        return finalKey;
    }
}
