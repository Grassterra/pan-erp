package com.doosan.erp.auth.controller;

import com.doosan.erp.auth.entity.User;
import com.doosan.erp.auth.entity.UserLevel;
import com.doosan.erp.auth.repository.UserLevelRepository;
import com.doosan.erp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final UserLevelRepository userLevelRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Page<User>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageRequest));
        }
        return ResponseEntity.ok(userRepository.findAll(pageRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String email = (String) request.get("email");
        
        if (userRepository.existsByUserId(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID already exists"));
        }
        if (email != null && userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        
        User user = User.builder()
                .userId(userId)
                .name((String) request.get("name"))
                .email(email)
                .password(passwordEncoder.encode((String) request.get("password")))
                .role(User.Role.USER)
                .isActive(request.get("isActive") != null ? (Boolean) request.get("isActive") : true)
                .phone((String) request.get("phone"))
                .department((String) request.get("department"))
                .position((String) request.get("position"))
                .build();
        
        if (request.get("userLevelId") != null) {
            Long userLevelId = Long.valueOf(request.get("userLevelId").toString());
            userLevelRepository.findById(userLevelId).ifPresent(user::setUserLevel);
        }
        
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return userRepository.findById(id)
                .map(existing -> {
                    if (request.get("name") != null) existing.setName((String) request.get("name"));
                    if (request.get("email") != null) existing.setEmail((String) request.get("email"));
                    if (request.get("isActive") != null) existing.setIsActive((Boolean) request.get("isActive"));
                    if (request.get("phone") != null) existing.setPhone((String) request.get("phone"));
                    if (request.get("department") != null) existing.setDepartment((String) request.get("department"));
                    if (request.get("position") != null) existing.setPosition((String) request.get("position"));
                    
                    if (request.get("userLevelId") != null) {
                        Long userLevelId = Long.valueOf(request.get("userLevelId").toString());
                        userLevelRepository.findById(userLevelId).ifPresent(existing::setUserLevel);
                    }
                    
                    if (request.get("password") != null && !((String) request.get("password")).isEmpty()) {
                        existing.setPassword(passwordEncoder.encode((String) request.get("password")));
                    }
                    
                    User saved = userRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(request.get("password")));
                    userRepository.save(user);
                    return ResponseEntity.ok().body(Map.of("message", "Password changed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<User> activate(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsActive(true);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivate(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setIsActive(false);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/fix-missing-levels")
    public ResponseEntity<?> fixMissingUserLevels() {
        UserLevel defaultLevel = userLevelRepository.findByCode("staff")
                .orElse(userLevelRepository.findAll().stream().findFirst().orElse(null));
        
        if (defaultLevel == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No user levels found"));
        }
        
        List<User> usersWithoutLevel = userRepository.findByUserLevelIsNull();
        
        for (User user : usersWithoutLevel) {
            user.setUserLevel(defaultLevel);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "Fixed " + usersWithoutLevel.size() + " users",
            "defaultLevel", defaultLevel.getName(),
            "count", usersWithoutLevel.size()
        ));
    }
}
