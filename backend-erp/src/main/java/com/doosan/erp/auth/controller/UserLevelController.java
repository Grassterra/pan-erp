package com.doosan.erp.auth.controller;

import com.doosan.erp.auth.entity.Module;
import com.doosan.erp.auth.entity.UserLevel;
import com.doosan.erp.auth.entity.UserLevelPermission;
import com.doosan.erp.auth.repository.ModuleRepository;
import com.doosan.erp.auth.repository.UserLevelPermissionRepository;
import com.doosan.erp.auth.repository.UserLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user-levels")
@RequiredArgsConstructor
public class UserLevelController {

    private final UserLevelRepository userLevelRepository;
    private final UserLevelPermissionRepository userLevelPermissionRepository;
    private final ModuleRepository moduleRepository;

    @GetMapping
    public ResponseEntity<Page<UserLevel>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("hierarchy").ascending());
        return ResponseEntity.ok(userLevelRepository.findAll(pageRequest));
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserLevel>> getActive() {
        return ResponseEntity.ok(userLevelRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserLevel> getById(@PathVariable Long id) {
        return userLevelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserLevel> create(@RequestBody UserLevel userLevel) {
        return ResponseEntity.ok(userLevelRepository.save(userLevel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserLevel> update(@PathVariable Long id, @RequestBody UserLevel levelData) {
        return userLevelRepository.findById(id)
                .map(existing -> {
                    existing.setName(levelData.getName());
                    existing.setCode(levelData.getCode());
                    existing.setDescription(levelData.getDescription());
                    existing.setHierarchy(levelData.getHierarchy());
                    existing.setIsActive(levelData.getIsActive());
                    return ResponseEntity.ok(userLevelRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (userLevelRepository.existsById(id)) {
            userLevelRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<List<UserLevelPermission>> getPermissions(@PathVariable Long id) {
        return userLevelRepository.findById(id)
                .map(level -> ResponseEntity.ok(userLevelPermissionRepository.findByUserLevelId(id)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<?> updatePermissions(@PathVariable Long id, @RequestBody Map<String, List<Map<String, Object>>> request) {
        return userLevelRepository.findById(id)
                .map(level -> {
                    List<Map<String, Object>> permissions = request.get("permissions");
                    if (permissions != null) {
                        for (Map<String, Object> perm : permissions) {
                            Long moduleId = ((Number) perm.get("moduleId")).longValue();
                            Module module = moduleRepository.findById(moduleId).orElse(null);
                            if (module != null) {
                                UserLevelPermission permission = userLevelPermissionRepository
                                        .findByUserLevelIdAndModuleId(id, moduleId)
                                        .orElse(new UserLevelPermission());
                                permission.setUserLevel(level);
                                permission.setModule(module);
                                permission.setCanView((Boolean) perm.getOrDefault("canView", false));
                                permission.setCanCreate((Boolean) perm.getOrDefault("canCreate", false));
                                permission.setCanEdit((Boolean) perm.getOrDefault("canEdit", false));
                                permission.setCanDelete((Boolean) perm.getOrDefault("canDelete", false));
                                permission.setCanExport((Boolean) perm.getOrDefault("canExport", false));
                                permission.setCanPrint((Boolean) perm.getOrDefault("canPrint", false));
                                userLevelPermissionRepository.save(permission);
                            }
                        }
                    }
                    return ResponseEntity.ok(Map.of("message", "Permissions updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
