package com.jiraclone.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jiraclone.domain.entity.*;
import com.jiraclone.domain.enums.*;
import com.jiraclone.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.PersistenceContext;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Value("${seed.data.enabled:false}")
    private boolean seedDataEnabled;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedDataEnabled) {
            log.info("Seed data is disabled");
            return;
        }

        // Check if data already exists
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping seed");
            return;
        }

        log.info("Starting data initialization...");

        try {
            // Load JSON file from resources
            ClassPathResource resource = new ClassPathResource("data/example-project.json");
            InputStream inputStream = resource.getInputStream();
            JsonNode rootNode = objectMapper.readTree(inputStream);

            // Create project
            Project project = createProject(rootNode);
            entityManager.flush(); // Ensure project is persisted

            // Create users
            Map<String, User> usersMap = createUsers(rootNode);
            entityManager.flush(); // Ensure users are persisted

            // Create permissions
            createPermissions(project, usersMap);

            // Create issues
            createIssues(rootNode, project, usersMap);

            log.info("Data initialization completed successfully!");
            log.info("Created {} users, 1 project, and {} issues",
                    usersMap.size(), issueRepository.count());
        } catch (Exception e) {
            log.error("Error during data initialization", e);
            throw e;
        }
    }

    private Project createProject(JsonNode rootNode) {
        Project project = new Project();
        // Don't set ID manually, let Hibernate generate it
        project.setName(rootNode.get("name").asText());
        project.setUrl(rootNode.get("url").asText());
        project.setDescription(rootNode.get("description").asText());
        project.setCategory(ProjectCategory.valueOf(rootNode.get("category").asText().toUpperCase()));
        project.setIsPublic(true); // Make it public so users can see it
        project.setCreatedAt(toLocalDateTime(rootNode.get("createdAt").asText()));
        project.setUpdatedAt(toLocalDateTime(rootNode.get("updatedAt").asText()));

        return projectRepository.save(project);
    }

    private Map<String, User> createUsers(JsonNode rootNode) {
        Map<String, User> usersMap = new HashMap<>();
        JsonNode usersNode = rootNode.get("users");

        for (JsonNode userNode : usersNode) {
            String originalUserId = userNode.get("id").asText();
            String name = userNode.get("name").asText();
            String avatarUrl = userNode.get("avatarUrl").asText();

            // Generate email from name (lowercase, no spaces)
            String email = name.toLowerCase()
                    .replaceAll("\\s+", ".")
                    .replaceAll("[^a-z.]", "") + "@taskflow.com";

            User user = new User();
            // Don't set ID manually, let Hibernate generate it
            user.setName(name);
            user.setEmail(email);
            user.setAvatarUrl(avatarUrl);
            // Default password for all seed users is "password"
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole(UserRole.USER);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);
            // Map by original ID from JSON for reference in issues
            usersMap.put(originalUserId, savedUser);

            log.debug("Created user: {} ({})", name, email);
        }

        return usersMap;
    }

    private void createPermissions(Project project, Map<String, User> usersMap) {
        int index = 0;
        for (User user : usersMap.values()) {
            Permission permission = new Permission();
            permission.setUserId(user.getId());
            permission.setProjectId(project.getId());
            permission.setUser(user);
            permission.setProject(project);
            // First user is admin, others are members
            permission.setRole(index == 0 ? ProjectRole.ADMIN : ProjectRole.MEMBER);
            permission.setCreatedAt(LocalDateTime.now());
            permission.setUpdatedAt(LocalDateTime.now());
            permissionRepository.save(permission);
            index++;
            log.debug("Created permission for user: {}", user.getName());
        }
    }

    private void createIssues(JsonNode rootNode, Project project, Map<String, User> usersMap) {
        JsonNode issuesNode = rootNode.get("issues");

        for (JsonNode issueNode : issuesNode) {
            Issue issue = new Issue();
            // Don't set ID manually, let Hibernate generate it
            issue.setTitle(issueNode.get("title").asText());
            issue.setDescription(issueNode.get("description").asText());
            issue.setType(IssueType.valueOf(issueNode.get("type").asText().toUpperCase()));
            issue.setStatus(IssueStatus.fromString(issueNode.get("status").asText()));
            issue.setPriority(IssuePriority.valueOf(issueNode.get("priority").asText().toUpperCase()));
            issue.setListPosition(issueNode.get("listPosition").asInt());

            // Set project (both ID and relationship)
            issue.setProjectId(project.getId());
            issue.setProject(project);

            // Set reporter (both ID and relationship)
            String reporterId = issueNode.get("reporterId").asText();
            User reporter = usersMap.get(reporterId);
            issue.setReporterId(reporter.getId());
            issue.setReporter(reporter);

            issue.setCreatedAt(toLocalDateTime(issueNode.get("createdAt").asText()));
            issue.setUpdatedAt(toLocalDateTime(issueNode.get("updatedAt").asText()));

            Issue savedIssue = issueRepository.save(issue);

            // Add assignees
            JsonNode userIdsNode = issueNode.get("userIds");
            if (userIdsNode != null && userIdsNode.isArray()) {
                Set<User> assignees = new HashSet<>();
                for (JsonNode userIdNode : userIdsNode) {
                    String userId = userIdNode.asText();
                    User assignee = usersMap.get(userId);
                    if (assignee != null) {
                        assignees.add(assignee);
                    }
                }
                savedIssue.setAssignees(assignees);
                issueRepository.save(savedIssue);
            }

            log.debug("Created issue: {}", issue.getTitle());
        }
    }

    private LocalDateTime toLocalDateTime(String isoDateString) {
        Instant instant = Instant.parse(isoDateString);
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
