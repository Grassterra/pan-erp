package com.doosan.erp.auth.repository;

import com.doosan.erp.auth.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    Page<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId, Pageable pageable);
    
    Page<ActivityLog> findByModuleOrderByCreatedAtDesc(String module, Pageable pageable);
    
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query(value = "SELECT * FROM activity_logs a WHERE " +
           "(:entityType IS NULL OR a.entity_type = :entityType) AND " +
           "(:module IS NULL OR a.module = :module) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:userId IS NULL OR a.user_id = :userId) AND " +
           "(:startDate IS NULL OR a.created_at >= :startDate) AND " +
           "(:endDate IS NULL OR a.created_at <= :endDate) AND " +
           "(:search IS NULL OR a.description LIKE CONCAT('%', :search, '%') OR " +
           "a.entity_code LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY a.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM activity_logs a WHERE " +
           "(:entityType IS NULL OR a.entity_type = :entityType) AND " +
           "(:module IS NULL OR a.module = :module) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:userId IS NULL OR a.user_id = :userId) AND " +
           "(:startDate IS NULL OR a.created_at >= :startDate) AND " +
           "(:endDate IS NULL OR a.created_at <= :endDate) AND " +
           "(:search IS NULL OR a.description LIKE CONCAT('%', :search, '%') OR " +
           "a.entity_code LIKE CONCAT('%', :search, '%'))",
           nativeQuery = true)
    Page<ActivityLog> findWithFilters(
            @Param("entityType") String entityType,
            @Param("module") String module,
            @Param("action") String action,
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable);

    List<ActivityLog> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT a.entityType FROM ActivityLog a ORDER BY a.entityType")
    List<String> findDistinctEntityTypes();

    @Query("SELECT DISTINCT a.module FROM ActivityLog a WHERE a.module IS NOT NULL ORDER BY a.module")
    List<String> findDistinctModules();

    Long countByCreatedAtAfter(LocalDateTime dateTime);
}
