package com.doosan.erp.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.doosan.erp.auth.entity.ActivityLog;
import com.doosan.erp.auth.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(String entityType, Long entityId, String entityCode, String action, 
                           String description, String module, Object oldValue, Object newValue,
                           String changedFields) {
        try {
            String userName = getCurrentUserName();
            
            ActivityLog activityLog = ActivityLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityCode(entityCode)
                    .action(action)
                    .description(description)
                    .module(module)
                    .oldValues(oldValue != null ? objectMapper.writeValueAsString(oldValue) : null)
                    .newValues(newValue != null ? objectMapper.writeValueAsString(newValue) : null)
                    .changedFields(changedFields)
                    .userName(userName)
                    .build();

            activityLogRepository.save(activityLog);
            log.info("Activity logged: {} {} - {}", action, entityType, entityCode);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage(), e);
        }
    }

    public void logCreate(String entityType, Long entityId, String entityCode, String module) {
        logActivity(entityType, entityId, entityCode, "CREATE", 
                   "Created " + entityType + ": " + entityCode, module, null, null, null);
    }

    public void logUpdate(String entityType, Long entityId, String entityCode, String module, 
                         String changedFields) {
        logActivity(entityType, entityId, entityCode, "UPDATE",
                   "Updated " + entityType + ": " + entityCode, module, null, null, changedFields);
    }

    public void logDelete(String entityType, Long entityId, String entityCode, String module) {
        logActivity(entityType, entityId, entityCode, "DELETE",
                   "Deleted " + entityType + ": " + entityCode, module, null, null, null);
    }

    public void logStatusChange(String entityType, Long entityId, String entityCode, String module,
                               String oldStatus, String newStatus) {
        logActivity(entityType, entityId, entityCode, "STATUS_CHANGE",
                   entityType + " " + entityCode + " status changed from " + oldStatus + " to " + newStatus,
                   module, Map.of("status", oldStatus), Map.of("status", newStatus), "status");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogin(Long userId, String userName, String identifier) {
        try {
            log.info("Logging login for user: {} ({})", userName, identifier);
            ActivityLog activityLog = ActivityLog.builder()
                    .entityType("User")
                    .entityId(userId)
                    .entityCode(identifier)
                    .action("LOGIN")
                    .description("User " + userName + " logged in")
                    .module("Auth")
                    .userName(userName)
                    .build();
            ActivityLog saved = activityLogRepository.save(activityLog);
            log.info("Login activity saved with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to log login: {}", e.getMessage(), e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogout(Long userId, String userName, String identifier) {
        try {
            log.info("Logging logout for user: {} ({})", userName, identifier);
            ActivityLog activityLog = ActivityLog.builder()
                    .entityType("User")
                    .entityId(userId)
                    .entityCode(identifier)
                    .action("LOGOUT")
                    .description("User " + userName + " logged out")
                    .module("Auth")
                    .userName(userName)
                    .build();
            ActivityLog saved = activityLogRepository.save(activityLog);
            log.info("Logout activity saved with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to log logout: {}", e.getMessage(), e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginFailed(String identifier) {
        try {
            log.info("Logging failed login for: {}", identifier);
            ActivityLog activityLog = ActivityLog.builder()
                    .entityType("User")
                    .entityId(0L)
                    .entityCode(identifier)
                    .action("LOGIN_FAILED")
                    .description("Failed login attempt for " + identifier)
                    .module("Auth")
                    .userName("Anonymous")
                    .build();
            ActivityLog saved = activityLogRepository.save(activityLog);
            log.info("Login failed activity saved with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to log login failure: {}", e.getMessage(), e);
        }
    }

    private String getCurrentUserName() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.debug("Could not get current user: {}", e.getMessage());
        }
        return "System";
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getActivityLogs(String entityType, String module, String action,
                                              Long userId, LocalDateTime startDate, LocalDateTime endDate,
                                              String search, Pageable pageable) {
        return activityLogRepository.findWithFilters(entityType, module, action, userId, 
                                                     startDate, endDate, search, pageable);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getEntityHistory(String entityType, Long entityId, Pageable pageable) {
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop10ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<String> getEntityTypes() {
        return activityLogRepository.findDistinctEntityTypes();
    }

    @Transactional(readOnly = true)
    public List<String> getModules() {
        return activityLogRepository.findDistinctModules();
    }

    @Transactional(readOnly = true)
    public Long getTodayActivityCount() {
        return activityLogRepository.countByCreatedAtAfter(LocalDateTime.now().toLocalDate().atStartOfDay());
    }
}
