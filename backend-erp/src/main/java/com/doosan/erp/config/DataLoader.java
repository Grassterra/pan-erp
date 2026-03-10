package com.doosan.erp.config;

import com.doosan.erp.auth.entity.Module;
import com.doosan.erp.auth.entity.User;
import com.doosan.erp.auth.entity.UserLevel;
import com.doosan.erp.auth.entity.UserLevelPermission;
import com.doosan.erp.auth.repository.ModuleRepository;
import com.doosan.erp.auth.repository.UserLevelPermissionRepository;
import com.doosan.erp.auth.repository.UserLevelRepository;
import com.doosan.erp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final ModuleRepository moduleRepository;
    private final UserLevelRepository userLevelRepository;
    private final UserLevelPermissionRepository userLevelPermissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedModules();
        seedUserLevels();
        seedDefaultPermissions();
        seedAdminUser();
    }

    private void seedModules() {
        if (moduleRepository.count() > 0) {
            log.info("Modules already seeded, skipping...");
            return;
        }

        log.info("Seeding default modules...");

        // Based on existing sidebar navigation
        String[][] moduleData = {
            {"dashboard", "대시보드", "Dashboard", "/", "1"},
            {"sales", "수주 관리", "Sales Management", "/sales", "2"},
            {"inventory", "재고 관리", "Inventory Management", "/inventory", "3"},
            {"accounting", "회계 관리", "Accounting Management", "/accounting", "4"},
            {"master-data", "마스터 데이터", "Master Data", "/master-data", "5"},
            {"ocr", "OCR 추출", "OCR Extraction", "/ocr", "6"},
            {"users", "사용자 관리", "User Management", "/users", "7"},
            {"activity-logs", "활동 로그", "Activity Logs", "/activity-logs", "8"},
        };

        for (String[] m : moduleData) {
            Module module = Module.builder()
                    .code(m[0])
                    .name(m[1])
                    .description(m[2])
                    .routePrefix(m[3])
                    .sortOrder(Integer.parseInt(m[4]))
                    .isActive(true)
                    .build();
            moduleRepository.save(module);
            log.info("Created module: {}", m[0]);
        }
    }

    private void seedUserLevels() {
        if (userLevelRepository.count() > 0) {
            log.info("User levels already seeded, skipping...");
            return;
        }

        log.info("Seeding default user levels...");

        String[][] levelData = {
            {"admin", "Administrator", "Full system access", "0"},
            {"manager", "Manager", "Management level access", "1"},
            {"supervisor", "Supervisor", "Supervisory access", "2"},
            {"staff", "Staff", "Standard user access", "3"},
        };

        for (String[] l : levelData) {
            UserLevel level = UserLevel.builder()
                    .code(l[0])
                    .name(l[1])
                    .description(l[2])
                    .hierarchy(Integer.parseInt(l[3]))
                    .isActive(true)
                    .build();
            userLevelRepository.save(level);
            log.info("Created user level: {}", l[0]);
        }
    }

    private void seedDefaultPermissions() {
        if (userLevelPermissionRepository.count() > 0) {
            log.info("Permissions already seeded, skipping...");
            return;
        }

        log.info("Seeding default permissions...");

        List<UserLevel> levels = userLevelRepository.findAll();
        List<Module> modules = moduleRepository.findAll();

        UserLevel admin = levels.stream().filter(l -> "admin".equals(l.getCode())).findFirst().orElse(null);
        UserLevel manager = levels.stream().filter(l -> "manager".equals(l.getCode())).findFirst().orElse(null);
        UserLevel supervisor = levels.stream().filter(l -> "supervisor".equals(l.getCode())).findFirst().orElse(null);
        UserLevel staff = levels.stream().filter(l -> "staff".equals(l.getCode())).findFirst().orElse(null);

        for (Module module : modules) {
            // Admin - full access to all modules
            if (admin != null) {
                userLevelPermissionRepository.save(UserLevelPermission.builder()
                        .userLevel(admin)
                        .module(module)
                        .canView(true).canCreate(true).canEdit(true).canDelete(true).canExport(true).canPrint(true)
                        .build());
            }

            // Manager - full access except delete on users
            if (manager != null) {
                boolean canDelete = !"users".equals(module.getCode());
                userLevelPermissionRepository.save(UserLevelPermission.builder()
                        .userLevel(manager)
                        .module(module)
                        .canView(true).canCreate(true).canEdit(true).canDelete(canDelete).canExport(true).canPrint(true)
                        .build());
            }

            // Supervisor - view, create, edit (no delete)
            if (supervisor != null) {
                boolean canCreate = !"users".equals(module.getCode());
                boolean canEdit = !"users".equals(module.getCode());
                userLevelPermissionRepository.save(UserLevelPermission.builder()
                        .userLevel(supervisor)
                        .module(module)
                        .canView(true).canCreate(canCreate).canEdit(canEdit).canDelete(false).canExport(true).canPrint(true)
                        .build());
            }

            // Staff - view only for sensitive, create on operational
            if (staff != null) {
                boolean isSensitive = "users".equals(module.getCode()) || "accounting".equals(module.getCode());
                boolean isOperational = "sales".equals(module.getCode()) || "inventory".equals(module.getCode());
                userLevelPermissionRepository.save(UserLevelPermission.builder()
                        .userLevel(staff)
                        .module(module)
                        .canView(!isSensitive)
                        .canCreate(isOperational)
                        .canEdit(false)
                        .canDelete(false)
                        .canExport(false)
                        .canPrint(true)
                        .build());
            }
        }

        log.info("Default permissions seeded for {} modules and {} levels", modules.size(), levels.size());
    }

    private void seedAdminUser() {
        if (userRepository.existsByUserId("admin")) {
            log.info("Admin user already exists, skipping...");
            return;
        }

        UserLevel adminLevel = userLevelRepository.findByCode("admin").orElse(null);

        // User admin = User.builder()
        //         .userId("admin")
        //         .name("Administrator")
        //         .email("admin@erp.local")
        //         .password(passwordEncoder.encode("admin123"))
        //         .role(User.Role.ADMIN)
        //         .userLevel(adminLevel)
        //         .isActive(true)
        //         .build();

        // userRepository.save(admin);
        // log.info("Created admin user: admin / admin123");
    }
}
