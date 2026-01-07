package com.jiraclone.domain.entity;

import com.jiraclone.domain.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "permissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "project_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectRole role = ProjectRole.VIEWER;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Project project;

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
