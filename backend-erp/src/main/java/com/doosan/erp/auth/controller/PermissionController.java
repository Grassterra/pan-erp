package com.doosan.erp.auth.controller;

import com.doosan.erp.auth.entity.User;
import com.doosan.erp.auth.entity.UserLevelPermission;
import com.doosan.erp.auth.repository.UserLevelPermissionRepository;
import com.doosan.erp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final UserLevelPermissionRepository userLevelPermissionRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<List<Map<String, Object>>> getMyPermissions(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Fetch actual User entity from database with userLevel
        User currentUser = userRepository.findByUserId(principal.getUsername()).orElse(null);
        if (currentUser == null || currentUser.getUserLevel() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<UserLevelPermission> permissions = userLevelPermissionRepository
                .findByUserLevelId(currentUser.getUserLevel().getId());

        List<Map<String, Object>> result = permissions.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("moduleCode", p.getModule().getCode());
            map.put("moduleName", p.getModule().getName());
            map.put("routePrefix", p.getModule().getRoutePrefix());
            map.put("canView", p.getCanView());
            map.put("canCreate", p.getCanCreate());
            map.put("canEdit", p.getCanEdit());
            map.put("canDelete", p.getCanDelete());
            map.put("canExport", p.getCanExport());
            map.put("canPrint", p.getCanPrint());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
