package com.jiraclone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jiraclone.domain.entity.*;
import com.jiraclone.domain.enums.*;
import com.jiraclone.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.PersistenceContext;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestPlanImportService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final PermissionRepository permissionRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private static final String PROJECT_NAME = "MeuNutria - Plano de Testes";
    private static final String DATA_FILE = "data/meunutria-test-plan.json";

    @Transactional
    public Map<String, Object> importTestPlan(String ownerId) {
        // Check if project already exists
        boolean projectExists = projectRepository.findByIsPublicTrue().stream()
                .anyMatch(p -> PROJECT_NAME.equals(p.getName()));
        if (projectExists) {
            throw new IllegalStateException("Project '" + PROJECT_NAME + "' already exists");
        }

        // Load owner within transaction to avoid lazy loading issues
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + ownerId));

        try {
            ClassPathResource resource = new ClassPathResource(DATA_FILE);
            if (!resource.exists()) {
                throw new IllegalStateException("Seed file not found: " + DATA_FILE);
            }

            InputStream inputStream = resource.getInputStream();
            JsonNode rootNode = objectMapper.readTree(inputStream);

            // Create project
            Project project = createProject(rootNode);
            entityManager.flush();

            // Create permission for owner
            createPermission(project, owner);
            entityManager.flush();

            // Create issues with subtask support (two-pass)
            int issueCount = createIssuesWithSubtasks(rootNode, project, owner);

            log.info("MeuNutria test plan imported: 1 project, {} issues, owner: {}",
                    issueCount, owner.getName());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("projectId", project.getId());
            result.put("projectKey", project.getKey());
            result.put("projectName", project.getName());
            result.put("issueCount", issueCount);
            result.put("owner", owner.getName());
            return result;

        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error importing MeuNutria test plan", e);
            throw new RuntimeException("Failed to import test plan: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Object> deleteTestPlan() {
        Project project = projectRepository.findByIsPublicTrue().stream()
                .filter(p -> PROJECT_NAME.equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Project '" + PROJECT_NAME + "' not found"));

        String projectId = project.getId();

        // Count before deleting
        long issueCount = issueRepository.findByProjectIdOrderByListPositionAsc(projectId).size();

        // Delete all via native queries to avoid lazy loading / FK issues
        entityManager.createNativeQuery("DELETE FROM issue_users WHERE issue_id IN (SELECT id FROM issues WHERE project_id = :pid)")
                .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM comments WHERE issue_id IN (SELECT id FROM issues WHERE project_id = :pid)")
                .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM issues WHERE project_id = :pid AND parent_issue_id IS NOT NULL")
                .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM issues WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM permissions WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM projects WHERE id = :pid")
                .setParameter("pid", projectId).executeUpdate();

        log.info("MeuNutria test plan deleted: project {}", projectId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("deletedProjectId", projectId);
        result.put("deletedIssues", issueCount);
        return result;
    }

    private Project createProject(JsonNode rootNode) {
        Project project = new Project();
        project.setName(rootNode.get("name").asText());
        project.setUrl(rootNode.has("url") && !rootNode.get("url").isNull()
                ? rootNode.get("url").asText() : null);
        project.setDescription(rootNode.get("description").asText());
        project.setCategory(ProjectCategory.valueOf(
                rootNode.get("category").asText().toUpperCase()));
        project.setIsPublic(true);
        project.setKey(generateProjectKey(rootNode.get("name").asText()));
        project.setIssueCounter(0);
        project.setCreatedAt(toLocalDateTime(rootNode.get("createdAt").asText()));
        project.setUpdatedAt(toLocalDateTime(rootNode.get("updatedAt").asText()));

        return projectRepository.save(project);
    }

    private String generateProjectKey(String name) {
        String baseKey = name.replaceAll("[^A-Za-z\\s]", "").trim().toUpperCase();
        String[] words = baseKey.split("\\s+");
        StringBuilder keyBuilder = new StringBuilder();

        if (words.length == 1) {
            keyBuilder.append(words[0], 0, Math.min(3, words[0].length()));
        } else {
            keyBuilder.append(words[0], 0, Math.min(3, words[0].length()));
            for (int i = 1; i < words.length && keyBuilder.length() < 10; i++) {
                if (!words[i].isEmpty()) {
                    keyBuilder.append(words[i].charAt(0));
                }
            }
        }

        String candidateKey = keyBuilder.toString();
        if (candidateKey.length() < 2) {
            candidateKey = candidateKey + "01";
        }
        candidateKey = candidateKey.substring(0, Math.min(10, candidateKey.length()));

        String finalKey = candidateKey;
        int counter = 1;
        while (projectRepository.existsByKey(finalKey)) {
            finalKey = candidateKey + counter;
            counter++;
        }

        return finalKey;
    }

    private void createPermission(Project project, User user) {
        Permission permission = new Permission();
        permission.setUserId(user.getId());
        permission.setProjectId(project.getId());
        permission.setUser(user);
        permission.setProject(project);
        permission.setRole(ProjectRole.ADMIN);
        permission.setCreatedAt(LocalDateTime.now());
        permission.setUpdatedAt(LocalDateTime.now());
        permissionRepository.save(permission);
    }

    private int createIssuesWithSubtasks(JsonNode rootNode, Project project, User owner) {
        JsonNode issuesNode = rootNode.get("issues");
        Map<String, Issue> issuesMap = new LinkedHashMap<>();
        List<JsonNode> subtaskNodes = new ArrayList<>();
        int counter = 0;

        // Pass 1: Create parent issues (TASK, STORY, BUG)
        for (JsonNode issueNode : issuesNode) {
            String type = issueNode.get("type").asText().toUpperCase();
            if ("SUBTASK".equals(type)) {
                subtaskNodes.add(issueNode);
                continue;
            }

            Issue savedIssue = createIssue(issueNode, project, owner, null);
            String refId = issueNode.get("id").asText();
            issuesMap.put(refId, savedIssue);
            counter++;
        }

        entityManager.flush();

        // Pass 2: Create subtask issues
        for (JsonNode issueNode : subtaskNodes) {
            String parentRefId = issueNode.get("parentIssueId").asText();
            Issue parentIssue = issuesMap.get(parentRefId);

            if (parentIssue == null) {
                log.warn("Parent issue '{}' not found for subtask '{}', skipping",
                        parentRefId, issueNode.get("title").asText());
                continue;
            }

            Issue savedIssue = createIssue(issueNode, project, owner, parentIssue.getId());
            String refId = issueNode.get("id").asText();
            issuesMap.put(refId, savedIssue);
            counter++;
        }

        // Update project issue counter
        project.setIssueCounter(counter);
        projectRepository.save(project);

        return counter;
    }

    private Issue createIssue(JsonNode node, Project project, User owner, String parentIssueId) {
        projectRepository.incrementIssueCounter(project.getId());
        entityManager.flush();
        entityManager.refresh(project);
        String issueKey = project.getKey() + "-" + project.getIssueCounter();

        Issue issue = new Issue();
        issue.setKey(issueKey);
        issue.setTitle(node.get("title").asText());
        issue.setDescription(node.get("description").asText());
        issue.setType(IssueType.valueOf(node.get("type").asText().toUpperCase()));
        issue.setStatus(IssueStatus.fromString(node.get("status").asText()));
        issue.setPriority(IssuePriority.valueOf(node.get("priority").asText().toUpperCase()));
        issue.setListPosition(node.get("listPosition").asInt());
        issue.setProjectId(project.getId());
        issue.setProject(project);
        issue.setReporterId(owner.getId());
        issue.setReporter(owner);

        if (parentIssueId != null) {
            issue.setParentIssueId(parentIssueId);
        }

        issue.setCreatedAt(toLocalDateTime(node.get("createdAt").asText()));
        issue.setUpdatedAt(toLocalDateTime(node.get("updatedAt").asText()));

        Issue savedIssue = issueRepository.save(issue);
        entityManager.flush();

        // Assign owner via native query to avoid collection sync issues
        entityManager.createNativeQuery("INSERT INTO issue_users (user_id, issue_id) VALUES (:uid, :iid)")
                .setParameter("uid", owner.getId())
                .setParameter("iid", savedIssue.getId())
                .executeUpdate();

        return savedIssue;
    }

    private LocalDateTime toLocalDateTime(String isoDateString) {
        Instant instant = Instant.parse(isoDateString);
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
