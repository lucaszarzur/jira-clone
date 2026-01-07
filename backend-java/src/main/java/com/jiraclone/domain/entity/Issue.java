package com.jiraclone.domain.entity;

import com.jiraclone.domain.enums.IssueType;
import com.jiraclone.domain.enums.IssueStatus;
import com.jiraclone.domain.enums.IssuePriority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuePriority priority;

    @Column(name = "list_position", nullable = false)
    @Builder.Default
    private Integer listPosition = 0;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    @Column
    private Integer estimate;

    @Column(name = "time_spent")
    private Integer timeSpent;

    @Column(name = "time_remaining")
    private Integer timeRemaining;

    @Column(name = "reporter_id", nullable = false)
    private String reporterId;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Project project;

    @ManyToMany(mappedBy = "assignedIssues")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> assignees = new HashSet<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Comment> comments = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
