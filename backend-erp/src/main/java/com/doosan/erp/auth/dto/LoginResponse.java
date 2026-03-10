package com.doosan.erp.auth.dto;

import com.doosan.erp.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 로그인 응답 DTO
 *
 * 로그인 성공 시 클라이언트에게 반환되는 JWT 토큰 정보입니다.
 * 클라이언트는 이 토큰을 이후 API 요청 시 Authorization 헤더에 포함합니다.
 *
 * 사용 예시: Authorization: Bearer {accessToken}
 */
@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;  // JWT 토큰
    private String tokenType;    // 토큰 타입 (Bearer)
    private Long expiresIn;      // 만료 시간 (초)
    private UserInfo user;       // 사용자 정보

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String userId;
        private String name;
        private String email;
        private String role;
        private String userLevel;      // User level name
        private String userLevelCode;  // User level code
    }

    /**
     * LoginResponse 생성 팩토리 메서드
     */
    public static LoginResponse of(String accessToken, Long expiresIn, User user) {
        String userLevelName = user.getUserLevel() != null ? user.getUserLevel().getName() : "User";
        String userLevelCode = user.getUserLevel() != null ? user.getUserLevel().getCode() : "user";
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(UserInfo.builder()
                        .id(user.getId())
                        .userId(user.getUserId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .userLevel(userLevelName)
                        .userLevelCode(userLevelCode)
                        .build())
                .build();
    }
}
