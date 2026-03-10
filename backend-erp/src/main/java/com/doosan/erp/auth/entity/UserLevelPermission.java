package com.doosan.erp.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_level_permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLevelPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_level_id", nullable = false)
    @JsonIgnore
    private UserLevel userLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "can_view")
    @Builder.Default
    private Boolean canView = false;

    @Column(name = "can_create")
    @Builder.Default
    private Boolean canCreate = false;

    @Column(name = "can_edit")
    @Builder.Default
    private Boolean canEdit = false;

    @Column(name = "can_delete")
    @Builder.Default
    private Boolean canDelete = false;

    @Column(name = "can_approve")
    @Builder.Default
    private Boolean canApprove = false;

    @Column(name = "can_export")
    @Builder.Default
    private Boolean canExport = false;

    @Column(name = "can_print")
    @Builder.Default
    private Boolean canPrint = false;
}
