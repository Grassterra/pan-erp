package com.doosan.erp.auth.repository;

import com.doosan.erp.auth.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    
    List<Module> findByIsActiveTrue();
    
    List<Module> findAllByOrderBySortOrderAsc();
    
    Optional<Module> findByCode(String code);
    
    Optional<Module> findByName(String name);
}
