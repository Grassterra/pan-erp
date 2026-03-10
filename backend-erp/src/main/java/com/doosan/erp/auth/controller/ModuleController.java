package com.doosan.erp.auth.controller;

import com.doosan.erp.auth.entity.Module;
import com.doosan.erp.auth.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleRepository moduleRepository;

    @GetMapping
    public ResponseEntity<List<Module>> getAll() {
        return ResponseEntity.ok(moduleRepository.findAllByOrderBySortOrderAsc());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Module>> getActive() {
        return ResponseEntity.ok(moduleRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getById(@PathVariable Long id) {
        return moduleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Module> create(@RequestBody Module module) {
        return ResponseEntity.ok(moduleRepository.save(module));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Module> update(@PathVariable Long id, @RequestBody Module moduleData) {
        return moduleRepository.findById(id)
                .map(existing -> {
                    existing.setCode(moduleData.getCode());
                    existing.setName(moduleData.getName());
                    existing.setDescription(moduleData.getDescription());
                    existing.setRoutePrefix(moduleData.getRoutePrefix());
                    existing.setIcon(moduleData.getIcon());
                    existing.setSortOrder(moduleData.getSortOrder());
                    existing.setIsActive(moduleData.getIsActive());
                    return ResponseEntity.ok(moduleRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (moduleRepository.existsById(id)) {
            moduleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
