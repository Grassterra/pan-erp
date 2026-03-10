/**
 * @file features/auth/AuthContext.tsx
 * @description 전역 인증 상태(로그인 여부, 사용자 정보)를 관리하는 Context Provider입니다.
 * JWT 토큰 기반 인증 로직과 로그인/회원가입/로그아웃 기능을 제공합니다.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

import { client } from '../../api/client';
import type { User } from '../../types';
import { authApi, type LoginRequest, type SignupRequest, type ModulePermission } from './api';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null; // 현재 로그인한 사용자 정보
  permissions: ModulePermission[]; // 사용자 모듈 권한
  isAuthenticated: boolean; // 로그인 여부 (user가 있으면 true)
  login: (data: LoginRequest) => Promise<void>; // 로그인 함수
  signup: (data: SignupRequest) => Promise<void>; // 회원가입 함수
  logout: () => void; // 로그아웃 함수
  isLoading: boolean; // API 요청 진행 중 여부
  canView: (moduleCode: string) => boolean; // 모듈 조회 권한 확인
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * JWT 토큰 만료 여부를 확인하는 헬퍼 함수
 * 토큰의 payload(base64 encoded)를 디코딩하여 exp 필드를 검사합니다.
 */
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    const payload = JSON.parse(jsonPayload);

    if (!payload.exp) return false;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true; // 파싱 실패 시 만료된 것으로 간주
  }
}

/**
 * 인증 데이터 공급자 (Provider) 컴포넌트
 * 애플리케이션 최상위에서 감싸주어 하위 컴포넌트들이 useAuth를 통해 인증 정보에 접근하게 함.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 초기 상태 로드: 로컬 스토리지에서 토큰과 유저 정보 확인
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      return null;
    }

    // 토큰 만료 시 자동 로그아웃 처리
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        localStorage.removeItem('user');
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<ModulePermission[]>(() => {
    const storedPerms = localStorage.getItem('permissions');
    if (storedPerms) {
      try {
        return JSON.parse(storedPerms);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 기존 로그인 사용자의 권한 자동 로드
  useEffect(() => {
    const fetchPermissions = async () => {
      if (user && permissions.length === 0) {
        try {
          const perms = await authApi.getMyPermissions();
          localStorage.setItem('permissions', JSON.stringify(perms));
          setPermissions(perms);
        } catch (e) {
          console.error('Failed to fetch permissions', e);
        }
      }
    };
    fetchPermissions();
  }, [user]);

  // 회원가입 처리
  const signup = async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.signup(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Signup failed');
      }
    } catch (error: unknown) {
      // Axios 에러 처리 및 백엔드 응답 메시지 추출
      const err = error as any;
      if (err.response && err.response.data) {
        const backendMessage = err.response.data.data?.message || err.response.data.message;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리
  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success) {
        const { accessToken, user: userData } = response.data;
        // 토큰 로컬 스토리지 저장
        localStorage.setItem('token', accessToken);

        // 사용자 정보 설정 (서버에서 받은 데이터 사용)
        const userToSet: User = {
          id: userData?.id || 0,
          userId: userData?.userId || data.userId,
          name: userData?.name || data.userId,
          email: userData?.email,
          role: (userData?.role as 'USER' | 'ADMIN') || 'USER',
          userLevel: userData?.userLevel,
          userLevelCode: userData?.userLevelCode,
        };

        // 사용자 정보 로컬 스토리지 저장 및 상태 업데이트
        localStorage.setItem('user', JSON.stringify(userToSet));
        setUser(userToSet);

        // 사용자 권한 정보 가져오기
        try {
          const perms = await authApi.getMyPermissions();
          localStorage.setItem('permissions', JSON.stringify(perms));
          setPermissions(perms);
        } catch (e) {
          console.error('Failed to fetch permissions', e);
        }
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: unknown) {
      // 에러 처리 로직 동일
      const err = error as any;
      if (err.response && err.response.data) {
        const backendMessage = err.response.data.data?.message || err.response.data.message;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      // 서버에 로그아웃 기록
      const token = localStorage.getItem('token');
      if (token) {
        await client.post('/api/auth/logout');
      }
    } catch (e) {
      console.error('Failed to log logout', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      setUser(null);
      setPermissions([]);
      window.location.href = '/login'; // 페이지 새로고침을 통해 상태 완전히 초기화
    }
  };

  // 모듈 조회 권한 확인
  const canView = (moduleCode: string): boolean => {
    // Admin role은 항상 접근 가능
    if (user?.role === 'ADMIN' || user?.userLevelCode === 'admin') {
      return true;
    }
    // 권한 정보가 아직 로드되지 않았으면 모두 표시 (fallback)
    if (permissions.length === 0) {
      return true;
    }
    const perm = permissions.find(p => p.moduleCode === moduleCode);
    return perm?.canView ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated: !!user, login, signup, logout, isLoading, canView }}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅: AuthContext를 쉽게 사용할 수 있도록 함
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
