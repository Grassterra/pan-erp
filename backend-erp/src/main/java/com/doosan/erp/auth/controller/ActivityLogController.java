package com.doosan.erp.auth.controller;

import com.doosan.erp.auth.entity.ActivityLog;
import com.doosan.erp.auth.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<ActivityLog> logs = activityLogService.getActivityLogs(
                entityType, module, action, userId, startDate, endDate, search,
                PageRequest.of(page, size));
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<Page<ActivityLog>> getEntityHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<ActivityLog> logs = activityLogService.getEntityHistory(
                entityType, entityId, PageRequest.of(page, size));
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLog>> getRecentActivities() {
        return ResponseEntity.ok(activityLogService.getRecentActivities());
    }

    @GetMapping("/entity-types")
    public ResponseEntity<List<String>> getEntityTypes() {
        return ResponseEntity.ok(activityLogService.getEntityTypes());
    }

    @GetMapping("/modules")
    public ResponseEntity<List<String>> getModules() {
        return ResponseEntity.ok(activityLogService.getModules());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "todayCount", activityLogService.getTodayActivityCount()
        ));
    }
}
