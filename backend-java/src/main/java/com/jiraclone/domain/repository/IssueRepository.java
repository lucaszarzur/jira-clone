package com.jiraclone.domain.repository;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    long countByStatusAndProjectId(IssueStatus status, String projectId);

    List<Issue> findByProjectIdOrderByListPositionAsc(String projectId);
}
