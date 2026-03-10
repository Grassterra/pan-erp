package com.doosan.erp.auth.repository;

import com.doosan.erp.auth.entity.UserLevelPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLevelPermissionRepository extends JpaRepository<UserLevelPermission, Long> {
    
    List<UserLevelPermission> findByUserLevelId(Long userLevelId);
    
    List<UserLevelPermission> findByModuleId(Long moduleId);
    
    Optional<UserLevelPermission> findByUserLevelIdAndModuleId(Long userLevelId, Long moduleId);
    
    void deleteByUserLevelId(Long userLevelId);
}
