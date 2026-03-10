package com.doosan.erp.auth.repository;

import com.doosan.erp.auth.entity.UserLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    
    List<UserLevel> findByIsActiveTrue();
    
    Optional<UserLevel> findByName(String name);
    
    Optional<UserLevel> findByCode(String code);
    
    Page<UserLevel> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    List<UserLevel> findAllByOrderByHierarchyAsc();
}
