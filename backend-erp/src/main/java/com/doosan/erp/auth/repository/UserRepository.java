package com.doosan.erp.auth.repository;

import com.doosan.erp.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 Repository 인터페이스
 *
 * JpaRepository를 상속하여 기본 CRUD와 페이징을 제공받고,
 * 추가로 사용자 조회를 위한 커스텀 메서드를 정의합니다.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 사용자 ID로 사용자 조회
     */
    Optional<User> findByUserId(String userId);

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 사용자 ID 존재 여부 확인
     */
    boolean existsByUserId(String userId);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);

    /**
     * 이름 또는 이메일로 검색 (페이징)
     */
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);

    /**
     * 활성화된 사용자 목록
     */
    List<User> findByIsActiveTrue();

    /**
     * 사용자 레벨이 없는 사용자 목록
     */
    List<User> findByUserLevelIsNull();
}
