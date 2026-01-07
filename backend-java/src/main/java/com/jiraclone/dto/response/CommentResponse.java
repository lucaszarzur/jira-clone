package com.jiraclone.dto.response;

import com.jiraclone.domain.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String body;
    private String issueId;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse user;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
            .id(comment.getId())
            .body(comment.getBody())
            .issueId(comment.getIssueId())
            .userId(comment.getUserId())
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .user(comment.getUser() != null ?
                UserResponse.from(comment.getUser()) : null)
            .build();
    }
}
