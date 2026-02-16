package com.jiraclone.domain.repository;

import com.jiraclone.domain.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    List<Project> findByIsPublicTrue();

    @Query("SELECT p FROM Project p WHERE p.isPublic = true OR p.id IN " +
           "(SELECT pm.projectId FROM Permission pm WHERE pm.userId = :userId)")
    List<Project> findAllAccessibleByUser(@Param("userId") String userId);

    Page<Project> findByIsPublicTrue(Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.isPublic = true OR p.id IN " +
           "(SELECT pm.projectId FROM Permission pm WHERE pm.userId = :userId)")
    Page<Project> findAllAccessibleByUser(@Param("userId") String userId, Pageable pageable);
}
