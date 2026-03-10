package com.doosan.erp.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false)
    private String entityType;  // e.g., "User", "Product", "SalesOrder"

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "entity_code")
    private String entityCode;  // For display purposes (e.g., user email, order number)

    @Column(nullable = false)
    private String action;  // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, LOGIN_FAILED

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;  // JSON of old values

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;  // JSON of new values

    @Column(name = "changed_fields")
    private String changedFields;  // Comma-separated list of changed fields

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "user_name")
    private String userName;  // Denormalized for quick display

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "module")
    private String module;  // e.g., "Auth", "Sales", "Inventory"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
