package com.jiraclone.service;

import com.jiraclone.domain.entity.Comment;
import com.jiraclone.domain.repository.CommentRepository;
import com.jiraclone.domain.repository.IssueRepository;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.CommentRequest;
import com.jiraclone.dto.response.CommentResponse;
import com.jiraclone.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getAllComments() {
        return commentRepository.findAll().stream()
            .map(CommentResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByIssueId(String issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
            .map(CommentResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommentResponse getCommentById(String id) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        return CommentResponse.from(comment);
    }

    @Transactional
    public CommentResponse createComment(CommentRequest request) {
        // Verify issue exists
        issueRepository.findById(request.getIssueId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", request.getIssueId()));

        // Verify user exists
        userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Comment comment = Comment.builder()
            .body(request.getBody())
            .issueId(request.getIssueId())
            .userId(request.getUserId())
            .build();

        comment = commentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    @Transactional
    public CommentResponse updateComment(String id, CommentRequest request) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));

        comment.setBody(request.getBody());

        comment = commentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(String id) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));

        commentRepository.delete(comment);
    }
}
