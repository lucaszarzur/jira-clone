package com.jiraclone.domain.repository;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    long countByStatusAndProjectId(IssueStatus status, String projectId);

    List<Issue> findByProjectIdOrderByListPositionAsc(String projectId);

    @Query("SELECT DISTINCT i FROM Issue i " +
           "LEFT JOIN FETCH i.reporter " +
           "LEFT JOIN FETCH i.assignees " +
           "LEFT JOIN FETCH i.comments c " +
           "LEFT JOIN FETCH c.user " +
           "WHERE i.projectId = :projectId " +
           "ORDER BY i.listPosition ASC")
    List<Issue> findByProjectIdWithRelationships(@Param("projectId") String projectId);
}
